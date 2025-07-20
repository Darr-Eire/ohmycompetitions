'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { usePiAuth } from 'context/PiAuthContext'
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
  const { user } = usePiAuth()

  // ✅ State
  const [timeLeft, setTimeLeft] = useState('')
  const [status, setStatus] = useState('UPCOMING')
  const [showGiftModal, setShowGiftModal] = useState(false)
  const [showCountdown, setShowCountdown] = useState(false)
  const [showAllCountries, setShowAllCountries] = useState(false)

  // ✅ Dates
  const startsAt = new Date(comp?.startsAt || comp?.comp?.startsAt || new Date())
  const endsAt = new Date(comp?.endsAt || comp?.comp?.endsAt || new Date())

  // ✅ Ticket logic
  const slug = comp?.slug || comp?.comp?.slug || ''
  const sold = comp?.ticketsSold || comp?.comp?.ticketsSold || 0
  const total = comp?.totalTickets || comp?.comp?.totalTickets || 100
  const remaining = Math.max(0, total - sold)
  const soldOutPercentage = (sold / total) * 100

  const isSoldOut = sold >= total
  const isLowStock = remaining <= total * 0.1
  const isNearlyFull = remaining <= total * 0.25
  const isGiftable = status === 'LIVE NOW' && !isSoldOut && !!slug

  const entryFee = fee ?? comp?.entryFee ?? comp?.comp?.entryFee ?? 'N/A'
  const formattedFee = Number(entryFee) === 0 ? 'Free' : !isNaN(entryFee) ? `${Number(entryFee).toFixed(2)} π` : 'N/A'

  // ✅ Top Countries Data
  const topCountries = [
    { name: 'Nigeria', entries: 0 },
    { name: 'Philippines', entries: 0},
    { name: 'India', entries: 0 },
    { name: 'Vietnam', entries: 0 },
    { name: 'Bangladesh', entries: 0 },
    { name: 'Pakistan', entries: 0 },
    { name: 'Ireland', entries: 0 },
    { name: 'England', entries: 0 },
    { name: 'Scotland', entries: 0 },
    { name: 'Wales', entries: 0 },
  ]

  // ✅ Countdown Timer
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      const start = startsAt.getTime()
      const end = endsAt.getTime()

      if (now < start) {
        setStatus('UPCOMING')
        setTimeLeft('')
        setShowCountdown(false)
        return
      }

      const diff = end - now
      if (diff <= 0) {
        setStatus('ENDED')
        setTimeLeft('')
        setShowCountdown(false)
        clearInterval(interval)
        return
      }

      setStatus('LIVE NOW')
      setShowCountdown(diff < 24 * 60 * 60 * 1000)

      const d = Math.floor(diff / (1000 * 60 * 60 * 24))
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24)
      const m = Math.floor((diff / (1000 * 60)) % 60)
      const s = Math.floor((diff / 1000) % 60)

      setTimeLeft(
        `${d > 0 ? `${d}D ` : ''}${h > 0 ? `${h}H ` : ''}${m}M ${d === 0 && h === 0 ? `${s}S` : ''}`
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [startsAt, endsAt])

  return (
    <>
      <div className="relative w-full max-w-sm mx-auto p-4 bg-[#0f172a] rounded-xl text-white font-orbitron shadow-xl border-2 border-cyan-400 overflow-hidden">
        {/* Decorative Backgrounds */}
        <div className="absolute inset-0 opacity-10 bg-[url('/images/glow-pi.png')] bg-center bg-no-repeat bg-contain pointer-events-none" />
        <div className="absolute inset-0 bg-[url('/images/worldmap.svg')] bg-cover opacity-5 pointer-events-none" />

        {/* Header */}
        <div className="flex justify-between items-center text-sm mb-2 z-10 relative">
          <span className="px-3 py-1 rounded-full border border-cyan-400 bg-cyan-600/30 text-white font-semibold">
            🌍 Pioneers Global Draw
          </span>
          <span className={`px-3 py-1 rounded-full font-bold text-xs shadow-md ${
            status === 'LIVE NOW' ? 'bg-green-400 text-black animate-pulse'
            : status === 'ENDED' ? 'bg-red-500 text-white'
            : 'bg-gradient-to-r from-orange-400 to-orange-500 text-black'
          }`}>
            {status}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-2xl sm:text-3xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#00ffd5] to-[#0077ff] text-center mb-3">
          {title || comp?.title}
        </h3>

        {/* Countries Leaderboard */}
        <div className="bg-[#1a1c2e] p-3 rounded-lg border border-cyan-300 text-sm mb-3">
          <p className="text-center text-cyan-300 font-semibold mb-2">
             🌍 Countries with Most Pioneer Entries
          </p>
          <ul className="space-y-1">
            {(showAllCountries ? topCountries : topCountries.slice(0, 3)).map((c, i) => (
              <li key={i} className="flex justify-between">
                <span>{c.name}</span>
                <span className="text-cyan-300">{c.entries.toLocaleString()}</span>
              </li>
            ))}
          </ul>
          {topCountries.length > 3 && (
            <div className="mt-2 text-center">
              <button
                onClick={() => setShowAllCountries(!showAllCountries)}
                className="text-cyan-300 hover:text-cyan-300 text-xs underline transition"
              >
                {showAllCountries ? 'View Less ' : 'View More '}
              </button>
            </div>
          )}
        </div>

        {/* Countdown */}
        {showCountdown && (
          <div className="text-center text-sm font-mono text-cyan-300 mb-2">
            ⏳ Ends in: <span className="font-bold">{timeLeft}</span>
          </div>
        )}

        {/* Details */}
        <div className="text-sm space-y-2">
          <p className="flex justify-between"><span className="text-cyan-300">Prize:</span><span>{prize}</span></p>
          <p className="flex justify-between"><span className="text-cyan-300">Entry Fee:</span><span>{formattedFee}</span></p>
          <p className="flex justify-between"><span className="text-cyan-300">Start:</span><span>{startsAt.toLocaleDateString()}</span></p>
          <p className="flex justify-between"><span className="text-cyan-300">Draw Date:</span><span>{endsAt.toLocaleDateString()}</span></p>
          <p className="flex justify-between"><span className="text-cyan-300">Tickets:</span><span>{sold.toLocaleString()} / {total.toLocaleString()}</span></p>
        </div>

        {/* Progress Bar */}
        <div className="my-3 h-2 w-full bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              isSoldOut ? 'bg-red-500' :
              isLowStock ? 'bg-orange-500' :
              isNearlyFull ? 'bg-yellow-500' : 'bg-blue-500'
            }`}
            style={{ width: `${Math.min(soldOutPercentage, 100)}%` }}
          />
        </div>

        {/* CTA Buttons */}
        <div className="space-y-2 mt-4">
          {slug ? (
            <Link href={`/ticket-purchase/pi/${slug}`}>
              <button
                disabled={status !== 'LIVE NOW'}
                className={`w-full py-2 rounded-md font-bold text-black ${
                  status === 'LIVE NOW'
                    ? 'bg-gradient-to-r from-[#00ffd5] to-[#0077ff] hover:brightness-110'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                {status === 'LIVE NOW' ? 'Enter Now' : 'Coming Soon'}
              </button>
            </Link>
          ) : (
            <button className="w-full py-2 bg-gray-500 text-white rounded-md cursor-not-allowed" disabled>
              Not Available
            </button>
          )}

          {isGiftable && !disableGift && user?.username && (
            <button
              onClick={(e) => {
                e.preventDefault()
                setShowGiftModal(true)
              }}
              className="w-full py-2 border border-cyan-400 text-cyan-400 rounded-md hover:bg-cyan-400 hover:text-black font-bold"
            >
              🎁 Gift Ticket
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
