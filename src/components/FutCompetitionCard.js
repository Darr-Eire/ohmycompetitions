'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

export default function FutCompetitionCard({
  comp,
  title,
  prize,
  fee,
  imageUrl,
  theme = 'blue',
  endsAt = comp.endsAt
}) {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    const update = () => {
      const diff = new Date(endsAt) - Date.now()
      if (diff <= 0) {
        setTimeLeft('Ended')
        return
      }
      const h = Math.floor(diff / 36e5)
      const m = Math.floor((diff % 36e5) / 6e4)
      setTimeLeft(`${h}h ${m}m`)
    }
    update()
    const iv = setInterval(update, 60_000)
    return () => clearInterval(iv)
  }, [endsAt])

  const gradients = {
    blue:    'from-blue-600 to-transparent',
    green:   'from-green-500 to-transparent',
    orange:  'from-orange-500 to-transparent',
    purple:  'from-purple-600 to-transparent',
    premium: 'from-gray-800 to-transparent',
  }

  return (
    <div className={`relative w-64 h-80 rounded-2xl overflow-hidden bg-gradient-to-tr ${gradients[theme] || gradients.blue} p-1 shadow-xl`}>
      <div className="absolute inset-1 bg-black rounded-xl overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <Image src={imageUrl} alt={title} fill className="object-cover" />
        </div>
        <div className="relative z-10 flex justify-between items-center px-3 pt-2 text-white">
          <span className="text-xs uppercase font-bold">{title}</span>
          <span className="text-xs font-semibold">{fee}</span>
        </div>
        <div className="relative z-10 flex-1 flex items-center justify-center">
          <span className="text-4xl font-extrabold text-white">{prize}</span>
        </div>
        <div className="relative z-10 grid grid-cols-3 gap-1 text-center text-xs text-white px-3 pb-2">
          <div>
            <div className="font-semibold">Total</div>
            <div>{comp.totalTickets?.toLocaleString() ?? '—'}</div>
          </div>
          <div>
            <div className="font-semibold">Left</div>
            <div>{
              typeof comp.ticketsSold === 'number'
                ? (comp.totalTickets - comp.ticketsSold).toLocaleString()
                : '—'
            }</div>
          </div>
          <div>
            <div className="font-semibold">Ends In</div>
            <div>{timeLeft}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
