'use client'
import React, { useState } from 'react'

export default function BuyTicketButton({ entryFee, competitionSlug }) {
  const [loading, setLoading] = useState(false)

  const handleBuy = () => {
    setLoading(true)
    window.Pi.createPayment(
      { amount: entryFee, memo: `ticket for ${competitionSlug}` },
      {
        onReadyForServerCompletion: async (paymentId, txid) => {
          // …POST to /api/pi/complete…
          setLoading(false)
        },
        onError: (err) => { console.error(err); setLoading(false) },
        onUserCancelled: () => setLoading(false),
      }
    )
  }

  return (
    <button
      onClick={handleBuy}
      disabled={loading}
      className="bg-green-600 text-white py-2 px-4 rounded"
    >
      {loading ? 'Processing…' : `Buy Ticket (${entryFee} π)`}
    </button>
  )
}
