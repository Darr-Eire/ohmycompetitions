// pages/index.jsx
'use client'
import React, { useState } from 'react'
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
      alert('Login failed—check console.')
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

  return (
    <>
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

      <main className="space-y-16 px-4 pb-12">
        {/* render your <Section> components for each items array */}
      </main>
    </>
  )
}