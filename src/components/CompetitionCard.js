'use client'

import { useRouter } from 'next/navigation'

export default function CompetitionCard({
  title,
  prize,
  fee,
  href,
}) {
  const router = useRouter()

  return (
    <div className="competition-card">
      <div className="competition-top-banner">{title}</div>
      <div className="competition-image-placeholder">
        <img src="/pi.jpeg" alt={title} className="w-full h-40 object-cover rounded" />
      </div>
      <div className="competition-info">
        <p><strong>Prize:</strong> {prize}</p>
        <p><strong>Draw ends in:</strong> 13h 58m</p>
        <p>📊 <strong>Total Tickets:</strong> 5,000</p>
        <p>✅ <strong>Sold:</strong> 0</p>
        <p>🎟️ <strong>Available:</strong> 5,000</p>
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
