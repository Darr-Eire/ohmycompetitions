'use client'
import React from 'react'
import Link from 'next/link'
import CompetitionCard from '@/components/CompetitionCard'
import HeroBanner from '@/components/HeroBanner'

export default function HomePage() {
  const topWinners = [
    { name: 'Jack jim', prize: 'Matchday Tickets', date: 'March 26th', image: '/images/winner2.png' },
    { name: 'Shanahan', prize: 'Playstation 5', date: 'February 14th', image: '/images/winner2.png' },
    { name: 'Emily Rose', prize: 'Luxury Car', date: 'January 30th', image: '/images/winner2.png' },
    { name: 'John Doe', prize: '€10,000 Pi', date: 'December 15th', image: '/images/winner2.png' },
  ]

  // Featured “tech” competitions
  const techItems = [
    {
      comp: { slug: 'ps5-bundle-giveaway', entryFee: 0.8, totalTickets: 1100, ticketsSold: 0, endsAt: '2025-05-07T14:00:00Z' },
      title: 'PS5 Bundle',
      prize: 'PlayStation 5',
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
    {
      comp: { slug: 'gamer-pc-bundle', entryFee: 0.25, totalTickets: 1400, ticketsSold: 0, endsAt: '2025-05-08T11:30:00Z' },
      title: 'Gaming PC',
      prize: 'Gamer Pc Bundle',
      fee: '0.25 π',
      href: '/competitions/gamer-pc-bundle',
      imageUrl: '/images/bundle.jpeg',
      theme: 'tech',
    },
    {
      comp: { slug: 'electric-bike', entryFee: 0.25, totalTickets: 1400, ticketsSold: 0, endsAt: '2025-05-08T11:30:00Z' },
      title: 'Electric Bike',
      prize: 'Electric Bike',
      fee: '0.25 π',
      href: '/competitions/electric-bike',
      imageUrl: '/images/bike.jpeg',
      theme: 'tech',
    },
    {
      comp: { slug: 'matchday-tickets', entryFee: 0.25, totalTickets: 1400, ticketsSold: 0, endsAt: '2025-05-08T11:30:00Z' },
      title: 'Matchday mTickets',
      prize: 'Matchday Tickets',
      fee: '0.25 π',
      href: '/competitions/matchday-tickets',
      imageUrl: '/images/liverpool.jpeg',
      theme: 'tech',
    },
  ]

  const premiumItems = [
    {
      comp: { slug: 'dubai-luxury-holiday', entryFee: 20, totalTickets: 15000, ticketsSold: 7100, endsAt: '2025-05-18T22:00:00Z' },
      title: 'Dubai Luxury Holiday',
      href: '/competitions/dubai-luxury-holiday',
      prize: '7-Day Dubai Trip',
      fee: '20 π',
      imageUrl: '/images/dubai-luxury-holiday.jpg',
      theme: 'premium',
    },
    {
      comp: { slug: 'penthouse-hotel-stay', entryFee: 15, totalTickets: 5000, ticketsSold: 4875, endsAt: '2025-05-15T21:00:00Z' },
      title: 'Penthouse Hotel Stay',
      href: '/competitions/penthouse-hotel-stay',
      prize: 'Penthouse Hotel Stay of your choice',
      fee: '15 π',
      imageUrl: '/images/hotel.jpeg',
      theme: 'premium',
    },
    {
      comp: { slug: 'first-class-flight', entryFee: 15, totalTickets: 5000, ticketsSold: 4875, endsAt: '2025-05-15T21:00:00Z' },
      title: 'First Class Flight',
      href: '/competitions/first-class-flight',
      prize: 'Return flights to anywhere in the world',
      fee: '15 π',
      imageUrl: '/images/first.jpeg',
      theme: 'premium',
    },

  ]

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

  const freeItems = [
    {
      comp: { slug: 'pi-day-freebie', entryFee: 0, totalTickets: 10000, ticketsSold: 0, endsAt: '2025-05-06T20:00:00Z' },
      title: 'Pi‑Day Freebie',
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
      <HeroBanner />
      <main className="max-w-screen-lg mx-auto px-4 pt-1 space-y-8"> {/* Reduced pt and space-y */}
        <Section title="Featured Competitions" items={techItems} viewMoreHref="/competitions" viewMoreText="View All" viewMoreClassName="btn-gradient text-white inline-block px-4 py-2 rounded-lg" />
        <Section title="Coming Soon" items={premiumItems} viewMoreHref="/competitions?theme=soon" />
        <Section title="Pi Giveaways" items={piItems} viewMoreHref="/competitions?theme=pi" />
        <Section title="Daily Competitions" items={dailyItems} viewMoreHref="/competitions?theme=daily" />
        <Section title="Free Competitions" items={freeItems} viewMoreHref="/competitions?theme=free" />
      </main>
  
      <div className="mt-12"> {/* was mt-16 */}
        <h2 className="text-3xl font-bold text-center text-white mb-4">{/* was mb-6 */}Top Winners</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 mx-auto max-w-4xl">{/* was gap-6 p-6 */}
          {topWinners.map((winner, index) => (
            <div key={index} className="bg-gradient-to-r from-[#00ffd5] to-[#0077ff] rounded-lg shadow-lg overflow-hidden text-black p-4">
              <img src={winner.image} alt={winner.name} className="w-full h-32 object-cover rounded-md" />
              <div className="mt-3">
                <h3 className="text-xl font-semibold text-black">{winner.name}</h3>
                <p className="text-md text-black">{winner.prize}</p>
                <p className="text-sm text-black mt-1">{winner.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
  
      <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl backdrop-blur-md text-black text-center text-sm sm:text-base mx-auto max-w-4xl bg-gradient-to-r from-[#00ffd5] to-[#0077ff] shadow-lg">
        <div><div className="text-2xl sm:text-3xl font-bold">44,000+</div><p className="text-black mt-1">Winners</p></div>
        <div><div className="text-2xl sm:text-3xl font-bold">106,400 π</div><p className="text-black mt-1">Total Pi Won</p></div>
        <div><div className="text-2xl sm:text-3xl font-bold">15,000 π</div><p className="text-black mt-1">Donated to Charity</p></div>
        <div><div className="text-2xl sm:text-3xl font-bold">5 ★</div><p className="text-black mt-1">User Rated</p></div>
      </div>
    </>
  )
}  

function Section({ title, items, viewMoreHref, viewMoreText = 'View More', viewMoreClassName }) {
  return (
    <section className="mb-12">
      <div className="text-center mb-2">
        <h2 className="inline-block text-sm font-medium text-black bg-gradient-to-r from-[#00ffd5] to-[#0077ff] px-4 py-2 rounded-lg shadow font-orbitron">
          {title}
        </h2>
      </div>
      <div className="centered-carousel lg:hidden">
        {items.map(item => (
          <CompetitionCard key={item.comp.slug} {...item} small />
        ))}
      </div>
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