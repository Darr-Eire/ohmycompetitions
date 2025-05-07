'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import '@fontsource/orbitron'

export default function CompetitionCard({ comp, title, prize, fee, imageUrl, endsAt = comp?.endsAt || new Date().toISOString(), hideButton = false, children }) {
  const [timeLeft, setTimeLeft] = useState('')
  const [status, setStatus] = useState('UPCOMING')

  useEffect(() => {
    function update() {
      const now = Date.now()
      const endMs = new Date(endsAt).getTime()
      const diff = endMs - now
      if (diff <= 0) {
        setTimeLeft('Ended')
        setStatus('ENDED')
        return
      }
      const h = Math.floor(diff / 36e5)
      const m = Math.floor((diff % 36e5) / 6e4)
      setTimeLeft(`${h}h ${m}m`)
      setStatus('LIVE')
    }
    update()
    const id = setInterval(update, 60_000)
    return () => clearInterval(id)
  }, [endsAt])

  return (
    <div className="flex flex-col w-full max-w-xs mx-auto h-full bg-[#0f172a] border border-cyan-600 rounded-xl shadow-lg text-white font-orbitron overflow-hidden transition-all duration-300 hover:scale-[1.03]">

      {/* Gradient Header with Centered Title */}
      <div className="card-header-gradient px-4 py-2">
       <span className="block w-full text-center text-sm sm:text-base font-semibold text-black">
         {title}
     </span>
      </div>

      {/* Image */}
      <div className="relative w-full aspect-[16/9] bg-black overflow-hidden">
        <Image src={imageUrl || '/pi.jpeg'} alt={title} fill className="object-cover" priority />
      </div>

      {/* Info */}
      <div className="p-4 text-xs sm:text-sm space-y-1 text-center">
        <p><span className="text-cyan-300 font-semibold">Prize:</span> {prize}</p>
        <p><span className="text-cyan-300 font-semibold">Ends In:</span> {timeLeft}</p>
        <p><span className="text-cyan-300 font-semibold">Total Tickets:</span> {comp.totalTickets?.toLocaleString() ?? '—'}</p>
        <p><span className="text-cyan-300 font-semibold">Entry Fee:</span> {fee}</p>
        <div className="mt-2">
          <span className={`
            inline-block px-3 py-1 rounded-full text-xs sm:text-sm font-bold shadow
            ${status === 'LIVE'
              ? 'bg-gradient-to-r from-[#00ffd5] to-[#0077ff] text-black animate-pulse'
              : 'bg-red-500 text-white'}
          `}>
            {status}
          </span>
        </div>
      </div>

      {/* Custom slot */}
      {children}

      {/* CTA */}
      {!children && !hideButton && (
        <div className="p-4 pt-0 mt-auto">
          <Link href={`/ticket-purchase/${comp.slug}`}>
            <button className="comp-button w-full">Enter Now</button>
          </Link>
        </div>
      )}
    </div>
  )
}
