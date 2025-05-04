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
    { title: '3.14 Seconds', href: '/try-your-luck/three-fourteen', icon: '🕒', desc: 'Stop the timer at exactly 3.14s to win!', storageKey: 'threeFourteenPlayed' },
    { title: 'Pi Slot Machine', href: '/try-your-luck/slot-machine', icon: '🎰', desc: 'Match 3 Pi symbols to win!', storageKey: 'slotMachinePlayed' },
    { title: 'Hack the Vault', href: '/try-your-luck/hack-the-vault', icon: '🗝️', desc: 'Guess today’s vault code!', storageKey: 'hackVaultPlayed' },
    { title: 'Mystery Wheel', href: '/try-your-luck/mystery-wheel', icon: '🎡', desc: 'Spin the wheel for a surprise!', storageKey: 'mysteryWheelPlayed' },
  ]

  useEffect(() => {
    setStreak(getStreak())
    const map = {}
    games.forEach(g => {
      map[g.storageKey] = !!localStorage.getItem(g.storageKey)
    })
    setPlayedMap(map)
  }, [])

  return (
    <>
      <Head>
        <title>Try Your Luck | OhMyCompetitions</title>
      </Head>

      <main
        className="min-h-screen p-4"
        style={{
          backgroundImage: 'linear-gradient(to bottom right, #1E3A8A, #60A5FA)',
        }}
      >
        <div className="max-w-xl mx-auto">

          {/* Banner */}
          <div className="text-3xl font-bold text-white text-center py-4 mb-4">
            🎯 Try Your Luck
          </div>
          <div className="h-1 w-24 bg-white/70 mx-auto rounded mb-8" />

          {/* Intro & streak */}
          <div className="text-center mb-8 px-2">
            <p className="text-xl sm:text-2xl font-semibold text-white mb-2">
              🎉 Welcome to the OhMyCompetitions “Try Your Luck” Page!
            </p>
            <p className="text-base sm:text-lg text-white mb-4">
              Win free tickets, unlock daily rewards, spin for mystery prizes,<br />
              and rack up piles of <span className="font-bold">π</span> every day!
            </p>
            <p className="text-lg font-bold text-yellow-300">
              🔥 Daily Streak: {streak} days 🔥
            </p>
          </div>

          {/* Game cards */}
          <div className="space-y-6">
            {games.map(game => {
              const played = playedMap[game.storageKey]
              return (
                <div
                  key={game.href}
                  className={`
                    competition-card
                    bg-white
                    rounded-2xl
                    shadow-lg
                    p-6
                    text-center
                    transition-opacity
                    ${played ? 'opacity-50 pointer-events-none' : 'opacity-100'}
                  `}
                >
                  <h2 className="text-xl font-bold text-blue-700 flex items-center justify-center gap-2 mb-2">
                    <span className="text-3xl">{game.icon}</span>
                    {game.title}
                  </h2>
                  <p className="text-gray-600 mb-4">{game.desc}</p>
                  {!played ? (
                    <Link
                      href={game.href}
                      className="comp-button bg-blue-600 text-white py-2 px-6 rounded-full hover:bg-blue-700 transition"
                    >
                      Play Now
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
