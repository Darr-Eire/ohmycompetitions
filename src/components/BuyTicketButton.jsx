'use client'
import { useState } from 'react'

export default function BuyTicketButton({ entryFee, competitionSlug }) {
  const [loading, setLoading] = useState(false)

  const handleBuy = () => {
    alert('🛒 createPayment called')
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
          alert('Calling /api/pi/approve with ID: ' + paymentId)
          console.log('Calling /api/pi/approve with ID:', paymentId)

          try {
            const res = await fetch('/api/pi/approve', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId }),
            })

            if (!res.ok) {
              const errorData = await res.json()
              console.error('❌ Approval failed:', errorData)
              throw new Error('Approval failed: ' + (errorData?.error || 'Unknown error'))
            }

            console.log('✅ Payment approved on server')
          } catch (err) {
            console.error('❌ Approval error:', err)
            alert('Approval failed: ' + err.message)
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

            if (!res.ok) {
              const errorData = await res.json()
              console.error('❌ Completion failed:', errorData)
              throw new Error('Completion failed: ' + (errorData?.error || 'Unknown error'))
            }

            alert('🎉 Ticket purchased successfully!')
          } catch (err) {
            console.error('❌ Completion error:', err)
            alert('Completion failed: ' + err.message)
          } finally {
            setLoading(false)
          }
        },

        onCancel: () => {
          console.warn('⚠️ User cancelled payment')
          alert('Payment cancelled')
          setLoading(false)
        },

        onError: (error) => {
          console.error('🛑 Pi payment error:', error)
          alert('Payment error: ' + error.message)
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

