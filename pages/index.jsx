'use client'
// pages/index.jsx

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import CompetitionCard from '@/components/CompetitionCard'

export default function HomePage() {
  // — Pi login state —
  const [piUser, setPiUser]       = useState(null)
  const [loadingLogin, setLoading] = useState(false)
  const scopes = ['username', 'payments']

  // Trigger Pi login
  async function handlePiLogin() {
    setLoading(true)
    try {
      const { user } = await window.Pi.authenticate(scopes)
      console.log('✅ Pioneer logged in:', user.uid)
      setPiUser(user)
    } catch (err) {
      console.error('❌ Login error:', err)
      alert('Login failed—see console.')
    } finally {
      setLoading(false)
    }
  }

  // Carousel refs
  const techRef    = useRef(null)
  const premiumRef = useRef(null)
  const piRef      = useRef(null)
  const dailyRef   = useRef(null)
  const freeRef    = useRef(null)

  // Reset any scrolled‐out carousels on page scroll
  useEffect(() => {
    const onScroll = () => {
      for (const ref of [techRef, premiumRef, piRef, dailyRef, freeRef]) {
        const el = ref.current
        if (el?.getBoundingClientRect().bottom < 0) {
          el.scrollLeft = 0
        }
      }
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // === Competition data ===
  const techItems = [
    {
      comp: { slug: 'ps5-bundle-giveaway' },
      title: 'PS5 Bundle Giveaway',
      prize: 'PlayStation 5 + Extra Controller',
      fee: '0.8 π',
      href: '/ticket-purchase/ps5-bundle-giveaway',
      imageUrl: '/images/playstation.jpeg',
      theme: 'tech',
    },
    {
      comp: { slug: '55-inch-tv-giveaway' },
      title: '55″ TV Giveaway',
      prize: '55″ Smart TV',
      fee: '0.25 π',
      href: '/ticket-purchase/55-inch-tv-giveaway',
      imageUrl: '/images/tv.jpg',
      theme: 'tech',
    },
    {
      comp: { slug: 'xbox-one-bundle' },
      title: 'Xbox One Bundle',
      prize: 'Xbox One + Game Pass',
      fee: '0.3 π',
      href: '/ticket-purchase/xbox-one-bundle',
      imageUrl: '/images/xbox.jpeg',
      theme: 'tech',
    },
  ]

  const premiumItems = [
    {
      comp: { slug: 'tesla-model-3-giveaway' },
      title: 'Tesla Model 3 Giveaway',
      prize: 'Tesla Model 3',
      fee: '40 π',
      href: '/ticket-purchase/tesla-model-3-giveaway',
      imageUrl: '/images/tesla.jpeg',
      theme: 'premium',
    },
    {
      comp: { slug: 'dubai-luxury-holiday' },
      title: 'Dubai Luxury Holiday',
      prize: '7-Day Dubai Trip',
      fee: '20 π',
      href: '/ticket-purchase/dubai-luxury-holiday',
      imageUrl: '/images/dubai-luxury-holiday.jpg',
      theme: 'premium',
    },
    {
      comp: { slug: 'penthouse-hotel-stay' },
      title: 'Penthouse Hotel Stay',
      prize: 'Penthouse Hotel Stay of your choice',
      fee: '15 π',
      href: '/ticket-purchase/penthouse-hotel-stay',
      imageUrl: '/images/hotel.jpeg',
      theme: 'premium',
    },
  ]

  const piItems = [
    {
      comp: { slug: 'pi-giveaway-250k' },
      title: '250 000 π Mega Giveaway',
      prize: '250 000 π',
      fee: '15 π',
      href: '/ticket-purchase/pi-giveaway-250k',
      imageUrl: '/images/250000.png',
      theme: 'pi',
    },
    {
      comp: { slug: 'pi-giveaway-100k' },
      title: '100 000 π Grand Giveaway',
      prize: '100 000 π',
      fee: '10 π',
      href: '/ticket-purchase/pi-giveaway-100k',
      imageUrl: '/images/100000.png',
      theme: 'pi',
    },
    {
      comp: { slug: 'pi-giveaway-50k' },
      title: '50 000 π Big Giveaway',
      prize: '50 000 π',
      fee: '5 π',
      href: '/ticket-purchase/pi-giveaway-50k',
      imageUrl: '/images/50000.png',
      theme: 'pi',
    },
  ]

  const dailyItems = [
    {
      comp: { slug: 'daily-jackpot' },
      title: 'Daily Jackpot',
      prize: '750 π',
      fee: '0.375 π',
      href: '/ticket-purchase/daily-jackpot',
      imageUrl: '/images/jackpot.png',
      theme: 'daily',
    },
    {
      comp: { slug: 'everyday-pioneer' },
      title: 'Everyday Pioneer',
      prize: '1,000 π',
      fee: '0.314 π',
      href: '/ticket-purchase/everyday-pioneer',
      imageUrl: '/images/everyday.png',
      theme: 'daily',
    },
    {
      comp: { slug: 'daily-pi-slice' },
      title: 'Daily Pi Slice',
      prize: '1,000 π',
      fee: '0.314 π',
      href: '/ticket-purchase/daily-pi-slice',
      imageUrl: '/images/daily.png',
      theme: 'daily',
    },
  ]

  const freeItems = [
    {
      comp: { slug: 'pi-day-freebie' },
      title: 'Pi-Day Freebie',
      prize: 'Special Badge',
      fee: 'Free',
      href: '/ticket-purchase/pi-day-freebie',
      imageUrl: '/images/piday.png',
      theme: 'free',
    },
    {
      comp: { slug: 'pi-miners-bonanza' },
      title: 'Pi Miners Bonanza',
      prize: '5000 π',
      fee: 'Free',
      href: '/ticket-purchase/pi-miners-bonanza',
      imageUrl: '/images/bonanza.png',
      theme: 'free',
    },
    {
      comp: { slug: 'weekly-giveaway' },
      title: 'Weekly Giveaway',
      prize: '1,000 π',
      fee: 'Free',
      href: '/ticket-purchase/weekly-giveaway',
      imageUrl: '/images/weekly.png',
      theme: 'free',
    },
  ]

  return (
    <>
      {/* Pi Login Section */}
      <div className="mb-8 text-center">
        {piUser ? (
          <p className="text-green-600">
            Welcome, {piUser.username || piUser.uid}!
          </p>
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

      {/* Competitions */}
      <main className="space-y-16 px-4 pb-12">
        <Section title="Tech Giveaways"    items={techItems}    containerRef={techRef}    theme="tech" />
        <Section title="Premium Competitions" items={premiumItems} containerRef={premiumRef} theme="premium" />
        <Section title="Pi Giveaways"      items={piItems}      containerRef={piRef}      theme="pi" />
        <Section title="Daily Competitions"  items={dailyItems}    containerRef={dailyRef}    theme="daily" />
        <Section title="Free Competitions"   items={freeItems}     containerRef={freeRef}     theme="free" />
      </main>
    </>
  )
}

// Section component
function Section({ title, items, containerRef, theme }) {
  const headingStyles = {
    tech:    'bg-orange-500 text-white',
    premium: 'bg-gray-800 text-white',
    pi:      'bg-purple-600 text-white',
    daily:   'bg-blue-600 text-white',
    free:    'bg-green-500 text-white',
  }
  const headingClass = headingStyles[theme] || ''

  return (
    <section ref={containerRef} className="mb-12">
      <h2 className={`text-center px-4 py-2 rounded ${headingClass}`}>{title}</h2>
      {/* Mobile carousel */}
      <div className="centered-carousel lg:hidden">
        {items.map(item => (
          <CompetitionCard key={item.comp.slug} {...item} small theme={theme} />
        ))}
      </div>
      {/* Desktop grid */}
      <div className="hidden lg:grid lg:grid-cols-3 gap-6">
        {items.map(item => (
          <CompetitionCard key={item.comp.slug} {...item} theme={theme} />
        ))}
      </div>
    </section>
  )
}
