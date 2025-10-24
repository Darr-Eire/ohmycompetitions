// src/components/PiCompetitionCard.js
'use client'

import Link from 'next/link'
import { useEffect, useState, useMemo } from 'react'
import { usePiAuth } from 'context/PiAuthContext'
import { useSafeTranslation } from '../hooks/useSafeTranslation'
import '@fontsource/orbitron'
import React from 'react'

export default function PiCompetitionCard({
  comp,
  title,
  prize,
  fee,
  imageUrl = '/pi.jpeg',
  disableGift = false,
  className = '',
}) {
  const { t } = useSafeTranslation()
  const { user } = usePiAuth()

  /* ----------------------------- helpers ----------------------------- */
  const toNum = (v, d = 0) => {
    if (v == null) return d
    if (typeof v === 'number' && Number.isFinite(v)) return v
    if (typeof v === 'string') {
      const n = Number(v.replace(/[^\d.,-]/g, '').replace(',', '.'))
      return Number.isFinite(n) ? n : d
    }
    return d
  }
  const fmtPi = (n) => `${Number(n).toLocaleString()} π`

  /* ----------------------------- base data ----------------------------- */
  const c = comp?.comp ?? comp ?? {}
  const slug = c.slug || ''
  const startsAt = new Date(c.startsAt || new Date())
  const endsAt = new Date(c.endsAt || new Date())
  const hasStarted = Date.now() >= startsAt.getTime()

  // entry fee (pi)
  const entryFee =
    toNum(c.entryFee ?? c.pricePi ?? c.feePi ?? c.piAmount ?? fee, null) ?? 0
  const formattedFee = entryFee === 0 ? 'Free' : fmtPi(entryFee)

  // winners
  const winners =
    c.winners ?? c.totalWinners ?? c.numWinners ?? c?.prizeBreakdown?.winners ?? '—'

  // prize (detect pool or breakdown)
  const firstPrize =
    c.firstPrize ?? c.prize1 ?? c?.prizeBreakdown?.firstPrize ?? null
  const secondPrize =
    c.secondPrize ?? c.prize2 ?? c?.prizeBreakdown?.secondPrize ?? null
  const thirdPrize =
    c.thirdPrize ?? c.prize3 ?? c?.prizeBreakdown?.thirdPrize ?? null

  const totalPool =
    c.prizePi ??
    [firstPrize, secondPrize, thirdPrize]
      .map((v) => toNum(v))
      .filter((n) => n > 0)
      .reduce((a, b) => a + b, 0)

  const prizeDisplay =
    totalPool && totalPool > 0
      ? fmtPi(totalPool)
      : prize || c.prize || t('tba', 'TBA')

  // tickets
  const sold = toNum(c.ticketsSold, 0)
  const total = toNum(c.totalTickets, 100)
  const soldOutPercentage = total > 0 ? (sold / total) * 100 : 0
  const isSoldOut = total > 0 && sold >= total

  /* ----------------------------- countdown ----------------------------- */
  const [status, setStatus] = useState('')
  const [timeLeft, setTimeLeft] = useState('')
  const [showCountdown, setShowCountdown] = useState(false)

  useEffect(() => {
    const update = () => {
      const now = Date.now()
      const start = startsAt.getTime()
      const end = endsAt.getTime()
      if (now < start) {
        setStatus(t('upcoming', 'UPCOMING'))
        setShowCountdown(false)
        return
      }
      const diff = end - now
      if (diff <= 0) {
        setStatus(t('ended', 'ENDED'))
        setShowCountdown(false)
        return
      }
      setStatus(t('live_now', 'LIVE NOW'))
      setShowCountdown(diff < 86400000)
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24)
      const m = Math.floor((diff / (1000 * 60)) % 60)
      const s = Math.floor((diff / 1000) % 60)
      setTimeLeft(`${h}H ${m}M ${s}S`)
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [startsAt, endsAt, t])

  const endsDisplay = Number.isFinite(endsAt.getTime())
    ? endsAt.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—'

  const href = slug ? `/ticket-purchase/${slug}` : null
  const ctaLabel =
    isSoldOut
      ? t('sold_out', 'Sold Out')
      : status === t('upcoming', 'UPCOMING')
      ? t('coming_soon', 'Coming Soon')
      : t('enter_now', 'More Details')

  /* ----------------------------- render ----------------------------- */
  return (
    <div
      className={`relative w-full max-w-[19rem] sm:max-w-sm mx-auto p-4 bg-[#0f172a] rounded-xl text-white font-orbitron shadow-xl border-2 border-cyan-400 overflow-hidden ${className}`}
    >
      {/* Status */}
      <div className="text-center mb-3">
        <span
          className={`px-3 py-1 rounded-full font-bold text-xs shadow-md ${
            status === 'LIVE NOW'
              ? 'bg-green-400 text-black animate-pulse'
              : status === 'ENDED'
              ? 'bg-red-500'
              : 'bg-gradient-to-r from-orange-400 to-orange-500 text-black'
          }`}
        >
          {status}
        </span>
      </div>

      {/* Title */}
      <div className="text-center mb-2">
        <p className="text-xs text-cyan-400 uppercase mb-1">
          {t('exclusive_draw', 'Exclusive Draw')}
        </p>
        <h3 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#00ffd5] to-[#0077ff]">
          {title || c.title}
        </h3>
      </div>

      {/* Prize / Fee / Info */}
      <div className="text-sm space-y-2 mt-4">
        <p className="flex justify-between">
          <span className="text-cyan-300">{t('prize_pool', 'Prize Pool')}:</span>
          <span>{prizeDisplay}</span>
        </p>
        <p className="flex justify-between">
          <span className="text-cyan-300">{t('entry_fee', 'Entry Fee')}:</span>
          <span>{formattedFee}</span>
        </p>
        <p className="flex justify-between">
          <span className="text-cyan-300">{t('winners', 'Winners')}:</span>
          <span>{winners}</span>
        </p>
        <p className="flex justify-between">
          <span className="text-cyan-300">{t('draw_date', 'Draw Date')}:</span>
          <span>{endsDisplay}</span>
        </p>
        <p className="flex justify-between">
          <span className="text-cyan-300">{t('tickets', 'Tickets')}:</span>
          <span>
            {sold.toLocaleString()} / {total.toLocaleString()}
          </span>
        </p>
      </div>

      {/* Progress */}
      <div className="my-3 h-2 w-full bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-500 bg-gradient-to-r from-[#00ffd5] to-[#0077ff]"
          style={{ width: `${Math.min(soldOutPercentage, 100)}%` }}
        />
      </div>

      {/* CTA */}
      <div className="mt-4">
        {href ? (
          <Link
            href={href}
            className="block w-full py-2 rounded-md font-bold text-black bg-gradient-to-r from-[#00ffd5] to-[#0077ff] hover:brightness-110 transition-all text-center"
          >
            {ctaLabel}
          </Link>
        ) : (
          <button
            className="w-full py-2 bg-gray-500 text-white rounded-md cursor-not-allowed"
            disabled
          >
            {t('not_available', 'Not Available')}
          </button>
        )}
      </div>

      {/* Countdown */}
      {showCountdown && status === 'LIVE NOW' && (
        <div className="text-center text-sm font-mono text-cyan-300 mt-3">
          ⏳ {t('ends_in', 'Ends in')}: <span className="font-bold">{timeLeft}</span>
        </div>
      )}
    </div>
  )
}
