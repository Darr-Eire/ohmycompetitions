'use client'

import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getStreak } from 'lib/streak'

export default function TryYourLuckPage() {
  const [streak, setStreak] = useState(0)
  const [playedMap, setPlayedMap] = useState({})
  const [resetCountdown, setResetCountdown] = useState('')

  const games = [
    {
      title: 'Match The Pi Code',
      href: '/try-your-luck/match-code',
      icon: '🕒',
      desc: 'Stop the timer at exactly 3.14s to win!',
      reward: ' You won 0.5π yesterday!',
      storageKey: 'threeFourteenPlayed',
    },
    {
      title: 'Hack the Vault',
      href: '/try-your-luck/hack-the-vault',
      icon: '🔓',
      desc: 'Guess today’s vault code!',
      reward: ' You unlocked 1 retry token!',
      storageKey: 'hackVaultPlayed',
    },
    {
      title: 'Spin the Wheel',
      href: '/try-your-luck/spin-the-pi-wheel',
      icon: '🎡',
      desc: 'Spin for rewards — retry tokens, π, jackpots!',
      reward: ' You won 1π yesterday!',
      storageKey: 'spinWheelPlayed',
    },
  ]

  useEffect(() => {
    setStreak(getStreak())
    refreshPlayedMap()
    startCountdown()
  }, [])

  function refreshPlayedMap() {
    const map = {}
    games.forEach((g) => {
      map[g.storageKey] = Boolean(localStorage.getItem(g.storageKey))
    })
    setPlayedMap(map)
  }

  function resetGames() {
    games.forEach((g) => {
      localStorage.removeItem(g.storageKey)
    })
    refreshPlayedMap()
  }

  function startCountdown() {
    const getNextMidnight = () => {
      const now = new Date()
      const next = new Date(now)
      next.setUTCHours(0, 0, 0, 0)
      next.setUTCDate(next.getUTCDate() + 1)
      return next
    }

    const update = () => {
      const now = new Date()
      const diff = getNextMidnight() - now
      const hours = String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, '0')
      const mins = String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, '0')
      setResetCountdown(`${hours}h ${mins}m`)
    }

    update()
    const interval = setInterval(update, 60000)
    return () => clearInterval(interval)
  }

  return (
    <>
      <Head>
        <title>Try Your Luck | OhMyCompetitions</title>
      </Head>

      <main className="app-background min-h-screen p-4 text-white font-orbitron">
        <div className="max-w-xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-[#0f172a]/70 via-[#1e293b]/70 to-[#0f172a]/70 border border-cyan-700 shadow-[0_0_30px_#00fff055] w-full max-w-md text-center px-4 py-3 rounded-3xl text-cyan-300">
              Try Your Luck
            </div>
          </div>

          <div className="text-center mb-6 px-2">
            <p className="text-base sm:text-lg mb-2">
              Win free tickets, unlock daily rewards, spin for mystery prizes,<br />
              and rack up piles of <span className="font-bold">π</span> every day!
            </p>
            <p className="text-lg font-bold text-yellow-300 mb-1">
              Daily Streak: {streak} days 
            </p>
            <p className="text-sm text-gray-300 mb-4">
               Next reset in: <span className="text-white font-semibold">{resetCountdown}</span>
            </p>
          </div>

          <div className="space-y-6">
            {games.map((game) => {
              const played = playedMap[game.storageKey]
              return (
                <div
                  key={game.href}
                  className={`bg-gradient-to-r from-[#1e293b] to-[#0f172a] border border-cyan-500 rounded-2xl p-6 text-center shadow-md transition-opacity ${
                    played ? 'opacity-50 pointer-events-none' : 'opacity-100'
                  }`}
                >
                  <h2 className="text-2xl font-bold flex items-center justify-center gap-2 mb-2 text-white">
                    <span className="text-3xl">{game.icon}</span>
                    {game.title}
                  </h2>
                  <p className="mb-2 text-sm text-gray-200">{game.desc}</p>
                  <p className="mb-4 text-sm text-green-300 italic">{game.reward}</p>
                  {!played ? (
                    <Link
                      href={game.href}
                      className="bg-gradient-to-r from-[#0f172a]/70 via-[#1e293b]/70 to-[#0f172a]/70 text-white font-semibold px-6 py-3 rounded-xl shadow-[0_0_30px_#00fff055] border border-cyan-700 hover:brightness-110 transition w-full mb-2"
                    >
                      Play Now
                    </Link>
                  ) : (
                    <p className="text-white text-sm"> Already played today</p>
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
