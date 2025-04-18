'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Competition } from '@/lib/types'

interface Props {
  competition: Competition
}

export default function ThousandPiCompetitionCard({ competition }: Props) {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    const end = new Date(competition.endDate)

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
  }, [competition.endDate])

  return (
    <div className="bg-white shadow-md rounded-xl border border-blue-300 overflow-hidden w-full max-w-sm mx-auto hover:shadow-lg transition">
      <img
        src={competition.imageUrl}
        alt={competition.title}
        className="w-full h-48 object-contain rounded-t-xl bg-white p-2"
      />

      <div className="p-4 space-y-2">
        <h2 className="text-xl font-bold text-blue-600">{competition.title}</h2>
        <div className="text-sm text-black font-semibold">⏳ {timeLeft}</div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">🎟️ {competition.ticketsToSell} Tickets</span>
          <span className="text-gray-600">💰 Entry: {competition.entryFee}π</span>
        </div>

        <Link
          href={`/ticket-purchase/${competition.slug}`}
          className="block w-full text-center mt-3 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
        >
          Enter Now
        </Link>
      </div>
    </div>
  )
}
