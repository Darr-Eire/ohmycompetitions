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
            comp: { slug: 'everyday-pioneer', entryFee: 0.314 },
            title: 'Everyday Pioneer',
            href: '/competitions/everyday-pioneer',
            prize: '1,000 PI Giveaway',
            fee: '0.314 π',
            imageUrl: '/images/everyday.png',
          },
          {
            comp: { slug: 'pi-to-the-moon', entryFee: 0.25 },
            title: 'Pi To The Moon',
            href: '/competitions/pi-to-the-moon',
            prize: '5,000 PI Prize',
            fee: '3.14 π',
            imageUrl: '/images/pitothemoon.jpeg',
          },
          {
            comp: { slug: 'hack-the-vault', entryFee: 0.375 },
            title: 'Hack The Vault',
            href: '/competitions/hack-the-vault',
            prize: '750 PI Bounty',
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
            comp: { slug: 'pi-day-freebie', entryFee: 0 },
            title: 'Pi Day Freebie',
            href: '/competitions/pi-day-freebie',
            prize: '🎉 Pi Day Badge',
            fee: 'Free',
            imageUrl: '/images/freebie.png',
          },
          {
            comp: { slug: 'everyones-a-winner', entryFee: 0 },
            title: "Everyone's A Winner",
            href: '/competitions/everyones-a-winner',
            prize: '🎉 1st 9999 2nd 5555 3rd 1111',
            fee: 'Free',
            imageUrl: '/images/everyone.png',
          },
          {
            comp: { slug: 'weekly-pi-giveaway', entryFee: 0 },
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
            comp: { slug: 'ps5-bundle-giveaway', entryFee: 0.5 },
            title: 'PS5 Bundle Giveaway',
            href: '/competitions/ps5-bundle-giveaway',
            prize: 'PlayStation 5 + Extra Controller',
            fee: '0.5 π',
            imageUrl: '/images/ps5.jpeg',
          },
          {
            comp: { slug: '55-inch-tv-giveaway', entryFee: 0.75 },
            title: '55" TV Giveaway',
            href: '/competitions/55-inch-tv-giveaway',
            prize: '55" Smart TV',
            fee: '0.75 π',
            imageUrl: '/images/Tv.jpeg',
          },
          {
            comp: { slug: 'xbox-one-bundle', entryFee: 0.6 },
            title: 'Xbox One Bundle',
            href: '/competitions/xbox-one-bundle',
            prize: 'Xbox One + Game Pass',
            fee: '0.6 π',
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
            comp: { slug: 'pi-giveaway-100k', entryFee: 10 },
            title: '100 000 π Giveaway',
            href: '/competitions/pi-giveaway-100k',
            prize: '100 000 π',
            fee: '10 π',
            imageUrl: '/images/100,000.png',
          },
          {
            comp: { slug: 'pi-giveaway-50k', entryFee: 5 },
            title: '50 000 π Giveaway',
            href: '/competitions/pi-giveaway-50k',
            prize: '50 000 π',
            fee: '5 π',
            imageUrl: '/images/50,000.png',
          },
          {
            comp: { slug: 'pi-giveaway-25k', entryFee: 2.5 },
            title: '25 000 π Giveaway',
            href: '/competitions/pi-giveaway-25k',
            prize: '25 000 π',
            fee: '2.5 π',
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
            comp: { slug: 'tesla-model-3-giveaway', entryFee: 50 },
            title: 'Tesla Model 3 Giveaway',
            href: '/competitions/tesla-model-3-giveaway',
            prize: 'Tesla Model 3',
            fee: '50 π',
            imageUrl: '/images/tesla.jpeg',
          },
          {
            comp: { slug: 'dubai-luxury-holiday', entryFee: 25 },
            title: 'Dubai Luxury Holiday',
            href: '/competitions/dubai-luxury-holiday',
            prize: '7-Day Dubai Trip',
            fee: '25 π',
            imageUrl: '/images/dubai-luxury-holiday.jpg',
          },
          {
            comp: { slug: 'penthouse-hotel-stay', entryFee: 15 },
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
