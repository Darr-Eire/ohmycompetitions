'use client'
import { useState } from 'react'

export default function BuyTicketButton({ entryFee, competitionSlug }) {
  const [loading, setLoading] = useState(false)

  const handleBuy = () => {
    alert('🛒 createPayment called') // Debug alert
    setLoading(true)

    if (!window?.Pi?.createPayment) {
      alert('Pi SDK not found. Are you in the Pi Browser?')
      setLoading(false)
      return
    }

    window.Pi.createPayment(
      {
        amount: entryFee,
        memo: competitionSlug,
        metadata: { slug: competitionSlug },
      },
      {
        onReadyForServerApproval: async (paymentId) => {
          try {
            const res = await fetch('/api/pi/approve', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId }),
            })
            if (!res.ok) throw new Error(await res.text())
            console.log('✅ Payment approved on server')
          } catch (err) {
            console.error('❌ Approval failed', err)
            alert('Approval failed')
            setLoading(false)
          }
        },

        onReadyForServerCompletion: async (paymentId, txid) => {
          try {
            const res = await fetch('/api/pi/complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId, txid }),
            })
            if (!res.ok) throw new Error(await res.text())
            alert('🎉 Ticket purchased!')
          } catch (err) {
            console.error('❌ Completion failed', err)
            alert('Completion failed')
          } finally {
            setLoading(false)
          }
        },

        onCancel: () => {
          console.warn('⚠️ User cancelled payment')
          setLoading(false)
        },

        onError: (error) => {
          console.error('🛑 Pi payment error', error)
          alert('Payment error')
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
