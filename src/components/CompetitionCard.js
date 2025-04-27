// src/components/CompetitionCard.js
'use client'

import { useRouter } from 'next/navigation'

export default function CompetitionCard({
  title = "Everyday Pioneer",
  prize = "1,000 PI Giveaways",
  fee = "0.314 π",
  href = "/competitions/everyday-pioneer",
}) {
  const router = useRouter()

  return (
    <div className="competition-card">
      <div className="competition-top-banner">{title}</div>
      <div className="competition-image-placeholder">
        Add Image Here
      </div>
      <div className="competition-info">
        <p><strong>Draw ends in:</strong> 13h 58m</p>
        <p>📊 <strong>Total Tickets:</strong> 1000</p>
        <p>✅ <strong>Sold:</strong> 300</p>
        <p>🎟️ <strong>Available:</strong> 700</p>
        <p>🏅 <strong>Entry Fee:</strong> {fee}</p>
      </div>
      <button
        className="comp-button"
        onClick={() => router.push(href)}
      >
        Enter Now
      </button>
    </div>
  )
}
