import { dbConnect } from 'lib/dbConnect';
import User from 'models/User';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    await dbConnect();

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Pick pioneer by weekly referrals first, then XP, then recent createdAt
    const topByReferrals = await User.find({ updatedAt: { $gte: weekAgo } })
      .sort({ referralWeeklyCount: -1, xp: -1, createdAt: -1 })
      .limit(1)
      .lean();

    const pioneer = topByReferrals[0] || null;
    if (!pioneer) return res.status(200).json({ ok: true, pioneer: null });

    return res.status(200).json({
      ok: true,
      pioneer: {
        username: pioneer.username,
        xp: pioneer.xp || 0,
        referralWeeklyCount: pioneer.referralWeeklyCount || 0,
        profileImage: pioneer.profileImage || '',
        country: pioneer.country || '',
      },
    });
  } catch (err) {
    console.error('pioneer API error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}


