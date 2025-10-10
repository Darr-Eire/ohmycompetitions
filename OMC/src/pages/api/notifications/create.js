import { dbConnect } from 'lib/dbConnect';
import Notification from 'models/Notification';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    await dbConnect();
    const { userId, username, type, title, message, href } = req.body || {};
    if (!type || (!userId && !username)) return res.status(400).json({ error: 'type and user required' });
    const doc = await Notification.create({ userId, username, type, title, message, href });
    res.status(200).json({ ok: true, id: doc._id });
  } catch (e) {
    console.error('notification create error', e);
    res.status(500).json({ error: 'Server error' });
  }
}


