// src/components/BuyTicketButton.jsx
'use client'
import { useState } from 'react'

export default function BuyTicketButton({ entryFee, competitionSlug }) {
  const [loading, setLoading] = useState(false)

  const handleBuy = () => {
    // Debug: verify Pi SDK presence
    if (!window.Pi || typeof window.Pi.createPayment !== 'function') {
      alert('❌ Pi SDK unavailable—open this page in the Pi mobile app browser over HTTPS.')
      return
    }

    console.log('🛒 createPayment', entryFee, competitionSlug)
    setLoading(true)

    window.Pi.createPayment(
      { amount: entryFee, memo: competitionSlug },
      {
        onReadyForServerCompletion: (paymentId, txid) => {
          alert(`✅ Payment ready!\nID: ${paymentId}\nTX: ${txid}`)
          setLoading(false)
        },
        onUserCancelled: () => {
          alert('⚠️ Payment cancelled')
          setLoading(false)
        },
        onError: (err) => {
          alert(`🔴 Payment error: ${err.message}`)
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
