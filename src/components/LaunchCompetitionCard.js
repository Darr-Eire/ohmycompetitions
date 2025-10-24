'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

const BRAND = { c1: '#00ffd5', c2: '#0077ff' }

/* helpers */
const clamp = (n, a, b) => Math.max(a, Math.min(b, n))
const toNum = (v) => {
  if (v == null) return null
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v === 'string') {
    const n = Number(v.replace(/[^\d.,-]/g, '').replace(',', '.'))
    return Number.isFinite(n) ? n : null
  }
  return null
}
const fmtPi = (v) => {
  const n = toNum(v)
  if (n == null) return 'TBA'
  if (n <= 0) return 'TBA'
  return `${(n % 1 === 0 ? n.toFixed(0) : n.toFixed(2))} π`
}

/* normalize prize tiers from many shapes */
function normalizeTiers(src, prizeProp) {
  const s = src && typeof src === 'object' ? src : {}
  const out = {}

  const f1 = s.firstPrize ?? s.prize1 ?? s['1st'] ?? s?.prizeBreakdown?.firstPrize
  const f2 = s.secondPrize ?? s.prize2 ?? s['2nd'] ?? s?.prizeBreakdown?.secondPrize
  const f3 = s.thirdPrize ?? s.prize3 ?? s['3rd'] ?? s?.prizeBreakdown?.thirdPrize

  if (f1 != null) out['1st'] = f1
  if (f2 != null) out['2nd'] = f2
  if (f3 != null) out['3rd'] = f3

  if (Array.isArray(s.prizes)) {
    if (!out['1st'] && s.prizes[0] != null) out['1st'] = s.prizes[0]
    if (!out['2nd'] && s.prizes[1] != null) out['2nd'] = s.prizes[1]
    if (!out['3rd'] && s.prizes[2] != null) out['3rd'] = s.prizes[2]
  }

  if (!out['1st'] && prizeProp) out['1st'] = prizeProp
  return out
}

/* pool = prizePi (if >0) else sum of tiers (if >0) */
function resolvePrizePool(c, tiers) {
  const direct = toNum(c.prizePi ?? c.totalPrizePi ?? c.poolPi)
  if (direct != null && direct > 0) return direct

  const tierNums = ['1st', '2nd', '3rd']
    .map((k) => toNum(tiers[k]))
    .filter((n) => n != null && n > 0)

  if (tierNums.length) return tierNums.reduce((a, b) => a + b, 0)
  return null
}

/* status */
function statusFromDates(startsAt, endsAt) {
  const now = Date.now()
  const s = startsAt ? new Date(startsAt).getTime() : null
  const e = endsAt ? new Date(endsAt).getTime() : null
  if (s && now < s) return 'UPCOMING'
  if (e && now > e) return 'ENDED'
  return 'LIVE'
}

