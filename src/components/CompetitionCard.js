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
  small,
  children,
  theme = 'global',
  imageUrl,
  endsAt = comp?.endsAt || Date.now() + 1000 * 60 * 60 * 12,
  hideButton = false,
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
    const timer = setInterval(update, 60000)
    return () => clearInterval(timer)
  }, [endsAt])

  const bannerStyles = {
    global:  'bg-blue-600 text-white',
    daily:   'bg-blue-600 text-white',
    green:   'bg-green-500 text-white',
    orange:  'bg-orange-500 text-white',
    purple:  'bg-purple-600 text-white',
    premium: 'bg-gray-800 text-white',
  }

  const bannerClass = bannerStyles[theme] || bannerStyles.global

  return (
    <div
      className={[
        'competition-card',
        small && 'competition-card--small',
      ]
        .filter(Boolean)
        .join(' ')
      }
    >
      {/* Colored title banner with larger text */}
      <div
        className={`${bannerClass} inline-block text-3xl font-bold px-4 py-2 rounded-t-md mb-4`}
      >
        {title}
      </div>

      {/* Image */}
      <div className="competition-image mb-4 h-40 overflow-hidden rounded">
        <Image
          src={imageUrl || '/pi.jpeg'}
          alt={`${title} banner`}
          width={300}
          height={180}
          className="object-cover w-full h-full"
        />
      </div>

      {/* Info */}
      <div className="competition-info space-y-1 text-left text-sm">
        <p>
          <strong>Prize:</strong>{' '}
          <span className="font-bold whitespace-pre-line">{prize}</span>
        </p>
        <p>
          <strong>Draw ends in:</strong>{' '}
          <span className="font-bold">{timeLeft}</span>
        </p>
        <p>
          <strong>Total Tickets:</strong>{' '}
          <span className="font-bold">
            {comp.totalTickets?.toLocaleString() ?? '—'}
          </span>
        </p>
        <p>
          <strong>Remaining:</strong>{' '}
          <span className="font-bold">
            {comp.totalTickets != null && typeof comp.ticketsSold === 'number'
              ? (comp.totalTickets - comp.ticketsSold).toLocaleString()
              : '—'}
          </span>
        </p>
        <p>
          <strong>Entry Fee:</strong>{' '}
          <span className="font-bold">{fee}</span>
        </p>
      </div>

      {/* Optional children */}
      {children}

      {/* Enter Now button */}
      {!children && !hideButton && (
        <Link href={`/ticket-purchase/${comp.slug}`}>
          <button className="mt-4 comp-button w-full">Enter Now</button>
        </Link>
      )}
    </div>
  )
}
