'use client'
import { useState } from 'react'

export default function BuyTicketButton({ entryFee, competitionSlug }) {
  const [loading, setLoading] = useState(false)

  const handleBuy = () => {
    console.log('🛒 createPayment start', { entryFee, competitionSlug })
    setLoading(true)

    window.Pi.createPayment(
      { amount: entryFee, memo: competitionSlug },
      {
        onReadyForServerCompletion: async (paymentId, txid) => {
          console.log('✅ onReadyForServerCompletion', { paymentId, txid })
          // … your existing completion logic …
          setLoading(false)
        },
        onUserCancelled: () => {
          console.warn('⚠️ onUserCancelled')
          setLoading(false)
        },
        onError: (err) => {
          console.error('🛑 onError callback fired', err)
          alert(`Payment error: ${err.message || err}`)
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
      {loading ? 'Processing…' : `Buy Ticket (${entryFee} π)`}
    </button>
  )
}
