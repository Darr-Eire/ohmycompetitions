'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'

const winners = [
  { name: 'Jack Jim', prize: 'Matchday Tickets', date: 'March 26th', image: '/images/winner2.png' },
  { name: 'Shanahan', prize: 'Playstation 5', date: 'February 14th', image: '/images/winner2.png' },
  { name: 'Emily Rose', prize: 'Luxury Car', date: 'January 30th', image: '/images/winner2.png' },
  { name: 'John Doe', prize: '10,000 Pi', date: 'December 15th', image: '/images/winner2.png' },
]

export default function TopWinnersCarousel() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % winners.length)
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const current = winners[index]

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl shadow-lg p-6 text-white text-center max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">🏆 Top Winners</h2>
      <div className="flex flex-col items-center">
        <Image
          src={current.image}
          alt={current.name}
          width={120}
          height={120}
          className="rounded-full border-4 border-blue-500 mb-4"
        />
        <h3 className="text-xl font-semibold text-white">{current.name}</h3>
        <p className="text-blue-300">{current.prize}</p>
        <p className="text-sm text-white/70">{current.date}</p>
      </div>
    </div>
  )
}
