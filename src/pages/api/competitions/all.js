import { dbConnect } from 'lib/dbConnect'
import Competition from 'models/Competition'

const DEFAULT_TOTAL = 100
const DEFAULT_STATUS = 'active'

/* ──────────────────────────────── CORS ──────────────────────────────── */
function allowCors(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Max-Age', '600')
}

/* ──────────────────────────────── Handler ──────────────────────────────── */
export default async function handler(req, res) {
  allowCors(req, res)

  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'GET')
    return res.status(405).json({ success: false, error: 'Method not allowed' })

  // Example: /api/competitions/all?status=active&includeEnded=0&limit=100&sort=liveFirst
  const statusFilter = String(req.query.status || '').trim().toLowerCase()
  const includeEnded = (req.query.includeEnded ?? '1').toString() !== '0'
  const limit = Math.min(parseInt(req.query.limit ?? '500', 10) || 500, 1000)
  const sortMode = String(req.query.sort || 'liveFirst')

  try {
    await dbConnect()

    const now = Date.now()
    const query = {}

    /* ───────── Projection: include all shapes we might need ───────── */
    const projection = {
      _id: 1,
      title: 1,
      prize: 1, // fallback text prize
      imageUrl: 1,
      thumbnail: 1,
      theme: 1,
      href: 1,

      // core comp info
      'comp.status': 1,
      'comp.ticketsSold': 1,
      'comp.totalTickets': 1,
      'comp.entryFee': 1,
      'comp.pricePi': 1,
      'comp.feePi': 1,
      'comp.ticketPricePi': 1,

      'comp.startsAt': 1,
      'comp.endsAt': 1,
      'comp.slug': 1,
      'comp.paymentType': 1,
      'comp.piAmount': 1,

      // prize info (various shapes)
      'comp.prizePi': 1,
      'comp.prizeBreakdown': 1,
      'comp.firstPrize': 1,
      'comp.secondPrize': 1,
      'comp.thirdPrize': 1,
      'comp.prize1': 1,
      'comp.prize2': 1,
      'comp.prize3': 1,
      'comp.prizes': 1,
      'comp.winners': 1,
      'comp.totalWinners': 1,
      'comp.numWinners': 1,
    }

    let docs = await Competition.find(query).select(projection).lean()

    /* ───────── Filter by status ───────── */
    docs = docs.filter((c) => {
      const comp = c.comp || {}
      const status = (comp.status || DEFAULT_STATUS).toLowerCase()
      const startsAt = comp.startsAt ? new Date(comp.startsAt).getTime() : null
      const endsAt = comp.endsAt ? new Date(comp.endsAt).getTime() : null

      const timeState =
        startsAt && now < startsAt
          ? 'upcoming'
          : endsAt && now > endsAt
          ? 'ended'
          : 'active'

      if (statusFilter) {
        const matches = status === statusFilter || timeState === statusFilter
        if (!matches) return false
      } else if (!includeEnded && timeState === 'ended') {
        return false
      }
      return true
    })

    /* ───────── Sorting ───────── */
    if (sortMode === 'liveFirst') {
      docs.sort((a, b) => {
        const A = a.comp || {},
          B = b.comp || {}
        const na = nowState(A, now),
          nb = nowState(B, now)
        const rank = { active: 0, upcoming: 1, ended: 2 }
        if (rank[na] !== rank[nb]) return rank[na] - rank[nb]
        const as = A.startsAt ? new Date(A.startsAt).getTime() : 0
        const bs = B.startsAt ? new Date(B.startsAt).getTime() : 0
        return as - bs
      })
    } else if (sortMode === 'newest') {
      docs.sort((a, b) => {
        const as = a._id?.getTimestamp ? a._id.getTimestamp().getTime() : 0
        const bs = b._id?.getTimestamp ? b._id.getTimestamp().getTime() : 0
        return bs - as
      })
    } else if (sortMode === 'soonest') {
      docs.sort((a, b) => {
        const as = a.comp?.startsAt
          ? new Date(a.comp.startsAt).getTime()
          : Number.MAX_SAFE_INTEGER
        const bs = b.comp?.startsAt
          ? new Date(b.comp.startsAt).getTime()
          : Number.MAX_SAFE_INTEGER
        return as - bs
      })
    }

    if (Number.isFinite(limit) && limit > 0) docs = docs.slice(0, limit)

    /* ───────── Helpers ───────── */
    const toNum = (v, d = 0) => {
      if (v == null) return d
      if (typeof v === 'number' && Number.isFinite(v)) return v
      if (typeof v === 'string') {
        const n = Number(v.replace?.(/[^\d.,-]/g, '').replace(',', '.') ?? v)
        return Number.isFinite(n) ? n : d
      }
      return d
    }

    /* ───────── Normalize for frontend ───────── */
    const formatted = docs.map((competition) => {
      const comp = competition.comp || {}
      const ticketsSold = toNum(comp.ticketsSold, 0)
      const totalTickets = toNum(comp.totalTickets, DEFAULT_TOTAL)

      // normalize entry fee
      const entryFeePi = toNum(
        comp.pricePi ??
          comp.feePi ??
          comp.ticketPricePi ??
          comp.piAmount ??
          comp.entryFee,
        0
      )

      // times
      const startsAt = comp.startsAt ? new Date(comp.startsAt) : null
      const endsAt = comp.endsAt ? new Date(comp.endsAt) : null
      const state = nowState(comp, now)

      // winners & prizes
      const winners =
        comp.winners ?? comp.totalWinners ?? comp.numWinners ?? null

      const firstPrize =
        comp.firstPrize ??
        comp.prize1 ??
        (Array.isArray(comp.prizes) ? comp.prizes[0] : undefined)
      const secondPrize =
        comp.secondPrize ??
        comp.prize2 ??
        (Array.isArray(comp.prizes) ? comp.prizes[1] : undefined)
      const thirdPrize =
        comp.thirdPrize ??
        comp.prize3 ??
        (Array.isArray(comp.prizes) ? comp.prizes[2] : undefined)
      const prizes = Array.isArray(comp.prizes) ? comp.prizes : undefined
      const prizeBreakdown = comp.prizeBreakdown || null

      const prizePi = toNum(comp.prizePi, null)

      return {
        _id: competition._id,
        comp: {
          ...comp,
          status: comp.status || DEFAULT_STATUS,
          startsAt: startsAt ? startsAt.toISOString() : null,
          endsAt: endsAt ? endsAt.toISOString() : null,

          // normalized ticket + payment
          ticketsSold,
          totalTickets,
          entryFee: entryFeePi,
          pricePi: entryFeePi,
          paymentType: comp.paymentType || 'pi',

          // prize info
          prizePi: prizePi ?? undefined,
          prizeBreakdown,
          firstPrize,
          secondPrize,
          thirdPrize,
          prizes,
          winners,
        },

        // UI convenience
        title: competition.title || '',
        prize: competition.prize || null,
        imageUrl: competition.imageUrl || '/pi.jpeg',
        thumbnail: competition.thumbnail || null,
        theme: competition.theme || null,
        href: competition.href || null,

        fee: `${entryFeePi} π`,
        remainingTickets: Math.max(0, totalTickets - ticketsSold),
        isActiveNow: state === 'active',
        timeState: state, // 'active' | 'upcoming' | 'ended'
      }
    })

    res.setHeader('Cache-Control', 'public, max-age=15, s-maxage=30')

    console.log(
      `✅ competitions/all -> ${formatted.length} items (filter: ${
        statusFilter || 'any'
      }, includeEnded: ${includeEnded})`
    )
    return res.status(200).json({ success: true, data: formatted })
  } catch (error) {
    console.error('❌ Error fetching competitions:', error)
    return res.status(500).json({
      success: false,
      error: error?.message || 'Internal server error',
      code: 'INTERNAL_ERROR',
    })
  }
}

/* ──────────────────────────────── Helpers ──────────────────────────────── */
function nowState(comp, nowTs) {
  const startsAt = comp?.startsAt ? new Date(comp.startsAt).getTime() : null
  const endsAt = comp?.endsAt ? new Date(comp.endsAt).getTime() : null
  if (startsAt && nowTs < startsAt) return 'upcoming'
  if (endsAt && nowTs > endsAt) return 'ended'
  return 'active'
}
