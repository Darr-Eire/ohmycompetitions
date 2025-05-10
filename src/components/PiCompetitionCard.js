'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import '@fontsource/orbitron'

const topCountries = [
  { code: '🇮🇳', name: 'India', entries: 2400 },
  { code: '🇳🇬', name: 'Nigeria', entries: 1870 },
  { code: '🇵🇭', name: 'Philippines', entries: 1300 },
]

export default function PiCompetitionCard({ comp, title, prize, fee, userHandle = '@pioneer' }) {
  const [timeLeft, setTimeLeft] = useState('')
  const [entryCount, setEntryCount] = useState(12842)
  const endsAt = comp?.endsAt || new Date().toISOString()

  useEffect(() => {
    if (!endsAt) return
    const end = new Date(endsAt).getTime()

    const interval = setInterval(() => {
      const now = Date.now()
      const diff = end - now
      if (diff <= 0) {
        setTimeLeft('Ended')
      } else {
        const hrs = Math.floor(diff / (1000 * 60 * 60))
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const secs = Math.floor((diff % (1000 * 60)) / 1000)
        setTimeLeft(`${hrs}h ${mins}m ${secs}s`)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [endsAt])

  return (
    <div className="relative w-full max-w-sm mx-auto p-4 bg-[#0f172a] rounded-xl text-white font-orbitron shadow-xl border-2 border-cyan-400 overflow-hidden">
      {/* Glowing Pi background */}
      <div className="absolute inset-0 opacity-10 bg-[url('/images/glow-pi.png')] bg-center bg-no-repeat bg-contain pointer-events-none" />

      {/* World Map Overlay */}
      <div className="absolute inset-0 bg-[url('/images/worldmap.svg')] bg-cover opacity-5 pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-center text-sm mb-4 z-10 relative">
        <span className="px-4 py-1.5 rounded-full border border-cyan-400 bg-cyan-600/30 text-white font-semibold">
          🌍 Global Draw
        </span>
        <span className="bg-green-400 text-black px-4 py-1.5 rounded-full font-bold animate-pulse">
          LIVE
        </span>
      </div>

      {/* Title */}
      <h3 className="text-2xl sm:text-3xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#00ffd5] to-[#0077ff] tracking-wide mb-4 text-center">
        ✦ {title} ✦
      </h3>

      {/* Prize Details */}
      <div className="text-center space-y-2 text-sm">
        <p className="text-cyan-300 font-semibold text-lg">🏆 {prize}</p>
        <p className="text-blue-300">🎫 Entry Fee: {fee}</p>
        <p className="text-yellow-300">⏳ Ends in: {timeLeft}</p>
      </div>

      {/* Stats */}
      <div className="mt-4 space-y-2 text-sm">
        <p className="text-center text-white">🔗 Total Entries: <strong>{entryCount.toLocaleString()}</strong></p>
        <div className="text-center text-xs text-white/60">Auto-refreshes with real-time Pi community data</div>
      </div>

      {/* Top Countries */}
      <div className="mt-4 bg-[#1a1c2e] p-3 rounded-lg border border-blue-500 text-sm">
        <p className="text-center text-blue-300 font-semibold mb-2">🌐 Top Contributing Countries</p>
        <ul className="space-y-1">
          {topCountries.map((c, i) => (
            <li key={i} className="flex justify-between">
              <span>{c.code} {c.name}</span>
              <span className="text-cyan-300">{c.entries.toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Invite Bonus */}
      <div className="mt-4 bg-[#1a1c2e] p-3 rounded-lg border border-cyan-400 text-sm text-center">
        <p className="text-cyan-300 font-bold">Invite a Pioneer = +1 Bonus Entry</p>
        <p className="text-xs mt-1 text-white/70">Share: pi.app/invite/{userHandle}</p>
      </div>

      {/* CTA */}
      <div className="mt-6">
        <Link href={`/ticket-purchase/${comp.slug}`}>
          <button className="w-full py-3 rounded-lg font-bold bg-gradient-to-r from-[#00ffd5] to-[#0077ff] text-black hover:brightness-110 transition-transform">
            🌎 Join the Global Draw — Win Big, With Pi
          </button>
        </Link>
      </div>
    </div>
  )
}
