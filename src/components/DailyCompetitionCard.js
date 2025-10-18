// src/components/DailyCompetitionCard.jsx
'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import '@fontsource/orbitron'

/* ───────────────────────── Helpers: prize selection ───────────────────────── */
function tryParseNumber(v) {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v === 'string') {
    const numLike = v.replace(/[^\d.,-]/g, '').replace(',', '.').trim()
    const n = Number(numLike)
    return Number.isFinite(n) ? n : null
  }
  return null
}
function formatPrizeValue(v) {
  if (v == null) return null
  if (typeof v === 'number') {
    const n = v
    const formatted = n >= 1000 ? Math.round(n).toLocaleString() : n.toFixed(2)
    return `${formatted} π`
  }
  const s = String(v).trim()
  return /\bπ\b|[$€£]/.test(s) ? s : `${s} π`
}
function pickTopPrizeFromBreakdown(breakdown = {}) {
  const entries = Object.entries(breakdown || {})
  if (!entries.length) return null
  const preferredKeys = [
    'first','1st','1st prize','1st place','grand','grand prize','top','top prize',
  ]
  const found = entries.find(([k]) => preferredKeys.includes(String(k).toLowerCase()))
  if (found) return found[1]
  let best = null, bestNum = -Infinity
  for (const [, val] of entries) {
    const n = tryParseNumber(val)
    if (n != null && n > bestNum) { bestNum = n; best = val }
  }
  return best ?? entries[0][1]
}
function getTopPrize(comp = {}, fallbackPrize) {
  const c = comp?.comp ? comp.comp : comp
  const bd = c?.prizeBreakdown || comp?.prizeBreakdown
  const fromBreakdown = bd ? pickTopPrizeFromBreakdown(bd) : null
  if (fromBreakdown != null) return formatPrizeValue(fromBreakdown)
  if (c?.firstPrize != null) return formatPrizeValue(c.firstPrize)
  if (c?.prize != null) return formatPrizeValue(c.prize)
  if (Array.isArray(c?.prizes) && c.prizes.length) {
    let best = c.prizes[0], bestNum = tryParseNumber(best)
    for (const p of c.prizes.slice(1)) {
      const n = tryParseNumber(p)
      if (n != null && (bestNum == null || n > bestNum)) { best = p; bestNum = n }
    }
    return formatPrizeValue(best)
  }
  if (fallbackPrize != null) return formatPrizeValue(fallbackPrize)
  return null
}

/* ───────────────────── Helpers: fee normalization/format ──────────────────── */
function resolveNumeric(value) {
  if (value == null) return null
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return null
    const numLike = trimmed.replace(/[^\d.,-]/g, '').replace(',', '.')
    const n = Number(numLike)
    if (Number.isFinite(n)) return n
    return trimmed // e.g., “Free”, “1 π”
  }
  return null
}
function formatEntryFee(value) {
  if (value == null) return 'TBA'
  if (typeof value === 'number') return value === 0 ? 'Free' : `${value.toFixed(2)} π`
  return /\bπ\b|[$€£]/.test(value) ? value : `${value} π`
}

/* ───────────────────────── Highlight message helper ───────────────────────── */
function getCustomHighlightMessage(comp) {
  const topPrize = getTopPrize(comp) || 'this competition'
  const prettyPrize = String(topPrize)
  switch (comp?.title) {
    case 'OMC Mega Pi Drop':
      return `🔥 Huge prize pool of ${prettyPrize} up for grabs! Don’t miss out!`
    case 'OMC Pi Mini Jackpot':
      return `🎉 Try your luck at winning ${prettyPrize}! Every ticket counts!`
    case 'Ps5 Bundle Giveaway':
      return `🎮 Enter now to win a ${prettyPrize}! Game on!`
    default:
      return `Join now and compete for the prize of ${prettyPrize}!`
  }
}


