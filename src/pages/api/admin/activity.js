// File: src/pages/api/admin/activity.js

import { requireAdmin } from 'lib/adminAuth';
import dbConnect from 'lib/dbConnect';
import Competition from 'models/Competition';
// import AuditLog from 'models/AuditLog'; // if you have one

export default async function handler(req, res) {
  try {
    // ✅ Only allow GET for this endpoint
    if (req.method !== 'GET') {
      return res.status(405).json({ message: 'METHOD_NOT_ALLOWED' });
    }

    // 🔐 Require admin authentication via headers
    requireAdmin(req);

    // 🚫 Avoid caching in browsers/CDNs
    res.setHeader('Cache-Control', 'no-store');

    const useMock = process.env.ADMIN_MOCK === '1';

    // 🧪 Mock activity (fast, no DB)
    if (useMock) {
      const now = Date.now();
      const mock = [
        {
          type: 'winner',
          message: 'User @piLegend claimed prize on "iPhone 16 Draw"',
          timestamp: now - 10 * 60 * 1000,
          href: '/admin/competitions/xxxxxxxxxxxxxxxxxxxxxxx1',
        },
        {
          type: 'voucher',
          message: 'Voucher ABC-123 redeemed by @satoshi_pi',
          timestamp: now - 45 * 60 * 1000,
          href: '/admin/vouchers',
        },
        {
          type: 'payment',
          message: 'Payment 31.4π received for "Weekly Mega"',
          timestamp: now - 2 * 60 * 60 * 1000,
        },
        {
          type: 'signup',
          message: 'New user joined: @pi_hustler',
          timestamp: now - 3 * 60 * 60 * 1000,
          href: '/admin/users',
        },
        {
          type: 'game',
          message: 'Try-Your-Luck: @speedrunner scored x3',
          timestamp: now - 5 * 60 * 60 * 1000,
          href: '/admin/try-your-luck',
        },
      ];
      return res.status(200).json(mock);
    }

    // 🔌 Real activity
    await dbConnect();

    // If you have an AuditLog model with { type, message, createdAt, href }:
    /*
    const logs = await AuditLog.find({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // last 24h
    })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    return res.status(200).json(
      logs.map(l => ({
        type: l.type,
        message: l.message,
        timestamp: new Date(l.createdAt).getTime(),
        href: l.href || null,
      }))
    );
    */

    // Fallback: derive recent activity from competitions (requires timestamps in schema)
    const comps = await Competition.find({})
      .sort({ updatedAt: -1 })
      .limit(10)
      .lean();

    const logs = comps.map((c) => ({
      type: 'competition',
      message: `Competition updated: "${c.title}"`,
      timestamp: c.updatedAt ? new Date(c.updatedAt).getTime() : Date.now(),
      href: `/admin/competitions/${c._id}`,
    }));

    return res.status(200).json(logs);
  } catch (err) {
    console.error('❌ Admin activity API error:', err);
    return res.status(err.statusCode || 500).json({
      message: err.message || 'Server error',
    });
  }
}
