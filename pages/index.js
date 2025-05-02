'use client'

import { useRef } from 'react'
import Link from 'next/link'
import CompetitionCard from '@/components/CompetitionCard'

export default function HomePage() {
  const dailyRef = useRef(null)
  const freeRef = useRef(null)
  const itemRef = useRef(null)
  const piRef = useRef(null)
  const premiumRef = useRef(null)

  const scroll = (ref, offset) => {
    ref.current?.scrollBy({ left: offset, behavior: 'smooth' })
  }

  const ViewMoreCard = ({ href, theme }) => (
    <div className="flex items-center justify-center min-w-[280px] h-full">

      <Link
        href={href}
        className={`view-more-button view-more-${theme}`}
      >
        View More →
      </Link>
    </div>
  )

  const Section = ({ title, comps, ref, theme, viewMoreHref }) => (
    <section className="relative text-center">
      <h2 className={`${theme}-competitions-title inline-block mx-auto mb-4`}>
        {title}
      </h2>
      <div ref={ref} className="daily-carousel">
        {comps.map(item => (
          <CompetitionCard
            key={item.comp.slug}
            comp={item.comp}
            title={item.title}
            prize={item.prize}
            fee={item.fee}
            href={item.href}
            imageUrl={item.imageUrl}
            small
            theme={theme}
            className="transform scale-95 transition-all duration-200"
          />
        ))}
        <ViewMoreCard href={viewMoreHref} theme={theme} />
      </div>
    </section>
  )

  return (
    <main className="pt-8 pb-12 px-4 bg-white min-h-screen space-y-16">
      <Section
        title="Daily Competitions"
        comps={[
          {
            comp: {
              slug: 'pi-to-the-moon',
              entryFee: 3.14,
              totalTickets: 1900,
              ticketsSold: 0,
              endsAt: '2025-05-04T12:00:00Z',
            },
            title: 'Pi To The Moon',
            href: '/competitions/pi-to-the-moon',
            prize: '5,000 Pi',
            fee: '3.14 π',
            imageUrl: '/images/pitothemoon.jpeg',
          }, 
           {
            comp: {
              slug: 'everyday-pioneer',
              entryFee: 0.314,
              totalTickets: 1900,
              ticketsSold: 0,
              endsAt: '2025-05-03T15:14:00Z',
            },
            title: 'Everyday Pioneer',
            href: '/competitions/everyday-pioneer',
            prize: '1,000 Pi',
            fee: '0.314 π',
            imageUrl: '/images/everyday.png',
          },
        
          {
            comp: {
              slug: 'hack-the-vault',
              entryFee: 0.99,
              totalTickets: 850,
              ticketsSold: 0,
              endsAt: '2025-05-03T23:59:59Z',
            },
            title: 'Hack The Vault',
            href: '/competitions/hack-the-vault',
            prize: '750 Pi',
            fee: '0.375 π',
            imageUrl: '/images/vault.png',
          },
        ]}
        
        ref={dailyRef}
        theme="daily"
        viewMoreHref="/competitions/daily"
      />

      <Section
        title="Free Competitions"
        comps={[
          {
            comp: {
              slug: 'pi-day-freebie',
              entryFee: 0,
              totalTickets: 10000,
              ticketsSold: 0,
              endsAt: '2025-05-06T20:00:00Z',
            },
            title: 'Pi Day Freebie',
            href: '/competitions/pi-day-freebie',
            prize: '🎉 TBH',
            fee: 'Free',
            imageUrl: '/images/freebie.png',
          },
          {
            comp: {
              slug: 'everyones-a-winner',
              entryFee: 0,
              totalTickets: 10000,
              ticketsSold: 0,
              endsAt: '2025-05-10T18:00:00Z',
            },
            title: "Everyone's A Winner",
            href: '/competitions/everyones-a-winner',
            prize: `🎉 1st 6,000\n2nd 3,000\n3rd 1,000`,
            fee: 'Free',
            imageUrl: '/images/everyone.png',
          },
          {
            comp: {
              slug: 'weekly-pi-giveaway',
              entryFee: 0,
              totalTickets: 5000,
              ticketsSold: 0,
              endsAt: '2025-05-05T23:59:59Z',
            },
            title: 'Weekly Pi Giveaway',
            href: '/competitions/weekly-pi-giveaway',
            prize: '1,000 π Giveaway',
            fee: 'Free',
            imageUrl: '/images/weekly.png',
          },
        ]}
        
        
        ref={freeRef}
        theme="green"
        viewMoreHref="/competitions/free"
      />

      <Section
        title="Tech Giveaways"
        comps={[
          {
            comp: {
              slug: 'ps5-bundle-giveaway',
              entryFee: 0.8,
              totalTickets: 1100,
              ticketsSold: 0,
              endsAt: '2025-05-07T14:00:00Z',
            },
            title: 'PS5 Bundle Giveaway',
            href: '/competitions/ps5-bundle-giveaway',
            prize: 'PlayStation 5 + Extra Controller',
            fee: '0.8 π',
            imageUrl: '/images/ps5.jpeg',
          },
          {
            comp: {
              slug: '55-inch-tv-giveaway',
              entryFee: 0.25,
              totalTickets: 1400,
              ticketsSold: 0,
              endsAt: '2025-05-08T11:30:00Z',
            },
            title: '55" TV Giveaway',
            href: '/competitions/55-inch-tv-giveaway',
            prize: '55" Smart TV',
            fee: '0.25 π',
            imageUrl: '/images/Tv.jpeg',
          },
          {
            comp: {
              slug: 'xbox-one-bundle',
              entryFee: 0.3,
              totalTickets: 2000,
              ticketsSold: 0,
              endsAt: '2025-05-09T17:45:00Z',
            },
            title: 'Xbox One Bundle',
            href: '/competitions/xbox-one-bundle',
            prize: 'Xbox One + Game Pass',
            fee: '0.2 π',
            imageUrl: '/images/xbox.jpeg',
          },
        ]}
        
        ref={itemRef}
        theme="orange"
        viewMoreHref="/competitions/tech"
      />

      <Section
        title="Pi Giveaways"
        comps={[
          {
            comp: {
              slug: 'pi-giveaway-100k',
              entryFee: 3.14,
              totalTickets: 33000,
              ticketsSold: 0,
              endsAt: '2025-05-12T00:00:00Z',
            },
            title: '100,000 π Giveaway',
            href: '/competitions/pi-giveaway-100k',
            prize: '100,000 π',
            fee: '10 π',
            imageUrl: '/images/100,000.png',
          },
          {
            comp: {
              slug: 'pi-giveaway-50k',
              entryFee: 3.14,
              totalTickets: 17000,
              ticketsSold: 0,
              endsAt: '2025-05-11T00:00:00Z',
            },
            title: '50,000 π Giveaway',
            href: '/competitions/pi-giveaway-50k',
            prize: '50,000 π',
            fee: '3,14 π',
            imageUrl: '/images/50,000.png',
          },
          {
            comp: {
              slug: 'pi-giveaway-25k',
              entryFee: 1.5,
              totalTickets: 18500,
              ticketsSold: 0,
              endsAt: '2025-05-10T00:00:00Z',
            },
            title: '25,000 π Giveaway',
            href: '/competitions/pi-giveaway-25k',
            prize: '25,000 π',
            fee: '1.5 π',
            imageUrl: '/images/25,000.png',
          },
        ]}
        
        ref={piRef}
        theme="purple"
        viewMoreHref="/competitions/pi"
      />

      <Section
        title="Premium Competitions"
        comps={[
          {
            comp: {
              slug: 'tesla-model-3-giveaway',
              entryFee: 40,
              totalTickets: 20000,
              ticketsSold: 5120,
              endsAt: '2025-05-20T23:59:00Z',
            },
            title: 'Tesla Model 3 Giveaway',
            href: '/competitions/tesla-model-3-giveaway',
            prize: 'Tesla Model 3',
            fee: '40 π',
            imageUrl: '/images/tesla.jpeg',
          },
          {
            comp: {
              slug: 'dubai-luxury-holiday',
              entryFee: 20,
              totalTickets: 15000,
              ticketsSold: 7100,
              endsAt: '2025-05-18T22:00:00Z',
            },
            title: 'Dubai Luxury Holiday',
            href: '/competitions/dubai-luxury-holiday',
            prize: '7-Day Dubai Trip',
            fee: '20 π',
            imageUrl: '/images/dubai-luxury-holiday.jpg',
          },
          {
            comp: {
              slug: 'penthouse-hotel-stay',
              entryFee: 15,
              totalTickets: 5000,
              ticketsSold: 4875,
              endsAt: '2025-05-15T21:00:00Z',
            },
            title: 'Penthouse Hotel Stay',
            href: '/competitions/macbook-pro-2025-giveaway',
            prize: 'Penthouse Hotel Stay of your choice',
            fee: '15 π',
            imageUrl: '/images/hotel.jpeg',
          },
        ]}
        
        ref={premiumRef}
        theme="premium"
        viewMoreHref="/competitions/premium"
      />
    </main>
  )
}

export async function getServerSideProps() {
  return { props: {} }
}
