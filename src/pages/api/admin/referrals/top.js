// File: src/pages/api/admin/referrals/top.js
import { requireAdmin } from 'lib/adminAuth';
import dbConnect from 'lib/dbConnect';
import User from 'models/User'; // ensure this path is correct for your project

export default async function handler(req, res) {
  try {
    // Only allow GET
    if (req.method !== 'GET') {
      return res.status(405).json({ message: 'METHOD_NOT_ALLOWED' });
    }

    // Admin auth (throws on failure)
    requireAdmin(req);

    // Avoid caching
    res.setHeader('Cache-Control', 'no-store');

    const useMock = process.env.ADMIN_MOCK === '1';
    if (useMock) {
      const mock = [
        { userId: 'u1', username: 'piKing', referrals: 42 },
        { userId: 'u2', username: 'satoshi_pi', referrals: 28 },
        { userId: 'u3', username: 'ohmywinner', referrals: 21 },
        { userId: 'u4', username: 'alphaNode', referrals: 17 },
        { userId: 'u5', username: 'piStorm', referrals: 11 },
      ];
      return res.status(200).json(mock);
    }

    // DB
    await dbConnect();

    // If your schema uses different fields, adjust here:
    // e.g., 'referralCount' or nested stats like 'stats.referrals'
    const topUsers = await User.find({ referralCount: { $gt: 0 } })
      .select('_id username referralCount')
      .sort({ referralCount: -1 })
      .limit(10)
      .lean();

    const mapped = (topUsers || []).map((u) => ({
      userId: String(u._id),
      username: u.username || 'Anonymous',
      referrals: Number(u.referralCount || 0),
    }));

    return res.status(200).json(mapped);
  } catch (e) {
    console.error('❌ referrals/top API error:', e);
    return res.status(e.statusCode || 500).json({
      message: e.message || 'Server error',
    });
  }
}
