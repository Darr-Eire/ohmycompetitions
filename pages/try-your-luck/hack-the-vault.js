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

      // Glow effect
      document.querySelector('.vault-wrapper')?.classList.add('glow-success')
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

      <div className={`vault-wrapper ${shake ? 'animate-shake' : ''}`}>
        <img src="/images/vault-door.png" alt="Vault Door" className="vault-bg" />

        <div className="vault-overlay">
          <h2 className="vault-title">🗝️ Hack The Vault</h2>

          <p className="text-sm mb-4 text-white">🔥 Daily Streak: {getStreak()} days</p>

          <form onSubmit={handleSubmit} className="vault-form">
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Enter vault code"
              required
              className="vault-input"
            />
            <button type="submit" className="vault-button">
              Unlock Vault
            </button>
          </form>

          {result && (
            <div className="vault-result mt-4">
              <p className="text-lg font-bold text-white">{result}</p>
              {prize && <p className="text-xl text-green-300">{prize}</p>}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
