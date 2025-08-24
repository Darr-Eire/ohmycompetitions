// src/pages/api/competitions/all.js
import { dbConnect } from 'lib/dbConnect';
import Competition from 'models/Competition';

export default async function handler(req, res) {
  // CORS (simple GET)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    // Pull only what the cards/detail need
    const competitions = await Competition.find({})
      .select({
        _id: 1,

        // comp.*
        'comp.slug': 1,
        'comp.status': 1,
        'comp.entryFee': 1,
        'comp.paymentType': 1,
        'comp.piAmount': 1,
        'comp.startsAt': 1,
        'comp.endsAt': 1,
        'comp.ticketsSold': 1,
        'comp.totalTickets': 1,
        'comp.maxPerUser': 1,      // NEW
        'comp.winnersCount': 1,    // NEW

        // root fields
        title: 1,
        prize: 1,
        prizeBreakdown: 1,         // NOTE: root-level in your schema
        imageUrl: 1,
        thumbnail: 1,
        theme: 1,
        href: 1,
        createdAt: 1,
      })
      .sort({ 'comp.status': 1, createdAt: -1 })
      .lean();

    const formattedCompetitions = competitions.map((c) => {
      const comp = c.comp || {};
      return {
        _id: c._id,

        comp: {
          slug: comp.slug,
          status: comp.status || 'active',
          entryFee: Number(comp.entryFee ?? 0),
          paymentType: comp.paymentType || 'pi',
          piAmount: Number(comp.piAmount ?? comp.entryFee ?? 0),
          startsAt: comp.startsAt || null,
          endsAt: comp.endsAt || null,
          ticketsSold: Number(comp.ticketsSold ?? 0),
          totalTickets: Number(comp.totalTickets ?? 0),

          // expose new fields
          maxPerUser: Number(comp.maxPerUser ?? 1),
          winnersCount: Number(comp.winnersCount ?? 1),
        },

        title: c.title,
        prize: c.prize,
        prizeBreakdown: Array.isArray(c.prizeBreakdown) ? c.prizeBreakdown : [],
        imageUrl: c.imageUrl || '/images/your.png',
        thumbnail: c.thumbnail || null,
        theme: c.theme,
        href: c.href || (comp.slug ? `/competitions/${comp.slug}` : '#'),

        // convenience field for old UI bits
        fee: `${Number(comp.entryFee ?? 0)} π`,
      };
    });

    console.log(`✅ Found ${formattedCompetitions.length} competitions`);

    // basic caching for list
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');

    return res.status(200).json({
      success: true,
      data: formattedCompetitions,
    });
  } catch (error) {
    console.error('❌ Error fetching competitions:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
}
