// src/pages/api/xp/offers.js
import { dbConnect } from 'lib/dbConnect';
import Competition from 'models/Competition';
import { computeXPCost, levelFromXP, deriveSlug, deriveEndsAt } from 'lib/xp';

function pickFirstPrize(doc = {}) {
  const c = doc.comp || doc;

  // Check prizeBreakdown first
  if (Array.isArray(c.prizeBreakdown) && c.prizeBreakdown.length > 0) {
    const first = c.prizeBreakdown[0];
    if (typeof first === 'string' && first.trim()) return first.trim();
    if (first && typeof first.prize === 'string' && first.prize.trim()) return first.prize.trim();
  }
  if (Array.isArray(doc.prizeBreakdown) && doc.prizeBreakdown.length > 0) {
    const first = doc.prizeBreakdown[0];
    if (typeof first === 'string' && first.trim()) return first.trim();
    if (first && typeof first.prize === 'string' && first.prize.trim()) return first.prize.trim();
  }

  // Then check prizes[]
  if (Array.isArray(c.prizes) && c.prizes.length > 0) {
    const first = c.prizes[0];
    if (typeof first === 'string' && first.trim()) return first.trim();
    if (first && typeof first.prize === 'string' && first.prize.trim()) return first.prize.trim();
  }
  if (Array.isArray(doc.prizes) && doc.prizes.length > 0) {
    const first = doc.prizes[0];
    if (typeof first === 'string' && first.trim()) return first.trim();
    if (first && typeof first.prize === 'string' && first.prize.trim()) return first.prize.trim();
  }

  // Fallback to flat comp.prize
  if (typeof c.prize === 'string' && c.prize.trim()) return c.prize.trim();
  if (typeof doc.prize === 'string' && doc.prize.trim()) return doc.prize.trim();

  return null;
}



export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    await dbConnect();

    // Select all fields we might need to compute + display
    const comps = await Competition.find({})
      .select({
        _id: 1,
        title: 1,
        prize: 1,
        prizes: 1,
        prizeBreakdown: 1,
        theme: 1,
        imageUrl: 1,
        href: 1,
        'comp.title': 1,
        'comp.slug': 1,
        'comp.href': 1,
        'comp.status': 1,
        'comp.endsAt': 1,
        'comp.drawAt': 1,
        'comp.drawDate': 1,
        'comp.closeAt': 1,
        'comp.entryFee': 1,
        'comp.prize': 1,
        'comp.prizes': 1,
        'comp.prizeBreakdown': 1,
      })
      .lean();

    const now = Date.now();

    const offers = (comps || []).map(c => {
      const slug = deriveSlug(c);
      const endsAt = deriveEndsAt(c);
      const status = c?.comp?.status || 'active';
      const entryFeePi = typeof c?.comp?.entryFee === 'number' ? c.comp.entryFee : undefined;

      const xpCost = computeXPCost(c);
      const minLevel = levelFromXP(xpCost);
      const isClosed =
        (status && String(status).toLowerCase() === 'closed') ||
        (endsAt ? new Date(endsAt).getTime() < now : false);

      const prize = pickFirstPrize(c);

      return {
        _id: c._id,
        slug,
        title: c?.comp?.title || c?.title || 'Competition',
        status,
        xpCost,
        minLevel,
        endsAt,
        entryFeePi,
        prize,                 // ← normalized prize sent to UI
        isClosed,
      };
    })
    // Only show comps that can be bought with XP and aren’t closed
    .filter(o => (o.xpCost || 0) > 0 && !o.isClosed);

    return res.status(200).json({ offers });
  } catch (err) {
    console.error('❌ /api/xp/offers error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
