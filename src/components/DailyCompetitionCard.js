// src/components/DailyCompetitionCard.js
'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function DailyCompetitionCard({
  title,
  img,
  tagline,
  endsIn,
  totalTickets,
  entryFee,
  href,
}) {
  const router = useRouter()

  return (
    <div className="daily-card">
      <div className="daily-card__image">
        <Image
          src={img}
          alt={title}
          width={250}
          height={150}
          className="rounded-lg object-cover"
        />
      </div>
      <h3 className="daily-card__title">{title}</h3>
      <p className="daily-card__tagline">{tagline}</p>
      <p className="daily-card__ends">Ends in: {endsIn}</p>
      <p className="daily-card__stat">📊 Total Tickets: {totalTickets}</p>
      <p className="daily-card__stat">🎟️ Entry Fee: {entryFee}</p>
      <button
        className="daily-card__button"
        onClick={() => router.push(href)}
      >
        Enter Now
      </button>
    </div>
  )
}
