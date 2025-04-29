'use client'

import { useState, useEffect } from 'react'
import Confetti from 'react-confetti'
import { useWindowSize } from '@uidotdev/usehooks'

const symbols = ['🥧', '⭐', '🔥', '🔒', '🪙', '🎁']

export default function PiSlotMachine() {
  const [reels, setReels] = useState(['?', '?', '?'])
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState(null)
  const [played, setPlayed] = useState(false)
  const { width, height } = useWindowSize()

  useEffect(() => {
    const stored = localStorage.getItem('slotMachinePlayed')
    if (stored === new Date().toDateString()) {
      setPlayed(true)
    }
  }, [])

  const spin = () => {
    if (played || spinning) return

    setResult(null)
    setSpinning(true)

    let spinIntervals = []

    for (let i = 0; i < 3; i++) {
      spinIntervals[i] = setInterval(() => {
        setReels(prev => {
          const newReels = [...prev]
          newReels[i] = symbols[Math.floor(Math.random() * symbols.length)]
          return newReels
        })
      }, 100)
    }

    // Stop reels one by one
    setTimeout(() => clearInterval(spinIntervals[0]), 2000)
    setTimeout(() => clearInterval(spinIntervals[1]), 2500)
    setTimeout(() => clearInterval(spinIntervals[2]), 3000)

    // After all stop
    setTimeout(() => {
      setSpinning(false)
      checkResult()
      localStorage.setItem('slotMachinePlayed', new Date().toDateString())
      setPlayed(true)
    }, 3200)
  }

  const checkResult = () => {
    if (reels[0] === reels[1] && reels[1] === reels[2]) {
      setResult('🎉 Jackpot! You matched all 3!')
    } else {
      setResult('❌ No match. Try again tomorrow!')
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-100 via-pink-100 to-purple-100 p-6">
      <h1 className="text-4xl font-bold text-purple-800 mb-8">
        🎰 Pi Slot Machine
      </h1>

      {result?.includes('Jackpot') && <Confetti width={width} height={height} />}

      {/* Slot Machine */}
      <div className="slot-machine mb-8">
        {reels.map((symbol, index) => (
          <div key={index} className="reel">
            {symbol}
          </div>
        ))}
      </div>

      {/* Spin Button */}
      <button
        onClick={spin}
        disabled={played || spinning}
        className={`px-8 py-4 rounded-full font-bold text-lg transition ${
          spinning
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-green-500 hover:bg-green-600 text-white'
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
