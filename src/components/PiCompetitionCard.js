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
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        let remainder = diff % (1000 * 60 * 60 * 24);
        const hrs = Math.floor(remainder / (1000 * 60 * 60));
        remainder %= (1000 * 60 * 60);
        const mins = Math.floor(remainder / (1000 * 60));
        setTimeLeft(`${days}d ${hrs}h ${mins}m`);
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [endsAt])

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
        <p>{timeLeft}</p>
      </div>

      <div className="mt-4 bg-[#1a1c2e] p-3 rounded-lg border border-blue-500 text-sm">
        <p className="text-center text-blue-300 font-semibold mb-2">🌐 Countries with Most Entries
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