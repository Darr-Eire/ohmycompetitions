'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import '@fontsource/orbitron'

const topCountries = [
  { name: 'Ireland', entries: 0 },
  { name: 'Nigeria', entries: 0 },
  { name: 'Philippines', entries: 0 },
]

export default function PiCompetitionCard({ comp, title, prize, fee, userHandle = '@pioneer' }) {
  const [timeLeft, setTimeLeft] = useState('')
  const [hasStarted, setHasStarted] = useState(false)

  const endsAt = comp?.endsAt || new Date().toISOString()
  const startsAt = comp?.startsAt || new Date().toISOString()

  const endDate = new Date(endsAt)
  const startDate = new Date(startsAt)

  const now = new Date()
  const hasEnded = now >= endDate
  const isLive = hasStarted && !hasEnded

  // Check start status
  useEffect(() => {
    const checkStart = () => {
      const currentTime = new Date()
      setHasStarted(currentTime >= startDate)
    }

    checkStart()
    const startInterval = setInterval(checkStart, 1000)
    return () => clearInterval(startInterval)
  }, [startDate])

  // Countdown logic
  useEffect(() => {
    if (!endsAt || !hasStarted) return

    const updateTimer = () => {
      const now = new Date()
      const diff = endDate.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeLeft('Ended')
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hrs = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const secs = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeLeft(`${days}d ${hrs}h ${mins}m ${secs}s`)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [endsAt, hasStarted, endDate])

  // Format entry fee
  let entryFeeValue = fee !== undefined ? fee : comp?.entryFee

  if (entryFeeValue === '' || entryFeeValue === null || entryFeeValue === undefined) {
    entryFeeValue = NaN
  }

  const numericFee = Number(entryFeeValue)

  let formattedFee
  if (!isNaN(numericFee)) {
    formattedFee = numericFee === 0 ? 'Free' : `${numericFee.toFixed(2)} π`
  } else {
    formattedFee = 'N/A'
  }

  const slug = comp?.slug ?? ''
  const comingSoon = comp?.comingSoon || !hasStarted

  return (
    <div className="relative w-full max-w-sm mx-auto p-4 bg-[#0f172a] rounded-xl text-white font-orbitron shadow-xl border-2 border-cyan-400 overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 opacity-10 bg-[url('/images/glow-pi.png')] bg-center bg-no-repeat bg-contain pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/images/worldmap.svg')] bg-cover opacity-5 pointer-events-none" />

      {/* Header badges */}
      <div className="flex justify-between items-center text-sm mb-4 z-10 relative">
        <span className="px-4 py-1.5 rounded-full border border-cyan-400 bg-cyan-600/30 text-white font-semibold">
          🌍 Pi Global Draw
        </span>
        <span
          className={`px-4 py-1.5 rounded-full font-bold shadow-md text-black text-xs sm:text-sm transition-all
            ${isLive ? 'bg-green-400 animate-pulse'
              : hasEnded ? 'bg-red-500 text-white'
              : 'bg-gradient-to-r from-orange-400 to-orange-500'}`}
        >
          {isLive ? 'LIVE NOW' : hasEnded ? 'ENDED' : 'COMING SOON'}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-2xl sm:text-3xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#00ffd5] to-[#0077ff] tracking-wide mb-4 text-center">
        {title || comp?.title || 'Competition'}
      </h3>

      {/* Core details */}
      <div className="text-center space-y-3 text-sm text-white">
         <p>Total Entries: <strong>{(comp?.ticketsSold ?? 0).toLocaleString()}</strong></p>
     <p>Multiple Winners</p>

        <p>Entry Fee: {formattedFee}</p>
       
        {hasStarted && (
          <p className="font-mono text-lg">{timeLeft}</p>
        )}
        <p>
          Start: {startDate.toLocaleString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          })}<br />
          End: {endDate.toLocaleString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          })}
        </p>
      </div>

      {/* Top countries block */}
      <div className="mt-4 bg-[#1a1c2e] p-3 rounded-lg border border-blue-500 text-sm">
        <p className="text-center text-blue-300 font-semibold mb-2">
          🌐 Countries with Most Entries
        </p>
        <ul className="space-y-1">
          {topCountries.map((c, i) => (
            <li key={i} className="flex justify-between">
              <span>{c.name}</span>
              <span className="text-cyan-300">{c.entries.toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA button */}
      <div className="mt-6">
        {slug ? (
          <Link href={`/ticket-purchase/pi/${slug}`} legacyBehavior>
            <a>
        <button
  disabled
  className="w-full py-3 rounded-lg font-bold bg-cyan-500 text-white opacity-60 cursor-not-allowed"
>
  Coming Soon
</button>

            </a>
          </Link>
        ) : (
          <button
            className="w-full py-3 rounded-lg font-bold bg-gray-500 text-white opacity-60 cursor-not-allowed"
            disabled
          >
            Not Available
          </button>
        )}
      </div>
    </div>
  )
}
