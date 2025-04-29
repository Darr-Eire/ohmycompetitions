'use client'

import { useState, useEffect } from 'react'
import Confetti from 'react-confetti'
import { useWindowSize } from '@uidotdev/usehooks'

const prizes = ['🎟️ Free Ticket', '🔥 Bonus Pi', '🥧 Mystery Pie', '⭐ 2x Entries', '🪙 0.314 Pi', '🎁 Surprise Gift']

export default function MysteryWheelPage() {
  const [spinning, setSpinning] = useState(false)
  const [angle, setAngle] = useState(0)
  const [result, setResult] = useState(null)
  const [played, setPlayed] = useState(false)
  const { width, height } = useWindowSize()

  useEffect(() => {
    const stored = localStorage.getItem('mysteryWheelPlayed')
    if (stored === new Date().toDateString()) {
      setPlayed(true)
    }
  }, [])

  const spin = () => {
    if (spinning || played) return

    setResult(null)
    setSpinning(true)

    // Spin a random big angle
    const randomAngle = 360 * 5 + Math.floor(Math.random() * 360) // 5 full spins + random

    setAngle((prev) => prev + randomAngle)

    // Calculate prize after spin finishes
    setTimeout(() => {
      const slice = 360 / prizes.length
      const finalAngle = (randomAngle % 360)
      const index = Math.floor((360 - finalAngle) / slice) % prizes.length

      setResult(`🎉 You won: ${prizes[index]}!`)
      localStorage.setItem('mysteryWheelPlayed', new Date().toDateString())
      setPlayed(true)
      setSpinning(false)
    }, 5000) // 5s spin
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-100 via-pink-100 to-purple-100 p-6">
      <h1 className="text-4xl font-bold text-purple-800 mb-8">
        🎡 Mystery Wheel
      </h1>

      {result?.includes('won') && <Confetti width={width} height={height} />}

      {/* Wheel */}
      <div className="wheel-container mb-8">
        <div
          className="wheel"
          style={{
            transform: `rotate(${angle}deg)`,
            transition: spinning ? 'transform 5s cubic-bezier(0.33, 1, 0.68, 1)' : undefined,
          }}
        >
          {prizes.map((prize, idx) => (
            <div key={idx} className="wheel-slice" style={{ transform: `rotate(${idx * (360 / prizes.length)}deg)` }}>
              {prize}
            </div>
          ))}
        </div>
        <div className="wheel-pointer">▲</div>
      </div>

      {/* Spin Button */}
      <button
        onClick={spin}
        disabled={spinning || played}
        className={`px-8 py-4 rounded-full font-bold text-lg transition ${
          spinning || played
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}
      >
        {spinning ? 'Spinning...' : played ? 'Already Played Today' : 'SPIN!'}
      </button>

      {/* Result */}
      {result && (
        <p className="mt-6 text-2xl font-bold text-purple-700 text-center">
          {result}
        </p>
      )}
    </main>
  )
}
