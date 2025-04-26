// pages/competitions/everyday-pioneer.js
'use client'

import { useState, useEffect } from 'react'
import Header from '../../src/components/Header'
import Footer from '../../src/components/footer'

export default function EverydayPioneer() {
  const [tickets, setTickets] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const [sdkReady, setSdkReady] = useState(false)

  // 1) Detect Pi Browser via the user agent
  const isPiBrowser = typeof navigator !== 'undefined' && /Pi Browser/i.test(navigator.userAgent)

  // 2) Dynamically load the SDK only in Pi Browser
  useEffect(() => {
    if (isPiBrowser && !window.Pi) {
      const script = document.createElement('script')
      script.src = 'https://sdk.minepi.com/pi-sdk.js'
      script.onload = () => {
        window.Pi.init({ version: '2.0' })
        setSdkReady(true)
      }
      document.head.appendChild(script)
    } else if (!isPiBrowser) {
      setSdkReady(true) // allow mocks for non-Pi
    }
  }, [isPiBrowser])

  // 3) Mock SDK in non-Pi
  useEffect(() => {
    if (sdkReady && !isPiBrowser && !window.Pi) {
      window.Pi = { /* ... your mock createPayment from earlier ... */ }
    }
  }, [sdkReady, isPiBrowser])

  const entryFeePerTicket = 0.314
  const totalCost         = (tickets * entryFeePerTicket).toFixed(3)

  const handlePurchase = async () => {
    if (!sdkReady) return
    setError(null)
    setLoading(true)

    if (!window.Pi || typeof window.Pi.createPayment !== 'function') {
      alert('Please open in Pi Browser to pay with Pi.')
      setLoading(false)
      return
    }

    try {
      const payment = await window.Pi.createPayment({ amount: totalCost, memo:`Everyday Pioneer: ${tickets}`, metadata:{tickets} })

      payment.onReadyForServerApproval(async ({ paymentID }) => {
        await fetch('/api/pi/approve-payment', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({paymentID}) })
        payment.serverApproved()
      })

      payment.onReadyForServerCompletion(async ({ paymentID, transaction }) => {
        await fetch('/api/pi/complete-payment', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({paymentID, txid:transaction.txid}) })
        payment.serverCompleted()
        alert('🎉 Purchase successful!')
      })

      payment.open()
    } catch (e) {
      console.error(e)
      setError(e.message || 'Payment failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Header />
      <main className="page p-6 max-w-lg mx-auto">
        {/* ... UI ... */}
        <button
          type="button"
          onClick={handlePurchase}
          disabled={loading || !sdkReady}
          className="px-4 py-2 bg-pi-purple text-white rounded"
        >
          {loading ? 'Processing…' : `Pay with Pi (${totalCost} PI)`}
        </button>
      </main>
      <Footer />
    </>
  )
}
