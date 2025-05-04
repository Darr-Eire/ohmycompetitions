'use client'

import { useRef, useEffect } from 'react'
import Link from 'next/link'
import CompetitionCard from '@/components/CompetitionCard'

export default function HomePage() {
  // Refs for each carousel
  const dailyRef   = useRef(null)
  const freeRef    = useRef(null)
  const techRef    = useRef(null)
  const piRef      = useRef(null)
  const premiumRef = useRef(null)
  const SCROLL_STEP = 75

  // Reset scrollLeft when a carousel scrolls off-screen
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

  // Section: header + swipe-native carousel
  // inside your HomePage component:

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
      <h2 className={`category-page-title inline-block px-4 py-2 rounded mb-4 ${headingClass}`}>
        {title}
      </h2>

      {/* Scrollable carousel: visible only below lg, and no scrollbar at lg+ */}
      <div
        ref={containerRef}
        className={`
          ${theme}-carousel
          flex space-x-4
          overflow-x-auto
          scroll-smooth
          touch-pan-x

          /* HIDE on large screens */
          lg:hidden

          /* If you did keep it visible, this would kill the scrollbar at lg+ */
          lg:overflow-hidden
        `}
      >
        {items.map(item => (
          <CompetitionCard
            key={item.comp.slug + item.comp.endsAt}
            {...item}
            small
            theme={theme}
          />
        ))}
      </div>

      {/* View More button — also hide at lg */}
      <div className="view-more-card mt-2 mb-8 w-full flex justify-center">
        <Link
          href={viewMoreHref}
          className={`view-more-button view-more-${theme}`}
        >
          View More →
        </Link>
      </div>
    </section>
  )


  }
  const techItems = [
    {
      comp: { slug:'ps5-bundle-giveaway', entryFee:0.5, totalTickets:1100, ticketsSold:900, endsAt:'2025-05-07T14:00:00Z' },
      title:'PS5 Bundle Giveaway', prize:'PS5 + Extra Controller', fee:'0.5 π',
      href:'/competitions/ps5-bundle-giveaway', imageUrl:'/images/playstation.jpeg', theme:'tech'
    },
    {
      comp: { slug:'55-inch-tv-giveaway', entryFee:0.75, totalTickets:1400, ticketsSold:1200, endsAt:'2025-05-08T11:30:00Z' },
      title:'55″ TV Giveaway', prize:'55″ Smart TV', fee:'0.75 π',
      href:'/competitions/55-inch-tv-giveaway', imageUrl:'/images/tv.jpeg', theme:'tech'
    },
    {
      comp: { slug:'xbox-one-bundle', entryFee:0.6, totalTickets:2000, ticketsSold:1750, endsAt:'2025-05-09T17:45:00Z' },
      title:'Xbox One Bundle', prize:'Xbox One + Game Pass', fee:'0.6 π',
      href:'/competitions/xbox-one-bundle', imageUrl:'/images/xbox.jpeg', theme:'tech'
    },
  ]

  const premiumItems = [
    {
      comp: { slug:'tesla-model-3-giveaway', entryFee:50, totalTickets:20000, ticketsSold:5120, endsAt:'2025-05-20T23:59:00Z' },
      title:'Tesla Model 3 Giveaway', prize:'Tesla Model 3', fee:'50 π',
      href:'/competitions/tesla-model-3-giveaway', imageUrl:'/images/tesla.jpeg', theme:'premium'
    },
    {
      comp: { slug:'dubai-luxury-holiday', entryFee:25, totalTickets:15000, ticketsSold:7100, endsAt:'2025-05-18T22:00:00Z' },
      title:'Dubai Luxury Holiday', prize:'7‑Day Dubai Trip', fee:'25 π',
      href:'/competitions/dubai-luxury-holiday', imageUrl:'/images/dubai-luxury-holiday.jpg', theme:'premium'
    },
    {
      comp: { slug:'penthouse-hotel-stay', entryFee:15, totalTickets:5000, ticketsSold:4875, endsAt:'2025-05-15T21:00:00Z' },
      title:'Penthouse Hotel Stay', prize:'Your Choice Penthouse', fee:'15 π',
      href:'/competitions/macbook-pro-2025-giveaway', imageUrl:'/images/hotel.jpeg', theme:'premium'
    },
  ]

  const piItems = [
    {
      comp: { slug:'pi-giveaway-100k', entryFee:10, totalTickets:33000, ticketsSold:32000, endsAt:'2025-05-12T00:00:00Z' },
      title:'100 000 π Giveaway', prize:'100 000 π', fee:'10 π',
      href:'/competitions/pi-giveaway-100k', imageUrl:'/images/100,000.png', theme:'pi'
    },
    {
      comp: { slug:'pi-giveaway-50k', entryFee:5, totalTickets:17000, ticketsSold:16000, endsAt:'2025-05-11T00:00:00Z' },
      title:'50 000 π Giveaway', prize:'50 000 π', fee:'5 π',
      href:'/competitions/pi-giveaway-50k', imageUrl:'/images/50,000.png', theme:'pi'
    },
    {
      comp: { slug:'pi-giveaway-25k', entryFee:2.5, totalTickets:18500, ticketsSold:17500, endsAt:'2025-05-10T00:00:00Z' },
      title:'25 000 π Giveaway', prize:'25 000 π', fee:'2.5 π',
      href:'/competitions/pi-giveaway-25k', imageUrl:'/images/25,000.png', theme:'pi'
    },
  ]

  const dailyItems = [
    { comp:{slug:'daily-jackpot',entryFee:0.375,totalTickets:2225,ticketsSold:0,endsAt:'2025-05-03T23:59:59Z'}, title:'Daily Jackpot', prize:'750 π', fee:'0.375 π', href:'/competitions/daily-jackpot', imageUrl:'/images/jackpot.png', theme:'daily' },
    { comp:{slug:'everyday-pioneer',entryFee:0.314,totalTickets:1900,ticketsSold:0,endsAt:'2025-05-03T15:14:00Z'}, title:'Everyday Pioneer', prize:'1,000 π', fee:'0.314 π', href:'/competitions/everyday-pioneer', imageUrl:'/images/everyday.jpeg', theme:'daily' },
    { comp:{slug:'daily-pi-slice',entryFee:0.314,totalTickets:1900,ticketsSold:0,endsAt:'2025-05-03T15:14:00Z'}, title:'Daily Pi Slice', prize:'1,000 π', fee:'0.314 π', href:'/competitions/daily-pi-slice', imageUrl:'/images/daily.png', theme:'daily' },
  ]

  const freeItems = [
    {
      comp: { slug:'pi-day-freebie', entryFee:0, totalTickets:10000, ticketsSold:7500, endsAt:'2025-05-06T20:00:00Z' },
      title:'Pi‑Day Freebie', prize:'3,314 Reward', fee:'Free',
      href:'/competitions/pi-day-freebie', imageUrl:'/images/freebie.png', theme:'free'
    },
    {
      comp: { slug:'everyones-a-winner', entryFee:0, totalTickets:10000, ticketsSold:8500, endsAt:'2025-05-10T18:00:00Z' },
      title:'Everyone’s A Winner', prize:'6,000 / 3,000 / 1,000 π', fee:'Free',
      href:'/competitions/everyones-a-winner', imageUrl:'/images/everyone.png', theme:'free'
    },
    {
      comp: { slug:'weekly-pi-giveaway', entryFee:0, totalTickets:5000, ticketsSold:4200, endsAt:'2025-05-05T23:59:59Z' },
      title:'Weekly Pi Giveaway', prize:'1,000 π', fee:'Free',
      href:'/competitions/weekly-pi-giveaway', imageUrl:'/images/weekly.png', theme:'free'
    },
  ]

  return (
    <main className="pt-8 pb-12 px-4 bg-white min-h-screen space-y-16">
      <Section title="Tech Giveaways"       items={techItems}    containerRef={techRef}    theme="tech"    viewMoreHref="/competitions/tech"    />
      <Section title="Premium Competitions" items={premiumItems} containerRef={premiumRef} theme="premium" viewMoreHref="/competitions/premium" />
      <Section title="Pi Giveaways"         items={piItems}      containerRef={piRef}      theme="pi"      viewMoreHref="/competitions/pi"      />
      <Section title="Daily Competitions"   items={dailyItems}   containerRef={dailyRef}   theme="daily"   viewMoreHref="/competitions/daily"   />
      <Section title="Free Competitions"    items={freeItems}    containerRef={freeRef}    theme="free"    viewMoreHref="/competitions/free"    />
    </main>
  )
}

export async function getServerSideProps() {
  return { props: {} }
}
