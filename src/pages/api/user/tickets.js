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
    // Find the user first to get their UID
    const user = await User.findOne({ username }).lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find tickets directly by username (for gifted tickets)
    const giftedTickets = await Ticket.find({ username }).lean();
    
    // Find user's purchased tickets via Entry model using both username and UID
    const userEntries = await Entry.find({ 
      $or: [
        { userUid: username },
        { userUid: user.piUserId },
        { username: username }
      ]
    }).lean();

    // ENHANCED: Get all completed payments by this user from the payments collection
    // Connect directly to MongoDB for payments collection (which uses raw MongoDB, not Mongoose)
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
                { 'piUser.uid': user.piUserId },
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
    
    // Get competition details for better data
    const competitionIds = [
      ...new Set([
        ...giftedTickets.map(t => t.competitionId).filter(Boolean),
        ...userEntries.map(e => e.competitionId).filter(Boolean)
      ])
    ];

    // ENHANCED: Also get competitions by slug from payments
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
      acc[comp.comp.slug] = comp; // Also index by slug
      return acc;
    }, {});
    
    // Combine and format all tickets with enhanced data
    const allTickets = [
      // Gifted tickets
      ...giftedTickets.map(ticket => {
        const comp = competitionMap[ticket.competitionId?.toString()];
        return {
          competitionTitle: ticket.competitionTitle || comp?.title || 'Unknown Competition',
          competitionSlug: ticket.competitionSlug || comp?.comp?.slug,
          prize: comp?.prize || ticket.competitionTitle || 'Prize',
          entryFee: 0, // Gifted tickets show 0 fee
          quantity: ticket.quantity || 1,
          drawDate: comp?.comp?.endsAt || ticket.purchasedAt,
          endsAt: comp?.comp?.endsAt || ticket.purchasedAt,
          ticketNumbers: ticket.ticketNumbers || [],
          imageUrl: comp?.imageUrl || ticket.imageUrl || '/images/default-prize.png',
          gifted: true,
          giftedBy: ticket.giftedBy,
          earned: false,
          purchasedAt: ticket.purchasedAt
        };
      }),
      
      // User entries (purchased tickets from Entry model)
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
          purchasedAt: entry.createdAt
        };
      }),

      // ENHANCED: User payments (actual Pi purchases from payments collection)
      ...userPayments.map(payment => {
        const comp = competitionMap[payment.competitionSlug];
        const ticketNumbers = payment.ticketNumber ? 
          (payment.ticketNumber.toString().includes('-') ? 
            payment.ticketNumber.split('-').map((n, i, arr) => 
              arr.length === 2 ? `T${parseInt(arr[0]) + i}` : `T${n}`
            ) : 
            [`T${payment.ticketNumber}`]
          ) : 
          [`P${payment.paymentId.slice(-6)}`];

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
          piTransaction: payment.txid
        };
      })
    ];

    // Remove duplicates based on ticket numbers or payment IDs
    const uniqueTickets = allTickets.filter((ticket, index, self) => {
      if (ticket.paymentId) {
        // For Pi payments, ensure unique by paymentId
        return self.findIndex(t => t.paymentId === ticket.paymentId) === index;
      } else if (ticket.ticketNumbers?.length > 0) {
        // For other tickets, ensure unique by ticket numbers
        return self.findIndex(t => 
          JSON.stringify(t.ticketNumbers) === JSON.stringify(ticket.ticketNumbers)
        ) === index;
      }
      return true;
    });

    // Sort by purchase date (newest first)
    uniqueTickets.sort((a, b) => new Date(b.purchasedAt) - new Date(a.purchasedAt));

    console.log(`✅ Found ${uniqueTickets.length} tickets for user ${username}:`, {
      gifted: giftedTickets.length,
      entries: userEntries.length,
      payments: userPayments.length,
      total: uniqueTickets.length
    });

    res.status(200).json(uniqueTickets);
  } catch (err) {
    console.error('Error fetching user tickets:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
}
