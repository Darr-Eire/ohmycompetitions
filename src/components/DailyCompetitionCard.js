'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import '@fontsource/orbitron'

export default function DailyCompetitionCard({ comp, title, prize, fee }) {
  const [timeLeft, setTimeLeft] = useState('')
  const endsAt = comp?.endsAt || new Date().toISOString()

  const formattedDate = new Date(endsAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })

  const status = 'LIVE'
  const sold = comp.ticketsSold ?? 0
  const total = comp.totalTickets ?? 100
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
        const hrs = Math.floor(diff / (1000 * 60 * 60))
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const secs = Math.floor((diff % (1000 * 60)) / 1000)
        setTimeLeft(`${hrs}h ${mins}m ${secs}s`)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [endsAt])

  return (
    <div className="w-full max-w-sm mx-auto p-4 bg-[#0e1b2a] border border-cyan-500 rounded-xl text-white font-orbitron shadow-xl hover:shadow-cyan-500/50 transition-all duration-200">

   <div className="flex justify-between items-center text-sm mb-4">
  <span className="px-4 py-1.5 rounded-full border border-blue-400 font-semibold bg-black bg-opacity-30 text-transparent bg-clip-text bg-gradient-to-r from-[#00ffd5] to-[#0077ff]">
    📅 {formattedDate}
  </span>
  <span className="bg-green-400 text-black px-4 py-1.5 rounded-full font-bold animate-pulse">
    {status}
  </span>
</div>



      {/* Title */}
      <div className="text-center mb-5">
      <h3 className="text-1xl sm:text-1xl font-black uppercase border border-blue-500 rounded-lg px-5 py-4 bg-black bg-opacity-30 shadow-[0_0_15px_#3b82f6] tracking-wide bg-gradient-to-r from-[#00ffd5] to-[#0077ff] text-transparent bg-clip-text">
   {title} 
</h3>

      </div>

      {/* Details */}
      <div className="space-y-3 text-sm text-center">
        <div className="grid grid-cols-2 gap-2 text-left">
          <p className="text-white">🎁 Prize:</p>
          <p className="text-white font-semibold">{prize}</p>

          <p className="text-white">🎟 Entry Fee:</p>
          <p className="text-white font-semibold">{fee}</p>

          <p className="text-white">🎫 Total Tickets:</p>
          <p className="text-white font-semibold">{total.toLocaleString()}</p>

          
          <p className="text-white font-mono">{timeLeft}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-4">
        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#00ffd5] via-blue-400 to-[#0077ff]"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="text-center text-xs text-gray-400 mt-1">
          Sold: <span className="text-white">{sold.toLocaleString()}</span> / {total.toLocaleString()} ({percent}%)
        </p>
      </div>

      {/* CTA */}
      <div className="mt-6">
        <Link href={`/ticket-purchase/${comp.slug}`}>
          <button className="w-full py-2 rounded-lg font-bold text-sm bg-gradient-to-r from-[#00ffd5] to-[#0077ff] text-black hover:scale-105 transition-transform duration-200">
            🎰 Enter Now
          </button>
        </Link>
      </div>
    </div>
  )
}
