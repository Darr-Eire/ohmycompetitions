// src/pages/api/competitions/all.js
import { dbConnect } from 'lib/dbConnect';
import Competition from 'models/Competition';

const DEFAULT_TOTAL = 100;
const DEFAULT_STATUS = 'active';

function allowCors(req, res) {
  // Adjust for prod: you can swap * for your domain(s)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '600');
}

export default async function handler(req, res) {
  allowCors(req, res);

  // Preflight
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ success: false, error: 'Method not allowed' });

  // Optional filters: /api/competitions/all?status=active&includeEnded=0&limit=100&sort=liveFirst
  const statusFilter = String(req.query.status || '').trim().toLowerCase(); // 'active', 'upcoming', 'ended' (if you use those)
  const includeEnded = (req.query.includeEnded ?? '1').toString() !== '0';
  const limit = Math.min(parseInt(req.query.limit ?? '500', 10) || 500, 1000);
  const sortMode = String(req.query.sort || 'liveFirst'); // 'liveFirst' | 'newest' | 'soonest'

  try {
    await dbConnect();

    // Build Mongo query
    const now = Date.now();
    const query = {};

    // If you store status only inside comp.status (as your select shows), we can filter in memory after fetch.
    // To keep it fast, we still scope a bit: if status is provided, don’t fetch everything blindly.
    // However, since comp.status is nested, unless you have an index on it, Mongo can't use it efficiently.
    // We’ll fetch and filter in JS to be safe and simple.

    // Minimal projection for UI
    const projection = {
      _id: 1,
      title: 1,
      prize: 1,
      imageUrl: 1,
      thumbnail: 1,
      theme: 1,
      href: 1,
      'comp.status': 1,
      'comp.ticketsSold': 1,
      'comp.totalTickets': 1,
      'comp.entryFee': 1,
      'comp.startsAt': 1,
      'comp.endsAt': 1,
      'comp.slug': 1,
      'comp.paymentType': 1,
      'comp.piAmount': 1,
      'comp.prizeBreakdown': 1,
    };

    let docs = await Competition.find(query).select(projection).lean();

    // In-memory filtering for status & ended
    docs = docs.filter((c) => {
      const comp = c.comp || {};
      const status = (comp.status || DEFAULT_STATUS).toLowerCase();
      const startsAt = comp.startsAt ? new Date(comp.startsAt).getTime() : null;
      const endsAt = comp.endsAt ? new Date(comp.endsAt).getTime() : null;

      // Determine temporal state
      const timeState =
        startsAt && now < startsAt ? 'upcoming' :
        endsAt && now > endsAt   ? 'ended' :
        'active';

      // If client asked for a specific status, use that; otherwise keep all (optionally excluding ended)
      if (statusFilter) {
        // honor explicit status filter by comp.status OR timeState match
        const matches = status === statusFilter || timeState === statusFilter;
        if (!matches) return false;
      } else if (!includeEnded && timeState === 'ended') {
        return false;
      }

      return true;
    });

    // Sorting
    if (sortMode === 'liveFirst') {
      docs.sort((a, b) => {
        const A = a.comp || {}, B = b.comp || {};
        const na = nowState(A, now), nb = nowState(B, now);
        // active -> upcoming -> ended
        const rank = { active: 0, upcoming: 1, ended: 2 };
        if (rank[na] !== rank[nb]) return rank[na] - rank[nb];
        // tie-breaker: sooner start or later end
        const as = A.startsAt ? new Date(A.startsAt).getTime() : 0;
        const bs = B.startsAt ? new Date(B.startsAt).getTime() : 0;
        return as - bs;
      });
    } else if (sortMode === 'newest') {
      docs.sort((a, b) => {
        const as = a._id?.getTimestamp ? a._id.getTimestamp().getTime() : 0;
        const bs = b._id?.getTimestamp ? b._id.getTimestamp().getTime() : 0;
        return bs - as;
      });
    } else if (sortMode === 'soonest') {
      docs.sort((a, b) => {
        const as = a.comp?.startsAt ? new Date(a.comp.startsAt).getTime() : Number.MAX_SAFE_INTEGER;
        const bs = b.comp?.startsAt ? new Date(b.comp.startsAt).getTime() : Number.MAX_SAFE_INTEGER;
        return as - bs;
      });
    }

    // Limit
    if (Number.isFinite(limit) && limit > 0) {
      docs = docs.slice(0, limit);
    }

    // Normalize & compute safe fields
    const formatted = docs.map((competition) => {
      const comp = competition.comp || {};
      const ticketsSold = Number(comp.ticketsSold || 0);
      const totalTickets = Number(comp.totalTickets || DEFAULT_TOTAL);
      const entryFee = Number(comp.entryFee || 0);
      const startsAt = comp.startsAt ? new Date(comp.startsAt) : null;
      const endsAt = comp.endsAt ? new Date(comp.endsAt) : null;
      const state = nowState(comp, now);

      return {
        _id: competition._id,
        comp: {
          ...comp,
          status: comp.status || DEFAULT_STATUS,
          ticketsSold,
          totalTickets,
          entryFee,
          startsAt: startsAt ? startsAt.toISOString() : null,
          endsAt: endsAt ? endsAt.toISOString() : null,
          paymentType: comp.paymentType || 'pi',
          prizeBreakdown: comp.prizeBreakdown || null,
        },
        title: competition.title || '',
        prize: competition.prize || null,
        imageUrl: competition.imageUrl || '/images/your.png',
        thumbnail: competition.thumbnail || null,
        theme: competition.theme || null,
        href: competition.href || null,

        // Convenience fields for UIs:
        fee: `${entryFee} π`,
        remainingTickets: Math.max(0, totalTickets - ticketsSold),
        isActiveNow: state === 'active',
        timeState: state, // 'active' | 'upcoming' | 'ended'
      };
    });

    // Mild caching (tune for your freshness requirements)
    res.setHeader('Cache-Control', 'public, max-age=15, s-maxage=30');

    console.log(`✅ competitions/all -> ${formatted.length} items (filter: ${statusFilter || 'any'}, includeEnded: ${includeEnded})`);
    return res.status(200).json({ success: true, data: formatted });

  } catch (error) {
    console.error('❌ Error fetching competitions:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
}

/* ------------------------- helpers ------------------------- */
function nowState(comp, nowTs) {
  const startsAt = comp?.startsAt ? new Date(comp.startsAt).getTime() : null;
  const endsAt = comp?.endsAt ? new Date(comp.endsAt).getTime() : null;
  if (startsAt && nowTs < startsAt) return 'upcoming';
  if (endsAt && nowTs > endsAt) return 'ended';
  return 'active';
}
