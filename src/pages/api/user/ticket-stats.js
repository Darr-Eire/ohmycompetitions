import { dbConnect } from 'lib/dbConnect';
import Ticket from 'models/Ticket';
import User from 'models/User';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    await dbConnect();

    const { username, userId } = req.query;
    if (!username && !userId) {
      return res.status(400).json({ error: 'Missing username or userId' });
    }

    // Resolve username if only userId is provided
    let uname = username;
    if (!uname && userId) {
      const u =
        (await User.findOne({ uid: userId }).lean()) ||
        (await User.findOne({ piUserId: userId }).lean()) ||
        (await User.findOne({ username: userId }).lean());
      uname = u?.username || userId;
    }

    const tickets = await Ticket.find({ username: uname }).lean();

    let totalPurchased = 0;
    let totalGifted = 0;
    let totalEarned = 0;

    for (const t of tickets) {
      const qty = Number(t.quantity || 0);
      if (t.gifted) totalGifted += qty;
      else if (t.earned) totalEarned += qty;
      else totalPurchased += qty;
    }

    // Join date from user if available
    const u =
      (await User.findOne({ username: uname }).select({ createdAt: 1, lastLogin: 1 }).lean()) || null;

    return res.status(200).json({
      totalPurchased,
      totalGifted,
      totalEarned,
      joinDate: u?.createdAt || u?.lastLogin || new Date()
    });
  } catch (err) {
    console.error('❌ /api/user/ticket-stats error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
