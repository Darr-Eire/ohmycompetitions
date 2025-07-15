'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import '@fontsource/orbitron'

export default function DailyCompetitionCard({ comp, title, prize, fee }) {
  const [timeLeft, setTimeLeft] = useState('')
  const [showCountdown, setShowCountdown] = useState(false)
  const [timePercent, setTimePercent] = useState(100)
  const endsAt = comp?.endsAt || new Date().toISOString()
  const startsAt = comp?.startsAt

  const sold = comp?.ticketsSold ?? 0
  const total = comp?.totalTickets ?? 100
  const percent = Math.min(100, Math.floor((sold / total) * 100))

  const entryFee =
    typeof fee === 'number'
      ? fee
      : typeof comp?.entryFee === 'number'
      ? comp.entryFee
      : 0

  const [statusLabel, setStatusLabel] = useState('LIVE')

  useEffect(() => {
    if (!startsAt) {
      setStatusLabel('LIVE')
      return
    }

    const start = new Date(startsAt).getTime()

    const checkStatus = () => {
      const now = Date.now()
      if (now < start) {
        setStatusLabel('Starting Soon')
      } else {
        setStatusLabel('LIVE')
      }
    }

    checkStatus()
    const interval = setInterval(checkStatus, 1000)
    return () => clearInterval(interval)
  }, [startsAt])

  const timerColor = timePercent > 50 ? 'bg-green-400' : timePercent > 20 ? 'bg-yellow-400' : 'bg-red-500'

  return (
    <div className="relative w-full max-w-sm mx-auto p-5 bg-[#0f172a] rounded-xl text-white font-orbitron shadow-xl border-2 border-cyan-400 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col mb-5 text-center w-full">
        <h3 className="w-full text-xl font-bold uppercase text-transparent bg-clip-text bg-gradient-to-l from-[#00ffd5] to-[#0077ff] tracking-wider">
          {title}
        </h3>
        <div className="flex justify-between w-full mt-2">
          <span className={`px-4 py-1.5 rounded-full ${statusLabel === 'LIVE' ? 'bg-gradient-to-r from-[#00ff99] to-[#00cc66] text-black' : 'bg-gradient-to-r from-orange-400 to-orange-500 text-black'} font-bold text-xs shadow-lg animate-pulse`}>
            {statusLabel}
          </span>
          <span className="px-4 py-1.5 rounded-full border border-cyan-400 bg-cyan-600/30 text-white font-semibold text-xs">
            Draw: {new Date(endsAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Highlight */}
      <div className="bg-gradient-to-r from-cyan-500/30 via-cyan-400/20 to-cyan-500/30 border border-cyan-400/50 p-5 rounded-xl text-center text-sm font-semibold mb-6 shadow-md">
        <p className="text-cyan-100 text-base leading-relaxed">
          {comp?.highlightMessage ? comp.highlightMessage : '🚀 Join now and compete for the Pi prize! 🎉'}
        </p>
        <p className="mt-3 text-xs text-cyan-200 font-medium tracking-wide animate-pulse">
          Only {total - sold} tickets left! 🔥
        </p>
        {showCountdown && (
          <div className="flex justify-center mt-4">
            <span className={`${timerColor} text-black px-4 py-1.5 rounded-full font-bold text-sm font-mono select-none`}>
              {timeLeft}
            </span>
          </div>
        )}
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-4 text-white text-sm mb-4 max-w-md mx-auto">
        <p className="font-semibold text-left">🗓 Starts On:</p>
        <p className="font-semibold text-right tabular-nums">
          {startsAt ? new Date(startsAt).toLocaleDateString('en-GB') : 'TBA'}
        </p>

        <p className="font-semibold text-left">🎁 Prize:</p>
        <p className="font-semibold text-right tabular-nums">{prize}</p>

        <p className="font-semibold text-left">🎟 Entry Fee:</p>
        <p className="font-semibold text-right tabular-nums">{entryFee.toFixed(2)} π</p>

        <p className="font-semibold text-left">🎫 Total Tickets:</p>
        <p className="font-semibold text-right tabular-nums">{total.toLocaleString()}</p>

        <p className="font-semibold text-left">🔒 Max Purchase:</p>
        <p className="font-semibold text-right tabular-nums">
          {comp.maxTicketsPerUser ? comp.maxTicketsPerUser.toLocaleString() : '10'}
        </p>
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
        <Link href={`/ticket-purchase/${comp.slug}`} legacyBehavior>
          <button
            className="w-full py-3 rounded-lg font-bold bg-gradient-to-r from-[#00ffd5] to-[#0077ff] text-black transition-transform duration-200 hover:scale-105"
          >
            Enter Now
          </button>
        </Link>
      </div>
    </div>
  )
}
