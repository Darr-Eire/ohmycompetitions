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
  small = false,
  theme = 'daily',
  imageUrl,
  endsAt = comp?.endsAt || new Date().toISOString(),
  hideButton = false,
  children,
}) {
  const [timeLeft, setTimeLeft] = useState('')
  const [status, setStatus] = useState('UPCOMING')

  useEffect(() => {
    function update() {
      const now = new Date()
      const end = new Date(endsAt)
      const diff = end.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeLeft('Ended')
        setStatus('ENDED')
        return
      }

      const hours = Math.floor(diff / 36e5)
      const mins = Math.floor((diff % 36e5) / 6e4)
      setTimeLeft(`${hours}h ${mins}m`)
      setStatus('LIVE')
    }

    update()
    const id = setInterval(update, 60_000)
    return () => clearInterval(id)
  }, [endsAt])

  return (
    <div className="flex flex-col w-full max-w-xs mx-auto h-full bg-[#0f172a] border border-cyan-600 rounded-xl shadow-lg text-white font-orbitron overflow-hidden transition-all duration-300 md:hover:scale-[1.03]">
      
      {/* Header with Status Badge and Title */}
      <div className="card-header-gradient flex items-center justify-between px-4 py-2">
        <span
          className={`px-3 py-1 rounded-full text-xs sm:text-sm font-bold shadow ${
            status === 'LIVE'
              ? 'bg-green-600 text-black animate-pulse'
              : 'bg-red-500 text-white'
          }`}
        >
          {status}
        </span>
        <span className="truncate text-right max-w-[calc(100%-4.5rem)] text-sm sm:text-base font-semibold">
          {title}
        </span>
      </div>

      {/* Image */}
      <div className="relative w-full aspect-[16/9] bg-black overflow-hidden">
        <Image
          src={imageUrl || '/pi.jpeg'}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover"
          priority
        />
      </div>

      {/* Info */}
   {/* Info - Centered */}
<div className="p-4 text-xs sm:text-sm space-y-1 text-center">
  <p><span className="text-cyan-300 font-semibold">Prize:</span> {prize}</p>
  <p><span className="text-cyan-300 font-semibold">Ends In:</span> {timeLeft}</p>
  <p><span className="text-cyan-300 font-semibold">Total Tickets:</span> {comp.totalTickets?.toLocaleString() ?? '—'}</p>
  <p><span className="text-cyan-300 font-semibold">Remaining:</span> {typeof comp.ticketsSold === 'number' ? (comp.totalTickets - comp.ticketsSold).toLocaleString() : '—'}</p>
  <p><span className="text-cyan-300 font-semibold">Entry Fee:</span> {fee}</p>
</div>


      {/* Custom Content Slot */}
      {children}

      {/* CTA Button */}
      {!children && !hideButton && (
        <div className="p-4 pt-0 mt-auto">
          <Link href={`/ticket-purchase/${comp.slug}`} passHref>
            <button className="comp-button w-full">
              Enter Now
            </button>
          </Link>
        </div>
      )}
    </div>
  )
}
