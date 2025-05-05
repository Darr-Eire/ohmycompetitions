// pages/ticket-purchase/[slug].js
'use client'

import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import CompetitionCard from '@/components/CompetitionCard'

export default function TicketPurchasePage() {
  const router = useRouter()
  const { slug } = router.query

  const [competition, setCompetition] = useState(null)
  const [quantity, setQuantity]       = useState(1)
  const [total, setTotal]             = useState(0)

  // Mock data lookup; replace with real fetch if needed
  const COMPETITIONS = {
    'ps5-bundle-giveaway': {
      title: 'PS5 Bundle Giveaway',
      prize: 'PlayStation 5 + Extra Controller',
      entryFee: 0.8,
      imageUrl: '/images/playstation.jpeg',
    },
    // …other competitions…
  }

  // Load competition data
  useEffect(() => {
    if (!slug || !COMPETITIONS[slug]) return
    const data = { slug, ...COMPETITIONS[slug] }
    setCompetition(data)
    setTotal(data.entryFee)
  }, [slug])

  // Recompute total on quantity change
  useEffect(() => {
    if (!competition) return
    let cost = quantity * competition.entryFee
    if (quantity === 10) cost = competition.entryFee * 8 // existing deal
    setTotal(cost)
  }, [quantity, competition])

  // Loading state
  if (!competition) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 to-blue-400">
        <p className="text-white text-lg">Loading competition…</p>
      </main>
    )
  }

  return (
    <main
      className="flex items-center justify-center py-12 px-4 min-h-screen"
      style={{ backgroundImage: 'linear-gradient(to bottom right, #1E3A8A, #60A5FA)' }}
    >
      <div className="competition-card max-w-lg w-full bg-white">
        {/* Competition Summary */}
        <CompetitionCard
          comp={competition}
          title={competition.title}
          prize={competition.prize}
          fee={`${competition.entryFee} π`}
          imageUrl={competition.imageUrl}
          hideButton
        />

        {/* Purchase Form */}
        <div className="p-6 space-y-6">
          <h2 className="text-2xl font-bold text-blue-800 text-center">
            🎟️ Purchase Tickets
          </h2>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><strong>Competition:</strong></div>
            <div>{competition.title}</div>
            <div><strong>Ticket Price:</strong></div>
            <div>{competition.entryFee} π</div>
          </div>

          {/* Quantity Selector up to 100 */}
          <label className="block">
            <strong>Select Quantity</strong>
            <select
              value={quantity}
              onChange={e => setQuantity(+e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {[...Array(100)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </label>

          {/* Total & Deal */}
          <p className="text-center text-xl font-semibold text-black">
            Total: {total.toFixed(3)} π
          </p>
          {quantity === 10 && (
            <p className="text-center text-sm text-black">
              🎁 Special Deal: 10 for the price of 8!
            </p>
          )}

          {/* Confirm Button */}
          <button className="w-full btn-neon-primary block mt-4">
            Confirm Purchase
          </button>
        </div>
      </div>
    </main>
  )
}
