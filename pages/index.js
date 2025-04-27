// pages/index.js
'use client'

import { useState, useEffect } from 'react'
import CompetitionCard from '@/components/CompetitionCard'

export default function Home() {
  const [sdkReady, setSdkReady] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [tickets, setTickets] = useState(1)

  // load Pi SDK
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://sdk.minepi.com/pi-sdk.js'
    script.onload = () => {
      window.Pi?.init({ version: '2.0' })
      setSdkReady(true)
    }
    document.head.appendChild(script)
  }, [])

  const entryFeePerTicket = 0.314
  const totalCost = (tickets * entryFeePerTicket).toFixed(3)

  const handleEnter = async () => {
    if (!sdkReady) return
    setError(null)
    setLoading(true)
    try {
      await window.Pi.createPayment({
        amount: totalCost,
        memo: `Everyday Pioneer: ${tickets} ticket${tickets > 1 ? 's' : ''}`,
        metadata: { competition: 'everyday-pioneer', tickets },
        onReadyForServerApproval: ({ paymentId }) => window.Pi.openPayment(paymentId),
        onReadyForServerCompletion: () => alert('🎉 Paid!'),
        onCancel: () => alert('Cancelled'),
        onError: e => setError(e.message),
      })
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }
  

  return (
    <main className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <CompetitionCard
          title="Everyday Pioneer"
          imagePlaceholder="Add Image Here"
          stats={[
            { emoji: '📊', label: 'Total Tickets', value: 1000 },
            { emoji: '✅', label: 'Sold', value: 300 },
            { emoji: '🎟️', label: 'Available', value: 700 },
            { emoji: '⏳', label: 'Draw ends in', value: '13h 58m' },
          ]}
          entryFee={entryFeePerTicket}
          actionLabel={`Pay with Pi (${totalCost} π)`}
          onAction={handleEnter}
          loading={loading}
          disabled={!sdkReady}
        />
        {error && <p className="text-red-600 text-center mt-4">{error}</p>}
      </div>
    </main>
  )
}
