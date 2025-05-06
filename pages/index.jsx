// pages/index.jsx
// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import CompetitionCard from '@/components/CompetitionCard'

export default function HomePage() {
  const [loadingLogin, setLoadingLogin] = useState(false)
  const [piUser, setPiUser] = useState(null)
  const scopes = ['username', 'payments']

  async function handlePiLogin() {
    setLoadingLogin(true)
    try {
      const { accessToken, user } = await window.Pi.authenticate(scopes)
      setPiUser(user)
    } catch (err) {
      console.error(err)
      alert('Login failed')
    } finally {
      setLoadingLogin(false)
    }
  }

  const techRef = useRef(null)
  const premiumRef = useRef(null)
  const piRef = useRef(null)
  const dailyRef = useRef(null)
  const freeRef = useRef(null)

  useEffect(() => {
    const onScroll = () => [techRef, premiumRef, piRef, dailyRef, freeRef].forEach(ref => {
      const el = ref.current
      if (el && el.getBoundingClientRect().bottom < 0) el.scrollLeft = 0
    })
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Example items array; expand as needed
  const techItems = [
    {
      comp: { slug: 'ps5-bundle-giveaway' },
      title: 'PS5 Bundle Giveaway',
      prize: 'PlayStation 5 + Extra Controller',
      fee: '0.8 π',
      href: '/ticket-purchase/ps5-bundle-giveaway',
      imageUrl: '/images/playstation.jpeg',
      theme: 'tech',
    }
]

  return (
    <>
      <div className="mb-8 text-center">
        {piUser ? (
          <p className="text-green-600">Welcome, {piUser.username || piUser.uid}!</p>
        ) : (
          <button onClick={handlePiLogin} disabled={loadingLogin} className="bg-blue-600 text-white p-2 rounded">
            {loadingLogin ? 'Logging in…' : 'Log in with Pi'}
          </button>
        )}
      </div>

      <main className="space-y-8 px-4 pb-12">
        <Section title="Tech Giveaways" items={techItems} containerRef={techRef} theme="tech" viewMoreHref="/competitions/tech" />
      </main>
    </>
  )
}

function Section({ title, items, containerRef, theme, viewMoreHref }) {
  const headingStyles = { tech: 'bg-orange-500 text-white' }
  const headingClass = headingStyles[theme] || ''

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
        <Link href={viewMoreHref} className="bg-blue-600 text-white py-2 px-6 rounded-full hover:bg-blue-700">
          View More
        </Link>
      </div>
    </section>
  )
}
