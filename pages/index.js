// pages/index.js
'use client'

import { useRef, useEffect } from 'react'
import Link from 'next/link'
import CompetitionCard from '@/components/CompetitionCard'

export default function HomePage() {
  // Carousel refs
  const dailyRef   = useRef(null)
  const freeRef    = useRef(null)
  const techRef    = useRef(null)
  const piRef      = useRef(null)
  const premiumRef = useRef(null)

  // Scroll step for arrow clicks
  const SCROLL_STEP = 75

  // Smooth scroll helper
  const scroll = (ref, offset) => {
    ref.current?.scrollBy({ left: offset, behavior: 'smooth' })
  }

  // Reset carousels when scrolled out of view
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

  // Tiny sponsor banner component
  const SponsorBanner = ({ href, img, alt }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="sponsor-banner"
    >
      <img src={img} alt={alt} className="w-full h-auto" />
    </a>
  )

  // Reusable section with header, arrows, friction on touch
  const Section = ({ title, items, containerRef, theme = 'global', viewMoreHref, className = '' }) => {
    const headingStyles = {
      global:  'bg-blue-600 text-white',
      daily:   'bg-blue-600 text-white',
      green:   'bg-green-500 text-white',
      orange:  'bg-orange-500 text-white',
      purple:  'bg-purple-600 text-white',
      premium: 'bg-gray-800 text-white',
    }
    const headingClass = headingStyles[theme]

    // Touch friction on mobile
    useEffect(() => {
      const el = containerRef.current
      if (!el) return
      const FRICTION = 0.3
      let startX = 0, startScroll = 0

      const onTouchStart = e => {
        startX = e.touches[0].pageX
        startScroll = el.scrollLeft
      }
      const onTouchMove = e => {
        const delta = startX - e.touches[0].pageX
        el.scrollLeft = startScroll + delta * FRICTION
        e.preventDefault()
      }

      el.addEventListener('touchstart', onTouchStart, { passive: true })
      el.addEventListener('touchmove', onTouchMove,   { passive: false })
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
        <div className="relative">
          <button
            onClick={() => scroll(containerRef, -SCROLL_STEP)}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow"
          >‹</button>

          <div
            ref={containerRef}
            className="daily-carousel flex space-x-4 overflow-x-auto scroll-smooth"
          >
            {items.map(item => (
              <CompetitionCard
                key={item.comp.slug + (item.comp.endsAt || '')}
                {...item}
                small
                theme={theme}
                className="transform scale-95 transition-all duration-200"
              />
            ))}
            <div className="flex items-center justify-center min-w-[280px] h-full">
              <Link href={viewMoreHref} className={`view-more-button view-more-${theme}`}>
                View More →
              </Link>
            </div>
          </div>

          <button
            onClick={() => scroll(containerRef, SCROLL_STEP)}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow"
          >›</button>
        </div>
      </section>
    )
  }

  // Data for each section
  const dailyItems = [
    { comp:{slug:'pi-to-the-moon',entryFee:3.14,totalTickets:1900,ticketsSold:0,endsAt:'2025-05-04T12:00:00Z'}, title:'Pi To The Moon', prize:'5,000 π', fee:'3.14 π', href:'/competitions/pi-to-the-moon', imageUrl:'/images/pitothemoon.jpeg', theme:'daily' },
    { comp:{slug:'everyday-pioneer',entryFee:0.314,totalTickets:1900,ticketsSold:0,endsAt:'2025-05-03T15:14:00Z'}, title:'Everyday Pioneer', prize:'1,000 π', fee:'0.314 π', href:'/competitions/everyday-pioneer', imageUrl:'/images/everyday.png', theme:'daily' },
    { comp:{slug:'hack-the-vault',entryFee:0.375,totalTickets:2225,ticketsSold:0,endsAt:'2025-05-03T23:59:59Z'}, title:'Hack The Vault', prize:'750 π', fee:'0.375 π', href:'/competitions/hack-the-vault', imageUrl:'/images/vault.png', theme:'daily' },
  ]

  const freeItems = [
    { comp:{slug:'pi-day-freebie',entryFee:0,totalTickets:10000,ticketsSold:0,endsAt:'2025-05-06T20:00:00Z'}, title:'Pi‑Day Freebie', prize:'Special Badge', fee:'Free', href:'/competitions/pi-day-freebie', imageUrl:'/images/freebie.png', theme:'green' },
    { comp:{slug:'everyone-wins',entryFee:0,totalTickets:10000,ticketsSold:0,endsAt:'2025-05-10T18:00:00Z'}, title:'Everyone Wins', prize:'9,999 / 5,555 / 1,111 π', fee:'Free', href:'/competitions/everyones-a-winner', imageUrl:'/images/everyone.png', theme:'green' },
    { comp:{slug:'weekly-giveaway',entryFee:0,totalTickets:5000,ticketsSold:0,endsAt:'2025-05-05T23:59:59Z'}, title:'Weekly Giveaway', prize:'1,000 π', fee:'Free', href:'/competitions/weekly-pi-giveaway', imageUrl:'/images/weekly.png', theme:'green' },
  ]

  const techItems = [
    { comp:{slug:'ps5-bundle',entryFee:0.8,totalTickets:1100,ticketsSold:0,endsAt:'2025-05-07T14:00:00Z'}, title:'PS5 Bundle', prize:'PS5 + Controller', fee:'0.8 π', href:'/competitions/ps5-bundle-giveaway', imageUrl:'/images/ps5.jpeg', theme:'orange' },
    { comp:{slug:'tv-giveaway-55',entryFee:0.25,totalTickets:1400,ticketsSold:0,endsAt:'2025-05-08T11:30:00Z'}, title:'55″ TV Giveaway', prize:'55″ Smart TV', fee:'0.25 π', href:'/competitions/55-inch-tv-giveaway', imageUrl:'/images/Tv.jpeg', theme:'orange' },
    { comp:{slug:'xbox-one-bundle',entryFee:0.3,totalTickets:2000,ticketsSold:0,endsAt:'2025-05-09T17:45:00Z'}, title:'Xbox One Bundle', prize:'Xbox + Game Pass', fee:'0.3 π', href:'/competitions/xbox-one-bundle', imageUrl:'/images/xbox.jpeg', theme:'orange' },
  ]

  const piItems = [
    { comp:{slug:'big-pi-100k',entryFee:10,totalTickets:33000,ticketsSold:0,endsAt:'2025-05-12T00:00:00Z'}, title:'100 000 π Giveaway', prize:'100 000 π', fee:'10 π', href:'/competitions/pi-giveaway-100k', imageUrl:'/images/100,000.png', theme:'purple' },
    { comp:{slug:'big-pi-50k', entryFee:5,totalTickets:17000,ticketsSold:0,endsAt:'2025-05-11T00:00:00Z'}, title:'50 000 π Giveaway', prize:'50 000 π', fee:'5 π', href:'/competitions/pi-giveaway-50k', imageUrl:'/images/50,000.png', theme:'purple' },
    { comp:{slug:'big-pi-25k', entryFee:1.5,totalTickets:18500,ticketsSold:0,endsAt:'2025-05-10T00:00:00Z'}, title:'25 000 π Giveaway', prize:'25 000 π', fee:'1.5 π', href:'/competitions/pi-giveaway-25k', imageUrl:'/images/25,000.png', theme:'purple' },
  ]

  const premiumItems = [
    { comp:{slug:'tesla-giveaway', entryFee:40,totalTickets:20000,ticketsSold:5120,endsAt:'2025-05-20T23:59:00Z'}, title:'Tesla Model 3 Giveaway', prize:'Tesla Model 3', fee:'40 π', href:'/competitions/tesla-model-3-giveaway', imageUrl:'/images/tesla.jpeg', theme:'premium' },
    { comp:{slug:'dubai-trip',      entryFee:20,totalTickets:15000,ticketsSold:7100,endsAt:'2025-05-18T22:00:00Z'}, title:'Dubai Luxury Trip',       prize:'7 Day Dubai Holiday', fee:'20 π', href:'/competitions/dubai-luxury-holiday', imageUrl:'/images/dubai-luxury-holiday.jpg', theme:'premium' },
    { comp:{slug:'penthouse-stay',  entryFee:15,totalTickets:5000, ticketsSold:4875,endsAt:'2025-05-15T21:00:00Z'}, title:'Penthouse Hotel Stay',   prize:'Your Choice Penthouse', fee:'15 π', href:'/competitions/macbook-pro-2025-giveaway', imageUrl:'/images/hotel.jpeg', theme:'premium' },
  ]

  return (
    <main className="pt-8 pb-12 px-4 bg-white min-h-screen space-y-16">
      {/* sponsor banners */}
  <div className="sponsor-row flex gap-6 mb-8">
    <SponsorBanner href="https://sponsor1.com" img="/images/sponsor-banner.png" alt="Sponsor 1"/>
 </div>

      {/* competition sections */}
      <Section title="Daily Competitions"   containerRef={dailyRef}   theme="daily"   viewMoreHref="/competitions/daily"   items={dailyItems}   className="mt-8" />
      <Section title="Free Competitions"    containerRef={freeRef}    theme="green"   viewMoreHref="/competitions/free"    items={freeItems}    />
      <Section title="Tech Giveaways"       containerRef={techRef}    theme="orange" viewMoreHref="/competitions/tech"    items={techItems}   />
      <Section title="Pi Giveaways"         containerRef={piRef}      theme="purple" viewMoreHref="/competitions/pi"      items={piItems}    />
      <Section title="Premium Competitions" containerRef={premiumRef} theme="premium" viewMoreHref="/competitions/premium" items={premiumItems}/>
    </main>
  )
}

export async function getServerSideProps() {
  return { props: {} }
}
