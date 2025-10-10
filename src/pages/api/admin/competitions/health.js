import { dbConnect } from '../../../../lib/dbConnect';
import Competition from '../../../../models/Competition';
import { requireAdmin } from '../_adminAuth';

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;
  try {
    await dbConnect();
    const comps = await Competition.find({}).sort({ updatedAt: -1 }).lean();
    const health = comps.map(c => ({
      id: c._id,
      title: c.title,
      slug: c.comp?.slug,
      ticketsSold: c.comp?.ticketsSold || 0,
      totalTickets: c.comp?.totalTickets || 0,
      percentSold: c.comp?.totalTickets ? Math.round((c.comp.ticketsSold || 0) * 100 / c.comp.totalTickets) : 0,
      status: c.comp?.status || 'unknown',
      endsAt: c.comp?.endsAt || null,
      prizePool: c.comp?.prizePool || 0,
    }));
    res.status(200).json(health);
  } catch (e) {
    console.error('competition health error', e);
    res.status(500).json({ error: 'Server error' });
  }
}


