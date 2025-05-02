'use client'

import { useState, useEffect } from 'react'
import Confetti from 'react-confetti'
import { useWindowSize } from '@uidotdev/usehooks'

const prizes = [
  '🎟️ Free Ticket',
  '🔥 Bonus Pi',
  '🥧 Mystery Pie',
  '⭐ 2x Entries',
  '🪙 0.314 Pi',
  '🎁 Surprise Gift'
]

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
    setAngle(prev => prev + randomAngle)

    setTimeout(() => {
      const slice = 360 / prizes.length
      const finalAngle = (randomAngle % 360)
      const index = Math.floor((360 - finalAngle + slice / 2) % 360 / slice)

      setResult(`🎉 You won: ${prizes[index]}!`)
      localStorage.setItem('mysteryWheelPlayed', new Date().toDateString())
      setPlayed(true)
      setSpinning(false)
    }, 5000)
  }

  return (
    <main className="page">
      {result?.includes('won') && <Confetti width={width} height={height} />}

      <div className="competition-card max-w-xl w-full">
        <div className="competition-top-banner bg-green-800 text-white">
          🎡 MYSTERY WHEEL
        </div>

        <div className="wheel-wrapper relative w-[280px] h-[280px] mx-auto my-8">
  {/* Pointer */}
  <div className="absolute top-[-14px] left-1/2 transform -translate-x-1/2 z-10">
    <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[20px] border-b-red-600" />
  </div>

  {/* Rotating Wheel */}
  <div
    className="absolute w-full h-full rounded-full border-[6px] border-green-800"
    style={{
      transform: `rotate(${angle}deg)`,
      transition: spinning ? 'transform 5s cubic-bezier(0.33, 1, 0.68, 1)' : undefined,
    }}
  >
    {prizes.map((prize, idx) => {
      const deg = idx * (360 / prizes.length)
      const bg = idx % 2 === 0 ? '#fef08a' : '#bbf7d0'
      return (
        <div
          key={idx}
          className="absolute w-full h-full flex items-center justify-center"
          style={{
            transform: `rotate(${deg}deg)`,
          }}
        >
          <div
            className="text-xs font-bold rounded px-2 py-1"
            style={{
              transform: `translateY(-110px) rotate(-${deg}deg)`,
              backgroundColor: bg,
              color: '#064e3b',
            }}
          >
            {prize}
          </div>
        </div>
      )
    })}
  </div>
</div>


        {/* Spin Button */}
        <div className="text-center">
          <button
            onClick={spin}
            disabled={spinning || played}
            className={`comp-button mt-6 ${
              spinning || played ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {spinning ? 'Spinning...' : played ? 'Already Played Today' : 'SPIN!'}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className="text-center mt-6">
            <p className="text-lg font-bold text-green-800">{result}</p>
          </div>
        )}
      </div>
    </main>
  )
}
