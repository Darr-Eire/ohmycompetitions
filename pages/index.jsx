// pages/index.jsx
// @ts-nocheck
import React, { useRef, useEffect, useState } from 'react'
import Link from 'next/link'
import CompetitionCard from '@/components/CompetitionCard'

export default function HomePage() {
  const [loadingLogin, setLoadingLogin] = useState(false)
  const [piUser, setPiUser] = useState(null)
  const scopes = ['username', 'payments']

  async function handlePiLogin() {
    setLoadingLogin(true)
    try {
      const { accessToken, user } = await window.Pi.authenticate(
        scopes,
        payment => console.warn('Incomplete payment:', payment)
      )
      console.log('✅ Pioneer logged in:', user.uid)
      setPiUser(user)
      // TODO: POST accessToken to /api/pi/verify
    } catch (err) {
      console.error('❌ Login error:', err)
      alert('Login failed—see console.')
    } finally {
      setLoadingLogin(false)
    }
  }

  // Carousel refs
  const techRef = useRef(null)
  const premiumRef = useRef(null)
  const piRef = useRef(null)
  const dailyRef = useRef(null)
  const freeRef = useRef(null)

  // Competition data
  const techItems = [
    {
      comp: { slug: 'ps5-bundle-giveaway', entryFee: 0.8, totalTickets: 1100, ticketsSold: 0, endsAt: '2025-05-07T14:00:00Z' },
      title: 'PS5 Bundle Giveaway',
      prize: 'PlayStation 5 + Extra Controller',
      fee: '0.8 π',
      href: '/competitions/ps5-bundle-giveaway',
      imageUrl: '/images/playstation.jpeg',
      theme: 'tech',
    },
    {
      comp: { slug: '55-inch-tv-giveaway', entryFee: 0.25, totalTickets: 1400, ticketsSold: 0, endsAt: '2025-05-08T11:30:00Z' },
      title: '55″ TV Giveaway',
      prize: '55″ Smart TV',
      fee: '0.25 π',
      href: '/competitions/55-inch-tv-giveaway',
      imageUrl: '/images/tv.jpg',
      theme: 'tech',
    },
    {
      comp: { slug: 'xbox-one-bundle', entryFee: 0.3, totalTickets: 2000, ticketsSold: 0, endsAt: '2025-05-09T17:45:00Z' },
      title: 'Xbox One Bundle',
      prize: 'Xbox One + Game Pass',
      fee: '0.3 π',
      href: '/competitions/xbox-one-bundle',
      imageUrl: '/images/xbox.jpeg',
      theme: 'tech',
    },
  ]

  const premiumItems = [
    /* same structure as above for Tesla, Dubai, Penthouse */
  ]
  const piItems = [
    /* your π giveaways */
  ]
  const dailyItems = [
    /* your daily competitions */
  ]
  const freeItems = [
    /* your free competitions */
  ]

  // Reset scroll when scrolled past
  useEffect(() => {
    function onScroll() {
      ;[techRef, premiumRef, piRef, dailyRef, freeRef].forEach(r => {
        const el = r.current
        if (el?.getBoundingClientRect().bottom < 0) el.scrollLeft = 0
      })
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      {/* Pi Login */}
      <div className="mb-8 text-center">
        {piUser ? (
          <p className="text-green-600">
            Welcome, {piUser.username || piUser.uid}!
          </p>
        ) : (
          <button
            onClick={handlePiLogin}
            disabled={loadingLogin}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            {loadingLogin ? 'Logging in…' : 'Log in with Pi'}
          </button>
        )}
      </div>

      {/* Competitions */}
      <main className="space-y-16 px-4 pb-12">
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
    </>
  )
}

// Section component
function Section({ title, items, containerRef, theme, viewMoreHref }) {
  const headingStyles = {
    tech: 'bg-orange-500 text-white',
    premium: 'bg-gray-800 text-white',
    pi: 'bg-purple-600 text-white',
    daily: 'bg-blue-600 text-white',
    free: 'bg-green-500 text-white',
  }
  const headingClass = headingStyles[theme] || headingStyles.tech

  return (
    <section ref={containerRef} className="mb-12">
      <h2 className={`text-center px-4 py-2 rounded ${headingClass}`}>
        {title}
      </h2>

      {/* Mobile carousel */}
      <div className="centered-carousel lg:hidden">
        {items.map(item => (
          <CompetitionCard key={item.comp.slug} {...item} small />
        ))}
      </div>

      {/* Desktop grid */}
      <div className="hidden lg:grid lg:grid-cols-3 gap-6">
        {items.map(item => (
          <CompetitionCard key={item.comp.slug} {...item} />
        ))}
      </div>

      {/* View More */}
      <div className="text-center mt-4">
        <Link
          href={viewMoreHref}
          className="inline-block bg-blue-600 text-white py-2 px-6 rounded-full hover:bg-blue-700"
        >
          View More
        </Link>
      </div>
    </section>
  )
}
