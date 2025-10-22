// src/pages/api/admin/competitions/health.js
import { dbConnect } from 'lib/dbConnect';
import Competition from 'models/Competition';
import { requireAdmin } from '../_adminAuth';

export default async function handler(req, res) {
  if (!(await requireAdmin(req, res))) return; // gate
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();
    const comps = await Competition.find({}).sort({ updatedAt: -1 }).lean();
    const items = comps.map((c) => ({
      id: String(c._id),
      title: c.title,
      slug: c.comp?.slug ?? c.slug ?? null,
      ticketsSold: c.comp?.ticketsSold ?? c.ticketsSold ?? 0,
      totalTickets: c.comp?.totalTickets ?? c.totalTickets ?? 0,
      percentSold:
        (c.comp?.totalTickets ?? c.totalTickets)
          ? Math.round(((c.comp?.ticketsSold ?? c.ticketsSold ?? 0) * 100) / (c.comp?.totalTickets ?? c.totalTickets))
          : 0,
      status: c.comp?.status ?? c.status ?? 'unknown',
      endsAt: c.comp?.endsAt ?? c.endsAt ?? null,
      prizePool: c.comp?.prizePool ?? c.prizePool ?? 0,
      updatedAt: c.updatedAt ?? null,
      startsAt: c.comp?.startsAt ?? c.startsAt ?? null,
    }));

    return res.status(200).json({ items, serverNow: new Date().toISOString() });
  } catch (e) {
    console.error('competition health error', e);
    return res.status(500).json({ error: 'Server error' });
  }
}
