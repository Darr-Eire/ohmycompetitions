import { dbConnect } from 'lib/dbConnect';
import Notification from 'models/Notification';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    await dbConnect();
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ error: 'id required' });
    await Notification.updateOne({ _id: id }, { $set: { read: true } });
    res.status(200).json({ ok: true });
  } catch (e) {
    console.error('notification mark-read error', e);
    res.status(500).json({ error: 'Server error' });
  }
}


