// pages/competitions/index.js
'use client'

import { useRef } from 'react'
import CompetitionCard from '@/components/CompetitionCard'

export default function AllCompetitions() {
  // 1) Create a ref via useRef (no quotes)
  const carouselRef = useRef(null)

  const dailyComps = [
    {
      title: 'Everyday Pioneer',
      href: '/competitions/everyday-pioneer',
      prize: '1,000 PI Giveaway',
      fee: '0.314 π',
    },
    {
      title: 'Pi To The Moon',
      href: '/competitions/pi-to-the-moon',
      prize: '500 PI Prize',
      fee: '0.250 π',
    },
    {
      title: 'Hack The Vault',
      href: '/competitions/hack-the-vault',
      prize: '750 PI Bounty',
      fee: '0.375 π',
    },
  ]

  // 2) Scroll helper that targets the ref you created
  const scroll = (offset) => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: offset, behavior: 'smooth' })
    }
  }

  return (
<main className="pt-0 pb-12 px-4 space-y-8 bg-white min-h-screen">
      {/* Daily Competitions Header */}
      <div className="text-center">
      <h2 className="text-2xl font-bold text-amber-700 mb-0">
          🎯 Daily Competitions
        </h2>
      </div>

      {/* Carousel with left/right buttons */}
      <div className="relative">
        <button
          onClick={() => scroll(-240)}
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow"
          aria-label="Scroll left"
        >
          ‹
        </button>

        {/* 3) Attach the hook-based ref here */}
        <div ref={carouselRef} className="daily-carousel">
          {dailyComps.map((c) => (
            <CompetitionCard
              key={c.href}
              title={c.title}
              prize={c.prize}
              fee={c.fee}
              href={c.href}
              small
            />
          ))}
        </div>

        <button
          onClick={() => scroll(240)}
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow"
          aria-label="Scroll right"
        >
          ›
        </button>
      </div>
    </main>
  )
}
