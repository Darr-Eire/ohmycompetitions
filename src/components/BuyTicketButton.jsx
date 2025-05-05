// src/components/BuyTicketButton.jsx
'use client'
import React, { useState } from 'react'

export default function BuyTicketButton({ entryFee, competitionSlug }) {
  const [loading, setLoading] = useState(false)

  const handleBuy = () => {
    console.log('🪙 Starting Pi.createPayment', entryFee, competitionSlug)
    setLoading(true)

    window.Pi.createPayment(
      {
        amount: entryFee,
        memo: `ticket for ${competitionSlug}`,
      },
      {
        onReadyForServerCompletion: async (paymentId, txid) => {
          console.log('✅ onReadyForServerCompletion', { paymentId, txid })
          try {
            const res = await fetch('/api/pi/complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId, txid, competitionSlug }),
            })
            if (!res.ok) throw new Error(await res.text())
            alert('🎉 Ticket purchased!')
          } catch (err) {
            console.error('❌ Server completion error', err)
            alert('Error confirming purchase; check console.')
          } finally {
            setLoading(false)
          }
        },
        onUserCancelled: () => {
          console.warn('⚠️ User cancelled payment')
          setLoading(false)
        },
        onError: (err) => {
          console.error('🔴 Payment error', err)
          alert('Payment error; check console.')
          setLoading(false)
        },
      }
    )
  }

  return (
    <button
      onClick={handleBuy}
      disabled={loading}
      className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition"
    >
      {loading ? 'Processing…' : `Buy Ticket (${entryFee} π)`}
    </button>
  )
}

