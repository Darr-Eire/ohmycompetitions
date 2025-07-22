'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

export default function TopWinnersCarousel() {
  const winners = [
    // Add winners here like:
    // { name: 'Alice', prize: 'PlayStation 5', date: 'June 12th', image: '/images/winner2.png' }
  ]

  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (winners.length === 0) return

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % winners.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [winners.length])

  // ✅ Prevent crash when no winners
  if (winners.length === 0) {
    return (
      <div className="max-w-md mx-auto mt-12 bg-[#0a1024]/90 border border-cyan-500 backdrop-blur-lg rounded-xl shadow-[0_0_40px_#00fff055] p-6 text-white text-center font-orbitron">
        <h2 className="text-2xl font-bold text-cyan-300 mb-4">Top Winners</h2>
        <p className="text-white/80">No winners yet — your name could be the first! 🎉</p>
      </div>
    )
  }

  const current = winners[index]

  return (
    <div className="max-w-md mx-auto mt-12 bg-[#0a1024]/90 border border-cyan-500 backdrop-blur-lg rounded-xl shadow-[0_0_40px_#00fff055] p-6 text-white text-center font-orbitron">
      <h2 className="text-2xl font-bold text-cyan-300 mb-4">Top Winners</h2>
      <div className="flex justify-center items-center mb-4">
        <Image
          src={current.image}
          alt={current.name}
          width={120}
          height={120}
          className="rounded-full border-4 border-cyan-400 shadow-lg"
        />
      </div>
      <h3 className="text-xl font-semibold">{current.name}</h3>
      <p className="text-cyan-200">{current.prize}</p>
      <p className="text-sm text-white/70">{current.date}</p>
    </div>
  )
}
