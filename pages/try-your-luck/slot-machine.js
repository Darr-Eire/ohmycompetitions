'use client'

import { useState, useEffect } from 'react'
import Confetti from 'react-confetti'
import { useWindowSize } from '@uidotdev/usehooks'
import { updateDailyStreak, getStreak } from '@/lib/streak'

export default function SlotMachine() {
  const [reels, setReels] = useState(["", "", ""])
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState(null)
  const [prize, setPrize] = useState(null)
  const { width, height } = useWindowSize()

  const symbols = ["🛸", "🚀", "🌕", "🔥", "🎯", "💎"]

  useEffect(() => {
    const playedToday = localStorage.getItem('slotMachinePlayed')
    if (playedToday) {
      setResult('You already played today! Come back tomorrow 🎰')
    }
  }, [])

  const handleSpin = () => {
    if (result) return

    setSpinning(true)
    setResult(null)
    setPrize(null)

    const newReels = [
      symbols[Math.floor(Math.random() * symbols.length)],
      symbols[Math.floor(Math.random() * symbols.length)],
      symbols[Math.floor(Math.random() * symbols.length)],
    ]

    setTimeout(() => {
      setReels(newReels)
      setSpinning(false)

      const allMatch = newReels[0] === newReels[1] && newReels[1] === newReels[2]

      if (allMatch) {
        const rewards = [
          '🎟️ Jackpot Ticket!',
          '✨ Bonus 0.314 Pi!',
          '🏆 Slot Master Badge!',
          '🎯 Extra Daily Spin!',
        ]
        const randomPrize = rewards[Math.floor(Math.random() * rewards.length)]
        const streak = updateDailyStreak()
        const bonus = streak % 3 === 0 ? ' 🎁 + Streak Bonus!' : ''

        setResult('🎰 JACKPOT! All 3 matched!')
        setPrize(`${randomPrize}${bonus}`)
      } else {
        setResult('No match. Try again tomorrow!')
      }

      localStorage.setItem('slotMachinePlayed', new Date().toDateString())
    }, 2000)
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-100 via-red-100 to-pink-100 p-6">
      {result?.includes('JACKPOT') && <Confetti width={width} height={height} />}
      <p className="streak-banner">🔥 Daily Streak: {getStreak()} days</p>

      <h1 className="text-3xl font-bold mb-4 text-purple-700">🎰 Pi Slot Machine</h1>

      <div className="bg-white shadow-xl p-8 rounded-xl text-center space-y-6 w-full max-w-md">
        <div className="flex justify-center space-x-6 text-6xl font-bold">
          {reels.map((symbol, idx) => (
            <div key={idx} className={`transition transform ${spinning ? 'animate-bounce' : ''}`}>
              {symbol || "❓"}
            </div>
          ))}
        </div>

        {!spinning && !result && (
          <button
            onClick={handleSpin}
            className="bg-purple-600 text-white font-semibold py-3 px-6 rounded hover:bg-purple-700"
          >
            Spin!
          </button>
        )}

        {result && (
          <div className="space-y-2">
            <p className="text-lg font-bold">{result}</p>
            {prize && <p className="text-pink-600 text-xl">{prize}</p>}
          </div>
        )}
      </div>
    </main>
  )
}
