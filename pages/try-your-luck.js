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
    { title: '3.14 Seconds',    href: '/try-your-luck/three-fourteen', icon: '🕒', desc: 'Stop the timer at exactly 3.14s to win!',     storageKey: 'threeFourteenPlayed' },
    { title: 'Pi Slot Machine',  href: '/try-your-luck/slot-machine',    icon: '🎰', desc: 'Match 3 Pi symbols to win!',              storageKey: 'slotMachinePlayed' },
    { title: 'Hack the Vault',   href: '/try-your-luck/hack-the-vault',  icon: '🗝️', desc: 'Guess today’s vault code!',               storageKey: 'hackVaultPlayed' },
    { title: 'Mystery Wheel',    href: '/try-your-luck/mystery-wheel',  icon: '🎡', desc: 'Spin the wheel for a surprise!',           storageKey: 'mysteryWheelPlayed' },
  ]

  useEffect(() => {
    setStreak(getStreak())
    refreshPlayedMap()
  }, [])

  function refreshPlayedMap() {
    const map = {}
    games.forEach(g => {
      map[g.storageKey] = Boolean(localStorage.getItem(g.storageKey))
    })
    setPlayedMap(map)
  }

  const clearAllStorage = () => {
    console.log('All keys before clear:', Object.keys(localStorage))
    localStorage.clear()
    console.log('All keys after clear:', Object.keys(localStorage))
    refreshPlayedMap()
  }

  return (
    <>
      <Head><title>Try Your Luck | OhMyCompetitions</title></Head>

      {/* App-wide background and global white text */}
      <main className="app-background min-h-screen p-4 text-white">
        <div className="max-w-xl mx-auto">
         {/* Banner */}
 <div className="flex justify-center mb-6">
   <div
     className="
       competition-top-banner
       btn-gradient
       w-full
       max-w-md
       text-center
       px-4
       py-3
       rounded-3xl
       text-white
     "
   >
     Try Your Luck
   </div>
 </div>

          {/* Intro & Streak */}
          <div className="text-center mb-4 px-2">
            <p className="text-base sm:text-lg mb-2">
              Win free tickets, unlock daily rewards, spin for mystery prizes,<br/>
              and rack up piles of <span className="font-bold">π</span> every day!
            </p>
            <p className="text-lg font-bold text-yellow-300 mb-4">
              🔥 Daily Streak: {streak} days 🔥
            </p>
            <button
              className="comp-button bg-red-600 text-white py-2 px-4 rounded-full hover:bg-red-700 transition mb-4"
              onClick={clearAllStorage}
            >
              🔥 Clear EVERYTHING 🔥
            </button>
          </div>

          {/* Game Cards */}
          <div className="space-y-6">
            {games.map(game => {
              const played = playedMap[game.storageKey]
              return (
                <div
                  key={game.href}
                  className={`
                    competition-card bg-white rounded-2xl shadow-lg p-6 text-center
                    transition-opacity ${played ? 'opacity-50 pointer-events-none' : 'opacity-100'}
                  `}
                >
                  <h2 className="text-xl font-bold flex items-center justify-center gap-2 mb-2 text-white">
                    <span className="text-3xl">{game.icon}</span>
                    {game.title}
                  </h2>
                  <p className="mb-4 text-white">{game.desc}</p>
                  {!played ? (
                    <Link
                      href={game.href}
                      className="comp-button bg-blue-600 text-white py-2 px-6 rounded-full hover:bg-blue-700 transition"
                    >
                      Play Now
                    </Link>
                  ) : (
                    <p className="text-white text-sm">Already played today</p>
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