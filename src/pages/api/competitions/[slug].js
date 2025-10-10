// file: src/pages/api/competitions/[slug].js
import { dbConnect } from '../../../lib/dbConnect';
import Competition from '../../../models/Competition';

export default async function handler(req, res) {
  // CORS (allow GET + preflight)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET, OPTIONS');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Normalize slug
  const raw = req.query.slug;
  if (typeof raw !== 'string' || !raw.trim()) {
    return res.status(400).json({ error: 'Missing slug parameter' });
  }
  const slug = raw.trim().toLowerCase();

  try {
    await dbConnect();

    const competition = await Competition.findOne({
      $or: [{ 'comp.slug': slug }, { slug }],
    })
      .select({
        _id: 1,
        // comp fields
        'comp.status': 1,
        'comp.ticketsSold': 1,
        'comp.totalTickets': 1,
        'comp.entryFee': 1,
        'comp.startsAt': 1,
        'comp.endsAt': 1,
        'comp.slug': 1,
        'comp.paymentType': 1,
        'comp.piAmount': 1,
        'comp.location': 1,
        'comp.maxPerUser': 1,      // ✅ include it
        'comp.winnersCount': 1,    // ✅ include it

        // top-level fields
        slug: 1,
        title: 1,
        prize: 1,
        prizeLabel: 1,
        prizeBreakdown: 1,         // ✅ top-level, not comp.prizeBreakdown
        imageUrl: 1,
        theme: 1,
        href: 1,
        description: 1,
        published: 1,
      })
      .lean();

    if (!competition) {
      return res
        .status(404)
        .json({ error: 'Competition not found', code: 'COMPETITION_NOT_FOUND' });
    }

    const c = competition.comp || {};
    const totalTickets = c.totalTickets ?? 100;
    const ticketsSold = c.ticketsSold ?? 0;
    const percentSold =
      totalTickets > 0 ? Math.round((ticketsSold / totalTickets) * 100) : 0;

    const response = {
      _id: competition._id?.toString?.() || competition._id,
      slug: c.slug || competition.slug || slug,
      title: competition.title ?? 'Competition',
      prize: competition.prize ?? competition.prizeLabel ?? '',
      prizeLabel: competition.prizeLabel ?? competition.prize ?? '',
      description: competition.description ?? '',
      imageUrl: competition.imageUrl || '/images/default-prize.png',
      theme: competition.theme ?? null,
      href: competition.href ?? null,

      // comp (numbers + meta)
      ticketsSold,
      totalTickets,
      percentSold, // optional convenience
      entryFee: c.entryFee ?? 0,
      piAmount: c.piAmount ?? c.entryFee ?? 0,
      status: c.status ?? 'active',
      paymentType: c.paymentType ?? 'pi',
      startsAt: c.startsAt ?? null,
      endsAt: c.endsAt ?? null,
      location: c.location ?? 'Online',

      // ✅ the two fields your UI needs
      maxPerUser: c.maxPerUser ?? null,
      winnersCount: c.winnersCount ?? null,

      // ✅ correct source (top-level in schema)
      prizeBreakdown: competition.prizeBreakdown ?? [],

      published: competition.published ?? true,
    };

    // Cache (edge-friendly): 60s fresh, 5m SWR
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return res.status(200).json(response);
  } catch (error) {
    console.error('❌ Error fetching competition:', error);
    return res
      .status(500)
      .json({ error: error.message || 'Internal server error', code: 'INTERNAL_ERROR' });
  }
}
