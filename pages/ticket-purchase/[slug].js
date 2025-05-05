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

  const COMPETITIONS = {
    'everyday-pioneer': {
      title: 'Everyday Pioneer',
      imageUrl: '/images/everyday.png',
      prize: '🎉 1000 pi',
      entryFee: 0.314,
      totalTickets: 1900,
      ticketsSold: 0,
      endsAt: '2025-05-03T15:14:00Z',
      theme: 'daily',
    },
    'pi-to-the-moon': {
      title: 'Pi To The Moon',
      imageUrl: '/images/pitothemoon.jpeg',
      prize: '🎉 5000',
      entryFee: 3.14,
      totalTickets: 1900,
      ticketsSold: 0,
      endsAt: '2025-05-04T12:00:00Z',
      theme: 'daily',
    },
    'hack-the-vault': {
      title: 'Hack The Vault',
      imageUrl: '/images/vault.png',
      prize: '🎉  750',
      entryFee: 0.375,
      totalTickets: 850,
      ticketsSold: 0,
      endsAt: '2025-05-03T23:59:59Z',
      theme: 'daily',
    },
    'pi-day-freebie': {
      title: 'Pi Day Freebie',
      imageUrl: '/images/freebie.png',
      prize: '🎉 Pi Day Badge',
      entryFee: 0,
      totalTickets: 10000,
      ticketsSold: 0,
      endsAt: '2025-05-06T20:00:00Z',
      theme: 'free',
    },
    'everyones-a-winner': {
      title: "Everyone's A Winner",
      imageUrl: '/images/everyone.png',
      prize: '🎉 10,000 pi',
      entryFee: 0,
      totalTickets: 10000,
      ticketsSold: 0,
      endsAt: '2025-05-10T18:00:00Z',
      theme: 'free',
    },
    'weekly-pi-giveaway': {
      title: 'Weekly Pi Giveaway',
      imageUrl: '/images/weekly.png',
      prize: '1,000 π Giveaway',
      entryFee: 0,
      totalTickets: 5000,
      ticketsSold: 0,
      endsAt: '2025-05-05T23:59:59Z',
      theme: 'free',
    },
    'ps5-bundle-giveaway': {
      title: 'PS5 Bundle Giveaway',
      imageUrl: '/images/playstation.jpeg',
      prize: 'PlayStation 5 + Extra Controller',
      entryFee: 0.8,
      totalTickets: 1100,
      ticketsSold: 0,
      endsAt: '2025-05-07T14:00:00Z',
      theme: 'tech',
    },
    '55-inch-tv-giveaway': {
      title: '55" TV Giveaway',
      imageUrl: '/images/tv.jpg',
      prize: '55" Smart TV',
      entryFee: 0.25,
      totalTickets: 1400,
      ticketsSold: 0,
      endsAt: '2025-05-08T11:30:00Z',
      theme: 'tech',
    },
    'xbox-one-bundle': {
      title: 'Xbox One Bundle',
      imageUrl: '/images/xbox.jpeg',
      prize: 'Xbox One + Game Pass',
      entryFee: 0.2,
      totalTickets: 2000,
      ticketsSold: 0,
      endsAt: '2025-05-09T17:45:00Z',
      theme: 'tech',
    },
    'pi-giveaway-100k': {
      title: '100,000 π Giveaway',
      imageUrl: '/images/100,000.png',
      prize: '100,000 π',
      entryFee: 10,
      totalTickets: 10600,
      ticketsSold: 0,
      endsAt: '2025-05-12T00:00:00Z',
      theme: 'pi',
    },
    'pi-giveaway-50k': {
      title: '50 000 π Giveaway',
      imageUrl: '/images/50,000.png',
      prize: '50 000 π',
      entryFee: 3.14,
      totalTickets: 17000,
      ticketsSold: 0,
      endsAt: '2025-05-11T00:00:00Z',
      theme: 'pi',
    },
    'pi-giveaway-25k': {
      title: '25 000 π Giveaway',
      imageUrl: '/images/25,000.png',
      prize: '25 000 π',
      entryFee: 2.5,
      totalTickets: 11200,
      ticketsSold: 0,
      endsAt: '2025-05-10T00:00:00Z',
      theme: 'pi',
    },
    'tesla-model-3-giveaway': {
      title: 'Tesla Model 3 Giveaway',
      imageUrl: '/images/tesla.jpeg',
      prize: 'Tesla Model 3',
      entryFee: 40,
      totalTickets: 15000,
      ticketsSold: 0,
      endsAt: '2025-05-20T23:59:00Z',
      theme: 'premium',
    },
    'dubai-luxury-holiday': {
      title: 'Dubai Luxury Holiday',
      imageUrl: '/images/dubai-luxury-holiday.jpg',
      prize: '7-Day Dubai Trip',
      entryFee: 25,
      totalTickets: 8000,
      ticketsSold: 7100,
      endsAt: '2025-05-18T22:00:00Z',
      theme: 'premium',
    },
    'penthouse-hotel-stay': {
      title: 'Penthouse Hotel Stay',
      imageUrl: '/images/hotel.jpeg',
      prize: 'Penthouse Hotel Stay of your choice',
      entryFee: 20,
      totalTickets: 15000,
      ticketsSold: 0,
      endsAt: '2025-05-15T21:00:00Z',
      theme: 'premium',
    },
  
   'luxury-yacht-weekend': {
    title: 'Luxury Yacht Weekend',
    imageUrl: '/images/yacht.jpeg',
    prize: '3 day Mediterranean Yacht Cruise',
    entryFee: 20,
    totalTickets: 15000,
    ticketsSold: 0,
    endsAt: '2025-05-15T21:00:00Z',
    theme: 'premium'},
  
    'the-crown-jewels': {
      title: 'The Crown Jewels',
      imageUrl: '/images/jew.jpeg',
      prize: 'Gold Rings',
      entryFee: 20,
      totalTickets: 15000,
      ticketsSold: 0,
      endsAt: '2025-05-15T21:00:00Z',
      theme: 'premium'},
  
      'first-class-flight': {
        title: 'First Class Flight',
        imageUrl: '/images/first.jpeg',
        prize: 'Return Flights Anywhere In The World',
        entryFee: 20,
        totalTickets: 15000,
        ticketsSold: 0,
        endsAt: '2025-05-15T21:00:00Z',
        theme: 'premium'},
  
        'pi-giveaway-250k': {
          title: '25,000 π Giveaway',
          imageUrl: '/images/first.jpeg',
          prize: '25 000 π',
          entryFee: 20,
          totalTickets: 15000,
          ticketsSold: 0,
          endsAt: '2025-05-15T21:00:00Z',
          theme: 'premium'},
  
          'pi-giveaway-100k': {
          title: '100,000 π Giveaway',
          imageUrl: '/images/first.jpeg',
          prize: '25 000 π',
          entryFee: 20,
          totalTickets: 15000,
          ticketsSold: 0,
          endsAt: '2025-05-15T21:00:00Z',
          theme: 'premium'},
  
          'pi-giveaway-60000': {
            title: '60,000 π Giveaway',
            imageUrl: '/images/first.jpeg',
            prize: '25 000 π',
            entryFee: 20,
            totalTickets: 15000,
            ticketsSold: 0,
            endsAt: '2025-05-15T21:00:00Z',
            theme: 'premium'},
  
            'pi-giveaway-25k': {
              title: '100,000 π Giveaway',
              imageUrl: '/images/first.jpeg',
              prize: '100,000 π',
              entryFee: 20,
              totalTickets: 15000,
              ticketsSold: 0,
              endsAt: '2025-05-15T21:00:00Z',
              theme: 'premium'},
  
              'pi-giveaway-25000': {
              title: '25,000 Giveaway',
              imageUrl: '/images/first.jpeg',
              prize: '25,000 π',
              entryFee: 20,
              totalTickets: 15000,
              ticketsSold: 0,
              endsAt: '2025-05-15T21:00:00Z',
              theme: 'premium'},
  
              'pi-giveaway-10000': {
                title: '10,000 Giveaway',
                imageUrl: '/images/first.jpeg',
                prize: '10,000 π',
                entryFee: 20,
                totalTickets: 15000,
                ticketsSold: 0,
                endsAt: '2025-05-15T21:00:00Z',
                theme: 'premium'},
  
                'pi-giveaway-5000': {
                title: '5000 Giveaway',
                imageUrl: '/images/first.jpeg',
                prize: '5000 π',
                entryFee: 20,
                totalTickets: 5000,
                ticketsSold: 0,
                endsAt: '2025-05-15T21:00:00Z',
                theme: 'premium'},
  
                'pi-giveaway-1000': {
                title: '1000 Giveaway',
                imageUrl: '/images/first.jpeg',
                prize: '1000 π',
                entryFee: 20,
                totalTickets: 1000,
                ticketsSold: 0,
                endsAt: '2025-05-15T21:00:00Z',
                theme: 'premium'},
  
                'apple-iphone': {
                title: 'Apple Iphone',
                imageUrl: '/images/iphone.jpeg',
                prize: 'Iphone',
                entryFee: 20,
                totalTickets: 1000,
                ticketsSold: 0,
                endsAt: '2025-05-15T21:00:00Z',
                theme: 'premium'},
  
                'Rolex': {
                title: 'Rolex',
                imageUrl: '/images/rolex.jpeg',
                prize: 'Rolex Watch',
                entryFee: 20,
                totalTickets: 1000,
                ticketsSold: 0,
                endsAt: '2025-05-15T21:00:00Z',
                theme: 'premium'},
  
                'gamer-pc-bundle': {
                title: 'Gamer Pc nBundle',
                imageUrl: '/images/bundle.jpeg',
                prize: 'Rolex Watch',
                entryFee: 20,
                totalTickets: 1000,
                ticketsSold: 0,
                endsAt: '2025-05-15T21:00:00Z',
                theme: 'premium'},
  
                'mac-book-pro': {
                  title: 'Mac Book Pro',
                  imageUrl: '/images/macbook.jpeg',
                  prize: 'Rolex Watch',
                  entryFee: 20,
                  totalTickets: 1000,
                  ticketsSold: 0,
                  endsAt: '2025-05-15T21:00:00Z',
                  theme: 'premium'},
                  
                  'electric-bike': {
                    title: 'Electric Bike',
                    imageUrl: '/images/bike.jpeg',
                    prize: 'Electric Bike',
                    entryFee: 20,
                    totalTickets: 1000,
                    ticketsSold: 0,
                    endsAt: '2025-05-15T21:00:00Z',
                    theme: 'premium'},
  
                    'pi-miners-bonanza': {
                      title: 'Pi Miners Bonanza',
                      imageUrl: '/images/bike.jpeg',
                      prize: '',
                      entryFee: 20,
                      totalTickets: 1000,
                      ticketsSold: 0,
                      endsAt: '2025-05-15T21:00:00Z',
                      theme: 'premium'},
  
                      'pi-nugget-giveaway': {
                        title: 'Pi-Nugget-Giveaway',
                        imageUrl: '/images/bike.jpeg',
                        prize: '',
                        entryFee: 20,
                        totalTickets: 1000,
                        ticketsSold: 0,
                        endsAt: '2025-05-15T21:00:00Z',
                        theme: 'premium'},
  
                        'free-for-all': {
                          title: 'Free For All',
                          imageUrl: '/images/bike.jpeg',
                          prize: '',
                          entryFee: 20,
                          totalTickets: 1000,
                          ticketsSold: 0,
                          endsAt: '2025-05-15T21:00:00Z',
                          theme: 'premium'},
  
                          'freebie-frenzy': {
                            title: 'freebie-frenzy',
                            imageUrl: '/images/bike.jpeg',
                            prize: '',
                            entryFee: 20,
                            totalTickets: 1000,
                            ticketsSold: 0,
                            endsAt: '2025-05-15T21:00:00Z',
                            theme: 'premium'},
  
                            'daily-pi-slice': {
                            title: 'Daily Pi Slice',
                            imageUrl: '/images/bike.jpeg',
                            prize: '',
                            entryFee: 20,
                            totalTickets: 1000,
                            ticketsSold: 0,
                            endsAt: '2025-05-15T21:00:00Z',
                            theme: 'premium'},
  
                              'daily-jackpot': {
                              title: 'Daily Jackpot',
                              imageUrl: '/images/.png',
                              prize: '',
                              entryFee: 20,
                              totalTickets: 1000,
                              ticketsSold: 0,
                              endsAt: '2025-05-15T21:00:00Z',
                              theme: 'premium'},
  
                              'the-daily-dash': {
                                title: 'The Daily Dash',
                                imageUrl: '/images/dash.png',
                                prize: '',
                                entryFee: 20,
                                totalTickets: 1000,
                                ticketsSold: 0,
                                endsAt: '2025-05-15T21:00:00Z',
                                theme: 'premium'},
    
  
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
    if (quantity === 10) cost = competition.entryFee * 8 // special deal
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
      style={{
        backgroundImage: 'linear-gradient(to bottom right, #1E3A8A, #60A5FA)',
      }}
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

        {/* Purchase & Action Section */}
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

          {/* Action Buttons */}
          <div className="flex flex-col gap-4">
            {/* Confirm Purchase */}
            <button className="w-full btn-neon-primary">
              Confirm Purchase
            </button>

            {/* Enter Now (back to competition) */}
            <button
              onClick={() => router.push(`/competitions/${slug}`)}
              className="comp-button"
            >
              Enter Now
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
