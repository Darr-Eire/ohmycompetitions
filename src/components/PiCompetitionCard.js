'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { usePiAuth } from 'context/PiAuthContext'
import { useSafeTranslation } from '../hooks/useSafeTranslation'
import GiftTicketModal from './GiftTicketModal'
import '@fontsource/orbitron'

export default function PiCompetitionCard({
  comp,
  title,
  prize,
  fee,
  imageUrl = '/pi.jpeg',
  disableGift = false,
}) {
  const { t } = useSafeTranslation()
  const { user } = usePiAuth()

  // ✅ State
  const [timeLeft, setTimeLeft] = useState('')
  const [status, setStatus] = useState('')

  const [showGiftModal, setShowGiftModal] = useState(false)
  const [showCountdown, setShowCountdown] = useState(false)
  const [showAllCountries, setShowAllCountries] = useState(false)

  // ✅ Dates
  const startsAt = new Date(comp?.startsAt || comp?.comp?.startsAt || new Date())
  const endsAt = new Date(comp?.endsAt || comp?.comp?.endsAt || new Date())

  // ✅ Pre-tickets config
  const preCfg = comp?.preTickets || comp?.comp?.preTickets || null

  // ✅ Ticket logic (base)
  const slug = comp?.slug || comp?.comp?.slug || ''
  const baseSold = comp?.ticketsSold || comp?.comp?.ticketsSold || 0
  const baseTotal = comp?.totalTickets || comp?.comp?.totalTickets || 100

  // Will we show pre-sale numbers?
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

  // include other possible fields like piAmount just in case
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
        `${d > 0 ? `${d}D ` : ''}${h > 0 ? `${h}H ` : ''}${m}M ${
          d === 0 && h === 0 ? `${s}S` : ''
        }`
      )
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [startsAt, endsAt, comp?.comingSoon])

  // For display: when pre-sale is active, rename the status label
  const statusLabel = willPreSale ? t('pre_sale', 'PRE-SALE') : status

  return (
    <>
      <div className="relative w-full max-w-sm mx-auto p-4 bg-[#0f172a] rounded-xl text-white font-orbitron shadow-xl border-2 border-cyan-400 overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center text-sm mb-2 z-10 relative">
          <span className="px-3 py-1 rounded-full border border-cyan-400 bg-cyan-600/30 text-white font-semibold">
            🌍 {t('pioneers_global_draw', 'Pioneers Global Draw')}
          </span>
          <span
            className={`px-3 py-1 rounded-full font-bold text-xs shadow-md ${
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
        <h3 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00ffd5] to-[#0077ff] text-center mb-3">
          {title || comp?.title}
        </h3>

        {/* Countries Leaderboard (defensive) */}
        <div className="bg-[#1a1c2e] p-3 rounded-lg border border-cyan-300 text-sm mb-3">
          <p className="text-center text-cyan-300 font-semibold mb-2">
            🌍 {t('countries_most_entries', 'Countries with Most Pioneer Entries')}
          </p>

          <>
            {countryList.length === 0 ? (
              <div className="text-center text-cyan-300/70">{t('no_data_yet', 'No data yet')}</div>
            ) : (
              <ul className="space-y-1">
                {(showAllCountries ? countryList : countryList.slice(0, 3)).map((c, i) => (
                  <li key={`${c?.name ?? 'country'}-${i}`} className="flex justify-between">
                    <span>{c?.name ?? '—'}</span>
                    <span className="text-cyan-300">
                      {Number(c?.entries ?? 0).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </>

          {countryList.length > 3 && (
            <div className="mt-2 text-center">
              <button
                onClick={() => setShowAllCountries(!showAllCountries)}
                className="text-cyan-300 hover:text-cyan-300 text-xs underline transition"
              >
                {showAllCountries ? t('view_less', 'View Less') : t('view_more', 'View More')}
              </button>
            </div>
          )}
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
              {comp?.comp?.winners
                ? comp.comp.winners
                : comp?.winners
                ? comp.winners
                : '10'}
            </span>
          </p>

          <p className="flex justify-between">
            <span className="text-cyan-300">{t('draw_date', 'Draw Date')}:</span>
            <span>
              {Number.isFinite(endsAt?.getTime())
                ? endsAt.toLocaleDateString()
                : '—'}
            </span>
          </p>

          <p className="flex justify-between">
            <span className="text-cyan-300">{t('max_per_user', 'Max Per User')}:</span>
            <span>
              {comp?.comp?.maxTicketsPerUser
                ? comp.comp.maxTicketsPerUser.toLocaleString()
                : comp?.maxTicketsPerUser
                ? comp.maxTicketsPerUser.toLocaleString()
                : '—'}
            </span>
          </p>

          <p className="flex justify-between">
            <span className="text-cyan-300">
              {statusLabel === t('pre_sale', 'PRE-SALE') ? t('pre_tickets', 'Pre-Tickets') : t('tickets', 'Tickets')}:
            </span>
            <span>
              {total ? `${sold.toLocaleString()} / ${total.toLocaleString()}` : '—'}
            </span>
          </p>
        </div>

        {/* Progress Bar */}
        <div className="my-3 h-2 w-full bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              isSoldOut
                ? 'bg-red-500'
                : isLowStock
                ? 'bg-orange-500'
                : isNearlyFull
                ? 'bg-yellow-500'
                : 'bg-blue-500'
            }`}
            style={{ width: `${Math.min(soldOutPercentage, 100)}%` }}
          />
        </div>

        {/* CTA Buttons */}
        <div className="space-y-2 mt-4">
          {slug ? (
            <Link
              href={
                statusLabel === 'PRE-SALE'
                  ? `/ticket-purchase/pi/${slug}?mode=pre`
                  : `/ticket-purchase/pi/${slug}`
              }
            >
              <button
                disabled={
                  status === 'ENDED' ||
                  isSoldOut ||
                  (status === 'UPCOMING' && !preCfg?.enabled) ||
                  (status === 'COMING SOON' && !preCfg?.enabled)
                }
                className={`w-full py-2 rounded-md font-bold text-black ${
                  status === 'ENDED' ||
                  isSoldOut ||
                  (status === 'UPCOMING' && !preCfg?.enabled) ||
                  (status === 'COMING SOON' && !preCfg?.enabled)
                    ? 'bg-gradient-to-r from-[#00ffd5] to-[#0077ff] opacity-60 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#00ffd5] to-[#0077ff] hover:brightness-110'
                }`}
              >
                {isSoldOut
                  ? t('sold_out', 'Sold Out')
                  : status === t('ended', 'ENDED')
                  ? t('closed', 'Closed')
                  : statusLabel === t('pre_sale', 'PRE-SALE')
                  ? t('pre_book_ticket', 'Pre-Book Ticket')
                  : status === t('upcoming', 'UPCOMING') || status === t('coming_soon', 'COMING SOON')
                  ? t('coming_soon', 'Coming Soon')
                  : t('enter_now', 'Enter Now')}
              </button>
            </Link>
          ) : (
            <button
              className="w-full py-2 bg-gray-500 text-white rounded-md cursor-not-allowed"
              disabled
            >
              {t('not_available', 'Not Available')}
            </button>
          )}

          {/* Disable Gift Button during UPCOMING/COMING SOON too */}
          {isGiftable && !disableGift && user?.username && status !== 'UPCOMING' && (
            <button
              onClick={(e) => {
                e.preventDefault()
                setShowGiftModal(true)
              }}
              className="w-full py-2 border border-cyan-400 text-cyan-400 rounded-md hover:bg-cyan-400 hover:text-black font-bold"
            >
              {t('gift_ticket', 'Gift Ticket')}
            </button>
          )}
        </div>
      </div>

      {/* Gift Modal */}
      <GiftTicketModal
        isOpen={showGiftModal}
        onClose={() => setShowGiftModal(false)}
        preselectedCompetition={comp}
      />
    </>
  )
}
