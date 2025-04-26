// pages/competitions/everyday-pioneer.js
'use client'

import { useState, useEffect } from 'react'
import Header from '../../src/components/Header'
import Footer from '../../src/components/footer'

export default function EverydayPioneer() {
  const [tickets, setTickets] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  // === MOCK Pi SDK for non-Pi browsers ===
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.Pi) {
      window.Pi = {
        createPayment: async ({ amount, memo, metadata }) => {
          console.log('🛠️ Mock createPayment', { amount, memo, metadata })
          return {
            onReadyForServerApproval: cb => {
              console.log('🛠️ Mock onReadyForServerApproval')
              setTimeout(() => cb({ paymentID: 'mock-123' }), 500)
            },
            onReadyForServerCompletion: cb => {
              console.log('🛠️ Mock onReadyForServerCompletion')
              setTimeout(() => cb({
                paymentID: 'mock-123',
                transaction: { txid: 'tx-mock-456' }
              }), 1500)
            },
            serverApproved: () => console.log('🛠️ Mock serverApproved'),
            serverCompleted: () => console.log('🛠️ Mock serverCompleted'),
            open: () => console.log('🛠️ Mock payment.open()'),
          }
        }
      }
      console.log('🛠️ Pi SDK mocked')
    }
  }, [])

  const entryFeePerTicket = 0.314
  const totalCost         = (tickets * entryFeePerTicket).toFixed(3)

  const handlePurchase = async () => {
    setError(null)
    setLoading(true)

    if (!window.Pi || typeof window.Pi.createPayment !== 'function') {
      alert('Please open this page in the Pi Browser to pay with Pi.')
      setLoading(false)
      return
    }

    try {
      const payment = await window.Pi.createPayment({
        amount: totalCost,
        memo: `Everyday Pioneer: ${tickets} ticket${tickets > 1 ? 's' : ''}`,
        metadata: { competition: 'everyday-pioneer', tickets },
      })

      payment.onReadyForServerApproval(async ({ paymentID }) => {
        console.log('Server approval for', paymentID)
        await fetch('/api/pi/approve-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentID }),
        })
        payment.serverApproved()
      })

      payment.onReadyForServerCompletion(async ({ paymentID, transaction }) => {
        console.log('Server completion for', paymentID, transaction)
        await fetch('/api/pi/complete-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentID, txid: transaction.txid }),
        })
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
        <h1 className="text-2xl font-bold mb-4">Everyday Pioneer</h1>
        <p className="mb-2"><strong>Prize:</strong> 1,000 PI Giveaways</p>
        <p className="mb-4"><strong>Entry fee:</strong> {entryFeePerTicket} PI per ticket</p>

        <label className="block mb-4">
          Tickets:
          <input
            type="number"
            min="1"
            value={tickets}
            onChange={e => setTickets(Math.max(1, Number(e.target.value)))}
            className="ml-2 w-16 border rounded px-2 py-1"
          />
        </label>

        <p className="mb-4"><strong>Total cost:</strong> {totalCost} PI</p>
        {error && <p className="text-red-500 mb-4">{error}</p>}

        <button
          type="button"
          onClick={handlePurchase}
          disabled={loading}
          className="px-4 py-2 bg-pi-purple text-white rounded"
        >
          {loading ? 'Processing…' : `Pay with Pi (${totalCost} PI)`}
        </button>
      </main>

      <Footer />
    </>
  )
}
