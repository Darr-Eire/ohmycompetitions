import { dbConnect } from 'lib/dbConnect';
import Notification from 'models/Notification';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    await dbConnect();
    const { userId, username, limit = 20 } = req.query || {};
    const criteria = {};
    if (userId) criteria.userId = userId;
    if (username) criteria.username = username;
    const items = await Notification.find(criteria).sort({ createdAt: -1 }).limit(Number(limit)).lean();
    res.status(200).json({ ok: true, items });
  } catch (e) {
    console.error('notification list error', e);
    res.status(500).json({ error: 'Server error' });
  }
}


