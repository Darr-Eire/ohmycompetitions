'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import HeroBanner from '@/components/HeroBanner'
import DailyCompetitionCard from '@/components/DailyCompetitionCard'
import FreeCompetitionCard from '@/components/FreeCompetitionCard'
import PiCompetitionCard from '@/components/PiCompetitionCard'
import CryptoGiveawayCard from '@/components/CryptoGiveawayCard'
import CompetitionCard from '@/components/CompetitionCard'
import TokenSelector from '@/components/TokenSelector' // ✅ Make sure this exists

export default function HomePage() {
  const [selectedToken, setSelectedToken] = useState('BTC') // ✅ Token state

  const topWinners = [
    { name: 'Jack Jim', prize: 'Matchday Tickets', date: 'March 26th', image: '/images/winner2.png' },
    { name: 'Shanahan', prize: 'Playstation 5', date: 'February 14th', image: '/images/winner2.png' },
    { name: 'Emily Rose', prize: 'Luxury Car', date: 'January 30th', image: '/images/winner2.png' },
    { name: 'John Doe', prize: '€10,000 Pi', date: 'December 15th', image: '/images/winner2.png' },
  ]

  function TopWinnersCarousel() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % topWinners.length)
    }, 5000) // Change every 5 seconds
    return () => clearInterval(interval)
  }, [])

  const current = topWinners[index]

  return (
    <div className="max-w-md mx-auto mt-12 bg-white bg-opacity-10 backdrop-blur-lg rounded-xl shadow-lg p-6 text-white text-center transition-all duration-500">
      <h2 className="text-2xl font-bold mb-4">🏆 Top Winner</h2>
      <div className="flex flex-col items-center">
        <Image
          src={current.image}
          alt={current.name}
          width={120}
          height={120}
          sizes="(max-width: 768px) 120px, 120px"
          className="rounded-full border-4 border-blue-500 mb-4"
        />
        <h3 className="text-xl font-semibold">{current.name}</h3>
        <p className="text-blue-300">{current.prize}</p>
        <p className="text-sm text-white/70">{current.date}</p>
      </div>
    </div>
    
  
)

  }

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
      comp: { slug: 'penthouse-stay', entryFee: 15, totalTickets: 5000, ticketsSold: 4875, endsAt: '2025-05-15T21:00:00Z' },
      title: 'Penthouse Stay',
      href: '/competitions/penthouse-stay',
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
      comp: { slug: 'pi-giveaway-100k', entryFee: 10, totalTickets: 33000, ticketsSold: 0, endsAt: '2025-05-20T00:00:00Z' },
      title: '100,000 Pi',
      prize: '100,000 π',
      fee: '10 π',
      href: '/competitions/pi-giveaway-100k',
      imageUrl: '/images/100000.png',
      theme: 'pi',
    },
    {
      comp: { slug: 'pi-giveaway-50k', entryFee: 5, totalTickets: 17000, ticketsSold: 0, endsAt: '2025-05-11T00:00:00Z' },
      title: '50,000 Pi',
      prize: '50,000 π',
      fee: '5 π',
      href: '/competitions/pi-giveaway-50k',
      imageUrl: '/images/50000.png',
      theme: 'pi',
    },
    {
      comp: { slug: 'pi-giveaway-25k', entryFee: 5, totalTickets: 17000, ticketsSold: 0, endsAt: '2025-05-11T00:00:00Z' },
      title: '25,000 Pi',
      prize: '25,000 π',
      fee: '2 π',
      href: '/competitions/pi-giveaway-25k',
      imageUrl: '/images/25000.png',
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
      comp: { slug: 'pi-to-the-mon', entryFee: 0, totalTickets: 10000, ticketsSold: 0, endsAt: '2025-05-10T18:00:00Z' },
      title: 'Pi To The Moon',
      prize: '10,000 π',
      fee: 'Free',
      href: '/competitions/Pi To The Moon',
      theme: 'free',
    },
  ]




