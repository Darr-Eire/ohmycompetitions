// pages/index.jsx
// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import CompetitionCard from '@/components/CompetitionCard'

export default function HomePage() {
  const [loadingLogin, setLoadingLogin] = useState(false)
  const [piUser, setPiUser] = useState(null)
  const scopes = ['username', 'payments']

  useEffect(() => {
    if (window.Pi?.getCurrentPioneer) {
      window.Pi.getCurrentPioneer()
        .then(user => {
          if (user) {
            console.log('♻️ Restored Pi session:', user.uid)
            setPiUser(user)
          }
        })
        .catch(err => console.error('Error restoring Pi session', err))
    }
  }, [])

  async function handlePiLogin() {
    setLoadingLogin(true)
    try {
      const { accessToken, user } = await window.Pi.authenticate(scopes)
      console.log('✅ Pioneer logged in:', user.uid)
      setPiUser(user)
    } catch (err) {
      console.error('❌ Login error:', err)
      alert('Login failed—see console.')
    } finally {
      setLoadingLogin(false)
    }
  }

  const techItems = [
    {
      comp: { slug: 'ps5-bundle-giveaway', entryFee: 0.8, totalTickets: 1100, ticketsSold: 0, endsAt: '2025-05-07T14:00:00Z' },
      title: 'PS5 Bundle Giveaway',
      prize: 'PlayStation 5 + Extra Controller',
      fee: '0.8 π',
      href: '/competitions/ps5-bundle-giveaway',
      imageUrl: '/images/playstation.jpeg',
      theme: 'tech',
    },
    {
      comp: { slug: '55-inch-tv-giveaway', entryFee: 0.25, totalTickets: 1400, ticketsSold: 0, endsAt: '2025-05-08T11:30:00Z' },
      title: '55″ TV Giveaway',
      prize: '55″ Smart TV',
      fee: '0.25 π',
      href: '/competitions/55-inch-tv-giveaway',
      imageUrl: '/images/tv.jpg',
      theme: 'tech',
    },
    {
      comp: { slug: 'xbox-one-bundle', entryFee: 0.3, totalTickets: 2000, ticketsSold: 0, endsAt: '2025-05-09T17:45:00Z' },
      title: 'Xbox One Bundle',
      prize: 'Xbox One + Game Pass',
      fee: '0.3 π',
      href: '/competitions/xbox-one-bundle',
      imageUrl: '/images/xbox.jpeg',
      theme: 'tech',
    },
    {
      comp: { slug: 'tesla-model-3-giveaway', entryFee: 40, totalTickets: 20000, ticketsSold: 5120, endsAt: '2025-05-20T23:59:00Z' },
      title: 'Tesla Model 3 Giveaway',
      prize: 'Tesla Model 3',
      fee: '40 π',
      href: '/competitions/tesla-model-3-giveaway',
      imageUrl: '/images/tesla.jpeg',
      theme: 'premium',
    },
    {
      comp: { slug: 'dubai-luxury-holiday', entryFee: 20, totalTickets: 15000, ticketsSold: 7100, endsAt: '2025-05-18T22:00:00Z' },
      title: 'Dubai Luxury Holiday',
      prize: '7‑Day Dubai Trip',
      fee: '20 π',
      href: '/competitions/dubai-luxury-holiday',
      imageUrl: '/images/dubai-luxury-holiday.jpg',
      theme: 'premium',
    },
    {
      comp: { slug: 'penthouse-hotel-stay', entryFee: 15, totalTickets: 5000, ticketsSold: 4875, endsAt: '2025-05-15T21:00:00Z' },
      title: 'Penthouse Hotel Stay',
      prize: 'Penthouse Hotel Stay of your choice',
      fee: '15 π',
      href: '/competitions/penthouse-hotel-stay',
      imageUrl: '/images/hotel.jpeg',
      theme: 'premium',
    },
  ]

  return (
    <>
      {/* Pi Login Section */}
      <div className="mb-8 text-center">
        {piUser ? (
          <p className="text-green-600">Welcome, {piUser.username || piUser.uid}!</p>
        ) : (
          <button
            onClick={handlePiLogin}
            disabled={loadingLogin}
            className="neon button"
          >
            {loadingLogin ? 'Logging in…' : 'Log in with Pi'}
          </button>
        )}
      </div>

      {/* Competitions Section */}
     <main className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
  <Section
    title="Tech + Premium Giveaways"
    items={techItems}
    viewMoreHref="/competitions"
  />
</main>

    </>
  )
}

function Section({ title, items, viewMoreHref }) {
  return (
    <section className="mb-12">
      <h2 className="text-center px-4 py-2 text-lg font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 rounded shadow mb-6 font-orbitron">
        {title}
      </h2>

      {/* Mobile carousel */}
      <div className="centered-carousel lg:hidden">
        {items.map(item => (
          <CompetitionCard key={item.comp.slug} {...item} small />
        ))}
      </div>

      {/* Desktop grid */}
      <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {items.map(item => (
          <CompetitionCard key={item.comp.slug} {...item} />
        ))}
      </div>

      <div className="text-center mt-6">
        <Link
          href={viewMoreHref}
          className="neon-button"
        >
          View More
        </Link>
      </div>
    </section>
  )
}
