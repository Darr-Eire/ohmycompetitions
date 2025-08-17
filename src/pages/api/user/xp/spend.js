import { dbConnect } from '../../../../lib/dbConnect';
import User from '../../../../models/User';
import { levelFromXP } from '../../../../lib/levels';

const ALLOWED = {
  competition_ticket: 120,
  stages_entry_ticket: 200,
  exclusive_competition: 350,
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    await dbConnect();
    const { userId, kind, cost } = req.body || {};
    if (!userId || !kind) return res.status(400).json({ error: 'Missing userId or kind' });

    const expected = ALLOWED[kind];
    if (!expected) return res.status(400).json({ error: 'Invalid kind' });
    if (Number(cost) !== expected) return res.status(400).json({ error: 'Cost mismatch' });

    const user = await User.findOne({ $or: [{ _id: userId }, { piUserId: userId }] });
    if (!user) return res.status(404).json({ error: 'User not found' });

    if ((user.xp || 0) < expected) return res.status(400).json({ error: 'Not enough XP' });

    user.xp = (user.xp || 0) - expected;
    user.xpHistory = user.xpHistory || [];
    user.xpHistory.push({ amount: -expected, reason: `redeem_${kind}` });

    const { level } = levelFromXP(user.xp);
    user.level = level;

    // TODO: grant entitlements:
    // - grant a ticket, create entry, or flag access for exclusive competition.
    // This depends on your existing models (not included here).

    await user.save();

    return res.status(200).json({
      ok: true,
      xp: user.xp,
      level: user.level,
      message: 'Redemption successful',
    });
  } catch (e) {
    console.error('XP spend error', e);
    return res.status(500).json({ error: 'Server error' });
  }
}
