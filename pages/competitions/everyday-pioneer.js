// pages/competitions/everyday-pioneer.js
'use client'

import { useState, useEffect } from 'react'

export default function EverydayPioneer() {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const [sdkReady, setSdkReady] = useState(false)

  // Load & init Pi SDK on mount
  useEffect(() => {
    if (typeof window === 'undefined') return

    if (window.Pi?.createPayment) {
      setSdkReady(true)
    } else {
      const script = document.createElement('script')
      script.src = 'https://sdk.minepi.com/pi-sdk.js'
      script.async = true
      script.onload = () => {
        window.Pi.init({ version: '2.0' })
        setSdkReady(true)
      }
      document.head.appendChild(script)
    }
  }, [])

  const handlePayment = async () => {
    if (!sdkReady) {
      alert('Please open in Pi Browser')
      return
    }

    setLoading(true)
    setError(null)

    try {
      window.Pi.createPayment(
        {
          amount: 0.314,
          memo:   'Everyday Pioneer — 1 ticket',
          metadata: { competition: 'everyday-pioneer', tickets: 1 },
        },
        {
          onReadyForServerApproval: (paymentId) => {
            fetch('/api/pi/approve-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId }),
            })
            window.Pi.openPayment(paymentId)
          },
          onReadyForServerCompletion: ({ paymentId, txid }) => {
            fetch('/api/pi/complete-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId, txid }),
            })
            alert('🎉 Payment successful!')
          },
          onCancel: () => alert('Payment cancelled'),
          onError: (err) => {
            console.error(err)
            setError(err.message || 'Payment error')
          },
        }
      )
    } catch (e) {
      console.error(e)
      setError(e instanceof Error ? e.message : 'Unexpected error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page">
      <div className="competition-card">
        <div className="competition-top-banner">Everyday Pioneer</div>
        <div className="competition-image-placeholder">[Image]</div>
        <div className="competition-info">
          <p><strong>Draw ends in:</strong> 13h 58m</p>
          <p>📊 <strong>Total Tickets:</strong> 1000</p>
          <p>✅ <strong>Sold:</strong> 300</p>
          <p>🎟️ <strong>Available:</strong> 700</p>
          <p>🏅 <strong>Entry Fee:</strong> 0.314 π</p>
        </div>

        <button
          onClick={handlePayment}
          disabled={loading || !sdkReady}
          className="comp-button"
        >
          {loading
            ? 'Processing…'
            : sdkReady
            ? 'Pay with Pi'
            : 'Loading SDK…'}
        </button>

        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>
    </main>
  )
}
