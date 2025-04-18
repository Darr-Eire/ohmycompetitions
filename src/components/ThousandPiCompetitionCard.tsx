'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function ThousandPiCompetitionCard() {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    const end = new Date('2025-04-25T15:14:00Z') // Example end date

    const updateCountdown = () => {
      const now = new Date()
      const diff = end.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeLeft('Ended')
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
      const minutes = Math.floor((diff / 1000 / 60) % 60)
      const seconds = Math.floor((diff / 1000) % 60)

      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`)
    }

    updateCountdown()
    const timer = setInterval(updateCountdown, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="bg-white shadow-md rounded-xl border border-blue-300 overflow-hidden w-full max-w-sm mx-auto hover:shadow-lg transition">
      <img
  src="/pi.jpeg"
  alt="1000 Pi Giveaway"
  className="w-full h-48 object-contain rounded-t-xl bg-white p-2"
/>

      <div className="p-4 space-y-2">
        <h2 className="text-xl font-bold text-blue-600">1000 Pi Giveaway</h2>
        <p className="text-sm text-gray-600">Enter to win 1000 Pi — open to all pioneers!</p>

        <div className="text-sm text-black font-semibold">⏳ {timeLeft}</div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">🎟️ 314 Tickets</span>
          <span className="text-gray-600">💰 Entry: 0.314π</span>
        </div>

        <Link
  href="/ticket-purchase/1000-pi-giveaway"
  className="block w-full text-center mt-3 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
>
  Enter Now
</Link>

      </div>
    </div>
  )
}
