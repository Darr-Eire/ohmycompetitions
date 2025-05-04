// pages/index.js
'use client'

import { useRef, useEffect } from 'react'
import Link from 'next/link'
import CompetitionCard from '@/components/CompetitionCard'

// Sample data (use yours or import from a data file)
const techItems = [ {
  comp: {
    slug: 'ps5-bundle-giveaway',
    entryFee: 0.8,
    totalTickets: 1100,
    ticketsSold: 0,
    endsAt: '2025-05-07T14:00:00Z',
  },
  title: 'PS5 Bundle Giveaway',
  prize: 'PlayStation 5 + Extra Controller',
  fee: '0.8 π',
  href: '/competitions/ps5-bundle-giveaway',
  imageUrl: '/images/playstation.jpeg',
  theme: 'orange',
},
{
  comp: {
    slug: '55-inch-tv-giveaway',
    entryFee: 0.25,
    totalTickets: 1400,
    ticketsSold: 0,
    endsAt: '2025-05-08T11:30:00Z',
  },
  title: '55″ TV Giveaway',
  prize: '55″ Smart TV',
  fee: '0.25 π',
  href: '/competitions/55-inch-tv-giveaway',
  imageUrl: '/images/tv.jpg',
  theme: 'orange',
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
  prize: 'Xbox One + Game Pass',
  fee: '0.3 π',
  href: '/competitions/xbox-one-bundle',
  imageUrl: '/images/xbox.jpeg',
  theme: 'orange',
},]
const premiumItems = [{
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
},]
const piItems = [ {
  comp: {
    slug: 'pi-giveaway-250k',
    entryFee: 15,
    totalTickets: 50000,
    ticketsSold: 0,
    endsAt: '2025-06-01T00:00:00Z',
  },
  title: '250 000 π Mega Giveaway',
  prize: '250 000 π',
  fee: '15 π',
  href: '/competitions/pi-giveaway-250k',
  imageUrl: '/images/250000.png',
  theme: 'purple',
},
{
  comp: {
    slug: 'pi-giveaway-100k',
    entryFee: 10,
    totalTickets: 33000,
    ticketsSold: 0,
    endsAt: '2025-05-20T00:00:00Z',
  },
  title: '100 000 π Grand Giveaway',
  prize: '100 000 π',
  fee: '10 π',
  href: '/competitions/pi-giveaway-100k',
  imageUrl: '/images/100000.png',
  theme: 'purple',
}, {
  comp: {
    slug: 'pi-giveaway-50k',
    entryFee: 5,
    totalTickets: 17000,
    ticketsSold: 0,
    endsAt: '2025-05-11T00:00:00Z',
  },
  title: '50 000 π Big Giveaway',
  prize: '50 000 π',
  fee: '5 π',
  href: '/competitions/pi-giveaway-50k',
  imageUrl: '/images/50,000.png',
  theme: 'purple',
},

]
const dailyItems = [ 
  { comp:{slug:'daily-jackpot',entryFee:0.375,totalTickets:2225,ticketsSold:0,endsAt:'2025-05-03T23:59:59Z'}, title:'Daily Jackpot', prize:'750 π', fee:'0.375 π', href:'/competitions/daily-jackpot', imageUrl:'/images/jackpot.png', theme:'daily' },
  { comp:{slug:'everyday-pioneer',entryFee:0.314,totalTickets:1900,ticketsSold:0,endsAt:'2025-05-03T15:14:00Z'}, title:'Everyday Pioneer', prize:'1,000 π', fee:'0.314 π', href:'/competitions/everyday-pioneer', imageUrl:'/images/everyday.png', theme:'daily' },
  { comp:{slug:'daily-pi-slice',entryFee:0.314,totalTickets:1900,ticketsSold:0,endsAt:'2025-05-03T15:14:00Z'}, title:'Daily Pi Slice', prize:'1,000 π', fee:'0.314 π', href:'/competitions/daily-pi-slice', imageUrl:'/images/daily.png', theme:'daily' },

]



