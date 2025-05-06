'use client'
import { useState } from 'react'

export default function BuyTicketButton({ entryFee, competitionSlug }) {
  const [loading, setLoading] = useState(false)

  const handleBuy = async () => {
    alert('🛒 createPayment called')
    setLoading(true)

    if (!window?.Pi?.createPayment) {
      alert('Pi SDK not found. Open in Pi Browser')
      setLoading(false)
      return
    }

    window.Pi.createPayment(
      {
        amount: entryFee,
        memo: `Ticket for ${competitionSlug}`,
        metadata: { competitionSlug },
      },
      {
        onReadyForServerApproval: async (paymentId) => {
          console.log('📩 Approving payment:', paymentId)
          const res = await fetch('/api/pi/approve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId }),
          })
          if (!res.ok) throw new Error('Approval failed')
        },
        onReadyForServerCompletion: async (paymentId, txid) => {
          console.log('✅ Completing payment:', paymentId, txid)
          const res = await fetch('/api/pi/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId, txid }),
          })
          if (!res.ok) throw new Error('Completion failed')
          alert('🎉 Ticket purchased!')
        },
        onCancel: () => {
          alert('Payment cancelled.')
          setLoading(false)
        },
        onError: (err) => {
          console.error('Pi SDK error:', err)
          alert('Payment error: ' + err.message)
          setLoading(false)
        },
      }
    )
  }

  return (
    <button
      onClick={handleBuy}
      disabled={loading}
      className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
    >
      {loading ? 'Processing…' : `Buy Ticket (${entryFee} π)`}
    </button>
  )
}