const cryptoGiveawaysItems = [ 

  {
    comp: { slug: 'crypto-btc', entryFee: 0.5, totalTickets: 5000, ticketsSold: 0, endsAt: '2025-06-02T00:59:00Z' },
    title: 'Win BTC',
    prize: '0.01 BTC',
    fee: '0.5 π',
  href: '/crypto/crypto-btc',

    token: 'BTC',
    imageUrl: '/images/crypto-btc.png',
  },
  {
    comp: { slug: 'crypto-eth', entryFee: 0.5, totalTickets: 6000, ticketsSold: 0, endsAt: '2025-06-03T23:59:00Z' },
    title: 'Win ETH',
    prize: '0.5 ETH',
    fee: '0.5 π',
 
    href: '/crypto/crypto-eth',
    token: 'ETH',
    imageUrl: '/images/crypto-eth.png',
  },
  {
    comp: { slug: 'crypto-xrp', entryFee: 0.4, totalTickets: 8000, ticketsSold: 0, endsAt: '2025-06-09T23:59:00Z' },
    title: 'Win XRP',
    prize: '1000 XRP',
    fee: '0.4 π',

    href: '/crypto/crypto-crp',
    token: 'XRP',
    imageUrl: '/images/crypto-xrp.png',
  },
  {
    comp: { slug: 'crypto-sol', entryFee: 0.4, totalTickets: 7000, ticketsSold: 0, endsAt: '2025-06-05T23:59:00Z' },
    title: 'Win SOL',
    prize: '10 SOL',
    fee: '0.4 π',
  
    href: '/crypto/crypto-sol',
    token: 'SOL',
    imageUrl: '/images/crypto-sol.png',
  },
  {
    comp: { slug: 'crypto-bnb', entryFee: 0.4, totalTickets: 4000, ticketsSold: 0, endsAt: '2025-06-07T23:59:00Z' },
    title: 'Win BNB',
    prize: '2 BNB',
    fee: '0.4 π',
  
    href: '/crypto/crypto-bnb',
    token: 'BNB',
    imageUrl: '/images/crypto-bnb.png',
  },
  {
    comp: { slug: 'crypto-doge', entryFee: 0.3, totalTickets: 10000, ticketsSold: 0, endsAt: '2025-06-11T23:59:00Z' },
    title: 'Win DOGE',
    prize: '10,000 DOGE',
    fee: '0.3 π',
    href: '/crypto/crypto-doge',
    token: 'DOGE',
    imageUrl: '/images/crypto-doge.png',
  },
];




  




  return (
    <>
      <HeroBanner />

      <main className="max-w-screen-lg mx-auto px-0 pt-0 space-y-0">
        <Section title="Featured Competitions" items={techItems} viewMoreHref="/competitions/featured" viewMoreClassName="btn-gradient text-white inline-block px-4 py-2 rounded-lg" />
<Section
  title="Travel & Lifestyle"
  items={premiumItems}
  viewMoreHref="/competitions/travel"
  viewMoreClassName="btn-gradient text-white inline-block px-4 py-2 rounded-lg"
/>



       <Section
  title="Pi Giveaways"
  items={piItems}
  viewMoreHref="/competitions/pi"
  viewMoreClassName="btn-gradient text-white inline-block px-4 py-2 rounded-lg"
  extraClass="mt-12"
/>


        {/* Crypto with selector */}
        <div className="flex justify-between items-center mb-4 px-6">
          <h2 className="text-lg font-bold text-cyan-300">Select Crypto Token</h2>
          <TokenSelector selected={selectedToken} onChange={setSelectedToken} />
        </div>
        <Section title="Crypto Giveaways" items={cryptoGiveawaysItems} viewMoreHref="/competitions/crypto-giveaways" viewMoreClassName="btn-gradient text-white inline-block px-4 py-2 rounded-lg" />

       <Section
  title="Daily Competitions"
  items={dailyItems}
  viewMoreHref="/competitions/daily"
  viewMoreClassName="btn-gradient text-white inline-block px-4 py-2 rounded-lg"
  extraClass="mt-12"
/>

       <section className="w-full bg-white/5 backdrop-blur-lg px-6 sm:px-10 py-12 my-8 border border-cyan-400 rounded-3xl shadow-[0_0_60px_#00ffd577] neon-outline">
  <div className="max-w-7xl mx-auto">
    <h2 className="text-2xl sm:text-3xl font-bold text-center text-cyan-300 mb-10 font-orbitron">✨ Featured Free Competition ✨</h2>
    
    <FreeCompetitionCard
      comp={{
        endsAt: '2025-05-10T23:59:59Z',
        ticketsSold: 0,
        totalTickets: 10000,
        slug: 'pi-to-the-moon'
      }}
      title="Pi To The Moon"
      prize="20,000 π"
    />
  </div>
</section>


        <TopWinnersCarousel />

        <div className="flex justify-center mt-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-md px-6 py-6 bg-gradient-to-r from-cyan-300 to-blue-500 rounded-xl shadow-lg text-black text-center text-base">
            <div><div className="text-xl font-bold">44,000+</div><div>Winners</div></div>
            <div><div className="text-xl font-bold">106,400 π</div><div>Total Pi Won</div></div>
            <div><div className="text-xl font-bold">15,000 π</div><div>Donated to Charity</div></div>
            <div><div className="text-xl font-bold">5★</div><div>User Rated</div></div>
          </div>
        </div>
      </main>
    </>
  )
}

function Section({ title, items, viewMoreHref, viewMoreText = 'View More', viewMoreClassName, extraClass = '' }) {


  const isDaily = title.toLowerCase().includes('daily')
  const isFree = title.toLowerCase().includes('free')
  const isPi = title.toLowerCase().includes('pi')
  const isCryptoGiveaway = title.toLowerCase().includes('crypto giveaways')

 return (
    <section className={`mb-12 ${extraClass}`}>
     <div className={`text-center mb-12 ${extraClass}`}>

        <h2 className="w-full text-xl font-bold text-center text-black bg-gradient-to-r from-[#00ffd5] to-[#0077ff] px-6 py-3 rounded-xl shadow font-orbitron">
          {title}
        </h2>
      </div>

      <div className="centered-carousel lg:hidden">
        {items.map((item, index) => {
          const key = item?.comp?.slug || item?.id || index
          if (!item?.comp) return null

          if (isDaily) return <DailyCompetitionCard key={key} {...item} />
          if (isFree) return <FreeCompetitionCard key={key} {...item} />
          if (isPi) return <PiCompetitionCard key={key} {...item} />
          if (isCryptoGiveaway) return <CryptoGiveawayCard key={key} {...item} />
          return <CompetitionCard key={key} {...item} small />
        })}
      </div>

      <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {items.map((item, index) => {
          const key = item?.comp?.slug || item?.id || index
          if (!item?.comp) return null

          if (isDaily) return <DailyCompetitionCard key={key} {...item} />
          if (isFree) return <FreeCompetitionCard key={key} {...item} />
          if (isPi) return <PiCompetitionCard key={key} {...item} />
          if (isCryptoGiveaway) return <CryptoGiveawayCard key={key} {...item} />
          return <CompetitionCard key={key} {...item} />
        })}
      </div>

 <div className="text-center mt-6">
  <Link href={viewMoreHref} className={viewMoreClassName}>
    {viewMoreText}
  </Link>
</div>


    </section>
  )
}