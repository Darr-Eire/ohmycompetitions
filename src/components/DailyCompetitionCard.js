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
    <div className="flex flex-col w-full max-w-xs mx-auto bg-[#0f172a] border-[0.5px] border-cyan-400 rounded-xl shadow-lg text-white font-orbitron overflow-hidden transition-all duration-300 hover:scale-[1.03]">
      
      {/* Header */}
      <div className="flex flex-col text-center p-3 bg-gradient-to-r from-[#00ffd5] via-[#00ccff] to-[#0077ff]">
        <h3 className="w-full text-base font-bold uppercase text-black truncate">
          {title}
        </h3>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex flex-col flex-grow justify-between">
          {/* Highlight */}
          <div className="bg-gradient-to-r from-cyan-500/30 via-cyan-400/20 to-cyan-500/30 border border-cyan-400/50 p-2 rounded text-center text-sm font-semibold mb-2 shadow-md">
            <p className="text-cyan-100">
              {comp?.highlightMessage ? comp.highlightMessage : 'Join now and compete for the Pi prize!'}
            </p>
            <p className="mt-1 text-sm text-cyan-300 font-medium tracking-wide animate-pulse">
              Only {total - sold} tickets left! 🔥
            </p>

            {/* Moved Status Banner here */}
            <div className={`w-full text-center mt-2 px-3 py-1 rounded-full text-xs font-bold shadow 
              ${statusLabel === 'LIVE'
                ? 'bg-gradient-to-r from-[#00ff99] to-[#00cc66] text-black animate-pulse'
                : 'bg-gradient-to-r from-orange-400 to-orange-500 text-black'}`}>
              {statusLabel}
            </div>
          </div>

          {/* Details Grid */}
 <div className="grid grid-cols-2 gap-1 text-white text-sm mb-3">
  <p className="font-semibold text-left">Starts</p>
  <p className="font-semibold text-right tabular-nums">
    {startsAt ? new Date(startsAt).toLocaleDateString('en-GB') : 'TBA'}
  </p>

  <p className="font-semibold text-left">Draw</p>
  <p className="font-semibold text-right tabular-nums">
    {endsAt ? new Date(endsAt).toLocaleDateString('en-GB') : 'TBA'}
  </p>



            <p className="font-semibold text-left"> Prize</p>
            <p className="font-semibold text-right tabular-nums">{prize}</p>

            <p className="font-semibold text-left"> Fee</p>
            <p className="font-semibold text-right tabular-nums">
              {isNaN(entryFee) ? 'TBA' : `${entryFee.toFixed(2)} π`}
            </p>

            <p className="font-semibold text-left"> Tickets</p>
            <p className="font-semibold text-right tabular-nums">{total.toLocaleString()}</p>

            <p className="font-semibold text-left"> Max Per User</p>
            <p className="font-semibold text-right tabular-nums">
              {comp.maxTicketsPerUser ? comp.maxTicketsPerUser.toLocaleString() : '10'}
            </p>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden mb-1">
              <div
                className="h-full bg-gradient-to-r from-[#00ffd5] via-blue-400 to-[#0077ff]"
                style={{ width: `${percent}%` }}
              />
            </div>
            <p className="text-center text-xs text-gray-400 mb-3">
              Sold: <span className="text-white font-semibold">{sold.toLocaleString()}</span> / {total.toLocaleString()} ({percent}%)
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <Link href={`/ticket-purchase/${comp.slug}`} legacyBehavior>
          <button
            className="w-full py-2 rounded-md font-bold text-black bg-gradient-to-r from-[#00ffd5] to-[#0077ff] hover:from-[#00e6c7] hover:to-[#0066e6] transition-transform duration-200 hover:scale-105 mt-1"
          >
            Enter Now
          </button>
        </Link>
      </div>
    </div>
  )
}
