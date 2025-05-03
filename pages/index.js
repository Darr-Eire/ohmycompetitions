// pages/index.js
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

  const SCROLL_STEP = 150

  const scroll = (ref, offset) => {
    ref.current?.scrollBy({ left: offset, behavior: 'smooth' })
  }

  // reset carousels when scrolled out of view
  useEffect(() => {
    const handler = () => {
      ;[dailyRef, freeRef, techRef, piRef, premiumRef].forEach(ref => {
        const el = ref.current
        if (el?.getBoundingClientRect().bottom < 0) {
          el.scrollLeft = 0
        }
      })
    }
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const ViewMoreCard = ({ href, theme }) => (
    <div className="flex items-center justify-center min-w-[280px] h-full">
      <Link href={href} className={`view-more-button view-more-${theme}`}>
        View More →
      </Link>
    </div>
  )

  const Section = ({
    title,
    items,
    containerRef,
    theme = 'global',
    viewMoreHref,
    className = '',
  }) => {
    const headingStyles = {
      global:  'bg-blue-600 text-white',
      daily:   'bg-blue-600 text-white',
      green:   'bg-green-500 text-white',
      orange:  'bg-orange-500 text-white',
      purple:  'bg-purple-600 text-white',
      premium: 'bg-gray-800 text-white',
    }
    const headingClass = headingStyles[theme] || headingStyles.global

    return (
      <section className={`relative ${className}`}>
        <h2
          className={`category-page-title inline-block px-4 py-2 rounded mb-4 ${headingClass}`}
        >
          {title}
        </h2>
        <div className="relative">
          <button
            onClick={() => scroll(containerRef, -SCROLL_STEP)}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow"
          >
            ‹
          </button>
          <div
            ref={containerRef}
            className="daily-carousel flex space-x-4 overflow-x-auto scroll-smooth"
          >
            {items.map(item => (
              <CompetitionCard
                key={item.comp.slug}
                {...item}
                small
                theme={theme}
                className="transform scale-95 transition-all duration-200"
              />
            ))}
            <ViewMoreCard href={viewMoreHref} theme={theme} />
          </div>
          <button
            onClick={() => scroll(containerRef, SCROLL_STEP)}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow"
          >
            ›
          </button>
        </div>
      </section>
    )
  }

  return (
    <main className="pt-8 pb-12 px-4 bg-white min-h-screen space-y-16">
      <Section
        title="Daily Competitions"
        className="mt-8"
        containerRef={dailyRef}
        theme="daily"
        viewMoreHref="/competitions/daily"
        items={[
          {
            comp: { slug: 'pi-to-the-moon', entryFee: 3.14, totalTickets: 1900, ticketsSold: 0, endsAt: '2025-05-04T12:00:00Z' },
            title: 'Pi To The Moon',
            prize: '5,000 Pi',
            fee: '3.14 π',
            href: '/competitions/pi-to-the-moon',
            imageUrl: '/images/pitothemoon.jpeg',
          },
          {
            comp: { slug: 'everyday-pioneer', entryFee: 0.314, totalTickets: 1900, ticketsSold: 0, endsAt: '2025-05-03T15:14:00Z' },
            title: 'Everyday Pioneer',
            prize: '1,000 Pi',
            fee: '0.314 π',
            href: '/competitions/everyday-pioneer',
            imageUrl: '/images/everyday.png',
          },
          {
            comp: { slug: 'hack-the-vault', entryFee: 0.375, totalTickets: 2225, ticketsSold: 0, endsAt: '2025-05-03T23:59:59Z' },
            title: 'Hack The Vault',
            prize: '750 Pi',
            fee: '0.375 π',
            href: '/competitions/hack-the-vault',
            imageUrl: '/images/vault.png',
          },
        ]}
      />

      <Section
        title="Free Competitions"
        containerRef={freeRef}
        theme="green"
        viewMoreHref="/competitions/free"
        items={[
          {
            comp: { slug: 'pi-day-freebie', entryFee: 0, totalTickets: 10000, ticketsSold: 0, endsAt: '2025-05-06T20:00:00Z' },
            title: 'Pi Day Freebie',
            prize: '🎉 TBH',
            fee: 'Free',
            href: '/competitions/pi-day-freebie',
            imageUrl: '/images/freebie.png',
          },
          {
            comp: { slug: 'everyones-a-winner', entryFee: 0, totalTickets: 10000, ticketsSold: 0, endsAt: '2025-05-10T18:00:00Z' },
            title: "Everyone's A Winner",
            prize: '🎉 1st 6,000\n2nd 3,000\n3rd 1,000',
            fee: 'Free',
            href: '/competitions/everyones-a-winner',
            imageUrl: '/images/everyone.png',
          },
          {
            comp: { slug: 'weekly-pi-giveaway', entryFee: 0, totalTickets: 5000, ticketsSold: 0, endsAt: '2025-05-05T23:59:59Z' },
            title: 'Weekly Pi Giveaway',
            prize: '1,000 π Giveaway',
            fee: 'Free',
            href: '/competitions/weekly-pi-giveaway',
            imageUrl: '/images/weekly.png',
          },
        ]}
      />

      <Section
        title="Tech Giveaways"
        containerRef={techRef}
        theme="orange"
        viewMoreHref="/competitions/tech"
        items={[
          {
            comp: { slug: 'ps5-bundle-giveaway', entryFee: 0.8, totalTickets: 1100, ticketsSold: 0, endsAt: '2025-05-07T14:00:00Z' },
            title: 'PS5 Bundle Giveaway',
            prize: 'PlayStation 5 + Extra Controller',
            fee: '0.8 π',
            href: '/competitions/ps5-bundle-giveaway',
            imageUrl: '/images/ps5.jpeg',
          },
          {
            comp: { slug: '55-inch-tv-giveaway', entryFee: 0.25, totalTickets: 1400, ticketsSold: 0, endsAt: '2025-05-08T11:30:00Z' },
            title: '55" TV Giveaway',
            prize: '55" Smart TV',
            fee: '0.25 π',
            href: '/competitions/55-inch-tv-giveaway',
            imageUrl: '/images/Tv.jpeg',
          },
          {
            comp: { slug: 'xbox-one-bundle', entryFee: 0.3, totalTickets: 2000, ticketsSold: 0, endsAt: '2025-05-09T17:45:00Z' },
            title: 'Xbox One Bundle',
            prize: 'Xbox One + Game Pass',
            fee: '0.2 π',
            href: '/competitions/xbox-one-bundle',
            imageUrl: '/images/xbox.jpeg',
          },
        ]}
      />

      <Section
        title="Pi Giveaways"
        containerRef={piRef}
        theme="purple"
        viewMoreHref="/competitions/pi"
        items={[
          {
            comp: { slug: 'pi-giveaway-100k', entryFee: 3.14, totalTickets: 33000, ticketsSold: 0, endsAt: '2025-05-12T00:00:00Z' },
            title: '100,000 π Giveaway',
            prize: '100,000 π',
            fee: '10 π',
            href: '/competitions/pi-giveaway-100k',
            imageUrl: '/images/100,000.png',
          },
          {
            comp: { slug: 'pi-giveaway-50k', entryFee: 3.14, totalTickets: 17000, ticketsSold: 0, endsAt: '2025-05-11T00:00:00Z' },
            title: '50,000 π Giveaway',
            prize: '50,000 π',
            fee: '3.14 π',
            href: '/competitions/pi-giveaway-50k',
            imageUrl: '/images/50,000.png',
          },
          {
            comp: { slug: 'pi-giveaway-25k', entryFee: 1.5, totalTickets: 18500, ticketsSold: 0, endsAt: '2025-05-10T00:00:00Z' },
            title: '25,000 π Giveaway',
            prize: '25,000 π',
            fee: '1.5 π',
            href: '/competitions/pi-giveaway-25k',
            imageUrl: '/images/25,000.png',
          },
        ]}
      />

      <Section
        title="Premium Competitions"
        containerRef={premiumRef}
        theme="premium"
        viewMoreHref="/competitions/premium"
        items={[
          {
            comp: { slug: 'tesla-model-3-giveaway', entryFee: 40, totalTickets: 20000, ticketsSold: 5120, endsAt: '2025-05-20T23:59:00Z' },
            title: 'Tesla Model 3 Giveaway',
            prize: 'Tesla Model 3',
            fee: '40 π',
            href: '/competitions/tesla-model-3-giveaway',
            imageUrl: '/images/tesla.jpeg',
          },
          {
            comp: { slug: 'dubai-luxury-holiday', entryFee: 20, totalTickets: 15000, ticketsSold: 7100, endsAt: '2025-05-18T22:00:00Z' },
            title: 'Dubai Luxury Holiday',
            prize: '7-Day Dubai Trip',
            fee: '20 π',
            href: '/competitions/dubai-luxury-holiday',
            imageUrl: '/images/dubai-luxury-holiday.jpg',
          },
          {
            comp: { slug: 'penthouse-hotel-stay', entryFee: 15, totalTickets: 5000, ticketsSold: 4875, endsAt: '2025-05-15T21:00:00Z' },
            title: 'Penthouse Hotel Stay',
            prize: 'Penthouse Hotel Stay of your choice',
            fee: '15 π',
            href: '/competitions/macbook-pro-2025-giveaway',
            imageUrl: '/images/hotel.jpeg',
          },
        ]}
      />
    </main>
  )
}

export async function getServerSideProps() {
  return { props: {} }
}
