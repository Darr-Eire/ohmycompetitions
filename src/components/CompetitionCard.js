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
  endsAt = comp?.endsAt || new Date().toISOString(),
  hideButton = false,
  children,
}) {
  // 1) Set up timeLeft state
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    function update() {
      const diff = new Date(endsAt).getTime() - Date.now()
      if (diff <= 0) {
        setTimeLeft('Ended')
        return
      }
      const hours = Math.floor(diff / 36e5)
      const mins  = Math.floor((diff % 36e5) / 6e4)
      setTimeLeft(`${hours}h ${mins}m`)
    }
    update()
    const id = setInterval(update, 60_000)
    return () => clearInterval(id)
  }, [endsAt])

  // 2) Banner classes by theme
  const bannerClass = {
    daily:   'bg-blue-600 text-white',
    free:    'bg-green-500 text-white',
    tech:    'bg-orange-500 text-white',
    pi:      'bg-purple-600 text-white',
    premium: 'bg-gray-800 text-white',
  }[theme] || 'bg-blue-600 text-white'

  return (
    <div className={`competition-card ${small ? 'competition-card--small' : ''}`}>
      {/* Title banner */}
      <div className={`competition-card__header ${bannerClass}`}>
        {title}
      </div>

      {/* Image */}
      <div className="competition-image h-40 overflow-hidden">
        <Image
          src={imageUrl || '/pi.jpeg'}
          alt={title}
          width={300}
          height={180}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Details */}
      <div className="competition-info flex-1 p-4 text-sm space-y-2">
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

      {/* Optional children */}
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

