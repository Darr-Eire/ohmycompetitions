'use client'

import Link from 'next/link'

export default function AllCompetitions() {
  return (
    <main className="page-container">
      {/* Page Title */}
      <h1 className="page-title">All Competitions</h1>
      <div className="title-divider" />

      {/* Competition Card */}
      <div className="competition-card">
        <div className="competition-top-banner">Everyday Pioneer</div>
        <div className="competition-image-placeholder">[Image Coming]</div>
        <div className="competition-info">
          <p><strong>Prize:</strong> 1,000 PI Giveaway</p>
          <p><strong>Entry Fee:</strong> 0.314 π</p>
          <p><strong>Total Tickets:</strong> 1000</p>
          <p><strong>Sold:</strong> 300</p>
          <p><strong>Draw ends in:</strong> 13h 58m</p>
        </div>
        <Link href="/competitions/everyday-pioneer">
          <button className="comp-button">Enter Now</button>
        </Link>
      </div>
    </main>
  )
}
