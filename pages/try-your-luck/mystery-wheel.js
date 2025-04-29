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

    const randomAngle = 360 * 5 + Math.floor(Math.random() * 360)

    setAngle((prev) => prev + randomAngle)

    setTimeout(() => {
      const slice = 360 / prizes.length
      const finalAngle = (randomAngle % 360)
      const index = Math.floor((360 - finalAngle) / slice) % prizes.length

      setResult(`🎉 You won: ${prizes[index]}!`)
      localStorage.setItem('mysteryWheelPlayed', new Date().toDateString())
      setPlayed(true)
      setSpinning(false)
    }, 5000)
  }

  return (
    <main className="page">
      <div className="competition-card max-w-xl w-full">
        {/* Top Blue Banner */}
        <div className="competition-top-banner">🎡 Mystery Wheel</div>

        {/* Confetti */}
        {result?.includes('won') && <Confetti width={width} height={height} />}

        {/* Wheel */}
        <div className="relative w-64 h-64 mx-auto mt-8 mb-6">
          <div
            className="absolute w-full h-full rounded-full border-4 border-blue-500 flex items-center justify-center transition-transform"
            style={{
              transform: `rotate(${angle}deg)`,
              transition: spinning ? 'transform 5s cubic-bezier(0.33, 1, 0.68, 1)' : undefined,
            }}
          >
            {prizes.map((prize, idx) => (
              <div
                key={idx}
                className="absolute text-xs font-bold text-purple-800"
                style={{
                  transform: `rotate(${idx * (360 / prizes.length)}deg) translateY(-100px)`,
                }}
              >
                {prize}
              </div>
            ))}
          </div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[160%] text-2xl">
            🔺
          </div>
        </div>

        {/* Spin Button */}
        <div className="text-center">
          <button
            onClick={spin}
            disabled={spinning || played}
            className={`comp-button ${
              spinning || played ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {spinning ? 'Spinning...' : played ? 'Already Played Today' : 'SPIN!'}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className="text-center mt-6">
            <p className="text-lg font-bold text-purple-700">{result}</p>
          </div>
        )}
      </div>
    </main>
  )
}

