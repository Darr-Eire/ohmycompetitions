import { dbConnect } from 'lib/dbConnect';
import StageTicket from 'models/StageTicket';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    await dbConnect();
    const { username, stage = 2 } = req.body || {};
    if (!username) return res.status(400).json({ error: 'username required' });
    const doc = await StageTicket.findOne({ username, stage: Number(stage) });
    if (!doc || (doc.count - doc.consumed) <= 0) return res.status(400).json({ error: 'No stage ticket available' });

    await StageTicket.updateOne({ _id: doc._id }, { $inc: { consumed: 1 } });
    res.status(200).json({ ok: true, remaining: (doc.count - doc.consumed - 1) });
  } catch (e) {
    console.error('stage use error', e);
    res.status(500).json({ error: 'Server error' });
  }
}


