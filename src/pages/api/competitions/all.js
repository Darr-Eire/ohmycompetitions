// pages/api/competitions/all.js
import connectToDatabase from '../../../lib/mongodb'; // ⬅️ default export from src/lib/mongodb.(ts|js)
import Competition from '../../../models/Competition';

const ALLOWED_ORIGIN = process.env.CORS_ORIGIN || '*';

export default async function handler(req, res) {
  // --- CORS ---
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    // Preflight
    return res.status(204).end();
  }
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    await connectToDatabase();

    // ---------- Query params ----------
    const {
      status,                 // e.g. active | upcoming
      theme,                  // e.g. tech | daily | pi | launch
      liveOnly,               // "true" => now between startsAt/endsAt
      limit,                  // e.g. 50
      sort = 'endsAtAsc',     // endsAtAsc | endsAtDesc | createdDesc
    } = req.query;

    // ---------- Filter ----------
    const now = new Date();
    const filter = {};

    if (status) filter['comp.status'] = status;
    if (theme) filter.theme = theme;

    if (String(liveOnly) === 'true') {
      filter['comp.startsAt'] = { $lte: now };
      filter['comp.endsAt'] = { $gt: now };
    }

    // ---------- Projection ----------
    const projection = {
      _id: 1,
      title: 1,
      prize: 1,
      imageUrl: 1,
      thumbnail: 1,
      theme: 1,
      href: 1,
      'comp.slug': 1,
      'comp.status': 1,
      'comp.ticketsSold': 1,
      'comp.totalTickets': 1,
      'comp.entryFee': 1,
      'comp.startsAt': 1,
      'comp.endsAt': 1,
      'comp.paymentType': 1,
      'comp.piAmount': 1,
      'comp.prizeBreakdown': 1,
    };

    // ---------- Sorting ----------
    const sortMap = {
      endsAtAsc:  { 'comp.endsAt': 1 },
      endsAtDesc: { 'comp.endsAt': -1 },
      createdDesc:{ _id: -1 },
    };
    const sortStage = sortMap[sort] || sortMap.endsAtAsc;

    const lim = Math.min(+(limit ?? 100), 200);

    const docs = await Competition.find(filter)
      .select(projection)
      .sort(sortStage)
      .limit(lim)
      .lean();

    // ---------- Normalize / defaults ----------
    const data = docs.map((d) => {
      const c = d.comp || {};
      const entryFee = Number.isFinite(+c.entryFee) ? +c.entryFee : 0;

      return {
        _id: d._id,
        title: d.title || '',
        prize: d.prize ?? null,
        imageUrl: d.imageUrl || '/images/your.png',
        thumbnail: d.thumbnail || null,
        theme: d.theme || 'tech',
        href: d.href ?? null,
        fee: `${entryFee} π`,
        comp: {
          slug: c.slug || '',
          status: c.status || 'active',
          ticketsSold: Number.isFinite(+c.ticketsSold) ? +c.ticketsSold : 0,
          totalTickets: Number.isFinite(+c.totalTickets) ? +c.totalTickets : 100,
          entryFee,
          startsAt: c.startsAt || null,
          endsAt: c.endsAt || null,
          paymentType: c.paymentType || 'pi',
          piAmount: c.piAmount ?? null,
          prizeBreakdown: c.prizeBreakdown || null,
        },
      };
    });

    // small cache for better TTFB on the homepage; adjust to your freshness needs
    res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=60, stale-while-revalidate=120');

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('❌ /api/competitions/all', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
}
