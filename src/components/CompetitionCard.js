'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import '@fontsource/orbitron'

export default function CompetitionCard({
  comp,
  title,
  prize,
  fee,
  imageUrl,
  endsAt = comp?.endsAt || new Date().toISOString(),
  hideButton = false,
  children
}) {
  const [timeLeft, setTimeLeft] = useState('')
  const [status, setStatus] = useState('UPCOMING')

  useEffect(() => {
    if (!endsAt) return

    const interval = setInterval(() => {
      const now = Date.now()
      const end = new Date(endsAt).getTime()
      const diff = end - now

      if (diff <= 0) {
        setTimeLeft('Ended')
        setStatus('ENDED')
        clearInterval(interval)
        return
      }

      const hrs = Math.floor(diff / (1000 * 60 * 60))
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const secs = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeLeft(`${hrs}h ${mins}m ${secs}s`)
      setStatus('LIVE')
    }, 1000)

    return () => clearInterval(interval)
  }, [endsAt])

  const sold = comp.ticketsSold ?? 0
  const total = comp.totalTickets ?? 100
  const percent = Math.min(100, Math.floor((sold / total) * 100))

  return (
    <div className="flex flex-col w-full max-w-xs mx-auto h-full bg-[#0f172a] border border-cyan-600 rounded-xl shadow-lg text-white font-orbitron overflow-hidden transition-all duration-300 hover:scale-[1.03]">

      {/* Header */}
      <div className="card-header-gradient px-4 py-2 flex justify-between items-center">
        <span className="w-full text-center text-sm sm:text-base font-semibold text-black">
          {title}
        </span>
        <span className={`
          ml-auto px-3 py-1 rounded-full text-xs sm:text-sm font-bold shadow
          ${status === 'LIVE'
            ? 'bg-gradient-to-r from-[#00ffd5] to-[#0077ff] text-black animate-pulse'
            : 'bg-red-500 text-white'}
        `}>
          {status}
        </span>
      </div>

      {/* Sponsored Badge */}
      {comp?.type === 'sponsored' && (
        <div className="flex items-center gap-2 justify-center py-2 bg-black/20">
          {comp.partnerLogoUrl && (
            <Image src={comp.partnerLogoUrl} alt="logo" width={28} height={28} className="rounded-full border" />
          )}
          <span className="text-cyan-400 text-xs font-semibold">
            Sponsored by {comp.partnerName}
          </span>
        </div>
      )}

      {/* Image */}
      <div className="relative w-full aspect-[16/9] bg-black overflow-hidden">
        <Image src={imageUrl || '/pi.jpeg'} alt={title} fill className="object-cover" priority />
      </div>

      {/* Timer */}
      <div className="flex justify-center items-center gap-3 px-4 pt-3">
        <div className="bg-gradient-to-r from-cyan-400 to-blue-500 px-3 py-1 rounded-lg">
          <p className="text-sm text-black font-mono font-bold">
            ⏳ {timeLeft}
          </p>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 text-xs sm:text-sm text-center space-y-2">
        <p><span className="text-cyan-300 font-semibold">Prize:</span> {prize}</p>
        <p><span className="text-cyan-300 font-semibold">Entry Fee:</span> {fee}</p>
        <p><span className="text-cyan-300 font-semibold">Total Tickets:</span> {total.toLocaleString()}</p>

        {/* Progress Bar */}
        <div className="w-full bg-gray-700 h-3 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500" style={{ width: `${percent}%` }} />
        </div>
        <p className="text-gray-300 text-xs">Sold: {sold.toLocaleString()} ({percent}%)</p>
      </div>

      {/* Slot or CTA */}
      {children ? children : !hideButton && (
        <div className="p-4 pt-0 mt-auto">
          <Link href={`/ticket-purchase/${comp.slug}`}>
            <button className="comp-button w-full">Enter Now</button>
          </Link>
        </div>
      )}
    </div>
  )
}
