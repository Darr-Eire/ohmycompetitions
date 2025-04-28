// src/components/CompetitionCard.js
'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function CompetitionCard({
  title = "Everyday Pioneer",
  prize = "1,000 PI Giveaways",
  fee = "0.314 π",
  href = "/competitions/everyday-pioneer",
}) {
  const router = useRouter()

  return (
    <div className="competition-card">
      {/* Banner */}
      <div className="competition-top-banner">{title}</div>
      <div className="competition-image-placeholder">
        <Image
          src="/pi.jpeg"
          alt={`${title} banner`}
          width={280}
          height={181}
          className="object-cover rounded"
        />
      </div>
      <br/>

      {/* Info */}
      <div className="competition-info">
        <p><strong>Prize:</strong> {prize}</p>
        <p><strong>Draw ends in:</strong> 13h 58m</p>
        <p>📊 <strong>Total Tickets:</strong> 5000</p>
        <p>✅ <strong>Sold:</strong> 0</p>
        <p>🎟️ <strong>Available:</strong> 5000</p>
        <p>🏅 <strong>Entry Fee:</strong> {fee}</p>
      </div>

      {/* Enter button */}
      <button
        className="comp-button"
        onClick={() => router.push(href)}
      >
        Enter Now
      </button>
    </div>
  )
}
