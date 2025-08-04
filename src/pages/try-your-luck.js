'use client'

import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getStreak } from 'lib/streak'
import { miniGames as games } from '@data/minigames';

export default function TryYourLuckPage() {
  const [streak, setStreak] = useState(0)
  const [playedMap, setPlayedMap] = useState({})
  const [resetCountdown, setResetCountdown] = useState('')

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
            <p className="text-lg font-bold text-cyan-300 mb-1">
              Daily Streak: {streak} days
            </p>
            <p className="text-sm text-gray-300 mb-4">
              Next reset in: <span className="text-white font-semibold">{resetCountdown}</span>
            </p>
          </div>

          <div className="space-y-6">
            {games.map((game) => {
              const hasPlayed = playedMap[game.storageKey]

              return (
                <div
                  key={game.href}
                  className="bg-gradient-to-r from-[#1e293b] to-[#0f172a] border border-cyan-500 rounded-2xl p-6 text-center shadow-md transition"
                >
                  <h2 className="text-2xl font-bold flex items-center justify-center gap-2 mb-2 text-white">
                    <span className="text-3xl">{game.icon}</span>
                    {game.title}
                  </h2>
                  <p className="mb-4 text-sm text-gray-200">{game.desc}</p>

                  {/* ✅ Conditional Buttons */}
                <button
  disabled
  className="bg-gray-700 text-gray-400 font-semibold px-6 py-3 rounded-xl w-full cursor-not-allowed"
>
  Play Now
</button>

                </div>
              )
            })}
          </div>

          <div className="mt-10 p-6 text-center border border-cyan-700 rounded-2xl bg-gradient-to-br from-[#0f172a]/70 to-[#1e293b]/70 shadow-[0_0_20px_#00fff055]">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Got an Idea for a New Mini Game?</h2>
            <p className="text-sm text-gray-300 mb-4">
              We're building more games! Got a fun idea or a cultural favourite from your country?
              Reach out anytime
            </p>
            <div className="space-y-2">
              <p className="text-sm text-white">
                X: <a href="https://x.com/OhMyComps" target="_blank" className="underline text-cyan-300">@OM_Compitions</a>
              </p>
              <p className="text-sm text-white">
                Instagram: <a href="https://instagram.com/ohmycompetitions" target="_blank" className="underline text-cyan-300">@ohmycompetitions</a>
              </p>
              <p className="text-sm text-white">
                Facebook: <a href="https://www.facebook.com/profile.php?id=61577406478876" target="_blank" rel="noopener noreferrer" className="underline text-cyan-300">Oh My Competitions</a>
              </p>
            </div>
          </div>
        </div>
      </main>

      <div className="mt-14 text-center">
        <a href="/terms-conditions" className="text-xs text-cyan-400 underline hover:text-cyan-300 transition">
          View full Terms & Conditions
        </a>
      </div>
    </>
  )
}
