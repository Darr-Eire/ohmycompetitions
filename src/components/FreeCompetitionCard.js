'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import '@fontsource/orbitron'

export default function FreeCompetitionCard({ comp, title, prize }) {
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
    <section className="w-full py-10 px-4 bg-gradient-to-r from-[#111827] to-[#0f172a] rounded-2xl border border-cyan-400 shadow-[0_0_40px_#00f2ff44] text-white font-orbitron max-w-2xl mx-auto text-center space-y-6">

      {/* Header */}
      <div className="flex justify-center items-center gap-4 text-sm">
        <span className="bg-white/10 px-3 py-1 rounded-full text-cyan-200 font-medium">
          📅 {formattedDate}
        </span>
        <span className="bg-green-300 text-black font-bold px-3 py-1 rounded-full animate-pulse">
          {status}
        </span>
      </div>

      {/* Title */}
      <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wide">
        ✦ {title} ✦
      </h2>
 {/* Entry & Referral Info */}
      <div className="border-t border-white/10 pt-4 text-sm space-y-3 text-gray-200 px-2">
        <p>💡 <strong>How to Enter:</strong> Just click “Claim Free Entry” — you'll be entered instantly.</p>
        <p>🤝 <strong>Refer a Friend:</strong> Share this competition and get <span className="text-white font-bold">1 bonus ticket</span> for every referral!</p>
        <p>🎯 <strong>More Tickets = More Chances</strong> to win. Boost your odds by referring!</p>
        <p className="text-xs text-gray-500 italic">
          Winners chosen randomly. 100% fair — good luck!
        </p>
      </div>
      {/* Core Info */}
      <div className="text-sm space-y-1">
        <p>🏆 Prize: {prize}</p>
        <p>🪙 Entry Fee: <span className="font-bold">FREE</span></p>
        <p>🎫 Tickets: {total.toLocaleString()}</p>
        <p className="font-mono">⏳ {timeLeft}</p>
      </div>

     

      {/* Progress Bar */}
      <div className="w-full">
        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#00ffd5] via-blue-400 to-[#0077ff]"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Sold: <span className="text-white">{sold.toLocaleString()}</span> / {total.toLocaleString()} ({percent}%)
        </p>
      </div>

      {/* CTA Button */}
      <div className="pt-2">
        <Link href={`/ticket-purchase/${comp.slug}`}>
          <button className="mt-6 w-full max-w-xs mx-auto py-3 px-6 rounded-lg font-bold text-sm bg-gradient-to-r from-[#00ffd5] to-[#0077ff] text-black hover:scale-105 transition-transform duration-200 shadow-lg">
            🎟 Claim Free Entry
          </button>
        </Link>
      </div>

    </section>
  )
}
