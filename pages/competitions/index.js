// pages/all-competitions.js
// pages/all-competitions.js
'use client'

import { useRef, useEffect, useState } from 'react'
import CompetitionCard from '@/components/CompetitionCard'

export default function AllCompetitions() {
  const carouselRef = useRef(null)
  const [competitions, setCompetitions] = useState([])

  useEffect(() => {
    async function fetchCompetitions() {
      try {
        const res = await fetch('/api/competitions')
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        setCompetitions(data)
      } catch (error) {
        console.error('Failed to load competitions:', error)
      }
    }
    fetchCompetitions()
  }, [])

  const scroll = (offset) => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: offset, behavior: 'smooth' })
    }
  }

  return (
    <main className="pt-0 pb-12 px-4 space-y-8 bg-white min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-blue-600 mb-4">
          🎯 All Competitions
        </h2>
      </div>

      <div className="relative">
        <button
          onClick={() => scroll(-300)}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow"
          aria-label="Scroll left"
        >
          ‹
        </button>

        <div
          ref={carouselRef}
          className="flex space-x-4 overflow-x-auto scrollbar-hide scroll-smooth"
        >
          {competitions.length > 0 ? (
            competitions.map((comp) => (
              <CompetitionCard
                key={comp._id}
                title={comp.title}
                prize={comp.prize}
                fee={comp.entryFee != null ? `${comp.entryFee} π` : 'Free'}
                href={`/competitions/${comp.slug}`}
                small
              />
            ))
          ) : (
            <p className="text-center text-gray-500 w-full">
              Loading competitions...
            </p>
          )}
        </div>
      </div>
    </main>
  )
}
