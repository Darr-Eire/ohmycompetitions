'use client'

import { useState, useEffect } from 'react'
import Confetti from 'react-confetti'
import { useWindowSize } from '@uidotdev/usehooks'

export default function MysteryWheel() {
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState(null)
  const [angle, setAngle] = useState(0)
  const { width, height } = useWindowSize()

  const prizes = [
    '🎟️ Free Ticket!',
    '✨ 0.314 Bonus Pi!',
    '🏆 Mystery Badge!',
    '🎯 Double Entry Tomorrow!',
    '🚀 Rocket Boost!',
    '💎 Vault Key!',
  ]

  useEffect(() => {
    const playedToday = localStorage.getItem('mysteryWheelPlayed')
    if (playedToday) {
      setResult('You already spun the wheel today! Come back tomorrow 🎡')
    }
  }, [])

  const spinWheel = () => {
    if (result) return
    setSpinning(true)
    const spinDegrees = 360 * 5 + Math.floor(Math.random() * 360) // 5 full spins + random
    setAngle(spinDegrees)

    setTimeout(() => {
      const prizeIndex = Math.floor(Math.random() * prizes.length)
      const prize = prizes[prizeIndex]
      setResult(`🎉 You won: ${prize}`)
      localStorage.setItem('mysteryWheelPlayed', new Date().toDateString())
      setSpinning(false)
    }, 3000)
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-100 via-pink-100 to-purple-100 p-6">
      {result?.includes('won') && <Confetti width={width} height={height} />}

      <h1 className="text-3xl font-bold mb-6 text-purple-700">🎁 Mystery Wheel</h1>

      <div className="relative w-[220px] h-[220px] rounded-full border-[12px] border-purple-600 bg-white shadow-inner flex items-center justify-center transition-transform duration-[3s] ease-out"
        style={{ transform: `rotate(${angle}deg)` }}
      >
        <span className="text-3xl">🎡</span>
      </div>

      {!spinning && !result && (
        <button
          onClick={spinWheel}
          className="mt-8 bg-purple-600 text-white font-bold py-3 px-6 rounded hover:bg-purple-700 transition"
        >
          Spin the Wheel
        </button>
      )}

      {result && (
        <div className="mt-6 text-center space-y-2">
          <p className="text-lg font-bold">{result}</p>
        </div>
      )}
    </main>
  )
}
