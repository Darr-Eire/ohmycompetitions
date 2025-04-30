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
  rarity = 'common', // rarity levels: common, rare, epic, legendary
  endsAt = new Date(Date.now() + 3600 * 1000 * 12), // fallback: 12h from now
}) {
  const isFree = comp?.entryFee === 0
  const appliedTheme = theme || (isFree ? 'green' : 'gold')

  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date()
      const diff = new Date(endsAt) - now
      if (diff <= 0) return setTimeLeft('Ended')
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      setTimeLeft(`${hours}h ${minutes}m`)
    }

    updateCountdown()
    const timer = setInterval(updateCountdown, 60000)
    return () => clearInterval(timer)
  }, [endsAt])

  return (
    <div
      className={[
        'competition-card',
        `theme-${appliedTheme}`,
        `rarity-${rarity}`,
        small && 'competition-card--small',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="competition-top-banner">{title}</div>

      <div className="competition-image-placeholder">
        <Image
          src="/pi.jpeg"
          alt={`${title} banner`}
          width={300}
          height={181}
          className="object-cover rounded"
        />
      </div>

      <div className="competition-info">
        <p><strong>Prize:</strong> {prize}</p>
        <p><strong>Draw ends in:</strong> {timeLeft}</p>
        <p>📊 <strong>Total Tickets:</strong> 5000</p>
        <p>✅ <strong>Sold:</strong> 0</p>
        <p>🏅 <strong>Entry Fee:</strong> {fee}</p>
        <p className="text-xs italic text-gray-400">Rarity: {rarity}</p>
      </div>

      {children}

      <Link href={href || `/ticket-purchase/${comp.slug}`}>
        <button className="mt-2 comp-button w-full">Enter Now</button>
      </Link>
    </div>
  )
}

CompetitionCard.defaultProps = {
  comp: { slug: 'everyday-pioneer', entryFee: 0 },
  title: 'Everyday Pioneer',
  prize: '1,000 PI Giveaways',
  fee: '0.314 π',
  href: '/competitions/everyday-pioneer',
  small: false,
  theme: null,
  rarity: 'common',
  endsAt: new Date(Date.now() + 1000 * 60 * 60 * 12),
}
