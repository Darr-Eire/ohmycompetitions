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

    setTimeout(() => clearInterval(spinIntervals[0]), 2000)
    setTimeout(() => clearInterval(spinIntervals[1]), 2500)
    setTimeout(() => clearInterval(spinIntervals[2]), 3000)

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
    <main className="page">
      <div className="competition-card max-w-xl w-full">
        {/* Top Banner */}
        <div className="competition-top-banner">🎰 Pi Slot Machine</div>

        {/* Confetti */}
        {result?.includes('Jackpot') && <Confetti width={width} height={height} />}

        {/* Slot Machine */}
        <div className="flex justify-center gap-6 mt-8 mb-6">
          {reels.map((symbol, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow text-5xl p-4 w-20 h-20 flex justify-center items-center text-black"
            >
              {symbol}
            </div>
          ))}
        </div>

        {/* Spin Button */}
        <div className="text-center">
          <button
            onClick={spin}
            disabled={played || spinning}
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
