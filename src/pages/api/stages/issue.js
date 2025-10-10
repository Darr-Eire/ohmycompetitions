import { dbConnect } from 'lib/dbConnect';
import StageTicket from 'models/StageTicket';
import User from 'models/User';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    await dbConnect();
    const { username, stage = 2, count = 1, source = 'win', expiresAt = null } = req.body || {};
    if (!username) return res.status(400).json({ error: 'username required' });
    const user = await User.findOne({ username }).lean();
    if (!user) return res.status(404).json({ error: 'User not found' });

    const doc = await StageTicket.findOneAndUpdate(
      { username, stage: Number(stage) },
      { $inc: { count: Number(count) } , $set: { source, ...(expiresAt ? { expiresAt: new Date(expiresAt) } : {}) } },
      { new: true, upsert: true }
    );

    res.status(200).json({ ok: true, ticket: { username, stage: doc.stage, count: doc.count, consumed: doc.consumed, expiresAt: doc.expiresAt } });
  } catch (e) {
    console.error('stage issue error', e);
    res.status(500).json({ error: 'Server error' });
  }
}


