// src/components/CompetitionCard.js
'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function CompetitionCard({
  comp,
  title,
  prize,
  fee,
  href,
  small,
  children,
}) {
  // Detect a “free” competition
  const isFree = comp?.entryFee === 0

  return (
    <div
      className={[
        'competition-card',
        small && 'competition-card--small',
        isFree && 'border-2 border-green-500',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Banner */}
      <div className="competition-top-banner">{title}</div>

      {/* Image */}
      <div className="competition-image-placeholder">
        <Image
          src="/pi.jpeg"
          alt={`${title} banner`}
          width={300}
          height={181}
          className="object-cover rounded"
        />
      </div>

      {/* Info */}
      <div className="competition-info">
        <p><strong>Prize:</strong> {prize}</p>
        <p><strong>Draw ends in:</strong> 13h 58m</p>
        <p>📊 <strong>Total Tickets:</strong> 5000</p>
        <p>✅ <strong>Sold:</strong> 0</p>
        <p>🏅 <strong>Entry Fee:</strong> {fee}</p>
      </div>

      {/* Extra controls (delete button, referral info, etc.) */}
      {children}

      {/* Enter button */}
      <Link href={href || `/ticket-purchase/${comp.slug}`}>
        <button className="mt-2 btn btn-secondary w-full">
          Enter Now
        </button>
      </Link>
    </div>
  )
}

// Default props
CompetitionCard.defaultProps = {
  comp: { slug: 'everyday-pioneer', entryFee: 0 },
  title: 'Everyday Pioneer',
  prize: '1,000 PI Giveaways',
  fee: '0.314 π',
  href: '/competitions/everyday-pioneer',
  small: false,
}
