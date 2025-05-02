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
  href,
  small,
  children,
  theme,
  imageUrl,            // ← new prop
  endsAt = Date.now() + 1000 * 60 * 60 * 12,
}) {
  const appliedTheme = theme || (comp.entryFee === 0 ? 'green' : 'gold')
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    function update() {
      const diff = new Date(endsAt) - Date.now()
      if (diff <= 0) return setTimeLeft('Ended')
      const h = Math.floor(diff / 36e5)
      const m = Math.floor((diff % 36e5) / 6e4)
      setTimeLeft(`${h}h ${m}m`)
    }
    update()
    const iv = setInterval(update, 60000)
    return () => clearInterval(iv)
  }, [endsAt])

  return (
    <div
      className={[
        'competition-card',
        `theme-${appliedTheme}`,
        small && 'competition-card--small',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="competition-top-banner">{title}</div>

      {/*
        If an imageUrl prop was passed, use it; otherwise
        fall back to /pi.jpeg.
      */}
      <div className="competition-image mb-4 h-40 overflow-hidden rounded">
        <Image
          src={imageUrl || '/pi.jpeg'}
          alt={`${title} banner`}
          width={300}
          height={180}
          className="object-cover w-full h-full"
        />
      </div>

      <div className="competition-info space-y-1 text-left">
        <p><strong>Prize:</strong> {prize}</p>
        <p><strong>Draw ends in:</strong> {timeLeft}</p>
        <p>📊 <strong>Total Tickets:</strong> 3500</p>
        <p>✅ <strong>Sold:</strong> 0</p>
        <p>🏅 <strong>Entry Fee:</strong> {fee}</p>
      </div>

      {children /* render any custom child UI here */}

      {!children && (
        <Link href={href}>
          <button className="mt-4 comp-button w-full">Enter Now</button>
        </Link>
      )}
    </div>
  )
}
