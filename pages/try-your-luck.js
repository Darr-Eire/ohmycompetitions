// pages/try-your-luck.js
'use client'

import Head from 'next/head'
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
      map[game.storageKey] = !!localStorage.getItem(game.storageKey)
    })
    setPlayedMap(map)
  }, [])

  return (
    <>
      <Head>
        <title>Try Your Luck | OhMyCompetitions</title>
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-yellow-100 via-pink-100 to-purple-100 p-4">
        <div className="max-w-xl mx-auto competition-card">

          {/* Page banner */}
          <div className="competition-top-banner bg-blue-600 text-white text-xl font-semibold text-center px-4 py-2">
            🎯 Try Your Luck
          </div>

          {/* Divider */}
          <div className="h-1 w-24 bg-blue-300 mx-auto rounded mb-6" />

          {/* Intro & streak */}
          <div className="text-center mb-6 px-4">
            <p className="text-2xl font-extrabold text-black mb-2">
              🎉 Welcome to the OhMyCompetitions “Try Your Luck” Page!  
              Win free tickets, unlock daily rewards, spin for mystery prizes,  
              and rack up piles of <span className="text-purple-600">π</span> every day!
            </p>
            <p className="text-xl font-bold text-red-600">
              🔥 Daily Streak: {streak} days 🔥
            </p>
          </div>

          {/* Games list */}
          <div className="space-y-6 px-4 pb-6">
            {games.map((game) => {
              const played = playedMap[game.storageKey]
              return (
                <div
                  key={game.href}
                  className={`
                    bg-white border border-blue-200 shadow rounded-xl p-4 text-center transition-all
                    ${played ? 'opacity-50 pointer-events-none' : ''}
                  `}
                >
                  <h2 className="text-lg font-bold text-blue-700 flex justify-center items-center gap-2 mb-2">
                    <span className="text-2xl">{game.icon}</span> {game.title}
                  </h2>
                  <p className="text-sm text-gray-700 mb-4">{game.desc}</p>
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
    </>
  )
}
