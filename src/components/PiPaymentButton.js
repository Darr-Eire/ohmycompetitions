'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'

export default function PiPaymentButton({ amount, memo, metadata }) {
const { user } = usePiAuth();
  const [busy, setBusy] = useState(false)

  const uid = session?.user?.uid

  const start = () => {
    if (!uid) {
      alert('You must log in first.')
      return
    }

    setBusy(true)

    window.Pi.createPayment(
      { amount, memo, metadata },
      {
        onReadyForServerApproval: async paymentId => {
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
            body: JSON.stringify({ paymentId, txid, uid }),
          })
          setBusy(false)
          alert('🎉 Payment complete!')
        },
        onCancel: () => setBusy(false),
        onError: err => {
          alert('❌ Payment failed: ' + err.message)
          setBusy(false)
        },
      }
    )
  }

  return (
    <button onClick={start} disabled={busy} className="mt-2 comp-button w-full">
      {busy ? 'Processing…' : `Pay ${amount} π`}
    </button>
  )
}
