'use client'

import { useRef, useEffect } from 'react'
import Link from 'next/link'
import CompetitionCard from '@/components/CompetitionCard'

export default function HomePage() {
  const dailyRef   = useRef(null)
  const freeRef    = useRef(null)
  const techRef    = useRef(null)
  const piRef      = useRef(null)
  const premiumRef = useRef(null)
  const SCROLL_STEP = 75
  // Section component: header + native‑swipe carousel
  const Section = ({ title, items, containerRef, theme, viewMoreHref, className = '' }) => {
    const headingStyles = {
      daily:   'bg-blue-600 text-white',
      free:    'bg-green-500 text-white',
      tech:    'bg-orange-500 text-white',
      pi:      'bg-purple-600 text-white',
      premium: 'bg-gray-800 text-white',
    }
    const headingClass = headingStyles[theme] || headingStyles.daily

    // Touch‑drag friction (no preventDefault)
    useEffect(() => {
      const el = containerRef.current
      if (!el) return

      const F = 0.3
      let startX = 0, startScroll = 0

      const onTouchStart = e => {
        startX = e.touches[0].pageX
        startScroll = el.scrollLeft
      }
      const onTouchMove = e => {
        const deltaX = startX - e.touches[0].pageX
        // Only adjust horizontal
        el.scrollLeft = startScroll + deltaX * F
        // **no** e.preventDefault() here
      }

      el.addEventListener('touchstart', onTouchStart, { passive: true })
      el.addEventListener('touchmove',  onTouchMove,   { passive: true })
      return () => {
        el.removeEventListener('touchstart', onTouchStart)
        el.removeEventListener('touchmove',  onTouchMove)
      }
    }, [containerRef])

    return (
      <section className={`relative ${className}`}>
        <h2 className={`category-page-title inline-block px-4 py-2 rounded mb-4 ${headingClass}`}>
          {title}
        </h2>
        <div
          ref={containerRef}
          className={`${theme}-carousel flex space-x-4 overflow-x-auto scroll-smooth`}
        >
          {items.map(item => (
            <CompetitionCard key={item.comp.slug + (item.comp.endsAt || '')} {...item} small theme={theme} />
          ))}
          <div className="flex items-center justify-center min-w-[280px]">
            <Link href={viewMoreHref} className={`view-more-button view-more-${theme}`}>
              View More →
            </Link>
          </div>
        </div>
      </section>
    )
  }

  // Data arrays
  const dailyItems = [
    {
      comp: { slug:'pi-to-the-moon', entryFee:3.14, totalTickets:1900, ticketsSold:0, endsAt:'2025-05-04T12:00:00Z' },
      title: 'Pi To The Moon',
      prize: '5,000 π',
      fee: '3.14 π',
      href: '/competitions/pi-to-the-moon',
      imageUrl: '/images/pitothemoon.jpeg',
      theme: 'daily',
    },
    {
      comp: { slug:'everyday-pioneer', entryFee:0.314, totalTickets:1900, ticketsSold:0, endsAt:'2025-05-03T15:14:00Z' },
      title: 'Everyday Pioneer',
      prize: '1,000 π',
      fee: '0.314 π',
      href: '/competitions/everyday-pioneer',
      imageUrl: '/images/everyday.png',
      theme: 'daily',
    },
    {
      comp: { slug:'hack-the-vault', entryFee:0.375, totalTickets:2225, ticketsSold:0, endsAt:'2025-05-03T23:59:59Z' },
      title: 'Hack The Vault',
      prize: '750 π',
      fee: '0.375 π',
      href: '/competitions/hack-the-vault',
      imageUrl: '/images/vault.png',
      theme: 'daily',
    },
  ]

  const freeItems = [
    {
      comp: { slug:'pi-day-freebie', entryFee:0, totalTickets:10000, ticketsSold:0, endsAt:'2025-05-06T20:00:00Z' },
      title: 'Pi‑Day Freebie',
      prize: 'Special Badge',
      fee: 'Free',
      href: '/competitions/pi-day-freebie',
      imageUrl: '/images/freebie.png',
      theme: 'free',
    },
    {
      comp: { slug:'everyone-wins', entryFee:0, totalTickets:10000, ticketsSold:0, endsAt:'2025-05-10T18:00:00Z' },
      title: 'Everyone Wins',
      prize: '9,999 / 5,555 / 1,111 π',
      fee: 'Free',
      href: '/competitions/everyones-a-winner',
      imageUrl: '/images/everyone.png',
      theme: 'free',
    },
    {
      comp: { slug:'weekly-giveaway', entryFee:0, totalTickets:5000, ticketsSold:0, endsAt:'2025-05-05T23:59:59Z' },
      title: 'Weekly Giveaway',
      prize: '1,000 π',
      fee: 'Free',
      href: '/competitions/weekly-pi-giveaway',
      imageUrl: '/images/weekly.png',
      theme: 'free',
    },
  ]

  const techItems = [
    {
      comp: { slug:'ps5-bundle', entryFee:0.8, totalTickets:1100, ticketsSold:0, endsAt:'2025-05-07T14:00:00Z' },
      title: 'PS5 Bundle',
      prize: 'PS5 + Controller',
      fee: '0.8 π',
      href: '/competitions/ps5-bundle-giveaway',
      imageUrl: '/images/ps5.jpeg',
      theme: 'tech',
    },
    {
      comp: { slug:'tv-giveaway-55', entryFee:0.25, totalTickets:1400, ticketsSold:0, endsAt:'2025-05-08T11:30:00Z' },
      title: '55″ TV Giveaway',
      prize: '55″ Smart TV',
      fee: '0.25 π',
      href: '/competitions/55-inch-tv-giveaway',
      imageUrl: '/images/Tv.jpeg',
      theme: 'tech',
    },
    {
      comp: { slug:'xbox-one-bundle', entryFee:0.3, totalTickets:2000, ticketsSold:0, endsAt:'2025-05-09T17:45:00Z' },
      title: 'Xbox One Bundle',
      prize: 'Xbox + Game Pass',
      fee: '0.3 π',
      href: '/competitions/xbox-one-bundle',
      imageUrl: '/images/xbox.jpeg',
      theme: 'tech',
    },
  ]

  const piItems = [
    {
      comp: { slug:'big-pi-100k', entryFee:10, totalTickets:33000, ticketsSold:0, endsAt:'2025-05-12T00:00:00Z' },
      title: '100 000 π Giveaway',
      prize: '100 000 π',
      fee: '10 π',
      href: '/competitions/pi-giveaway-100k',
      imageUrl: '/images/100,000.png',
      theme: 'pi',
    },
    {
      comp: { slug:'big-pi-50k', entryFee:5, totalTickets:17000, ticketsSold:0, endsAt:'2025-05-11T00:00:00Z' },
      title: '50 000 π Giveaway',
      prize: '50 000 π',
      fee: '5 π',
      href: '/competitions/pi-giveaway-50k',
      imageUrl: '/images/50,000.png',
      theme: 'pi',
    },
    {
      comp: { slug:'big-pi-25k', entryFee:1.5, totalTickets:18500, ticketsSold:0, endsAt:'2025-05-10T00:00:00Z' },
      title: '25 000 π Giveaway',
      prize: '25 000 π',
      fee: '1.5 π',
      href: '/competitions/pi-giveaway-25k',
      imageUrl: '/images/25,000.png',
      theme: 'pi',
    },
  ]

  const premiumItems = [
    {
      comp: { slug:'tesla-giveaway', entryFee:40, totalTickets:20000, ticketsSold:5120, endsAt:'2025-05-20T23:59:00Z' },
      title: 'Tesla Model 3 Giveaway',
      prize: 'Tesla Model 3',
      fee: '40 π',
      href: '/competitions/tesla-model-3-giveaway',
      imageUrl: '/images/tesla.jpeg',
      theme: 'premium',
    },
    {
      comp: { slug:'dubai-trip', entryFee:20, totalTickets:15000, ticketsSold:7100, endsAt:'2025-05-18T22:00:00Z' },
      title: 'Dubai Luxury Trip',
      prize: '7 Day Dubai Holiday',
      fee: '20 π',
      href: '/competitions/dubai-luxury-holiday',
      imageUrl: '/images/dubai-luxury-holiday.jpg',
      theme: 'premium',
    },
    {
      comp: { slug:'penthouse-stay', entryFee:15, totalTickets:5000, ticketsSold:4875, endsAt:'2025-06-15T21:00:00Z' },
      title: 'Penthouse Hotel Stay',
      prize: 'Your Choice Penthouse',
      fee: '15 π',
      href: '/competitions/macbook-pro-2025-giveaway',
      imageUrl: '/images/hotel.jpeg',
      theme: 'premium',
    },
  ]

  return (
    <main className="pt-8 pb-12 px-4 bg-white min-h-screen space-y-16">
      <Section title="Daily Competitions"   containerRef={dailyRef}   theme="daily"   viewMoreHref="/competitions/daily"   items={dailyItems}   className="mt-8" />
      <Section title="Free Competitions"    containerRef={freeRef}    theme="free"    viewMoreHref="/competitions/free"    items={freeItems}    />
      <Section title="Tech Giveaways"       containerRef={techRef}    theme="tech"    viewMoreHref="/competitions/tech"    items={techItems}   />
      <Section title="Pi Giveaways"         containerRef={piRef}      theme="pi"      viewMoreHref="/competitions/pi"      items={piItems}    />
      <Section title="Premium Competitions" containerRef={premiumRef} theme="premium" viewMoreHref="/competitions/premium" items={premiumItems}/>
    </main>
  )
}

export async function getServerSideProps() {
  return { props: {} }
}
