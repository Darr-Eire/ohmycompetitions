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
    
    // Also find user's purchased tickets via Entry model using both username and UID
    const userEntries = await Entry.find({ 
      $or: [
        { userUid: username },
        { userUid: user.piUserId },
        { username: username }
      ]
    }).lean();
    
    // Get competition details for better data
    const competitionIds = [
      ...new Set([
        ...giftedTickets.map(t => t.competitionId).filter(Boolean),
        ...userEntries.map(e => e.competitionId).filter(Boolean)
      ])
    ];
    
    const competitions = await Competition.find({ 
      _id: { $in: competitionIds } 
    }).lean();
    
    const competitionMap = competitions.reduce((acc, comp) => {
      acc[comp._id.toString()] = comp;
      return acc;
    }, {});
    
    // Combine and format all tickets with enhanced data
    const allTickets = [
      // Gifted tickets
      ...giftedTickets.map(ticket => {
        const comp = competitionMap[ticket.competitionId?.toString()];
        return {
          competitionTitle: ticket.competitionTitle || comp?.title || 'Unknown Competition',
          competitionSlug: ticket.competitionSlug || comp?.slug,
          prize: comp?.prize || ticket.competitionTitle || 'Prize',
          entryFee: 0, // Gifted tickets show 0 fee
          quantity: ticket.quantity || 1,
          drawDate: comp?.endsAt || ticket.purchasedAt,
          endsAt: comp?.endsAt || ticket.purchasedAt,
          ticketNumbers: ticket.ticketNumbers || [],
          imageUrl: comp?.imageUrl || ticket.imageUrl || '/images/default-prize.png',
          gifted: true,
          giftedBy: ticket.giftedBy,
          earned: false,
          purchasedAt: ticket.purchasedAt
        };
      }),
      
      // User entries (purchased tickets)
      ...userEntries.map(entry => {
        const comp = competitionMap[entry.competitionId?.toString()];
        return {
          competitionTitle: comp?.title || entry.competitionName || 'Unknown Competition',
          competitionSlug: comp?.slug || entry.competitionId,
          prize: comp?.prize || entry.competitionName || 'Prize',
          entryFee: comp?.entryFee || 0,
          quantity: entry.quantity || entry.ticketCount || 1,
          drawDate: comp?.endsAt || entry.createdAt,
          endsAt: comp?.endsAt || entry.createdAt,
          ticketNumbers: entry.ticketNumbers || [`E${entry._id.toString().slice(-6)}`],
          imageUrl: comp?.imageUrl || '/images/default-prize.png',
          gifted: false,
          giftedBy: null,
          earned: entry.earned || comp?.entryFee === 0 || false,
          purchasedAt: entry.createdAt
        };
      })
    ];

    // Sort by purchase date (newest first)
    allTickets.sort((a, b) => new Date(b.purchasedAt) - new Date(a.purchasedAt));

    res.status(200).json(allTickets);
  } catch (err) {
    console.error('Error fetching user tickets:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
}
