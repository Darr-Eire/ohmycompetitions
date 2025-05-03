// src/components/CompetitionCard.js
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function CompetitionCard({
  comp,
  title,
  prize,
  fee,
  small = false,
  theme = 'daily',
  imageUrl,
  endsAt,
  hideButton = false,
  children,
}) {
  // Countdown
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    const update = () => {
      const diff = new Date(endsAt).getTime() - Date.now()
      if (diff <= 0) return setTimeLeft('Ended')
      const h = Math.floor(diff / 36e5)
      const m = Math.floor((diff % 36e5) / 6e4)
      setTimeLeft(`${h}h ${m}m`)
    }
    update()
    const id = setInterval(update, 60_000)
    return () => clearInterval(id)
  }, [endsAt])

  // Theme → banner classes
  const bannerClass = {
    daily:   'bg-blue-600 text-white',
    free:    'bg-green-500 text-white',
    tech:    'bg-orange-500 text-white',
    pi:      'bg-purple-600 text-white',
    premium: 'bg-gray-800 text-white',
  }[theme] || 'bg-blue-600 text-white'

  return (
    <div className={`competition-card ${small ? 'competition-card--small' : ''}`}>
      {/* Title Banner */}
      <div className={`${bannerClass} px-4 py-2 text-2xl font-bold rounded-t-md mb-4`}>
        {title}
      </div>

      {/* Image */}
      <div className="competition-image h-40 overflow-hidden rounded mb-4">
        <Image
          src={imageUrl || '/pi.jpeg'}
          alt={title}
          width={300}
          height={180}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Details */}
      <div className="competition-info text-sm space-y-1">
        <p><strong>Prize:</strong> <span className="font-bold">{prize}</span></p>
        <p><strong>Ends In:</strong> <span className="font-bold">{timeLeft}</span></p>
        <p>
          <strong>Tickets:</strong>{' '}
          <span className="font-bold">
            {comp.totalTickets?.toLocaleString() ?? '—'}
          </span>
        </p>
        <p>
          <strong>Remaining:</strong>{' '}
          <span className="font-bold">
            {typeof comp.ticketsSold === 'number'
              ? (comp.totalTickets - comp.ticketsSold).toLocaleString()
              : '—'}
          </span>
        </p>
        <p><strong>Entry Fee:</strong> <span className="font-bold">{fee}</span></p>
      </div>

      {/* Custom children */}
      {children}

      {/* Enter Now button */}
      {!children && !hideButton && (
        <Link href={`/ticket-purchase/${comp.slug}`}>
          <button className="comp-button w-full mt-4">Enter Now</button>
        </Link>
      )}
    </div>
  )
}
