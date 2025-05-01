'use client'

import { useState } from 'react'
import { usePiAuth } from '@/lib/usePiAuth'

export default function PiPaymentButton({ amount, memo, metadata }) {
  const { user, loading: authLoading, signIn } = usePiAuth()
  const [busy, setBusy] = useState(false)

  const start = () => {
    if (!user) return signIn()
    setBusy(true)
    window.Pi.createPayment(
      { amount, memo, metadata },
      {
        onReadyForServerApproval: async paymentId => {
          await fetch('/api/payments/approve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId }),
          })
        },
        onReadyForServerCompletion: async (paymentId, txid) => {
          await fetch('/api/payments/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId, txid }),
          })
          setBusy(false)
          alert('🎉 Payment complete!')
        },
        onCancel: () => setBusy(false),
        onError: err => { alert('Payment failed: ' + err.message); setBusy(false) },
      }
    )
  }

  return (
    <button onClick={start} disabled={authLoading || busy} className="mt-2 comp-button w-full">
      { !user
        ? authLoading ? 'Connecting Pi…' : 'Sign in with Pi'
        : busy ? 'Processing…' : `Pay ${amount} π`
      }
    </button>
  )
}
