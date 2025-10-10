import { dbConnect } from 'lib/dbConnect';
import StageTicket from 'models/StageTicket';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    await dbConnect();
    const { userId, username } = req.query || {};
    const crit = username ? { username } : (userId ? { userId } : null);
    if (!crit) return res.status(400).json([]);
    const items = await StageTicket.find(crit).sort({ stage: 1 }).lean();
    const grouped = items.map(i => ({ stage: i.stage, count: (i.count - i.consumed), expiresAt: i.expiresAt || null }));
    res.status(200).json(grouped.filter(g => g.count > 0));
  } catch (e) {
    res.status(200).json([]);
  }
}


