'use client'

import { useEffect, useState } from 'react'

export default function DailyStreakCard({ uid }) {
  const [streak, setStreak] = useState(0)
  const [hasSpun, setHasSpun] = useState(false)
  const [hasPlayedGame, setHasPlayedGame] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStreak = async () => {
      const res = await fetch(`/api/user/streak?uid=${uid}`)
      const data = await res.json()
      setStreak(data.streak || 0)
      setHasSpun(data.spinnedToday || false)
      setHasPlayedGame(data.playedToday || false)
      setLoading(false)
    }

    fetchStreak()
  }, [uid])

  if (loading) {
    return (
      <div className="bg-white bg-opacity-10 rounded-2xl p-6 shadow-lg text-white text-center">
        Loading streak info...
      </div>
    )
  }

  return (
    <div className="bg-white bg-opacity-10 rounded-2xl p-6 shadow-lg text-white">
      <h2 className="text-xl font-bold mb-2">🔥 Daily Streak</h2>
      <p className="text-lg mb-2">
        You’re on a <strong>{streak}-day</strong> streak! Keep going to earn rewards.
      </p>
      <ul className="list-disc list-inside text-sm space-y-1">
        <li>
          ✅ Daily Spin:{' '}
          <span className={hasSpun ? 'text-green-400' : 'text-yellow-400'}>
            {hasSpun ? 'Completed' : 'Not Yet'}
          </span>
        </li>
        <li>
          🎮 Try Your Skill Game:{' '}
          <span className={hasPlayedGame ? 'text-green-400' : 'text-yellow-400'}>
            {hasPlayedGame ? 'Completed' : 'Not Yet'}
          </span>
        </li>
      </ul>
    </div>
  )
}