export default function DailyCompetitionCard({
  comp = {},
  title,
  prize,
  fee,

  asSlide = true,
  slideMinWidth = 'min(420px, calc(100vw - 2rem))',
  maxCardWidth = '420px',
}) {
  const [timeLeft, setTimeLeft] = useState('')
  const [showCountdown, setShowCountdown] = useState(false)
  const [statusLabel, setStatusLabel] = useState('LIVE')

  const endsAtIso = comp?.endsAt || comp?.comp?.endsAt || new Date().toISOString()
  const startsAtIso = comp?.startsAt || comp?.comp?.startsAt || null
  const endMs = useMemo(() => new Date(endsAtIso).getTime(), [endsAtIso])
  const startMs = useMemo(() => (startsAtIso ? new Date(startsAtIso).getTime() : null), [startsAtIso])

  const sold = comp?.ticketsSold ?? comp?.comp?.ticketsSold ?? 0
  const total = comp?.totalTickets ?? comp?.comp?.totalTickets ?? 100
  const remaining = Math.max(0, total - sold)
  const percent = Math.min(100, Math.floor((sold / total) * 100))

  const rawFee =
    fee ??
    comp?.entryFee ??
    comp?.piAmount ??
    (comp?.comp ? comp?.comp?.entryFee ?? comp?.comp?.piAmount : undefined)

  const resolvedFee = resolveNumeric(rawFee)
  const formattedFee = formatEntryFee(resolvedFee)
  const formattedTopPrize = getTopPrize(comp, prize)

  useEffect(() => {
    const update = () => {
      const now = Date.now()

      if (startMs && now < startMs) {
        setStatusLabel('UPCOMING'); setShowCountdown(false); setTimeLeft(''); return
      }
      if (now >= endMs) {
        setStatusLabel('ENDED'); setShowCountdown(false); setTimeLeft(''); return
      }
      setStatusLabel('LIVE')

      const diff = endMs - now
      if (diff <= 24 * 60 * 60 * 1000 && diff > 0) {
        setShowCountdown(true)
        const hrs = Math.floor(diff / 3_600_000)
        const mins = Math.floor((diff % 3_600_000) / 60_000)
        const secs = Math.floor((diff % 60_000) / 1000)
        setTimeLeft(`${String(hrs).padStart(2,'0')}:${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`)
      } else {
        setShowCountdown(false); setTimeLeft('')
      }
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [startMs, endMs])

  const headerTitle = title || comp?.title || 'Daily Competition'
  const slug = comp?.slug || comp?.comp?.slug
  const isSoldOut = sold >= total

  const statusPillClass =
    statusLabel === 'LIVE'
      ? 'bg-gradient-to-r from-[#00ff99] to-[#00cc66] text-black animate-pulse'
      : statusLabel === 'UPCOMING'
      ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-black'
      : 'bg-gradient-to-r from-red-500 to-red-600 text-white'

  // Slide shell (ensures perfect centering in mobile carousels)
  const SlideShellOpen = asSlide
    ? (props) => (
        <div
          data-card
          className="snap-center shrink-0"
          style={{ minWidth: slideMinWidth }}
          {...props}
        />
      )
    : (props) => <div {...props} />

  return (
    <SlideShellOpen>
      <div
        className="
          relative w-full mx-auto
          rounded-2xl overflow-hidden font-orbitron
          shadow-[0_0_30px_rgba(0,255,213,0.18)]
          border border-cyan-400/60
          bg-[#0b1220]/80 backdrop-blur
          transition-transform duration-300 hover:scale-[1.02]
        "
        style={{ maxWidth: maxCardWidth }}
      >
        {/* Glow */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(60%_60%_at_50%_0%,rgba(0,255,213,0.14),transparent_60%)]" />

        {/* Header */}
        <div className="relative z-10 px-4 py-3 bg-gradient-to-r from-[#00ffd5] via-[#00ccff] to-[#0077ff]">
          <h3 className="w-full text-base font-bold uppercase text-black text-center truncate">
            {headerTitle}
          </h3>
        </div>

        {/* Body */}
        <div className="relative z-10 p-4">
          {/* Highlight */}
          <div className="rounded-xl border border-cyan-400/40 bg-gradient-to-r from-cyan-500/15 via-cyan-400/10 to-cyan-500/15 p-3 shadow-[0_0_10px_rgba(34,211,238,0.2)]">
            <p className="text-center text-sm font-semibold text-white">
              {getCustomHighlightMessage(comp)}
            </p>

            {/* Key Stats */}
            <div className="mt-2 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg border border-cyan-300/40 bg-white/5 p-2">
                <div className="text-[10px] text-cyan-300 uppercase tracking-wider">1st Prize</div>
                <div className="text-white font-bold">{formattedTopPrize || 'TBA'}</div>
              </div>
              <div className="rounded-lg border border-cyan-300/40 bg-white/5 p-2">
                <div className="text-[10px] text-cyan-300 uppercase tracking-wider">Fee</div>
                <div className="text-white font-bold">{formattedFee}</div>
              </div>
              <div className="rounded-lg border border-cyan-300/40 bg-white/5 p-2">
                <div className="text-[10px] text-cyan-300 uppercase tracking-wider">Tickets</div>
                <div className="text-white font-bold">
                  {sold.toLocaleString()} / {total.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="mt-2 text-center">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold shadow ${statusPillClass}`}>
                {statusLabel}
              </span>
            </div>

            {statusLabel === 'LIVE' && remaining > 0 && (
              <p className="mt-1 text-center text-xs text-cyan-300 font-medium tracking-wide">
                Only {remaining.toLocaleString()} tickets left! 🔥
              </p>
            )}
          </div>

          {/* Details */}
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div className="text-cyan-300 font-semibold">Draw</div>
            <div className="text-right text-white tabular-nums">
              {endsAtIso ? new Date(endsAtIso).toLocaleDateString('en-GB') : 'TBA'}
            </div>

            {showCountdown && (
              <div className="col-span-2 text-center text-sm text-red-400 font-bold tracking-wider">
                ⏳ Draw in: <span className="font-mono">{timeLeft}</span>
              </div>
            )}

            <div className="text-cyan-300 font-semibold">Max Per User</div>
            <div className="text-right text-white tabular-nums">
              {comp?.maxTicketsPerUser ? comp.maxTicketsPerUser.toLocaleString() : '10'}
            </div>
          </div>

          {/* Progress */}
          <div className="mt-3">
            <div className="w-full h-2 rounded-full bg-cyan-200/10 border border-cyan-300/30 overflow-hidden">
              <div
                className="
                  h-full transition-[width] duration-700 ease-out
                  bg-gradient-to-r from-[#00ffd5] via-blue-400 to-[#0077ff]
                  shadow-[0_0_10px_rgba(0,255,213,0.5)]
                "
                style={{ width: `${percent}%` }}
                aria-label="Tickets sold progress"
                role="progressbar"
                aria-valuenow={percent}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
            <p className="mt-1 text-center text-xs text-white">
              Sold: <span className="font-semibold">{sold.toLocaleString()}</span> / {total.toLocaleString()} ({percent}%)
            </p>
          </div>

          {/* CTA (path consistent with homepage) */}
          <div className="mt-3">
            {slug ? (
              <Link href={`/ticket-purchase/${slug}`} legacyBehavior>
                <button
                  disabled={statusLabel !== 'LIVE' || isSoldOut}
                  className={`
                    w-full py-2 rounded-md font-bold text-black
                    bg-gradient-to-r from-[#00ffd5] to-[#0077ff]
                    transition-transform duration-200 hover:scale-[1.02] hover:brightness-110
                    ${statusLabel !== 'LIVE' || isSoldOut ? 'opacity-60 cursor-not-allowed' : ''}
                  `}
                >
                  {isSoldOut
                    ? 'Sold Out'
                    : statusLabel === 'UPCOMING'
                    ? 'Coming Soon'
                    : statusLabel === 'ENDED'
                    ? 'Closed'
                    : 'Enter Now'}
                </button>
              </Link>
            ) : (
              <button className="w-full py-2 rounded-md font-bold bg-gray-500 text-white cursor-not-allowed" disabled>
                Not Available
              </button>
            )}
          </div>
        </div>
      </div>
    </SlideShellOpen>
  )
}

