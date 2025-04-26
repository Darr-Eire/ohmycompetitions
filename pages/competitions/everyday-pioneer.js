// pages/competitions/everyday-pioneer.js
'use client'

import { useState } from 'react'

export default function EverydayPioneer() {
  const [tickets, setTickets]   = useState(1)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const entryFeePerTicket       = 0.314
  const totalCost               = (tickets * entryFeePerTicket).toFixed(3)

  const handlePurchase = async () => {
    // ... your existing transact logic ...
  }

  return (
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

      <p className="mb-4">
        <strong>Total cost:</strong> {totalCost} PI
      </p>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <button
        onClick={handlePurchase}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        {loading ? 'Processing…' : `Pay ${totalCost} PI`}
      </button>
    </main>
  )
}
