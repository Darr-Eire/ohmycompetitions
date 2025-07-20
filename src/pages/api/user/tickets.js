import { dbConnect } from 'lib/dbConnect';
import Ticket from 'models/Ticket';
import User from 'models/User';
import Entry from 'models/Entry';
import Competition from 'models/Competition';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ message: 'Missing username parameter' });
  }

  try {
    const user = await User.findOne({ username }).lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const giftedTickets = await Ticket.find({ username }).lean();

    const userPiId = user.piUserId || user.uid;
    const userEntries = await Entry.find({ 
      $or: [
        { userUid: username },
        { userUid: userPiId },
        { username: username }
      ]
    }).lean();

    const { MongoClient } = require('mongodb');
    const MONGODB_URI = process.env.MONGO_DB_URL;
    
    let userPayments = [];
    if (MONGODB_URI) {
      try {
        const client = new MongoClient(MONGODB_URI);
        await client.connect();
        const db = client.db();

        userPayments = await db.collection('payments').find({
          $and: [
            { status: 'completed' },
            {
              $or: [
                { 'piUser.uid': userPiId },
                { 'piUser.uid': username },
                { 'piUser.username': username }
              ]
            }
          ]
        }).toArray();

        await client.close();
      } catch (paymentError) {
        console.error('Error fetching payments:', paymentError);
        userPayments = [];
      }
    }

    const competitionIds = [
      ...new Set([
        ...giftedTickets.map(t => t.competitionId).filter(Boolean),
        ...userEntries.map(e => e.competitionId).filter(Boolean)
      ])
    ];

    const competitionSlugs = [
      ...new Set([
        ...userPayments.map(p => p.competitionSlug).filter(Boolean)
      ])
    ];

    const competitions = await Competition.find({ 
      $or: [
        { _id: { $in: competitionIds } },
        { 'comp.slug': { $in: competitionSlugs } }
      ]
    }).lean();

    const competitionMap = competitions.reduce((acc, comp) => {
      acc[comp._id.toString()] = comp;
      acc[comp.comp.slug] = comp;
      return acc;
    }, {});

    const allTickets = [
      ...giftedTickets.map(ticket => {
        const comp = competitionMap[ticket.competitionId?.toString()];
        return {
          competitionTitle: ticket.competitionTitle || comp?.title || 'Unknown Competition',
          competitionSlug: ticket.competitionSlug || comp?.comp?.slug,
          prize: comp?.prize || ticket.competitionTitle || 'Prize',
          entryFee: 0,
          quantity: ticket.quantity || 1,
          drawDate: comp?.comp?.endsAt || ticket.purchasedAt,
          endsAt: comp?.comp?.endsAt || ticket.purchasedAt,
          ticketNumbers: ticket.ticketNumbers || [],
          imageUrl: comp?.imageUrl || ticket.imageUrl || '/images/default-prize.png',
          gifted: true,
          giftedBy: ticket.giftedBy,
          earned: false,
          purchasedAt: ticket.purchasedAt,
          theme: comp?.theme || comp?.comp?.theme || 'daily'
        };
      }),

      ...userEntries.map(entry => {
        const comp = competitionMap[entry.competitionId?.toString()];
        return {
          competitionTitle: comp?.title || entry.competitionName || 'Unknown Competition',
          competitionSlug: comp?.comp?.slug || entry.competitionId,
          prize: comp?.prize || entry.competitionName || 'Prize',
          entryFee: comp?.comp?.entryFee || 0,
          quantity: entry.quantity || entry.ticketCount || 1,
          drawDate: comp?.comp?.endsAt || entry.createdAt,
          endsAt: comp?.comp?.endsAt || entry.createdAt,
          ticketNumbers: entry.ticketNumbers || [`E${entry._id.toString().slice(-6)}`],
          imageUrl: comp?.imageUrl || '/images/default-prize.png',
          gifted: false,
          giftedBy: null,
          earned: entry.earned || comp?.comp?.entryFee === 0 || false,
          purchasedAt: entry.createdAt,
          theme: comp?.theme || comp?.comp?.theme || 'daily'
        };
      }),

      ...userPayments.map(payment => {
        const comp = competitionMap[payment.competitionSlug];
       const ticketNumbers = Array.isArray(payment.ticketNumbers)
  ? payment.ticketNumbers
  : payment.ticketNumber?.toString().includes('-')
    ? (() => {
        const [start, end] = payment.ticketNumber.split('-').map(n => parseInt(n));
        return Array.from({ length: end - start + 1 }, (_, i) => `T${start + i}`);
      })()
    : payment.ticketNumber
      ? [`T${payment.ticketNumber}`]
      : [`P${payment.paymentId.slice(-6)}`];

        return {
          competitionTitle: comp?.title || payment.competitionSlug || 'Competition',
          competitionSlug: payment.competitionSlug,
          prize: comp?.prize || 'Prize',
          entryFee: comp?.comp?.entryFee || payment.amount || 0,
          quantity: payment.ticketQuantity || 1,
          drawDate: comp?.comp?.endsAt || payment.completedAt,
          endsAt: comp?.comp?.endsAt || payment.completedAt,
          ticketNumbers: ticketNumbers,
          imageUrl: comp?.imageUrl || '/images/default-prize.png',
          gifted: false,
          giftedBy: null,
          earned: false,
          purchasedAt: payment.completedAt || payment.createdAt,
          paymentId: payment.paymentId,
          piTransaction: payment.txid,
          theme: comp?.theme || comp?.comp?.theme || 'daily'
        };
      })
    ];

    const uniqueTickets = allTickets.filter((ticket, index, self) => {
      if (ticket.paymentId) {
        return self.findIndex(t => t.paymentId === ticket.paymentId) === index;
      } else if (ticket.ticketNumbers?.length > 0) {
        return self.findIndex(t => 
          JSON.stringify(t.ticketNumbers) === JSON.stringify(ticket.ticketNumbers)
        ) === index;
      }
      return true;
    });

    uniqueTickets.sort((a, b) => new Date(b.purchasedAt) - new Date(a.purchasedAt));

    console.log(`✅ Found ${uniqueTickets.length} tickets for user ${username}:`, {
      gifted: giftedTickets.length,
      entries: userEntries.length,
      payments: userPayments.length,
      total: uniqueTickets.length,
      userPiId: userPiId
    });

    res.status(200).json(uniqueTickets);
  } catch (err) {
    console.error('Error fetching user tickets:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
}
