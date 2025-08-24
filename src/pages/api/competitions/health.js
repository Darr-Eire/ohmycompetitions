// src/pages/api/competitions/health.js

import { requireAdmin } from '../../../lib/adminAuth';

// in src/lib/adminAuth.js
import dbConnect from './dbConnect';
import User from '../models/User';

export default async function handler(req, res) {
  try {
    // Protect route with admin credentials (throws on invalid)
    requireAdmin(req);
  } catch (err) {
    return res.status(err.statusCode || 403).json({
      success: false,
      error: err.message || 'Forbidden: Invalid credentials',
    });
  }

  // Optional mock mode for dashboards/local dev
  const useMock = process.env.ADMIN_MOCK === '1';
  if (useMock) {
    const now = Date.now();
    const mock = [
      {
        id: 'c1',
        title: 'iPhone 16 Ultra',
        ticketsSold: 120,
        totalTickets: 1000,
        endsAt: new Date(now + 20 * 60 * 60 * 1000).toISOString(),
        status: 'Active',
        warning: 'Low sell-through (<20%)',
        critical: '',
      },
      {
        id: 'c2',
        title: 'Ledger Nano X Bundle',
        ticketsSold: 950,
        totalTickets: 1000,
        endsAt: new Date(now + 6 * 60 * 60 * 1000).toISOString(),
        status: 'Ending Soon',
        warning: '',
        critical: 'Ends < 6h',
      },
      {
        id: 'c3',
        title: 'Pi Swag Pack',
        ticketsSold: 0,
        totalTickets: 100,
        endsAt: new Date(now + 48 * 60 * 60 * 1000).toISOString(),
        status: 'Active',
        warning: '0 tickets sold',
        critical: '',
      },
    ];
    return res.status(200).json(mock);
  }

  try {
    await dbConnect();

    // Pull active competitions and compute simple health signals
    const comps = await Competition.find({ 'comp.status': 'active' })
      .select('title comp.totalTickets comp.ticketsSold comp.endsAt')
      .sort({ updatedAt: -1 })
      .lean();

    const alerts = comps.map((c) => {
      const sold = c.comp?.ticketsSold ?? 0;
      const total = c.comp?.totalTickets ?? 0;
      const endsAt = c.comp?.endsAt ? new Date(c.comp.endsAt) : null;

      const sellThrough = total > 0 ? sold / total : 0;
      const hoursLeft = endsAt ? Math.max(0, (endsAt.getTime() - Date.now()) / 36e5) : null;

      let status = 'Active';
      if (hoursLeft !== null && hoursLeft <= 24) status = 'Ending Soon';

      let warning = '';
      if (total > 0 && sellThrough < 0.2) warning = 'Low sell-through (<20%)';
      if (sold === 0) warning = '0 tickets sold';

      let critical = '';
      if (hoursLeft !== null && hoursLeft <= 6) critical = 'Ends < 6h';

      return {
        id: String(c._id),
        title: c.title,
        ticketsSold: sold,
        totalTickets: total,
        endsAt: endsAt ? endsAt.toISOString() : null,
        status,
        warning,
        critical,
      };
    });

    return res.status(200).json(alerts);
  } catch (e) {
    console.error('competitions/health API error', e);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}
