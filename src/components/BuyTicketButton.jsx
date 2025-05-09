'use client'

import { useSession } from 'next-auth/react'
import { useState } from 'react'

export default function BuyTicketButton({ competitionSlug, entryFee, quantity }) {
  const { data: session } = useSession()
  const [busy, setBusy] = useState(false)

  const total = (entryFee * quantity).toFixed(3)
  const uid = session?.user?.uid

  const startPayment = () => {
    if (!uid) {
      alert('You must log in first.')
      return
    }

    setBusy(true)

    const metadata = {
      type: 'ticket',
      slug: competitionSlug,
      quantity,
    }

    window.Pi.createPayment(
      {
        amount: total,
        memo: `Entry for ${competitionSlug}`,
        metadata,
      },
      {
        onReadyForServerApproval: async (paymentId) => {
          await fetch('/api/pi/approve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId }),
          })
        },
        onReadyForServerCompletion: async (paymentId, txid) => {
          await fetch('/api/payments/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId, txid, uid, competitionSlug }),
          })
          setBusy(false)
          alert('🎉 Payment complete!')
        },
        onCancel: () => {
          setBusy(false)
        },
        onError: (err) => {
          alert('❌ Payment failed: ' + err.message)
          setBusy(false)
        },
      }
    )
  }

  return (
    <button
      onClick={startPayment}
      disabled={busy}
      className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold py-3 px-4 rounded-xl shadow-lg"
    >
      {busy ? 'Processing…' : `Confirm & Pay ${total} π`}
    </button>
  )
}
