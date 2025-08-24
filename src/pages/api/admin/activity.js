import { requireAdmin } from './_adminAuth';
import { dbConnect } from 'lib/dbConnect';
import Competition from 'models/Competition';

// Optional: if you have an AuditLog collection, import it and use the real section below
// import AuditLog from '@/models/AuditLog';

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  const useMock = process.env.ADMIN_MOCK === '1';

  if (useMock) {
    // ---- MOCK: last 24h mixed events ----
    const now = Date.now();
    const mock = [
      { type: 'winner', message: 'User @piLegend claimed prize on "iPhone 16 Draw"', timestamp: now - 10 * 60 * 1000, href: '/admin/competitions/xxxxxxxxxxxxxxxxxxxxxxx1' },
      { type: 'voucher', message: 'Voucher ABC-123 redeemed by @satoshi_pi', timestamp: now - 45 * 60 * 1000, href: '/admin/vouchers' },
      { type: 'payment', message: 'Payment 31.4π received for "Weekly Mega"', timestamp: now - 2 * 60 * 60 * 1000 },
      { type: 'signup', message: 'New user joined: @pi_hustler', timestamp: now - 3 * 60 * 60 * 1000, href: '/admin/users' },
      { type: 'game', message: 'Try-Your-Luck: @speedrunner scored x3', timestamp: now - 5 * 60 * 60 * 1000, href: '/admin/try-your-luck' },
    ];
    return res.status(200).json(mock);
  }

  try {
    await dbConnect();

    // ---- REAL (choose your source of truth) ----
    // If you have an AuditLog model with fields: { type, message, createdAt, href }
    // const logs = await AuditLog.find({ createdAt: { $gte: new Date(Date.now() - 24*60*60*1000) } })
    //   .sort({ createdAt: -1 })
    //   .limit(30)
    //   .lean();

    // TEMP REAL EXAMPLE using Competition doc timestamps as “activity”:
    const comps = await Competition.find({})
      .sort({ updatedAt: -1 })
      .limit(10)
      .lean();

    const logs = comps.map(c => ({
      type: 'competition',
      message: `Competition updated: "${c.title}"`,
      timestamp: new Date(c.updatedAt).getTime(),
      href: `/admin/competitions/${c._id}`,
    }));

    return res.status(200).json(logs);
  } catch (e) {
    console.error('activity API error', e);
    return res.status(500).json({ message: 'Server error' });
  }
}
