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
      console.error('❌ Pi.authenticate error:', err)
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
    { comp: { slug: 'ps5-bundle-giveaway', entryFee: 0.8, totalTickets: 1100, ticketsSold: 0, endsAt: '2025-05-07T14:00:00Z' }, title: 'PS5 Bundle Giveaway', prize: 'PlayStation 5 + Extra Controller', fee: '0.8 π', href: '/competitions/ps5-bundle-giveaway', imageUrl: '/images/playstation.jpeg', theme: 'tech' },
    { comp: { slug: '55-inch-tv-giveaway', entryFee: 0.25, totalTickets: 1400, ticketsSold: 0, endsAt: '2025-05-08T11:30:00Z' }, title: '55″ TV Giveaway', prize: '55″ Smart TV', fee: '0.25 π', href: '/competitions/55-inch-tv-giveaway', imageUrl: '/images/tv.jpg', theme: 'tech' },
    { comp: { slug: 'xbox-one-bundle', entryFee: 0.3, totalTickets: 2000, ticketsSold: 0, endsAt: '2025-05-09T17:45:00Z' }, title: 'Xbox One Bundle', prize: 'Xbox One + Game Pass', fee: '0.3 π', href: '/competitions/xbox-one-bundle', imageUrl: '/images/xbox.jpeg', theme: 'tech' }
  ]
  const premiumItems = [
    { comp: { slug: 'tesla-model-3-giveaway', entryFee: 40, totalTickets: 20000, ticketsSold: 5120, endsAt: '2025-05-20T23:59:00Z' }, title: 'Tesla Model 3 Giveaway', prize: 'Tesla Model 3', fee: '40 π', href: '/competitions/tesla-model-3-giveaway', imageUrl: '/images/tesla.jpeg', theme: 'premium' },
    { comp: { slug: 'dubai-luxury-holiday', entryFee: 20, totalTickets: 15000, ticketsSold: 7100, endsAt: '2025-05-18T22:00:00Z' }, title: 'Dubai Luxury Holiday', prize: '7-Day Dubai Trip', fee: '20 π', href: '/competitions/dubai-luxury-holiday', imageUrl: '/images/dubai-luxury-holiday.jpg', theme: 'premium' },
    { comp: { slug: 'penthouse-hotel-stay', entryFee: 15, totalTickets: 5000, ticketsSold: 4875, endsAt: '2025-05-15T21:00:00Z' }, title: 'Penthouse Hotel Stay', prize: 'Penthouse Hotel Stay of your choice', fee: '15 π', href: '/competitions/penthouse-hotel-stay', imageUrl: '/images/hotel.jpeg', theme: 'premium' }
  ]
  const piItems = [
    { comp: { slug: 'pi-giveaway-250k', entryFee: 15, totalTickets: 50000, ticketsSold: 0, endsAt: '2025-06-01T00:00:00Z' }, title: '250 000 π Mega Giveaway', prize: '250 000 π', fee: '15 π', href: '/competitions/pi-giveaway-250k', imageUrl: '/images/250000.png', theme: 'pi' },
    { comp: { slug: 'pi-giveaway-100k', entryFee: 10, totalTickets: 33000, ticketsSold: 0, endsAt: '2025-05-20T00:00:00Z' }, title: '100 000 π Grand Giveaway', prize: '100 000 π', fee: '10 π', href: '/competitions/pi-giveaway-100k', imageUrl: '/images/100000.png', theme: 'pi' },
    { comp: { slug: 'pi-giveaway-50k', entryFee: 5, totalTickets: 17000, ticketsSold: 0, endsAt: '2025-05-11T00:00:00Z' }, title: '50 000 π Big Giveaway', prize: '50 000 π', fee: '5 π', href: '/competitions/pi-giveaway-50k', imageUrl: '/images/50000.png', theme: 'pi' }
  ]
  const dailyItems = [
    { comp: { slug: 'daily-jackpot', entryFee: 0.375, totalTickets: 2225, ticketsSold: 0, endsAt: '2025-05-03T23:59:59Z' }, title: 'Daily Jackpot', prize: '750 π', fee: '0.375 π', href: '/competitions/daily-jackpot', imageUrl: '/images/jackpot.png', theme: 'daily' },
    { comp: { slug: 'everyday-pioneer', entryFee: 0.314, totalTickets: 1900, ticketsSold: 0, endsAt: '2025-05-03T15:14:00Z' }, title: 'Everyday Pioneer', prize: '1,000 π', fee: '0.314 π', href: '/competitions/everyday-pioneer', imageUrl: '/images/everyday.png', theme: 'daily' },
    { comp: { slug: 'daily-pi-slice', entryFee: 0.314, totalTickets: 1900, ticketsSold: 0, endsAt: '2025-05-03T15:14:00Z' }, title: 'Daily Pi Slice', prize: '1,000 π', fee: '0.314 π', href: '/competitions/daily-pi-slice', imageUrl: '/images/daily.png', theme: 'daily' }
  ]
  const freeItems = [
    { comp: { slug: 'pi-day-freebie', entryFee: 0, totalTickets: 10000, ticketsSold: 0, endsAt: '2025-05-06T20:00:00Z' }, title: 'Pi-Day Freebie', prize: 'Special Badge', fee: 'Free', href: '/competitions/pi-day-freebie', imageUrl: '/images/piday.png', theme: 'free' },
    { comp: { slug: 'pi-miners-bonanza', entryFee: 0, totalTickets: 10000, ticketsSold: 0, endsAt: '2025-05-10T18:00:00Z' }, title: 'Pi Miners Bonanza', prize: '5000 π', fee: 'Free', href: '/competitions/pi-miners-bonanza', imageUrl: '/images/bonanza.png', theme: 'free' },
    { comp: { slug: 'weekly-giveaway', entryFee: 0, totalTickets: 5000, ticketsSold: 0, endsAt: '2025-05-05T23:59:59Z' }, title: 'Weekly Giveaway', prize: '1,000 π', fee: 'Free', href: '/competitions/weekly-pi-giveaway', imageUrl: '/images/weekly.png', theme: 'free' }
  ]

  useEffect(() => {
    function onScroll() {
      ;[techRef, premiumRef, piRef, dailyRef, freeRef].forEach(r => {
        const el = r.current
        if (el && el.getBoundingClientRect().bottom < 0) el.scrollLeft = 0
      })
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <div className="mb-8 text-center">
        {piUser ? (
          <p className="text-green-600">Welcome, {piUser.username || piUser.uid}!</p>
        ) : (
          <button
            onClick={handlePiLogin}
            disabled={loadingLogin}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
          >
            {loadingLogin ? 'Logging in…' : 'Log in with Pi'}
          </button>
        )}
      </div>

      <main className="pt-4 space-y-16 px-4"> 
        <Section title="Tech Giveaways" items={techItems} containerRef={techRef} theme="tech" viewMoreHref="/competitions/tech" />
        <Section title="Premium Competitions" items={premiumItems} containerRef={premiumRef} theme="premium" viewMoreHref="/competitions/premium" />
        <Section title="Pi Giveaways" items={piItems} containerRef={piRef} theme="pi" viewMoreHref="/competitions/pi" />
        <Section title="Daily Competitions" items={dailyItems} containerRef={dailyRef} theme="daily" viewMoreHref="/competitions/daily" />
        <Section title="Free Competitions" items={freeItems} containerRef={freeRef} theme="free" viewMoreHref="/competitions/free" />
      </main>
    </>
  )
}

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
      <h2 className={`text-center px-4 py-2 rounded ${headingClass}`}>{title}</h2>
      <div className="centered-carousel lg:hidden">
        {items.map(item => (
          <CompetitionCard key={item.comp.slug} {...item} small />
        ))}
      </div>
      <div className="hidden lg:grid lg:grid-cols-3 gap-6">
        {items.map(item => (
          <CompetitionCard key={item.comp.slug} {...item} />
        ))}
      </div>
      <div className="text-center mt-4">
        <Link href={viewMoreHref} className="inline-block bg-blue-600 text-white py-2 px-6 rounded-full hover:bg-blue-700 transition">
          View More
        </Link>
      </div>
    </section>
}
