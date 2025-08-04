'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import '@fontsource/orbitron'

function getCustomHighlightMessage(comp) {
  const firstPrize = comp.prizeBreakdown?.first || comp.prize || 'this competition'

  switch (comp.title) {
    case 'OMC Mega Pi Drop':
      return `🔥 Huge prize pool of ${firstPrize} up for grabs! Don’t miss out!`
    case 'OMC Pi Mini Jackpot':
      return `🎉 Try your luck at winning ${firstPrize}! Every ticket counts!`
    case 'Ps5 Bundle Giveaway':
      return `🎮 Enter now to win a ${firstPrize}! Game on!`
    default:
      return `Join now and compete for the prize of ${firstPrize}!`
  }
}

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
    const end = new Date(endsAt).getTime()
    const start = startsAt ? new Date(startsAt).getTime() : null

    const updateTimer = () => {
      const now = Date.now()
      const diff = end - now

      if (diff <= 24 * 60 * 60 * 1000 && diff > 0) {
        setShowCountdown(true)
        const hrs = Math.floor(diff / (1000 * 60 * 60))
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const secs = Math.floor((diff % (1000 * 60)) / 1000)

        setTimeLeft(
          `${hrs.toString().padStart(2, '0')}:${mins
            .toString()
            .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
        )
      } else {
        setShowCountdown(false)
      }

      if (start && now < start) {
        setStatusLabel('Starting Soon')
      } else {
        setStatusLabel('LIVE')
      }

      const totalTime = end - (start || now)
      const elapsed = now - (start || now)
      const percent = Math.max(0, Math.min(100, 100 - (elapsed / totalTime) * 100))
      setTimePercent(percent)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [endsAt, startsAt])

  const numberOfWinners = comp?.numberOfWinners || 1
  const prizesArray = Array.isArray(comp?.prizes) ? comp.prizes : []

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

          {/* Highlight with Prize */}
          <div className="bg-gradient-to-r from-cyan-500/30 via-cyan-400/20 to-cyan-500/30 border border-cyan-400/50 p-2 rounded text-center text-sm font-semibold mb-2 shadow-md">
            <p className="text-white">{getCustomHighlightMessage(comp)}</p>
           <div className="mt-1 space-y-1">
  {comp.prizeBreakdown?.first && (
    <p className="text-white font-bold text-lg">
      🥇 1st Prize <span className="text-white">{comp.prizeBreakdown.first} π</span>
    </p>
  )}
  {comp.prizeBreakdown?.second && (
    <p className="text-white font-bold text-lg">
      🥈 2nd Prize <span className="text-white">{comp.prizeBreakdown.second} π</span>
    </p>
  )}
  {comp.prizeBreakdown?.third && (
    <p className="text-white font-bold text-lg">
      🥉 3rd Prize <span className="text-white">{comp.prizeBreakdown.third} π</span>
    </p>
  )}

  {/* Fallback if no prizeBreakdown */}
  {!comp.prizeBreakdown && (
    <p className="text-white font-bold text-lg">
      Top Prize <span className="text-white">{comp?.prize || prize || 'No prize found'} π</span>
    </p>
  )}
</div>

            <p className="mt-1 text-sm text-cyan-300 font-medium tracking-wide animate-pulse">
              Only {total - sold} tickets left! 🔥
            </p>
            <div
              className={`w-full text-center mt-2 px-3 py-1 rounded-full text-xs font-bold shadow ${
                statusLabel === 'LIVE'
                  ? 'bg-gradient-to-r from-[#00ff99] to-[#00cc66] text-black animate-pulse'
                  : 'bg-gradient-to-r from-orange-400 to-orange-500 text-black'
              }`}
            >
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

            {showCountdown && (
              <div className="col-span-2 text-center text-sm text-red-400 font-bold tracking-wider">
                ⏳ Draw in: <span className="font-mono">{timeLeft}</span>
              </div>
            )}

           <p className="font-semibold text-left">Top Prize</p>
<p className="font-semibold text-right tabular-nums">
  {prizesArray.length > 0
    ? `${prizesArray[0]} π`
    : `${prize} π`}
</p>


        

            <p className="font-semibold text-left">Fee</p>
            <p className="font-semibold text-right tabular-nums">
              {isNaN(entryFee) ? 'TBA' : `${entryFee.toFixed(2)} π`}
            </p>

            <p className="font-semibold text-left">Tickets</p>
            <p className="font-semibold text-right tabular-nums">{total.toLocaleString()}</p>

            <p className="font-semibold text-left">Max Per User</p>
            <p className="font-semibold text-right tabular-nums">
              {comp.maxTicketsPerUser ? comp.maxTicketsPerUser.toLocaleString() : '10'}
            </p>
          </div>

          {/* Prize Breakdown Section */}
          {comp.prizeBreakdown && (
            <div className="mt-2 px-3 py-2 bg-cyan-900/20 rounded text-sm font-mono text-cyan-300">
              <p className="mb-1 font-semibold">🎯 Prize Breakdown:</p>
              <ul className="list-disc list-inside space-y-0.5">
                {comp.prizeBreakdown.first && <li>🥇 1st Prize: {comp.prizeBreakdown.first}</li>}
                {comp.prizeBreakdown.second && <li>🥈 2nd Prize: {comp.prizeBreakdown.second}</li>}
                {comp.prizeBreakdown.third && <li>🥉 3rd Prize: {comp.prizeBreakdown.third}</li>}
              </ul>
            </div>
          )}

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
