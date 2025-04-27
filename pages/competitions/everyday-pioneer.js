'use client'

import { useState, useEffect } from 'react'

export default function EverydayPioneer() {
  const [tickets, setTickets] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [sdkReady, setSdkReady] = useState(false)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [timeLeft, setTimeLeft] = useState('')

  const isPiBrowser = typeof navigator !== 'undefined' && /Pi Browser/i.test(navigator.userAgent)

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

  const updateCountdown = () => {
    const now = new Date()
    const nextDraw = new Date(now)
    nextDraw.setUTCHours(15, 14, 0, 0) // 3:14 PM UTC
    if (now > nextDraw) {
      nextDraw.setUTCDate(nextDraw.getUTCDate() + 1)
    }
    const diffMs = nextDraw - now
    const hours = Math.floor(diffMs / 1000 / 60 / 60)
    const minutes = Math.floor((diffMs / 1000 / 60) % 60)
    setTimeLeft(`${hours}h ${minutes}m`)
  }

  useEffect(() => {
    updateCountdown()
    const interval = setInterval(updateCountdown, 60000)
    return () => clearInterval(interval)
  }, [])

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
    <main className="page p-6 flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white border-2 border-blue-500 rounded-lg shadow-lg p-6 max-w-md w-full text-center">
        
        {/* Image placeholder */}
        <div className="w-full h-40 bg-gray-200 rounded mb-4 flex items-center justify-center">
          <span className="text-gray-500">Add Image Here</span>
        </div>

        {/* Competition Info */}
        <h1 className="text-2xl font-bold text-blue-600 mb-2">Everyday Pioneer</h1>
        <p className="text-lg mb-1"><strong>Prize:</strong> 1,000 PI Giveaway</p>
        <p className="text-md mb-1"><strong>Entry Fee:</strong> {entryFeePerTicket} PI per ticket</p>
        <p className="text-md mb-4 text-gray-700"><strong>Draw ends in:</strong> {timeLeft}</p>

        {/* Show "Enter Now" or the Payment Form */}
        {!showPaymentForm ? (
          <button
            type="button"
            onClick={() => setShowPaymentForm(true)}
            className="px-6 py-3 bg-blue-500 text-white font-semibold rounded hover:bg-blue-700 transition"
          >
            Enter Now
          </button>
        ) : (
          <>
            <label className="block mb-4 mt-4">
              <span className="text-sm font-semibold">Tickets:</span>
              <input
                type="number"
                min="1"
                value={tickets}
                onChange={(e) => setTickets(Math.max(1, Number(e.target.value)))}
                className="ml-2 w-20 border rounded px-2 py-1 text-center"
              />
            </label>

            <p className="text-md mb-4">
              <strong>Total:</strong> {totalCost} PI
            </p>

            {error && <p className="text-red-500 mb-4">{error}</p>}

            <button
              type="button"
              onClick={handlePurchase}
              disabled={loading || !sdkReady}
              className="px-6 py-3 bg-pi-purple text-white font-semibold rounded hover:bg-purple-700 transition mb-4"
            >
              {loading ? 'Processing…' : `Pay with Pi (${totalCost} PI)`}
            </button>

            {/* Back Button */}
            <button
              type="button"
              onClick={() => setShowPaymentForm(false)}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
            >
              Back
            </button>
          </>
        )}
      </div>
    </main>
  )
}

