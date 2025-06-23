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
  const endsAt = comp?.endsAt || new Date().toISOString()
  const endDate = new Date(endsAt)

  useEffect(() => {
    if (!endsAt) return

    const updateTimer = () => {
      const now = new Date()
      const diff = endDate.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeLeft('Ended')
        return
      }

      if (diff > 24 * 60 * 60 * 1000) {
        // More than 24 hours left: show formatted end date
        setTimeLeft(`Ends on ${endDate.toLocaleString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZoneName: 'short',
          hour12: false,
        })}`)
      } else {
        // Less than 24 hours left: show countdown timer (HH:mm:ss)
        const hrs = Math.floor(diff / (1000 * 60 * 60))
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const secs = Math.floor((diff % (1000 * 60)) / 1000)

        setTimeLeft(`${hrs}h ${mins}m ${secs}s`)
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [endsAt, endDate])

  return (
    <div className="relative w-full max-w-sm mx-auto p-4 bg-[#0f172a] rounded-xl text-white font-orbitron shadow-xl border-2 border-cyan-400 overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[url('/images/glow-pi.png')] bg-center bg-no-repeat bg-contain pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/images/worldmap.svg')] bg-cover opacity-5 pointer-events-none" />

      <div className="flex justify-between items-center text-sm mb-4 z-10 relative">
        <span className="px-4 py-1.5 rounded-full border border-cyan-400 bg-cyan-600/30 text-white font-semibold">
          🌍Pi Global Draw
        </span>
        <span className="bg-green-400 text-black px-4 py-1.5 rounded-full font-bold animate-pulse">
          LIVE NOW
        </span>
      </div>

      <h3 className="text-2xl sm:text-3xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#00ffd5] to-[#0077ff] tracking-wide mb-4 text-center">
        {title}
      </h3>

      <div className="text-center space-y-3 text-sm text-white">
        <p>Winner Takes All</p>
        <p>Entry Fee: {(comp.entryFee ?? 0).toFixed(2)} π</p>
        <p>Total Entries: <strong>{(comp.ticketsSold ?? 0).toLocaleString()}</strong></p>
        <p className="font-mono text-lg">{timeLeft}</p>
      </div>

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

      <div className="mt-6">
        <Link href={`/ticket-purchase/pi/${comp.slug}`}>
          <button className="w-full py-3 rounded-lg font-bold bg-gradient-to-r from-[#00ffd5] to-[#0077ff] text-black hover:brightness-110 transition-transform">
            Join the Global Draw — Win Big, With Pi
          </button>
        </Link>
      </div>
    </div>
  )
}
