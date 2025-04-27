// pages/competitions/everyday-pioneer.js
'use client'

import { useState, useEffect } from 'react'

export default function EverydayPioneer() {
  const [tickets, setTickets]   = useState(1)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [sdkReady, setSdkReady] = useState(false)

  // Detect Pi Browser
  const isPiBrowser =
    typeof navigator !== 'undefined' && /Pi Browser/i.test(navigator.userAgent)

  // Load Pi SDK dynamically
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
      setSdkReady(true) // Allow testing outside Pi Browser
    }
  }, [isPiBrowser])

  const entryFeePerTicket = 0.314
  const totalCost         = (tickets * entryFeePerTicket).toFixed(3)

  const handlePurchase = async () => {
    if (!sdkReady) return
    setError(null)
    setLoading(true)

    if (!window.Pi || typeof window.Pi.createPayment !== 'function') {
      alert('Please open this page in the Pi Browser to pay with Pi.')
      setLoading(false)
      return
    }

    try {
      await window.Pi.createPayment({
        amount: totalCost,
        memo: `Everyday Pioneer: ${tickets} ticket${tickets > 1 ? 's' : ''}`,
        metadata: { competition: 'everyday-pioneer', tickets },

        // Attach all required callbacks here directly
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
          alert('🎉 Payment completed successfully!')
        },

        onIncompletePaymentFound: (payment) => {
          console.warn('Incomplete payment found', payment)
          // Optional: Try recovering
        },

        onCancel: () => {
          alert('Payment was cancelled')
        },

        onError: (error) => {
          console.error('Payment error', error)
          setError(error.message || 'Payment error')
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
    <main className="page p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Everyday Pioneer</h1>
      <p className="mb-2">
        <strong>Prize:</strong> 1,000 PI Giveaway
      </p>
      <p className="mb-4">
        <strong>Entry fee:</strong> {entryFeePerTicket} PI per ticket
      </p>

      <label className="block mb-4">
        Tickets:
        <input
          type="number"
          min="1"
          value={tickets}
          onChange={(e) => setTickets(Math.max(1, Number(e.target.value)))}
          className="ml-2 w-16 border rounded px-2 py-1"
        />
      </label>

      <p className="mb-4">
        <strong>Total cost:</strong> {totalCost} PI
      </p>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <button
        type="button"
        onClick={handlePurchase}
        disabled={loading || !sdkReady}
        className="px-4 py-2 bg-pi-purple text-white rounded"
      >
        {loading ? 'Processing…' : `Pay with Pi (${totalCost} PI)`}
      </button>
    </main>
  )
}
