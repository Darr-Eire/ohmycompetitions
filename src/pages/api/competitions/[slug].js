import { dbConnect } from '../../../lib/dbConnect';
import Competition from '../../../models/Competition';

export default async function handler(req, res) {
  // --- CORS handling ---
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET, OPTIONS');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // --- Validate slug ---
  const rawSlug = req.query.slug;
  if (typeof rawSlug !== 'string' || !rawSlug.trim()) {
    return res.status(400).json({ error: 'Missing slug parameter' });
  }

  const slug = rawSlug.trim().toLowerCase();

  try {
    await dbConnect();

    const doc = await Competition.findOne({
      $or: [{ 'comp.slug': slug }, { slug }],
    })
      .select({
        _id: 1,
        'comp.slug': 1,
        'comp.status': 1,
        'comp.ticketsSold': 1,
        'comp.totalTickets': 1,
        'comp.entryFee': 1,
        'comp.startsAt': 1,
        'comp.endsAt': 1,
        'comp.paymentType': 1,
        'comp.piAmount': 1,
        'comp.location': 1,
        'comp.maxPerUser': 1,
        'comp.winnersCount': 1,
        title: 1,
        prize: 1,
        prizeLabel: 1,
        prizeBreakdown: 1,
        imageUrl: 1,
        thumbnail: 1,
        theme: 1,
        href: 1,
        description: 1,
        createdAt: 1,
        published: 1,
      })
      .lean();

    if (!doc) {
      return res.status(404).json({
        error: 'Competition not found',
        code: 'COMPETITION_NOT_FOUND',
      });
    }

    const c = doc.comp || {};
    const totalTickets = Number(c.totalTickets ?? 0);
    const ticketsSold = Number(c.ticketsSold ?? 0);
    const percentSold = totalTickets > 0 ? Math.round((ticketsSold / totalTickets) * 100) : 0;

    const payload = {
      _id: String(doc._id),
      slug: c.slug || doc.slug || slug,
      title: doc.title ?? 'Competition',
      prize: doc.prize ?? doc.prizeLabel ?? '',
      prizeLabel: doc.prizeLabel ?? doc.prize ?? '',
      description: doc.description ?? '',
      imageUrl: doc.imageUrl || '/images/default-prize.png',
      thumbnail: doc.thumbnail || null,
      theme: doc.theme ?? null,
      href: doc.href ?? (c.slug ? `/competitions/${c.slug}` : null),

      // Stats
      ticketsSold,
      totalTickets,
      percentSold,

      // Pricing / Meta
      entryFee: Number(c.entryFee ?? 0),
      piAmount: Number(c.piAmount ?? c.entryFee ?? 0),
      status: c.status ?? 'active',
      paymentType: c.paymentType ?? 'pi',
      startsAt: c.startsAt ?? null,
      endsAt: c.endsAt ?? null,
      location: c.location ?? 'Online',

      // Exposed limits
      maxPerUser: Number(c.maxPerUser ?? 1),
      winnersCount: Number(c.winnersCount ?? 1),

      // Additional
      prizeBreakdown: Array.isArray(doc.prizeBreakdown) ? doc.prizeBreakdown : [],
      published: doc.published ?? true,
      createdAt: doc.createdAt,
    };

    // --- Cache headers for better performance ---
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return res.status(200).json(payload);
  } catch (err) {
    console.error('❌ Error fetching competition:', err);
    return res.status(500).json({
      error: err.message || 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
}
