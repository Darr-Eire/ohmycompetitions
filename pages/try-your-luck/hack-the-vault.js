'use client'

import { useState, useEffect } from 'react'
import Confetti from 'react-confetti'
import { useWindowSize } from '@uidotdev/usehooks'
import { updateDailyStreak, getStreak } from '@/lib/streak'

export default function HackTheVault() {
  const [answer, setAnswer] = useState("")
  const [result, setResult] = useState(null)
  const [prize, setPrize] = useState(null)
  const [shake, setShake] = useState(false)
  const { width, height } = useWindowSize()

  const vaultCode = "pi"

  useEffect(() => {
    const playedToday = localStorage.getItem('hackVaultPlayed')
    if (playedToday) {
      setResult('🔒 Already tried today! Come back tomorrow.')
    }
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (result) return

    const input = answer.trim().toLowerCase()

    if (input === vaultCode) {
      const rewards = [
        '🔓 1 Free Ticket!',
        '✨ Bonus 0.314 Pi!',
        '🎯 Vault Master Badge!',
        '🚀 Extra Game Play!',
      ]
      const reward = rewards[Math.floor(Math.random() * rewards.length)]
      const streak = updateDailyStreak()
      const bonus = streak % 3 === 0 ? ' 🎁 + Streak Bonus!' : ''

      setResult('🔓 Vault Unlocked!')
      setPrize(`${reward}${bonus}`)
    } else {
      setShake(true)
      setTimeout(() => setShake(false), 600)
      setResult('❌ Wrong code! Try again tomorrow.')
    }

    localStorage.setItem('hackVaultPlayed', new Date().toDateString())
  }

  return (
    <main className="page">
      {result?.includes('Unlocked') && <Confetti width={width} height={height} />}

      <div className="competition-card max-w-md w-full">
        {/* Top banner */}
        <div className="competition-top-banner">🗝️ Hack The Vault</div>

        {/* Divider */}
        <div className="h-1 w-24 bg-blue-300 mx-auto rounded mb-4" />

        {/* Streak */}
        <p className="text-center text-sm text-blue-800 mb-4">
          🔥 Daily Streak: {getStreak()} days
        </p>

        {/* Vault Game */}
        <div className={`vault-container px-4 ${shake ? 'animate-shake' : ''}`}>
          <div className="text-5xl text-center mb-4">🔐</div>

          <form onSubmit={handleSubmit} className="flex flex-col items-center gap-3">
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Enter vault code"
              required
              className="px-4 py-2 border border-gray-300 rounded w-full text-black"
            />
            <button type="submit" className="comp-button w-full">
              Unlock Vault
            </button>
          </form>
        </div>

        {/* Result */}
        {result && (
          <div className="mt-6 text-center space-y-2">
            <p className="text-lg font-bold text-black">{result}</p>
            {prize && <p className="text-2xl text-pink-500 font-semibold">{prize}</p>}
          </div>
        )}
      </div>
    </main>
  )
}
