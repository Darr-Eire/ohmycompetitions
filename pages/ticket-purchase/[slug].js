'use client'

import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import CompetitionCard from '@/components/CompetitionCard'

// Full list of competition data keyed by slug
const COMPETITIONS = {
  'everyday-pioneer': {
    title: 'Everyday Pioneer',
    imageUrl: '/images/everyday.png',
    prize: '🎉 1st 6,000\n2nd 3,000\n3rd 1,000',
    entryFee: 0.314,
    totalTickets: 5000,
    ticketsSold: 3123,
    endsAt: '2025-05-03T15:14:00Z',
  },
  'pi-to-the-moon': {
    title: 'Pi To The Moon',
    imageUrl: '/images/pitothemoon.jpeg',
    prize: '🎉 1st 6,000\n2nd 3,000\n3rd 1,000',
    entryFee: 3.14,
    totalTickets: 3000,
    ticketsSold: 1480,
    endsAt: '2025-05-04T12:00:00Z',
  },
  'hack-the-vault': {
    title: 'Hack The Vault',
    imageUrl: '/images/vault.png',
    prize: '🎉 1st 6,000\n2nd 3,000\n3rd 1,000',
    entryFee: 0.375,
    totalTickets: 2000,
    ticketsSold: 1985,
    endsAt: '2025-05-03T23:59:59Z',
  },
  'pi-day-freebie': {
    title: 'Pi Day Freebie',
    imageUrl: '/images/freebie.png',
    prize: '🎉 Pi Day Badge',
    entryFee: 0,
    totalTickets: 10000,
    ticketsSold: 9860,
    endsAt: '2025-05-06T20:00:00Z',
  },
  'everyones-a-winner': {
    title: "Everyone's A Winner",
    imageUrl: '/images/everyone.png',
    prize: '🎉 1st 9,999\n2nd 5,555\n3rd 1,111',
    entryFee: 0,
    totalTickets: 99999,
    ticketsSold: 75000,
    endsAt: '2025-05-10T18:00:00Z',
  },
  'weekly-pi-giveaway': {
    title: 'Weekly Pi Giveaway',
    imageUrl: '/images/weekly.png',
    prize: '1,000 π Giveaway',
    entryFee: 0,
    totalTickets: 20000,
    ticketsSold: 19234,
    endsAt: '2025-05-05T23:59:59Z',
  },
  'ps5-bundle-giveaway': {
    title: 'PS5 Bundle Giveaway',
    imageUrl: '/images/ps5.jpeg',
    prize: 'PlayStation 5 + Extra Controller',
    entryFee: 0.5,
    totalTickets: 4000,
    ticketsSold: 2220,
    endsAt: '2025-05-07T14:00:00Z',
  },
  '55-inch-tv-giveaway': {
    title: '55" TV Giveaway',
    imageUrl: '/images/Tv.jpeg',
    prize: '55" Smart TV',
    entryFee: 0.75,
    totalTickets: 3500,
    ticketsSold: 2890,
    endsAt: '2025-05-08T11:30:00Z',
  },
  'xbox-one-bundle': {
    title: 'Xbox One Bundle',
    imageUrl: '/images/xbox.jpeg',
    prize: 'Xbox One + Game Pass',
    entryFee: 0.6,
    totalTickets: 2500,
    ticketsSold: 1875,
    endsAt: '2025-05-09T17:45:00Z',
  },
  'pi-giveaway-100k': {
    title: '100 000 π Giveaway',
    imageUrl: '/images/100,000.png',
    prize: '100 000 π',
    entryFee: 10,
    totalTickets: 100000,
    ticketsSold: 91000,
    endsAt: '2025-05-12T00:00:00Z',
  },
  'pi-giveaway-50k': {
    title: '50 000 π Giveaway',
    imageUrl: '/images/50,000.png',
    prize: '50 000 π',
    entryFee: 5,
    totalTickets: 50000,
    ticketsSold: 47000,
    endsAt: '2025-05-11T00:00:00Z',
  },
  'pi-giveaway-25k': {
    title: '25 000 π Giveaway',
    imageUrl: '/images/25,000.png',
    prize: '25 000 π',
    entryFee: 2.5,
    totalTickets: 25000,
    ticketsSold: 20000,
    endsAt: '2025-05-10T00:00:00Z',
  },
  'tesla-model-3-giveaway': {
    title: 'Tesla Model 3 Giveaway',
    imageUrl: '/images/tesla.jpeg',
    prize: 'Tesla Model 3',
    entryFee: 50,
    totalTickets: 10000,
    ticketsSold: 5120,
    endsAt: '2025-05-20T23:59:00Z',
  },
  'dubai-luxury-holiday': {
    title: 'Dubai Luxury Holiday',
    imageUrl: '/images/dubai-luxury-holiday.jpg',
    prize: '7-Day Dubai Trip',
    entryFee: 25,
    totalTickets: 8000,
    ticketsSold: 7100,
    endsAt: '2025-05-18T22:00:00Z',
  },
  'penthouse-hotel-stay': {
    title: 'Penthouse Hotel Stay',
    imageUrl: '/images/hotel.jpeg',
    prize: 'Penthouse Hotel Stay of your choice',
    entryFee: 15,
    totalTickets: 6000,
    ticketsSold: 4875,
    endsAt: '2025-05-15T21:00:00Z',
  },
}

export default function TicketPurchasePage() {
  const router = useRouter()
  const { slug } = router.query

  const [competition, setCompetition] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    if (!slug || !COMPETITIONS[slug]) return
    const data = {
      ...COMPETITIONS[slug],
      slug,
    }
    setCompetition(data)
    setTotal(data.entryFee)
  }, [slug])

  useEffect(() => {
    if (!competition) return
    let fee = competition.entryFee
    let cost = quantity * fee
    if (quantity === 10) cost = fee * 8 // deal
    setTotal(cost)
  }, [quantity, competition])

  if (!competition) return <p className="text-center mt-10">Loading...</p>

  return (
    <main className="page">
      <div className="competition-card max-w-xl w-full">
      <CompetitionCard
  comp={competition}
  title={competition.title}
  prize={competition.prize}
  fee={`${competition.entryFee} π`}
  href=""
  imageUrl={competition.imageUrl}
  small={false}
  hideButton={true} // ← hide the button only here
/>


        <div className="mt-6 px-4 space-y-4 text-center">
          <h2 className="text-lg font-bold text-green-900">🎟️ Purchase Tickets</h2>
          <p><strong>Competition:</strong> {slug}</p>
          <p><strong>Price Per Ticket:</strong> {competition.entryFee} π</p>

          <label>
            <strong>Select Quantity:</strong>{' '}
            <select
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="ml-2 px-2 py-1 border rounded"
            >
              {[...Array(20)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </label>

          <p className="text-xl font-bold text-green-800">Total: {total} π</p>

          {quantity === 10 && (
            <p className="text-sm text-green-600 font-semibold">
              🎁 Deal applied: 10 for the price of 8!
            </p>
          )}

          <button className="comp-button mt-4">Confirm Purchase</button>
        </div>
      </div>
    </main>
  )
}