const freeItems = [ { comp:{slug:'pi-day-freebie', entryFee:0, totalTickets:10000, ticketsSold:0, endsAt:'2025-05-06T20:00:00Z'}, title:'Pi‑Day Freebie', href:'/competitions/pi-day-freebie', prize:'Special Badge', fee:'Free', imageUrl:'/images/freebie.png', theme:'green' },
  { comp:{slug:'everyone-wins',   entryFee:0, totalTickets:10000, ticketsSold:0, endsAt:'2025-05-10T18:00:00Z'}, title:"Everyone Wins",    href:'/competitions/everyones-a-winner', prize:'9,999 / 5,555 / 1,111 π', fee:'Free', imageUrl:'/images/everyone.png', theme:'green' },
  { comp:{slug:'weekly-giveaway', entryFee:0, totalTickets:5000,  ticketsSold:0, endsAt:'2025-05-05T23:59:59Z'}, title:'Weekly Giveaway',  href:'/competitions/weekly-pi-giveaway', prize:'1,000 π', fee:'Free', imageUrl:'/images/weekly.png', theme:'green' },]

function Section({ title, items, containerRef, theme, viewMoreHref }) {
  const headingStyles = {
    daily:   'bg-blue-600 text-white',
    free:    'bg-green-500 text-white',
    tech:    'bg-orange-500 text-white',
    pi:      'bg-purple-600 text-white',
    premium: 'bg-gray-800 text-white',
  }
  const headingClass = headingStyles[theme] || headingStyles.daily

  return (
    <section className="relative mb-12">
      <h2 className={`inline-block px-4 py-2 rounded mb-4 ${headingClass}`}>
        {title}
      </h2>

      {/* ─── Mobile swipe carousel ─── */}
      <div
        ref={containerRef}
        className={`
          ${theme}-carousel
          flex space-x-4 overflow-x-auto pb-4
          lg:hidden
        `}
      >
        {items.map(item => (
          <CompetitionCard
            key={item.comp.slug}
            {...item}
            small
            theme={theme}
          />
        ))}
      </div>

      {/* ─── Desktop grid ─── */}
      <div className="hidden lg:grid lg:grid-cols-3 gap-6">
        {items.map(item => (
          <CompetitionCard
            key={item.comp.slug}
            {...item}
            theme={theme}
          />
        ))}
      </div>

      {/* ─── View More (mobile only) ─── */}
      <div className="view-more-card mt-4 flex justify-center lg:hidden">
        <Link href={viewMoreHref} className={`view-more-button view-more-${theme}`}>
          View More →
        </Link>
      </div>
    </section>
  )
}

export default function HomePage() {
  const dailyRef   = useRef(null)
  const freeRef    = useRef(null)
  const techRef    = useRef(null)
  const piRef      = useRef(null)
  const premiumRef = useRef(null)

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

  return (
    <main className="pt-8 pb-12 px-4 bg-white min-h-screen space-y-16">
      <Section
        title="Tech Giveaways"
        items={techItems}
        containerRef={techRef}
        theme="tech"
        viewMoreHref="/competitions/tech"
      />
      <Section
        title="Premium Competitions"
        items={premiumItems}
        containerRef={premiumRef}
        theme="premium"
        viewMoreHref="/competitions/premium"
      />
      <Section
        title="Pi Giveaways"
        items={piItems}
        containerRef={piRef}
        theme="pi"
        viewMoreHref="/competitions/pi"
      />
      <Section
        title="Daily Competitions"
        items={dailyItems}
        containerRef={dailyRef}
        theme="daily"
        viewMoreHref="/competitions/daily"
      />
      <Section
        title="Free Competitions"
        items={freeItems}
        containerRef={freeRef}
        theme="free"
        viewMoreHref="/competitions/free"
      />
    </main>
  )
}
