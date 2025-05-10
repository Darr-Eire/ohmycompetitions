// pages/competitions/travel.jsx
import React from 'react'
import CompetitionCard from '@/components/CompetitionCard'

const premiumItems = [
  {
    comp: { slug: 'dubai-luxury-holiday', entryFee: 20, totalTickets: 15000, ticketsSold: 7100, endsAt: '2025-05-18T22:00:00Z' },
    title: 'Dubai Luxury Holiday',
    prize: '7-Day Dubai Trip',
    fee: '20 π',
    href: '/competitions/dubai-luxury-holiday',
    imageUrl: '/images/dubai-luxury-holiday.jpg',
    theme: 'premium',
  },
  {
    comp: { slug: 'penthouse-stay', entryFee: 15, totalTickets: 5000, ticketsSold: 4875, endsAt: '2025-05-15T21:00:00Z' },
    title: 'Penthouse Stay',
    prize: 'Luxury Penthouse Stay',
    fee: '15 π',
    href: '/competitions/penthouse-stay',
    imageUrl: '/images/hotel.jpeg',
    theme: 'premium',
  },
  {
    comp: { slug: 'first-class-flight', entryFee: 15, totalTickets: 5000, ticketsSold: 4875, endsAt: '2025-05-15T21:00:00Z' },
    title: 'First Class Flight',
    prize: 'Flights to Anywhere',
    fee: '15 π',
    href: '/competitions/first-class-flight',
    imageUrl: '/images/first.jpeg',
    theme: 'premium',
  },
  {
    comp: { slug: 'weekend-getaway', entryFee: 12, totalTickets: 4000, ticketsSold: 0, endsAt: '2025-06-01T22:00:00Z' },
    title: 'Weekend Getaway',
    prize: '€2,000 Travel Voucher',
    fee: '12 π',
    href: '/competitions/weekend-getaway',
    imageUrl: '/images/weekend.jpg',
    theme: 'premium',
  },
  {
    comp: { slug: 'airbnb-voucher', entryFee: 10, totalTickets: 3500, ticketsSold: 0, endsAt: '2025-06-05T22:00:00Z' },
    title: 'Airbnb Voucher',
    prize: '€1,000 Airbnb Credit',
    fee: '10 π',
    href: '/competitions/airbnb-voucher',
    imageUrl: '/images/airbnb.jpg',
    theme: 'premium',
  },
  {
    comp: { slug: 'spa-day-package', entryFee: 8, totalTickets: 3000, ticketsSold: 0, endsAt: '2025-06-10T22:00:00Z' },
    title: 'Spa Day Package',
    prize: 'Luxury Spa Experience',
    fee: '8 π',
    href: '/competitions/spa-day-package',
    imageUrl: '/images/spa.jpg',
    theme: 'premium',
  }
]



export default function TravelPage() {
   return (
    <main className="max-w-screen-lg mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-center text-pink-500 mb-10">🌍 Travel & Lifestyle Giveaways</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {premiumItems.map((item, index) => (
          <CompetitionCard key={item.comp?.slug || index} {...item} />
        ))}
      </div>
    </main>
  )
}