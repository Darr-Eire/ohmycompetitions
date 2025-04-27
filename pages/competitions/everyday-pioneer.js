'use client'

import { useState, useEffect } from 'react'

export default function EverydayPioneer() {
  const [tickets, setTickets] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [sdkReady, setSdkReady] = useState(false)

  // Detect Pi Browser
  const isPiBrowser =
    typeof navigator !== 'undefined' && /Pi Browser/i.test(navigator.userAgent)

  useEffect(() => {
    if (isPiBrowser && !window.Pi) {
      const script = document.createElement('script')
      script.src = 'https://sdk.minepi.com/pi-sdk.js'
      script.onload = () => {
        window.Pi.init({ version: '2.0' })
        setSdkReady(true)
      }
      document.head.appendChild(script)
    } else {
      setSdkReady(true)
    }
  }, [isPiBrowser])

  const entryFeePerTicket = 0.314
  const totalCost = (tickets * entryFeePerTicket).toFixed(3)

  const handleEnter = () => {
    // replace with actual navigation or payment flow
    alert(`Proceed to enter with ${tickets} ticket(s) costing ${totalCost} π`)
  }

  return (
    <main className="page">
      <div className="competition-card">
        <div className="competition-top-banner">Everyday Pioneer</div>

        <div className="competition-image-placeholder">
          Add Image Here
        </div>

        <div className="competition-info">
          <p><strong>Draw ends in:</strong> 13h 58m</p>
          <p>📊 <strong>Total Tickets:</strong> 1000</p>
          <p>✅ <strong>Sold:</strong> 300</p>
          <p>🎟️ <strong>Available:</strong> 700</p>
          <p>🏅 <strong>Entry Fee:</strong> 0.314 π</p>
        </div>

        {error && (
          <p className="text-red-500 mb-4">{error}</p>
        )}

        <button
          onClick={handleEnter}
          disabled={loading}
          className="comp-button"
        >
          Enter Now
        </button>
      </div>
    </main>
  )
}
