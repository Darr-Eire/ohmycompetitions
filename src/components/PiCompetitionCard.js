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

  // ✅ State
  const [timeLeft, setTimeLeft] = useState('')
  const [status, setStatus] = useState('')
  const [showGiftModal, setShowGiftModal] = useState(false)
  const [showCountdown, setShowCountdown] = useState(false)
  const [showCountriesModal, setShowCountriesModal] = useState(false)

  // ✅ Dates
  const startsAt = new Date(comp?.startsAt || comp?.comp?.startsAt || new Date())
  const endsAt = new Date(comp?.endsAt || comp?.comp?.endsAt || new Date())
  const hasStarted = Number.isFinite(startsAt.getTime()) ? Date.now() >= startsAt.getTime() : false

  // ✅ Pre-tickets config
  const preCfg = comp?.preTickets || comp?.comp?.preTickets || null

  // ✅ Ticket logic (base)
  const slug = comp?.slug || comp?.comp?.slug || ''
  const baseSold = comp?.ticketsSold || comp?.comp?.ticketsSold || 0
  const baseTotal = comp?.totalTickets || comp?.comp?.totalTickets || 100

  const willPreSale =
    (status === 'UPCOMING' || status === 'COMING SOON') && preCfg?.enabled === true

  const sold = willPreSale ? (preCfg?.sold ?? 0) : baseSold
  const total = willPreSale ? (preCfg?.total ?? 0) : baseTotal

  const remaining = Math.max(0, total - sold)
  const soldOutPercentage = total > 0 ? (sold / total) * 100 : 0

  const isSoldOut = total > 0 && sold >= total
  const isLowStock = total > 0 && remaining <= total * 0.1
  const isNearlyFull = total > 0 && remaining <= total * 0.25
  const isGiftable = status === 'LIVE NOW' && !isSoldOut && !!slug

  // ✅ Countries (safe defaults)
  const topCountries =
    comp?.topCountries ||
    comp?.comp?.topCountries || [
      { name: 'Nigeria', entries: 0 },
      { name: 'Philippines', entries: 0 },
      { name: 'India', entries: 0 },
      { name: 'Vietnam', entries: 0 },
      { name: 'Bangladesh', entries: 0 },
      { name: 'Pakistan', entries: 0 },
      { name: 'Ireland', entries: 0 },
      { name: 'England', entries: 0 },
      { name: 'Scotland', entries: 0 },
      { name: 'Wales', entries: 0 },
    ]

  const countryList = Array.isArray(topCountries) ? topCountries : []

  const top5 = useMemo(() => {
    const safe = countryList
      .map(c => ({ name: c?.name ?? '—', entries: Number(c?.entries ?? 0) }))
      .sort((a, b) => b.entries - a.entries)
    return safe.slice(0, 5)
  }, [countryList])

  /* ------------------------ Formatting helpers ------------------------ */
  function resolveNumeric(value) {
    if (value == null) return null
    if (typeof value === 'number' && Number.isFinite(value)) return value
    if (typeof value === 'string') {
      const trimmed = value.trim()
      if (!trimmed) return null
      const numLike = trimmed.replace(/[^\d.,-]/g, '').replace(',', '.')
      const n = Number(numLike)
      if (Number.isFinite(n)) return n
      return trimmed
    }
    return null
  }

  function formatEntryFee(value) {
    if (value == null) return '—'
    if (typeof value === 'number') {
      return value === 0 ? 'Free' : `${value.toFixed(2)} π`
    }
    return /\bπ\b|[$€£]/.test(value) ? value : `${value} π`
  }

  const rawFee =
    (willPreSale ? preCfg?.entryFee : undefined) ??
    fee ??
    comp?.entryFee ??
    comp?.comp?.entryFee ??
    comp?.piAmount ??
    comp?.comp?.piAmount

  const resolvedFee = resolveNumeric(rawFee)
  const formattedFee = formatEntryFee(resolvedFee)

  // ✅ Countdown Timer
  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now()
      const start = startsAt.getTime()
      const end = endsAt.getTime()

      if (now < start) {
        setStatus(comp?.comingSoon ? t('coming_soon', 'COMING SOON') : t('upcoming', 'UPCOMING'))
        setTimeLeft('')
        setShowCountdown(false)
        return
      }

      const diff = end - now
      if (diff <= 0) {
        setStatus(t('ended', 'ENDED'))
        setTimeLeft('')
        setShowCountdown(false)
        return
      }

      setStatus(t('live_now', 'LIVE NOW'))
      setShowCountdown(diff < 24 * 60 * 60 * 1000)

      const d = Math.floor(diff / (1000 * 60 * 60 * 24))
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24)
      const m = Math.floor((diff / (1000 * 60)) % 60)
      const s = Math.floor((diff / 1000) % 60)

      setTimeLeft(
        `${d > 0 ? `${d}D ` : ''}${h > 0 ? `${h}H ` : ''}${m}M ${d === 0 && h === 0 ? `${s}S` : ''}`
      )
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [startsAt, endsAt, comp?.comingSoon, t])

  const statusLabel = willPreSale ? t('pre_sale', 'PRE-SALE') : status

  const fmtOpts = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
  const startsDisplay = Number.isFinite(startsAt.getTime()) ? startsAt.toLocaleString(undefined, fmtOpts) : '—'
  const endsDisplay = Number.isFinite(endsAt.getTime()) ? endsAt.toLocaleString(undefined, fmtOpts) : '—'

  /* ------------------------ CTA href + label ------------------------ */
  const href = slug
    ? (statusLabel === t('pre_sale', 'PRE-SALE')
        ? `/ticket-purchase/${slug}?mode=pre`
        : `/ticket-purchase/${slug}`)
    : null

  const ctaLabel = isSoldOut
    ? t('sold_out', 'Sold Out')
    : statusLabel === t('pre_sale', 'PRE-SALE')
    ? t('pre_book_ticket', 'Pre-Book Ticket')
    : status === t('upcoming', 'UPCOMING') || status === t('coming_soon', 'COMING SOON')
    ? t('coming_soon', 'Coming Soon')
    : t('enter_now', 'More Details')

  return (
    <>
      <div className={`relative w/full max-w-[19rem] sm:max-w-sm mx-auto p-4 bg-[#0f172a] rounded-xl text-white font-orbitron shadow-xl border-2 border-cyan-400 overflow-hidden ${className}`.replace('w/full','w-full')}>
        {/* Header */}
        <div className="flex flex-col items-center justify-center gap-2 text-sm mb-3 z-10 relative">
          <span className="px-3 py-1 rounded-full border border-cyan-400 bg-cyan-600/30 text-white font-semibold text-center">
            🌍 {t('pioneers_global_draw', 'Pioneers Global Competition')}
          </span>
          <span
            className={`px-3 py-1 rounded-full font-bold text-xs shadow-md text-center ${
              status === 'LIVE NOW'
                ? 'bg-green-400 text-black animate-pulse'
                : status === 'ENDED'
                ? 'bg-red-500 text-white'
                : statusLabel === 'PRE-SALE'
                ? 'bg-gradient-to-r from-cyan-300 to-blue-400 text-black'
                : 'bg-gradient-to-r from-orange-400 to-orange-500 text-black'
            }`}
          >
            {statusLabel}
          </span>
        </div>

        {/* Title */}
        <div className="text-center mb-2">
          <p className="text-xs text-cyan-400 uppercase tracking-widest mb-1">
            {t('exclusive_draw', 'Exclusive Draw')}
          </p>
          <h3 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#00ffd5] to-[#0077ff] drop-shadow-[0_0_6px_#00e5ff80]">
            {title || comp?.title}
          </h3>
        </div>

        {/* View Top Countries link UNDER the title */}
        <div className="mt-1 mb-3 text-center">
          <button
            type="button"
            onClick={() => setShowCountriesModal(true)}
            className="text-cyan-300 text-xs underline hover:brightness-125"
          >
            {t('view_top_countries', 'View Top Countries')}
          </button>
        </div>

        {/* Countdown */}
        {showCountdown && status === 'LIVE NOW' && (
          <div className="text-center text-sm font-mono text-cyan-300 mb-2">
            ⏳ {t('ends_in', 'Ends in')}: <span className="font-bold">{timeLeft}</span>
          </div>
        )}

        {/* Details */}
        <div className="text-sm space-y-2">
          <p className="flex justify-between">
            <span className="text-cyan-300">{t('prize', 'Prize')}:</span>
            <span>{prize}</span>
          </p>

          <p className="flex justify-between">
            <span className="text-cyan-300">{t('entry_fee', 'Entry Fee')}:</span>
            <span>{formattedFee}</span>
          </p>

          <p className="flex justify-between">
            <span className="text-cyan-300">{t('multiple_winners', 'Multiple Winners')}:</span>
            <span>
              {comp?.comp?.winners ? comp.comp.winners : comp?.winners ? comp.winners : '10'}
            </span>
          </p>

          {/* 🔄 Start/Draw date toggle */}
          <p className="flex justify-between">
            <span className="text-cyan-300">
              {hasStarted ? t('draw_date', 'Draw Date') : t('starts', 'Starts')}:
            </span>
            <span>{hasStarted ? endsDisplay : startsDisplay}</span>
          </p>

          <p className="flex justify-between">
            <span className="text-cyan-300">
              {statusLabel === t('pre_sale', 'PRE-SALE') ? t('pre_tickets', 'Pre-Tickets') : t('tickets', 'Tickets')}:
            </span>
            <span>{total ? `${sold.toLocaleString()} / ${total.toLocaleString()}` : '—'}</span>
          </p>
        </div>

        {/* Progress Bar */}
        <div className="my-3 h-2 w-full bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              isSoldOut ? 'bg-red-500' : isLowStock ? 'bg-orange-500' : isNearlyFull ? 'bg-yellow-500' : 'bg-blue-500'
            }`}
            style={{ width: `${Math.min(soldOutPercentage, 100)}%` }}
          />
        </div>

        {/* CTA Buttons */}
        <div className="space-y-2 mt-4">
          {href ? (
            <Link
              href={href}
              className="block w-full py-2 rounded-md font-bold text-black bg-gradient-to-r from-[#00ffd5] to-[#0077ff] hover:brightness-110 transition-all text-center"
              aria-label={ctaLabel}
              onClick={() => {
                if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(15)
              }}
            >
              {ctaLabel}
            </Link>
          ) : (
            <button className="w-full py-2 bg-gray-500 text-white rounded-md cursor-not-allowed" disabled>
              {t('not_available', 'Not Available')}
            </button>
          )}

          {isGiftable && !disableGift && user?.username && status !== t('upcoming', 'UPCOMING') && (
            <button
              onClick={(e) => {
                e.preventDefault()
                setShowGiftModal(true)
                if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10)
              }}
              className="w-full py-2 border border-cyan-400 text-cyan-400 rounded-md hover:bg-cyan-400 hover:text-black font-bold"
            >
              {t('gift_ticket', 'Gift Ticket')}
            </button>
          )}
        </div>
      </div>
      {showGiftModal && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={t('gift_tickets', 'Gift Tickets')}
          onClick={() => setShowGiftModal(false)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-cyan-400 bg-[#101426] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-cyan-900/50 flex items-center justify-between">
              <h4 className="text-lg font-bold text-cyan-300">
                {t('gift_tickets', 'Gift Tickets')}
              </h4>
              <button onClick={() => setShowGiftModal(false)} className="text-cyan-200 hover:text-white text-sm">
                {t('close', 'Close')}
              </button>
            </div>

            <div className="p-4 space-y-2">
              <p className="text-white/90">
                {t('gifting_coming_soon', 'Gifting tickets to other users is coming very soon.')}
              </p>
              {(comp?.title || comp?.comp?.title) && (
                <p className="text-sm text-white/70">
                  {t('you_will_be_able_to_gift_for', 'You’ll be able to gift tickets for:')}{' '}
                  <span className="font-semibold">{comp?.title ?? comp?.comp?.title}</span>
                </p>
              )}
            </div>

            <div className="px-4 pb-4">
              <button
                onClick={() => setShowGiftModal(false)}
                className="w-full py-2 rounded-md font-bold text-black bg-gradient-to-r from-[#00ffd5] to-[#0077ff] hover:brightness-110"
              >
                {t('got_it', 'Got it')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Countries Modal */}
      {showCountriesModal && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={t('top_countries', 'Top Countries')}
          onClick={() => setShowCountriesModal(false)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-cyan-400 bg-[#101426] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-cyan-900/50 flex items-center justify-between">
              <h4 className="text-lg font-bold text-cyan-300">
                {t('top_countries', 'Top Countries')}
              </h4>
              <button onClick={() => setShowCountriesModal(false)} className="text-cyan-200 hover:text-white text-sm">
                {t('close', 'Close')}
              </button>
            </div>

            <div className="p-4">
              {top5.length === 0 ? (
                <div className="text-center text-cyan-300/70">{t('no_data_yet', 'No data yet')}</div>
              ) : (
                <ul className="space-y-2">
                  {top5.map((c, idx) => (
                    <li
                      key={`${c.name}-${idx}`}
                      className="flex items-center justify-between rounded-lg bg-[#0f172a] border border-cyan-900/40 px-3 py-2"
                    >
                      <span className="font-medium">
                        {idx + 1}. {c.name}
                      </span>
                      <span className="text-cyan-300 font-semibold">
                        {Number(c.entries).toLocaleString()} {t('entries', 'entries')}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="px-4 pb-4">
              <button
                onClick={() => setShowCountriesModal(false)}
                className="w-full py-2 rounded-md font-bold text-black bg-gradient-to-r from-[#00ffd5] to-[#0077ff] hover:brightness-110"
              >
                {t('got_it', 'Got it')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
