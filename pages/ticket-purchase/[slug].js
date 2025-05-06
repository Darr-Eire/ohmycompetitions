'use client'
// pages/ticket-purchase/[slug].js

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import BuyTicketButton from '@/components/BuyTicketButton'
import Link from 'next/link'

// Competition lookup
const COMPETITIONS = {
  'ps5-bundle-giveaway': {
    title: 'PS5 Bundle Giveaway',
    prize: 'PlayStation 5 + Extra Controller',
    entryFee: 0.8,
    imageUrl: '/images/playstation.jpeg',
  },
  // …other slugs…
}

export default function TicketPurchasePage() {
  const router = useRouter()
  const { slug } = router.query

  const [piUser, setPiUser] = useState(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const [loadingLogin, setLoadingLogin] = useState(false)

  // Restore Pi session on load
  useEffect(() => {
    if (!router.isReady) return
    if (!window.Pi?.getCurrentPioneer) {
      setLoadingUser(false)
      return
    }
    window.Pi.getCurrentPioneer()
      .then(user => {
        if (user) setPiUser(user)
      })
      .catch(console.error)
      .finally(() => setLoadingUser(false))
  }, [router.isReady])

// Centralized login handler for this page
async function handlePiLogin() {
  setLoadingLogin(true)
  try {
    // Ask for username+payments scope up‑front
    const { accessToken, user } = await window.Pi.authenticate([
      'username',
      'payments'
    ])
    console.log('✅ Pioneer logged in:', user)
    setPiUser(user)
  } catch (err) {
    console.error('❌ Purchase‑page login error:', err)
    // show the real error message
    alert(`Login failed: ${err.message || err}`)
  } finally {
    setLoadingLogin(false)
  }
}


  if (!router.isReady) return null
  const comp = COMPETITIONS[slug]
  if (!comp) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold">Competition Not Found</h1>
        <p className="mt-4">We couldn’t find “{slug}”.</p>
        <Link href="/" className="mt-6 inline-block text-blue-600 underline">
          Back to Home
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto p-6 space-y-8">
      {/* Hero */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold">{comp.title}</h1>
        <p className="text-gray-600">Entry Fee: {comp.entryFee} π</p>
      </div>

      {/* Prize Image */}
      {comp.imageUrl && (
        <img
          src={comp.imageUrl}
          alt={comp.title}
          className="w-full rounded-xl shadow-lg"
        />
      )}

      {/* Purchase Card */}
      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <h2 className="text-xl font-semibold">Your Ticket</h2>
        <p className="text-gray-700">
          You’re about to enter for <strong>{comp.prize}</strong> at{' '}
          <strong>{comp.entryFee} π</strong> per ticket.
        </p>

        {loadingUser ? (
          <p className="text-center text-gray-500">Checking session…</p>
        ) : !piUser ? (
          <button
            onClick={handlePiLogin}
            disabled={loadingLogin}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            {loadingLogin ? 'Logging in…' : 'Log in with Pi to continue'}
          </button>
        ) : (
          <BuyTicketButton
            competitionSlug={slug}
            entryFee={comp.entryFee}
          />
        )}
      </div>

      <Link href="/" className="block text-center text-blue-600 underline">
        ← Back to Competitions
      </Link>
    </div>
  )
}
