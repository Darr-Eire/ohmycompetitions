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

  const vaultCode = "pi" // today's answer

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
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-black text-white p-6">
      {result?.includes('Unlocked') && <Confetti width={width} height={height} />}
      <p className="streak-banner">🔥 Daily Streak: {getStreak()} days</p>

      <h1 className="text-3xl font-bold mb-6 text-emerald-400">💥 Hack the Vault</h1>

      <div
        className={`vault-container ${shake ? 'animate-shake' : ''}`}
      >
        <div className="vault-dial">🔐</div>
        <form onSubmit={handleSubmit} className="vault-input">
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Enter vault code"
            required
          />
          <button type="submit">Unlock</button>
        </form>
      </div>

      {result && (
        <div className="mt-6 text-center space-y-2">
          <p className="text-lg font-bold text-white">{result}</p>
          {prize && <p className="text-2xl text-pink-400">{prize}</p>}
        </div>
      )}
    </main>
  )
}
