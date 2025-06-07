'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import '@fontsource/orbitron'

export default function DailyCompetitionCard({ comp, title, prize, fee }) {
  const [timeLeft, setTimeLeft] = useState('')
  const endsAt = comp?.endsAt || new Date().toISOString()

  const sold = comp?.ticketsSold ?? 0
  const total = comp?.totalTickets ?? 100
  const percent = Math.min(100, Math.floor((sold / total) * 100))

  useEffect(() => {
    if (!endsAt) return
    const end = new Date(endsAt).getTime()

    const interval = setInterval(() => {
      const now = Date.now()
      const diff = end - now

      if (diff <= 0) {
        setTimeLeft('Ended')
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hrs = Math.floor((diff / (1000 * 60 * 60)) % 24)
        const mins = Math.floor((diff / (1000 * 60)) % 60)
        setTimeLeft(`${days}d ${hrs}h ${mins}m`)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [endsAt])

  return (
    <div className="relative w-full max-w-sm mx-auto p-5 bg-[#0f172a] rounded-xl text-white font-orbitron shadow-xl border-2 border-cyan-400 overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center text-sm mb-5 z-10 relative">
        <span className="px-4 py-1.5 rounded-full border border-cyan-400 bg-cyan-600/30 text-white font-semibold">
          📅 {new Date(endsAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
        <span className="bg-green-400 text-black px-4 py-1.5 rounded-full font-bold animate-pulse">
          LIVE NOW
        </span>
      </div>

      {/* Title */}
      <h3 className="text-2xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#00ffd5] to-[#0077ff] tracking-wide mb-6 text-center">
        {title}
      </h3>

      {/* Details Grid with spacing and right align */}
      <div className="grid grid-cols-2 gap-4 text-white text-sm mb-4 max-w-md mx-auto">
        <p className="font-semibold text-left">🎁 Prize:</p>
        <p className="font-semibold text-right tabular-nums">{prize}</p>

        <p className="font-semibold text-left">🎟 Entry Fee:</p>
        <p className="font-semibold text-right tabular-nums">{comp.entryFee?.toFixed(2)} π</p>

        <p className="font-semibold text-left">🎫 Total Tickets:</p>
        <p className="font-semibold text-right tabular-nums">{total.toLocaleString()}</p>

        <p className="font-semibold text-left">⌛ Time Left:</p>
        <p className="font-mono font-bold text-right">{timeLeft}</p>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-gradient-to-r from-[#00ffd5] via-blue-400 to-[#0077ff]"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-center text-xs text-gray-400 mb-6">
        Sold: <span className="text-white font-semibold">{sold.toLocaleString()}</span> / {total.toLocaleString()} ({percent}%)
      </p>

      {/* Call to Action */}
      <div>
        <Link href={`/ticket-purchase/${comp.slug}`}>
          <button className="w-full py-3 rounded-lg font-bold bg-gradient-to-r from-[#00ffd5] to-[#0077ff] text-black hover:scale-105 transition-transform duration-200">
            Enter Now
          </button>
        </Link>
      </div>
    </div>
  )
}
