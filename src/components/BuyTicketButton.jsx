// src/components/BuyTicketButton.jsx
'use client'

import React, { useState } from 'react'

export default function BuyTicketButton() {
  const [loading, setLoading] = useState(false)

  async function handleBuyTicket() {
    setLoading(true)
    try {
      const payment = await window.Pi.createPayment({
        amount: 0.314,
        memo: 'Buy ticket for PS5',
        metadata: { competitionId: 'ps5-bundle-giveaway' },
        onReadyForServerApproval: async (paymentId) => {
          console.log('Approving payment:', paymentId)
          const res = await fetch('/api/pi/approve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId }),
          })
          if (!res.ok) throw new Error('Approval failed')
        },
        onReadyForServerCompletion: async (paymentId, txid) => {
          const res = await fetch('/api/pi/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId, txid }),
          })
          if (!res.ok) throw new Error('Completion failed')
          alert('Ticket purchased successfully!')
        },
        onCancel: () => alert('Payment cancelled'),
        onError: (err) => alert('Payment error: ' + err.message),
      })
    } catch (err) {
      console.error('Pi payment failed:', err)
      alert('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleBuyTicket}
      disabled={loading}
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
    >
      {loading ? 'Processing…' : 'Buy Ticket'}
    </button>
  )
}
