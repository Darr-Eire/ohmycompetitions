'use client'

import React from 'react'

export default function BuyTicketButton({ competitionSlug, entryFee }) {
  async function handleBuy() {
    if (!window.Pi || !window.Pi.createPayment) {
      alert('Pi Network SDK not available. Use Pi Browser.')
      return
    }

    try {
      const payment = await window.Pi.createPayment({
        amount: entryFee.toString(),
        memo: `${competitionSlug} entry`,
        metadata: { competitionSlug },

        onReadyForServerApproval: async (paymentId, paymentData, signature) => {
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
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Approval failed')
            console.log('✅ Approved by server:', data)
          } catch (err) {
            console.error('❌ Server approval error:', err)
            alert('Payment approval failed. Try again.')
          }
        },

        onReadyForServerCompletion: async (paymentId, txid) => {
          try {
            const res = await fetch('/api/pi/complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                paymentId,
                txid,
                uid: localStorage.getItem('pi_user_uid'),
              }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Completion failed')
            console.log('✅ Payment completed:', data)
            alert('🎉 Entry confirmed! Good luck!')
          } catch (err) {
            console.error('❌ Completion error:', err)
            alert('Payment completion failed. Contact support.')
          }
        },

        onCancel: () => {
          console.warn('User canceled payment.')
        },

        onError: (err) => {
          console.error('Pi payment error:', err)
          alert('Something went wrong. Try again.')
        },
      })

      console.log('Payment object:', payment)
    } catch (err) {
      console.error('createPayment error:', err)
      alert('Could not initiate payment. Are you in the Pi Browser?')
    }
  }

  return (
    <button
      onClick={handleBuy}
      className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
    >
      Pay with Pi to Enter
    </button>
  )
}

