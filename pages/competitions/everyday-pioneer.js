// pages/competitions/everyday-pioneer.js
'use client'

import { useState } from 'react'
import Header from '../../src/components/Header'
import Footer from '../../src/components/footer'

export default function EverydayPioneer() {
  const [tickets, setTickets] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const entryFeePerTicket = 0.314  // PI per ticket
  const totalCost         = (tickets * entryFeePerTicket).toFixed(3)

  const handlePurchase = async () => {
    setError(null)
    setLoading(true)

    if (typeof window.Pi?.transact !== 'function') {
      setError('Pi Wallet SDK not available. Please open in Pi Browser.')
      setLoading(false)
      return
    }

    try {
      // 1) Trigger Pi Wallet payment
      const tx = await window.Pi.transact({
        amount: totalCost,
        memo: `Entry to Everyday Pioneer (${tickets} ticket${tickets > 1 ? 's' : ''})`,
        metadata: { competition: 'everyday-pioneer', tickets },
      })

      // 2) Send transaction to backend for verification & recording
      const res = await fetch(
        `/api/competitions/everyday-pioneer/entry`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transaction: tx, tickets }),
        }
      )
      if (!res.ok) throw new Error(`Server error (${res.status})`)

      alert('🎉 Purchase successful! Good luck!')
    } catch (e) {
      console.error(e)
      setError(e.message || 'Transaction failed')
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

        <label className="block mb-2">
          Number of tickets:
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
