'use client'

import { useRef, useEffect } from 'react'
import Link from 'next/link'
import CompetitionCard from '@/components/CompetitionCard'

export default function HomePage() {
  // refs for each carousel
  const dailyRef   = useRef(null)
  const freeRef    = useRef(null)
  const techRef    = useRef(null)
  const piRef      = useRef(null)
  const premiumRef = useRef(null)

  const SCROLL_STEP = 75

  // reset scrollLeft when scrolled off‐screen
  useEffect(() => {
    const onScroll = () => {
      for (const ref of [dailyRef, freeRef, techRef, piRef, premiumRef]) {
        const el = ref.current
        if (el?.getBoundingClientRect().bottom < 0) {
          el.scrollLeft = 0
        }
      }
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // helper to scroll by offset
  const scroll = (ref, offset) => {
    ref.current?.scrollBy({ left: offset, behavior: 'smooth' })
  }

  // Section component: header + native‑swipe carousel
  function Section({ title, items, containerRef, theme, viewMoreHref, className = '' }) {
    const headingStyles = {
      daily:   'bg-blue-600 text-white',
      free:    'bg-green-500 text-white',
      tech:    'bg-orange-500 text-white',
      pi:      'bg-purple-600 text-white',
      premium: 'bg-gray-800 text-white',
    }
    const headingClass = headingStyles[theme] || headingStyles.daily

    return (
      <section className={`relative ${className}`}>
        <h2
          className={`category-page-title inline-block px-4 py-2 rounded mb-4 ${headingClass}`}
        >
          {title}
        </h2>
        <div
          ref={containerRef}
          className={`${theme}-carousel flex space-x-4 overflow-x-auto scroll-smooth touch-pan-x`}
        >
          {items.map(item => (
            <CompetitionCard
              key={item.comp.slug + (item.comp.endsAt || '')}
              {...item}
              small
              theme={theme}
            />
          ))}
          <div className="view-more-card">
    <Link href={viewMoreHref} className={`view-more-button view-more-${theme}`}>
      View More →
    </Link>
          </div>
        </div>
      </section>
    )
  }
  const dailyItems = [
    { comp: { slug: 'everyday-pioneer', entryFee: 0.314 },      title: 'Everyday Pioneer',       prize: '1,000 PI Giveaway',        fee: '0.314 π',      href: '/competitions/everyday-pioneer',      imageUrl: '/images/everyday.png',              theme: 'daily'    },
    { comp: { slug: 'pi-to-the-moon', entryFee: 0.25 },          title: 'Pi To The Moon',          prize: '5,000 PI Prize',           fee: '3.14 π',      href: '/competitions/pi-to-the-moon',          imageUrl: '/images/pitothemoon.jpeg',         theme: 'daily'    },
    { comp: { slug: 'hack-the-vault', entryFee: 0.375 },        title: 'Hack The Vault',          prize: '750 PI Bounty',           fee: '0.375 π',     href: '/competitions/hack-the-vault',         imageUrl: '/images/vault.png',               theme: 'daily'    },,
  ]

  const freeItems = [
    { comp: { slug: 'pi-day-freebie', entryFee: 0 },            title: 'Pi Day Freebie',          prize: 'Pi Day Badge',             fee: 'Free',        href: '/competitions/pi-day-freebie',         imageUrl: '/images/freebie.png',              theme: 'green'    },
    { comp: { slug: 'everyones-a-winner', entryFee: 0 },        title: 'Everyone’s A Winner',     prize: '9999 / 5555 / 1111 π',      fee: 'Free',        href: '/competitions/everyones-a-winner',     imageUrl: '/images/everyone.png',             theme: 'green'    },
    { comp: { slug: 'weekly-pi-giveaway', entryFee: 0 },        title: 'Weekly Pi Giveaway',      prize: '1,000 π Giveaway',         fee: 'Free',        href: '/competitions/weekly-pi-giveaway',     imageUrl: '/images/weekly.png',               theme: 'green'    },
  ]
const techItems = [
    { comp: { slug: 'ps5-bundle-giveaway', entryFee: 0.5 },     title: 'PS5 Bundle Giveaway',     prize: 'PlayStation 5 + Extra Controller', fee: '0.5 π', href: '/competitions/ps5-bundle-giveaway', imageUrl: '/images/ps5.jpeg',                theme: 'orange'   },
    { comp: { slug: '55-inch-tv-giveaway', entryFee: 0.75 },    title: '55" TV Giveaway',         prize: '55" Smart TV',              fee: '0.75 π',     href: '/competitions/55-inch-tv-giveaway',    imageUrl: '/images/Tv.jpeg',                  theme: 'orange'   },
    { comp: { slug: 'xbox-one-bundle', entryFee: 0.6 },         title: 'Xbox One Bundle',         prize: 'Xbox One + Game Pass',      fee: '0.6 π',      href: '/competitions/xbox-one-bundle',        imageUrl: '/images/xbox.jpeg',                theme: 'orange'   },
  ]
const piItems = [
    { comp: { slug: 'pi-giveaway-100k', entryFee: 10 },         title: '100 000 π Giveaway',      prize: '100 000 π',                 fee: '10 π',       href: '/competitions/pi-giveaway-100k',       imageUrl: '/images/100,000.png',              theme: 'purple'   },
    { comp: { slug: 'pi-giveaway-50k', entryFee: 5 },           title: '50 000 π Giveaway',       prize: '50 000 π',                  fee: '5 π',        href: '/competitions/pi-giveaway-50k',        imageUrl: '/images/50,000.png',               theme: 'purple'   },
    { comp: { slug: 'pi-giveaway-25k', entryFee: 2.5 },         title: '25 000 π Giveaway',       prize: '25 000 π',                  fee: '2.5 π',      href: '/competitions/pi-giveaway-25k',        imageUrl: '/images/25,000.png',               theme: 'purple'   },
  ]
const premiumItems = [
{ comp: { slug: 'tesla-model-3-giveaway', entryFee: 50 },   title: 'Tesla Model 3 Giveaway',  prize: 'Tesla Model 3',             fee: '50 π',       href: '/competitions/tesla-model-3-giveaway', imageUrl: '/images/tesla.jpeg',               theme: 'premium'  },
    { comp: { slug: 'dubai-luxury-holiday', entryFee: 25 },     title: 'Dubai Luxury Holiday',     prize: '7-Day Dubai Trip',          fee: '25 π',       href: '/competitions/dubai-luxury-holiday',   imageUrl: '/images/dubai-luxury-holiday.jpg', theme: 'premium'  },
    { comp: { slug: 'penthouse-hotel-stay', entryFee: 15 },     title: 'Penthouse Hotel Stay',     prize: 'Penthouse Hotel Stay of your choice', fee: '15 π', href: '/competitions/macbook-pro-2025-giveaway', imageUrl: '/images/hotel.jpeg', theme: 'premium' },
 ]

  return (
    <main className="pt-8 pb-12 px-4 bg-white min-h-screen space-y-16">
      <Section
        title="Daily Competitions"
        items={dailyItems}
        containerRef={dailyRef}
        theme="daily"
        viewMoreHref="/competitions/daily"
        className="mt-8"
      />
      <Section
        title="Free Competitions"
        items={freeItems}
        containerRef={freeRef}
        theme="free"
        viewMoreHref="/competitions/free"
      />
      <Section
        title="Tech Giveaways"
        items={techItems}
        containerRef={techRef}
        theme="tech"
        viewMoreHref="/competitions/tech"
      />
      <Section
        title="Pi Giveaways"
        items={piItems}
        containerRef={piRef}
        theme="pi"
        viewMoreHref="/competitions/pi"
      />
      <Section
        title="Premium Competitions"
        items={premiumItems}
        containerRef={premiumRef}
        theme="premium"
        viewMoreHref="/competitions/premium"
      />
    </main>
  )
}

export async function getServerSideProps() {
  return { props: {} }
}