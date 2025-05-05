// pages/index.js
'use client'

import { useRef, useEffect, useState } from 'react'
import Link from 'next/link'
import CompetitionCard from '@/components/CompetitionCard'

export default function HomePage() {
  // Pi SDK + login state
  const [sdkReady, setSdkReady] = useState(false)
  const [loadingLogin, setLoadingLogin] = useState(false)
  const [piUser, setPiUser] = useState(null)
  const scopes = ['username', 'payments']

  // 1) Load & init the Pi SDK
  useEffect(() => {
    if (window.Pi) {
      setSdkReady(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://sdk.minepi.com/pi-sdk.js'
    script.async = true
    script.onload = () => {
      window.Pi.init({ version: '2.0', sandbox: true })
      console.log('✅ Pi SDK initialized')
      setSdkReady(true)
    }
    script.onerror = () => console.error('❌ Failed to load Pi SDK')
    document.head.appendChild(script)
  }, [])

  // 2) Catch incomplete payments
  function onIncompletePaymentFound(payment) {
    console.warn('Incomplete payment found:', payment)
  }

  // 3) Login handler
  async function handlePiLogin() {
    if (!sdkReady) {
      alert('Please wait—the Pi SDK is still loading.')
      return
    }
    setLoadingLogin(true)
    try {
      const { accessToken, user } = await window.Pi.authenticate(
        scopes,
        onIncompletePaymentFound
      )
      console.log('✅ Logged in Pioneer:', user.uid, user.username)
      setPiUser(user)
      // TODO: POST accessToken to your backend (/api/pi/verify)
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

  // Data arrays
  const techItems = [ /* your techItems objects here */ ]
  const premiumItems = [ /* your premiumItems objects here */ ]
  const piItems = [ /* your piItems objects here */ ]
  const dailyItems = [ /* your dailyItems objects here */ ]
  const freeItems = [ /* your freeItems objects here */ ]

  // Reset scroll on scroll-out
  useEffect(() => {
    const onScroll = () => {
      [techRef, premiumRef, piRef, dailyRef, freeRef].forEach(ref => {
        const el = ref.current
        if (el && el.getBoundingClientRect().bottom < 0) {
          el.scrollLeft = 0
        }
      })
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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
            disabled={!sdkReady || loadingLogin}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
          >
            {!sdkReady
              ? 'Loading Pi SDK…'
              : loadingLogin
              ? 'Logging in…'
              : 'Log in with Pi'}
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
    <section className="mb-12" ref={containerRef}>
      <h2 className={`text-center px-4 py-2 rounded ${headingClass}`}>{title}</h2>
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
      <div className="text-center mt-4">
        <Link href={viewMoreHref}>
          <a className="bg-blue-600 text-white py-2 px-6 rounded-full hover:bg-blue-700 transition">
            View More
          </a>
        </Link>
      </div>
    </section>
  )
}
