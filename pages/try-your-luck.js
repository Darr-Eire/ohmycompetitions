'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getStreak } from '@/lib/streak'

export default function TryYourLuckPage() {
  const [streak, setStreak] = useState(0)
  const [playedMap, setPlayedMap] = useState({})

  const games = [
    {
      title: '3.14 Seconds',
      href: '/try-your-luck/three-fourteen',
      icon: '🕒',
      desc: 'Stop the timer at exactly 3.14s to win!',
      storageKey: 'threeFourteenPlayed',
    },
    {
      title: 'Pi Slot Machine',
      href: '/try-your-luck/slot-machine',
      icon: '🎰',
      desc: 'Match 3 Pi symbols to win!',
      storageKey: 'slotMachinePlayed',
    },
    {
      title: 'Hack the Vault',
      href: '/try-your-luck/hack-the-vault',
      icon: '🗝️',
      desc: 'Guess today’s vault code!',
      storageKey: 'hackVaultPlayed',
    },
    {
      title: 'Mystery Wheel',
      href: '/try-your-luck/mystery-wheel',
      icon: '🎡',
      desc: 'Spin the wheel for a surprise!',
      storageKey: 'mysteryWheelPlayed',
    },
  ]

  useEffect(() => {
    setStreak(getStreak())

    const map = {}
    games.forEach((game) => {
      const played = localStorage.getItem(game.storageKey)
      map[game.storageKey] = !!played
    })
    setPlayedMap(map)
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-br from-yellow-100 via-pink-100 to-purple-100 p-4">
      <div className="max-w-xl mx-auto competition-card">
        <div className="competition-top-banner text-white text-xl font-bold">
          🎯 Try Your Luck
        </div>

        <div className="text-center mb-4 text-lg text-black">
          🔥 Daily Streak: {streak} days
        </div>

        <div className="space-y-6 px-4">
          {games.map((game) => {
            const played = playedMap[game.storageKey]

            return (
              <div
                key={game.href}
                className={`bg-white border border-blue-200 shadow rounded-xl p-4 text-center transition-all ${
                  played ? 'opacity-50 pointer-events-none' : ''
                }`}
              >
                <h2 className="text-lg font-bold text-blue-700 flex justify-center items-center gap-2">
                  <span className="text-2xl">{game.icon}</span> {game.title}
                </h2>

                <p className="text-sm text-gray-700 mb-3">{game.desc}</p>

                {!played ? (
                  <Link href={game.href}>
                    <button className="comp-button">Play Now</button>
                  </Link>
                ) : (
                  <p className="text-gray-500 text-sm">Already played today</p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
