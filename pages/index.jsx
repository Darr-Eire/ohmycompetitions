// pages/index.jsx
// @ts-nocheck
import React from 'react'
import Link from 'next/link'
import CompetitionCard from '@/components/CompetitionCard'

export default function HomePage() {
  // Featured “tech” competitions
  const techItems = [
    {
      comp: { slug: 'ps5-bundle-giveaway', entryFee: 0.8, totalTickets: 1100, ticketsSold: 0, endsAt: '2025-05-07T14:00:00Z' },
      title: 'PS5 Bundle',
      prize: 'PlayStation 5 + Extra Controller',
      fee: '0.8 π',
      href: '/competitions/ps5-bundle-giveaway',
      imageUrl: '/images/playstation.jpeg',
      theme: 'tech',
    },
    {
      comp: { slug: '55-inch-tv-giveaway', entryFee: 0.25, totalTickets: 1400, ticketsSold: 0, endsAt: '2025-05-08T11:30:00Z' },
      title: '55″ TV',
      prize: '55″ Smart TV',
      fee: '0.25 π',
      href: '/competitions/55-inch-tv-giveaway',
      imageUrl: '/images/tv.jpg',
      theme: 'tech',
    },
    {
      comp: { slug: 'xbox-one-bundle', entryFee: 0.3, totalTickets: 2000, ticketsSold: 0, endsAt: '2025-05-09T17:45:00Z' },
      title: 'Xbox One',
      prize: 'Xbox One + Game Pass',
      fee: '0.3 π',
      href: '/competitions/xbox-one-bundle',
      imageUrl: '/images/xbox.jpeg',
      theme: 'tech',
    },
  ]

  // “Pi” giveaways
  const piItems = [
    {
      comp: { slug: 'pi-giveaway-250k', entryFee: 15, totalTickets: 50000, ticketsSold: 0, endsAt: '2025-06-01T00:00:00Z' },
      title: '250 000 π',
      prize: '250 000 π',
      fee: '15 π',
      href: '/competitions/pi-giveaway-250k',
      imageUrl: '/images/250000.png',
      theme: 'pi',
    },
    {
      comp: { slug: 'pi-giveaway-100k', entryFee: 10, totalTickets: 33000, ticketsSold: 0, endsAt: '2025-05-20T00:00:00Z' },
      title: '100 000 π',
      prize: '100 000 π',
      fee: '10 π',
      href: '/competitions/pi-giveaway-100k',
      imageUrl: '/images/100000.png',
      theme: 'pi',
    },
    {
      comp: { slug: 'pi-giveaway-50k', entryFee: 5, totalTickets: 17000, ticketsSold: 0, endsAt: '2025-05-11T00:00:00Z' },
      title: '50 000 π',
      prize: '50 000 π',
      fee: '5 π',
      href: '/competitions/pi-giveaway-50k',
      imageUrl: '/images/50000.png',
      theme: 'pi',
    },
  ]

  // Daily freebies and jackpots
  const dailyItems = [
    {
      comp: { slug: 'daily-jackpot', entryFee: 0.375, totalTickets: 2225, ticketsSold: 0, endsAt: '2025-05-03T23:59:59Z' },
      title: 'Daily Jackpot',
      prize: '750 π',
      fee: '0.375 π',
      href: '/competitions/daily-jackpot',
      imageUrl: '/images/jackpot.png',
      theme: 'daily',
    },
    {
      comp: { slug: 'everyday-pioneer', entryFee: 0.314, totalTickets: 1900, ticketsSold: 0, endsAt: '2025-05-03T15:14:00Z' },
      title: 'Everyday Pioneer',
      prize: '1,000 π',
      fee: '0.314 π',
      href: '/competitions/everyday-pioneer',
      imageUrl: '/images/everyday.png',
      theme: 'daily',
    },
    {
      comp: { slug: 'daily-pi-slice', entryFee: 0.314, totalTickets: 1900, ticketsSold: 0, endsAt: '2025-05-03T15:14:00Z' },
      title: 'Daily Pi Slice',
      prize: '1,000 π',
      fee: '0.314 π',
      href: '/competitions/daily-pi-slice',
      imageUrl: '/images/daily.png',
      theme: 'daily',
    },
  ]

  // Freebie competitions
  const freeItems = [
    {
      comp: { slug: 'pi-day-freebie', entryFee: 0, totalTickets: 10000, ticketsSold: 0, endsAt: '2025-05-06T20:00:00Z' },
      title: 'Pi-Day Freebie',
      prize: 'Special Badge',
      fee: 'Free',
      href: '/competitions/pi-day-freebie',
      imageUrl: '/images/freebie.png',
      theme: 'free',
    },
    {
      comp: { slug: 'everyone-wins', entryFee: 0, totalTickets: 10000, ticketsSold: 0, endsAt: '2025-05-10T18:00:00Z' },
      title: 'Everyone Wins',
      prize: '9,999 / 5,555 / 1,111 π',
      fee: 'Free',
      href: '/competitions/everyones-a-winner',
      imageUrl: '/images/everyone.png',
      theme: 'free',
    },
    {
      comp: { slug: 'weekly-giveaway', entryFee: 0, totalTickets: 5000, ticketsSold: 0, endsAt: '2025-05-05T23:59:59Z' },
      title: 'Weekly Giveaway',
      prize: '1,000 π',
      fee: 'Free',
      href: '/competitions/weekly-pi-giveaway',
      imageUrl: '/images/weekly.png',
      theme: 'free',
    },
  ]

  return (
    <>
      {/* Featured Competitions */}
      <main className="max-w-screen-lg mx-auto px-4 py-8">
        <Section
          title="Featured"
          items={techItems}
          viewMoreHref="/competitions"
          viewMoreText="View All"
          viewMoreClassName="btn-gradient text-white inline-block px-4 py-2 rounded-lg"
        />

        {/* More Competitions */}
        <section className="mt-10">
          <h2 className="text-center px-4 py-2 text-base font-bold text-white bg-gradient-to-r from-[#00ffd5] to-[#0077ff] rounded shadow mb-6 font-orbitron">
            More Competitions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...piItems, ...dailyItems, ...freeItems].map(item => (
              <CompetitionCard key={item.comp.slug} {...item} />
            ))}
          </div>
        </section>
      </main>
    </>
  )
}

// Section helper component
function Section({
  title,
  items,
  viewMoreHref,
  viewMoreText = 'View More',
  viewMoreClassName,
}) {
  const gradientClasses =
    title === 'Featured'
      ? 'bg-gradient-to-r from-[#00ffd5] to-[#0077ff]'
      : 'bg-gradient-to-r from-[#00ffd5] to-[#0077ff]'

  return (
    <section className="mb-12">
      <h2
        className={`
          text-center px-4 py-2 text-base font-bold text-white
          ${gradientClasses}
          rounded shadow mb-6 font-orbitron
        `}
      >
        {title}
      </h2>

      {/* Mobile carousel */}
      <div className="centered-carousel lg:hidden">
        {items.map(item => (
          <CompetitionCard key={item.comp.slug} {...item} small />
        ))}
      </div>

      {/* Desktop grid */}
      <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {items.map(item => (
          <CompetitionCard key={item.comp.slug} {...item} />
        ))}
      </div>

      <div className="text-center mt-6">
        <Link href={viewMoreHref} className={viewMoreClassName}>
          {viewMoreText}
        </Link>
      </div>
    </section>
  )
}
