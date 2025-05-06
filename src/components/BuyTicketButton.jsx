'use client'

import { useState } from 'react'

export default function BuyTicketButton({ entryFee, competitionSlug }) {
  const [loading, setLoading] = useState(false)

  const handleBuy = async () => {
    alert('🛒 createPayment called')
    setLoading(true)

    if (!window?.Pi?.createPayment) {
      alert('Pi SDK not found. Use Pi Browser.')
      setLoading(false)
      return
    }

    window.Pi.createPayment(
      {
        amount: entryFee.toString(),
        memo: `Ticket for ${competitionSlug}`,
        metadata: { competitionSlug },
      },
      {
        onReadyForServerApproval: async (paymentId, paymentData, signature) => {
          console.log('📩 Approving payment:', paymentId)
          alert('📩 Approving payment: ' + paymentId) // 👈 shows the ID

          try {
            const res = await fetch('/api/pi/approve', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                paymentId,
                paymentData,
                signature,
                uid: localStorage.getItem('pi_user_uid'),
              }),
            })
            if (!res.ok) throw new Error('Approval failed')
          } catch (err) {
            console.error('❌ Approval error:', err)
            alert('Approval failed: ' + err.message)
            setLoading(false)
          }
        },

        onReadyForServerCompletion: async (paymentId, txid) => {
          try {
            console.log('✅ Completing payment:', paymentId, txid)
            const res = await fetch('/api/pi/complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                paymentId,
                txid,
                uid: localStorage.getItem('pi_user_uid'),
              }),
            })
            if (!res.ok) throw new Error('Completion failed')
            alert('🎉 Ticket purchased!')
          } catch (err) {
            console.error('❌ Completion error:', err)
            alert('Completion failed: ' + err.message)
          } finally {
            setLoading(false)
          }
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
