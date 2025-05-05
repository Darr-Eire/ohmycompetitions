'use client'
// pages/index.jsx
import React, { useState, useRef, useEffect } from 'react'
import CompetitionCard from '@/components/CompetitionCard'
import Link from 'next/link'

export default function HomePage() {
  // — Pi login state —
  const [piUser, setPiUser] = useState(null)
  const [loadingLogin, setLoadingLogin] = useState(false)

  // Always ask for payments up-front
  const scopes = ['username', 'payments']

  // 1) Trigger Pi login
  async function handlePiLogin() {
    setLoadingLogin(true)
    try {
      // prompts user for both username + payments
      const { accessToken, user } = await window.Pi.authenticate(scopes)
      console.log('✅ Pioneer logged in:', user.uid, user.username)
      setPiUser(user)
      // TODO: send accessToken to your backend (/api/pi/verify)
    } catch (err) {
      console.error('❌ Pi.authenticate error:', err)
      alert('Login failed—see console for details')
    } finally {
      setLoadingLogin(false)
    }
  }

  // — carousels reset refs (unchanged) —
  const techRef    = useRef(null)
  const premiumRef = useRef(null)
  const piRef      = useRef(null)
  const dailyRef   = useRef(null)
  const freeRef    = useRef(null)
  useEffect(() => {
    const onScroll = () => [techRef, premiumRef, piRef, dailyRef, freeRef].forEach(r => {
      const el = r.current
      if (el?.getBoundingClientRect().bottom < 0) el.scrollLeft = 0
    })
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // === Competition data ===
  const techItems = [
    { comp: { slug: 'ps5-bundle-giveaway', entryFee: 0.8, totalTickets:1100, ticketsSold:0, endsAt:'2025-05-07T14:00:00Z' },
      title:'PS5 Bundle Giveaway', prize:'PlayStation 5 + Controller', fee:'0.8 π',
      href:'/ticket-purchase/ps5-bundle-giveaway', imageUrl:'/images/playstation.jpeg', theme:'tech' },
    { comp: { slug: '55-inch-tv-giveaway', entryFee: 0.25, totalTickets:1400, ticketsSold:0, endsAt:'2025-05-08T11:30:00Z' },
      title:'55″ TV Giveaway', prize:'55″ Smart TV', fee:'0.25 π',
      href:'/ticket-purchase/55-inch-tv-giveaway', imageUrl:'/images/tv.jpg', theme:'tech' },
    { comp: { slug: 'xbox-one-bundle', entryFee: 0.3, totalTickets:2000, ticketsSold:0, endsAt:'2025-05-09T17:45:00Z' },
      title:'Xbox One Bundle', prize:'Xbox One + Game Pass', fee:'0.3 π',
      href:'/ticket-purchase/xbox-one-bundle', imageUrl:'/images/xbox.jpeg', theme:'tech' }
  ]

  const premiumItems = [
    { comp:{slug:'tesla-model-3-giveaway',entryFee:40,totalTickets:20000,ticketsSold:5120,endsAt:'2025-05-20T23:59:00Z'},
      title:'Tesla Model 3 Giveaway', prize:'Tesla Model 3', fee:'40 π',
      href:'/ticket-purchase/tesla-model-3-giveaway', imageUrl:'/images/tesla.jpeg', theme:'premium' },
    { comp:{slug:'dubai-luxury-holiday',entryFee:20,totalTickets:15000,ticketsSold:7100,endsAt:'2025-05-18T22:00:00Z'},
      title:'Dubai Luxury Holiday', prize:'7-Day Dubai Trip', fee:'20 π',
      href:'/ticket-purchase/dubai-luxury-holiday', imageUrl:'/images/dubai-luxury-holiday.jpg', theme:'premium' },
    { comp:{slug:'penthouse-hotel-stay',entryFee:15,totalTickets:5000,ticketsSold:4875,endsAt:'2025-05-15T21:00:00Z'},
      title:'Penthouse Hotel Stay', prize:'Penthouse Hotel Stay', fee:'15 π',
      href:'/ticket-purchase/penthouse-hotel-stay', imageUrl:'/images/hotel.jpeg', theme:'premium' }
  ]

  const piItems = [
    { comp:{slug:'pi-giveaway-250k',entryFee:15,totalTickets:50000,ticketsSold:0,endsAt:'2025-06-01T00:00:00Z'},
      title:'250 000 π Mega Giveaway', prize:'250 000 π', fee:'15 π',
      href:'/ticket-purchase/pi-giveaway-250k', imageUrl:'/images/250000.png', theme:'pi' },
    { comp:{slug:'pi-giveaway-100k',entryFee:10,totalTickets:33000,ticketsSold:0,endsAt:'2025-05-20T00:00:00Z'},
      title:'100 000 π Grand Giveaway', prize:'100 000 π', fee:'10 π',
      href:'/ticket-purchase/pi-giveaway-100k', imageUrl:'/images/100000.png', theme:'pi' },
    { comp:{slug:'pi-giveaway-50k',entryFee:5,totalTickets:17000,ticketsSold:0,endsAt:'2025-05-11T00:00:00Z'},
      title:'50 000 π Big Giveaway', prize:'50 000 π', fee:'5 π',
      href:'/ticket-purchase/pi-giveaway-50k', imageUrl:'/images/50000.png', theme:'pi' }
  ]

  const dailyItems = [
    { comp:{slug:'daily-jackpot',entryFee:0.375,totalTickets:2225,ticketsSold:0,endsAt:'2025-05-03T23:59:59Z'},
      title:'Daily Jackpot', prize:'750 π', fee:'0.375 π',
      href:'/ticket-purchase/daily-jackpot', imageUrl:'/images/jackpot.png', theme:'daily' },
    { comp:{slug:'everyday-pioneer',entryFee:0.314,totalTickets:1900,ticketsSold:0,endsAt:'2025-05-03T15:14:00Z'},
      title:'Everyday Pioneer', prize:'1 000 π', fee:'0.314 π',
      href:'/ticket-purchase/everyday-pioneer', imageUrl:'/images/everyday.png', theme:'daily' },
    { comp:{slug:'daily-pi-slice',entryFee:0.314,totalTickets:1900,ticketsSold:0,endsAt:'2025-05-03T15:14:00Z'},
      title:'Daily Pi Slice', prize:'1 000 π', fee:'0.314 π',
      href:'/ticket-purchase/daily-pi-slice', imageUrl:'/images/daily.png', theme:'daily' }
  ]

  const freeItems = [
    { comp:{slug:'pi-day-freebie',entryFee:0,totalTickets:10000,ticketsSold:0,endsAt:'2025-05-06T20:00:00Z'},
      title:'Pi-Day Freebie', prize:'Special Badge', fee:'Free',
      href:'/ticket-purchase/pi-day-freebie', imageUrl:'/images/piday.png', theme:'free' },
    { comp:{slug:'pi-miners-bonanza',entryFee:0,totalTickets:10000,ticketsSold:0,endsAt:'2025-05-10T18:00:00Z'},
      title:'Pi Miners Bonanza', prize:'5000 π', fee:'Free',
      href:'/ticket-purchase/pi-miners-bonanza', imageUrl:'/images/bonanza.png', theme:'free' },
    { comp:{slug:'weekly-giveaway',entryFee:0,totalTickets:5000,ticketsSold:0,endsAt:'2025-05-05T23:59:59Z'},
      title:'Weekly Giveaway', prize:'1 000 π', fee:'Free',
      href:'/ticket-purchase/weekly-giveaway', imageUrl:'/images/weekly.png', theme:'free' }
  ]

  return (
    <>
      {/* — Pi Login Section — */}
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

      {/* — Competitions Listings — */}
      <main className="space-y-16 px-4 pb-12">
        {/* your <Section … /> calls go here */}
      </main>
    </>
  )
}