export default function LaunchCompetitionCard({
  comp = {},
  className = '',
  title: titleProp,
  prize: prizeProp,
}) {
  const c = comp?.comp ?? comp ?? {}

  const title = titleProp ?? c.title ?? 'Launch Week'
  const slug = c.slug ?? ''

  /* Entry fee & tickets */
  const entryFee =
    toNum(
      c.pricePi ??
        c.entryFeePi ??
        c.feePi ??
        c.entryFee ??
        c.ticketPrice ??
        c.price
    ) ?? 0

  const totalTickets =
    toNum(c.totalTickets ?? c.ticketsTotal ?? c.capacity) ?? 0
  const ticketsSold = clamp(
    toNum(c.ticketsSold ?? c.sold ?? c.entries) ?? 0,
    0,
    Math.max(0, totalTickets)
  )
  const progress = totalTickets > 0 ? Math.round((ticketsSold / totalTickets) * 100) : 0
  const remaining = totalTickets > 0 ? Math.max(0, totalTickets - ticketsSold) : null

  const startsAt = c.startsAt ?? c.startAt ?? c.drawOpensAt ?? null
  const endsAt = c.endsAt ?? c.endAt ?? c.drawAt ?? c.closingAt ?? null
  const status = statusFromDates(startsAt, endsAt)

  const isLive = status === 'LIVE'
  const isUpcoming = status === 'UPCOMING'
  const isEnded = status === 'ENDED'

  /* Prize logic */
  const tiers = useMemo(() => normalizeTiers(c, prizeProp), [c, prizeProp])

  // winners count: prefer explicit; fallback to how many tier values are >0
  const winnersExplicit = toNum(c.winners ?? c.totalWinners ?? c.numWinners)
  const tierCount = ['1st', '2nd', '3rd'].filter((k) => toNum(tiers[k]) > 0).length
  const winnersCount = winnersExplicit && winnersExplicit > 0
    ? Math.min(3, winnersExplicit)
    : Math.max(1, tierCount || 1)

  const pool = resolvePrizePool(c, tiers)
  const poolText = fmtPi(pool)

  const drawText = endsAt
    ? new Date(endsAt).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'TBA'

  const entryFeeText = isUpcoming
    ? 'TBA'
    : entryFee > 0
    ? fmtPi(entryFee)
    : 'Free Entry'

  const href = slug ? `/ticket-purchase/${encodeURIComponent(slug)}` : '#'

  /* live countdown tick */
  const [, setTick] = useState(0)
  useEffect(() => {
    if (!isLive || !endsAt) return
    const id = setInterval(() => setTick((t) => (t + 1) % 1e6), 1000)
    return () => clearInterval(id)
  }, [isLive, endsAt])

  return (
    <div
      className={[
        'relative w-full max-w-sm mx-auto font-orbitron',
        'rounded-2xl overflow-hidden border border-cyan-400/60 bg-[#0b1220]/80 backdrop-blur',
        'shadow-[0_0_25px_rgba(0,255,213,0.18)] transition-transform duration-300 hover:scale-[1.02]',
        className,
      ].join(' ')}
    >
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(60%_60%_at_50%_0%,rgba(0,255,213,0.14),transparent_60%)]" />

      {/* Header */}
      <div className="relative z-10 px-4 pt-3 pb-2 border-b border-cyan-400/15 bg-slate-950/40">
        <div className="flex items-center justify-between">
          <h3
            className="text-[16px] font-extrabold tracking-wide uppercase bg-clip-text text-transparent"
            style={{ backgroundImage: `linear-gradient(90deg, ${BRAND.c1}, ${BRAND.c2})` }}
          >
            {title}
          </h3>
          <div
            className={[
              'px-2 py-0.5 rounded-md text-[11px] font-extrabold shadow-sm',
              isLive && 'bg-gradient-to-r from-emerald-300 to-green-400 text-black',
              isUpcoming && 'bg-gradient-to-r from-orange-400 to-orange-500 text-black',
              isEnded && 'bg-gradient-to-r from-rose-400 to-red-500 text-white',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {status === 'UPCOMING' ? 'COMING SOON' : status}
          </div>
        </div>

        <div className="mt-2 flex items-center justify-center gap-2">
          <span className="inline-flex items-center rounded-md bg-cyan-500/20 border border-cyan-400/30 text-cyan-200 px-2 py-0.5 text-[10px] font-bold">
            Launch Week
          </span>
          <span className="inline-flex items-center rounded-md bg-blue-500/15 border border-blue-400/30 text-blue-200 px-2 py-0.5 text-[10px] font-bold">
            {winnersCount === 1 ? 'Single Winner' : `${winnersCount} Winners`}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="relative z-10 p-3">
        {/* Prize Pool */}
        <div className="mx-auto w-[96%] rounded-xl border border-cyan-400/40 bg-gradient-to-r from-cyan-500/10 via-cyan-400/10 to-cyan-500/10 p-3 shadow-[0_0_10px_rgba(34,211,238,0.2)]">
          <div className="text-center text-sm font-bold text-cyan-300">Prize Pool</div>
          <div className="mt-1 text-center text-2xl font-extrabold text-white tracking-wide">{poolText}</div>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-1.5">
            {['1st', '2nd', '3rd'].slice(0, winnersCount).map((k, i) => (
              <div
                key={k}
                className={[
                  'rounded-lg px-3 py-2 text-center bg-white/5',
                  i === 0 ? 'border border-cyan-300/40' : 'border border-cyan-300/20',
                ].join(' ')}
              >
                <div className="text-[10px] text-cyan-300 tracking-wider">{k} Prize</div>
                <div className="text-white font-extrabold">{fmtPi(tiers[k])}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Details row */}
        <div className="mt-3 grid grid-cols-3 gap-1.5 text-[11px]">
          <Fact label="Entry Fee" value={entryFeeText} />
          <Fact label="Draw Date" value={drawText} />
          <Fact
            label="Tickets"
            value={totalTickets ? `${ticketsSold} / ${totalTickets}` : '∞'}
          />
        </div>

        {/* Progress bar */}
        {totalTickets > 0 && (
          <div className="mt-3">
            <div className="w-full h-2 rounded-full bg-cyan-200/10 border border-cyan-300/30 overflow-hidden">
              <div
                className="h-full transition-[width] duration-700 ease-out bg-gradient-to-r from-[#00ffd5] via-blue-400 to-[#0077ff]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-1 text-center text-xs text-white">
              Sold: <span className="font-semibold">{ticketsSold.toLocaleString()}</span>
              {totalTickets ? ` / ${totalTickets.toLocaleString()}` : ''} ({progress}%)
            </p>
            {isLive && remaining != null && remaining <= Math.max(5, Math.ceil(totalTickets * 0.1)) && (
              <p className="text-center text-[11px] text-cyan-300 mt-0.5">
                {remaining} tickets left! 🔥
              </p>
            )}
          </div>
        )}

        {/* CTA */}
        <div className="mt-3">
          {isEnded ? (
            <button
              disabled
              className="w-full py-2 rounded-md font-bold bg-slate-700 text-slate-300 cursor-not-allowed"
            >
              Ended
            </button>
          ) : isUpcoming || !slug ? (
            <button
              disabled
              className="w-full py-2 rounded-md font-bold text-black opacity-70"
              style={{ backgroundImage: `linear-gradient(90deg, ${BRAND.c1}, ${BRAND.c2})` }}
            >
              Coming Soon
            </button>
          ) : (
            <Link href={href}>
              <span className="block w-full text-center rounded-md py-2 font-bold text-black bg-gradient-to-r from-[#00ffd5] to-[#0077ff] hover:brightness-110 active:translate-y-px transition-transform">
                More Details
              </span>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

function Fact({ label, value }) {
  return (
    <div className="rounded-lg border border-cyan-300/25 bg-white/5 px-2 py-1 text-center">
      <div className="text-slate-400">{label}</div>
      <div className="font-bold text-white">{value}</div>
    </div>
  )
}
