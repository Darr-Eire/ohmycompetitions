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
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-blue-600 text-center mb-4 mx-auto">
          🎯 All Competitions
        </h2>
      </div>

      {/* Carousel */}
      <div className="relative">
        {/* Carousel container */}
        <div ref={carouselRef} className="daily-carousel">
          {competitions.length > 0 ? (
            competitions.map((comp) => (
              <CompetitionCard
                key={comp._id}
                title={comp.title}
                prize={comp.prize}
                fee={`${comp.fee} π`}
                href={`/competitions/${comp.slug}`}
                small
              />
            ))
          ) : (
            <p className="text-center text-gray-500">Loading competitions...</p>
          )}
        </div>
      </div>
    </main>
  )
}

