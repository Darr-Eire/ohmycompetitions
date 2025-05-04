// pages/index.js
'use client'

import { useRef, useEffect } from 'react'
import Link from 'next/link'
import CompetitionCard from '@/components/CompetitionCard'

// === Data arrays ===
const techItems = [ /* …your techItems…*/ ]
const premiumItems = [ /* …your premiumItems…*/ ]
const piItems = [ /* …your piItems…*/ ]
const dailyItems = [ /* …your dailyItems…*/ ]
const freeItems = [ /* …your freeItems…*/ ]

// === Section component ===
function Section({ title, items, containerRef, theme, viewMoreHref }) {
  const headingStyles = {
    daily:   'bg-blue-600 text-white',
    free:    'bg-green-500 text-white',
    tech:    'bg-orange-500 text-white',
    pi:      'bg-purple-600 text-white',
    premium: 'bg-gray-800 text-white',
  }
  const headingClass = headingStyles[theme] || headingStyles.tech

  return (
    <section className="relative mb-12">
      <h2 className={`w-full text-center px-4 py-2 rounded mb-4 ${headingClass}`}>
        {title}
      </h2>

      {/* Mobile carousel */}
      <div
        ref={containerRef}
        className={`${theme}-carousel flex space-x-4 overflow-x-auto pb-4 lg:hidden`}
      >
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

      {/* “View More” (mobile only) */}
      <div className="view-more-card mt-4 flex justify-center lg:hidden">
        <Link
          href={viewMoreHref}
          className={`view-more-button view-more-${theme}`}
        >
          View More →
        </Link>
      </div>
    </section>
  )
}

// === HomePage ===
export default function HomePage() {
  const dailyRef   = useRef(null)
  const freeRef    = useRef(null)
  const techRef    = useRef(null)
  const piRef      = useRef(null)
  const premiumRef = useRef(null)

  useEffect(() => {
    const onScroll = () => {
      for (const ref of [dailyRef, freeRef, techRef, piRef, premiumRef]) {
        const el = ref.current
        if (el?.getBoundingClientRect().bottom < 0) {
          el.scrollLeft = 0
        }
      }
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <main className="pt-8 pb-12 px-4 min-h-screen space-y-16">
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
  )
}
