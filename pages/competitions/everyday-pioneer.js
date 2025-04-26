// pages/competitions/everyday-pioneer.js
'use client'

import { useState } from 'react'
import Header from '../../src/components/Header'
import Footer from '../../src/components/footer'

export default function EverydayPioneer() {
  const [tickets, setTickets] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const entryFeePerTicket = 0.314
  const totalCost         = (tickets * entryFeePerTicket).toFixed(3)

  const handlePurchase = async () => {
    setError(null)
    setLoading(true)

    if (!window.Pi || typeof window.Pi.createPayment !== 'function') {
      setError('Please open in Pi Browser.')
      setLoading(false)
      return
    }

    try {
      // Phase I: createPayment
      const payment = await window.Pi.createPayment({
        amount: totalCost,
        memo: `Everyday Pioneer: ${tickets} ticket${tickets>1?'s':''}`,
        metadata: { competition: 'everyday-pioneer', tickets }
      })

      // Immediately called when SDK is ready for your server to approve
      payment.onReadyForServerApproval(async ({ paymentID }) => {
        // 1) send paymentID to your server to approve
        await fetch('/api/pi/approve-payment', {
          method: 'POST',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ paymentID })
        })
        // tell SDK to continue
        payment.serverApproved()
      })

      // Phase II: user signs and submits the blockchain tx (handled in Pi Wallet)

      // Phase III: after blockchain tx, SDK calls:
      payment.onReadyForServerCompletion(async ({ paymentID, transaction }) => {
        // 2) send to your server to complete
        await fetch('/api/pi/complete-payment', {
          method: 'POST',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ paymentID, txid: transaction.txid })
        })
        payment.serverCompleted()
        alert('🎉 Purchase successful!')
      })

      // finally, tell SDK to open the payment UI
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
        {/* ... your form ... */}
        <button
          disabled={loading}
          onClick={handlePurchase}
          className="px-4 py-2 bg-pi-purple text-white rounded"
        >
          {loading ? 'Processing…' : `Pay with Pi (${totalCost} PI)`}
        </button>
      </main>
      <Footer />
    </>
  )
}
