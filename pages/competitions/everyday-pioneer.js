'use client'

import { useState, useEffect } from 'react'

export default function EverydayPioneer() {
  const [tickets, setTickets] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [sdkReady, setSdkReady] = useState(false)

  // Detect Pi Browser
  const isPiBrowser =
    typeof navigator !== 'undefined' && /Pi Browser/i.test(navigator.userAgent)

  useEffect(() => {
    if (isPiBrowser && !window.Pi) {
      const script = document.createElement('script')
      script.src = 'https://sdk.minepi.com/pi-sdk.js'
      script.onload = () => {
        window.Pi.init({ version: '2.0' })
        setSdkReady(true)
      }
      document.head.appendChild(script)
    } else {
      setSdkReady(true)
    }
  }, [isPiBrowser])

  const entryFeePerTicket = 0.314
  const totalCost = (tickets * entryFeePerTicket).toFixed(3)

  const handlePurchase = async () => {
    if (!sdkReady) return
    setError(null)
    setLoading(true)

    if (!window.Pi || typeof window.Pi.createPayment !== 'function') {
      alert('Please open in Pi Browser')
      setLoading(false)
      return
    }

    try {
      await window.Pi.createPayment({
        amount: totalCost,
        memo: `Everyday Pioneer: ${tickets} ticket${tickets > 1 ? 's' : ''}`,
        metadata: { competition: 'everyday-pioneer', tickets },
        onReadyForServerApproval: async ({ paymentId }) => {
          await fetch('/api/pi/approve-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId }),
          })
          window.Pi.openPayment(paymentId)
        },
        onReadyForServerCompletion: async ({ paymentId, txid }) => {
          await fetch('/api/pi/complete-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId, txid }),
          })
          alert('🎉 Payment successful!')
        },
        onCancel: () => {
          alert('Payment was cancelled.')
        },
        onError: (error) => {
          console.error(error)
          setError(error.message || 'Payment error')
        },
        onIncompletePaymentFound: (payment) => {
          console.warn('Incomplete payment found', payment)
        },
      })
    } catch (e) {
      console.error(e)
      setError(e.message || 'Payment failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page">
      <div className="competition-card">
        <div className="competition-top-banner">Everyday Pioneer</div>

        <div className="competition-image-placeholder">
          Add Image Here
        </div>

        <div className="competition-info">
          <p><strong>Draw ends in:</strong> 13h 58m</p>
          <p>📊 <strong>Total Tickets:</strong> 1000</p>
          <p>✅ <strong>Sold:</strong> 300</p>
          <p>🎟️ <strong>Available:</strong> 700</p>
          <p>🏅 <strong>Entry Fee:</strong> 0.314 π</p>
        </div>

        {error && (
          <p className="text-red-500 mb-4">{error}</p>
        )}

        <button
          onClick={handlePurchase}
          disabled={loading || !sdkReady}
          className="comp-button"
        >
          {loading ? 'Processing…' : `Pay with Pi (${totalCost} π)`}
        </button>
      </div>
    </main>
  )
}
