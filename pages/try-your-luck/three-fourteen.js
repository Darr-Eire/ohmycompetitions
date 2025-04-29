'use client'

import { useState, useEffect } from 'react'
import Confetti from 'react-confetti'
import { useWindowSize } from '@uidotdev/usehooks'

export default function ThreeFourteenGame() {
  const [isRunning, setIsRunning] = useState(false)
  const [time, setTime] = useState(0)
  const [result, setResult] = useState(null)
  const [played, setPlayed] = useState(false)
  const { width, height } = useWindowSize()

  useEffect(() => {
    let timer
    if (isRunning) {
      timer = setInterval(() => {
        setTime(prev => +(prev + 0.01).toFixed(2))
      }, 10) // Update every 10ms
    }
    return () => clearInterval(timer)
  }, [isRunning])

  useEffect(() => {
    const stored = localStorage.getItem('threeFourteenPlayed')
    if (stored === new Date().toDateString()) {
      setPlayed(true)
    }
  }, [])

  const handleStartStop = () => {
    if (played) return

    if (!isRunning) {
      // Start timer
      setResult(null)
      setTime(0)
      setIsRunning(true)
    } else {
      // Stop timer
      setIsRunning(false)
      checkResult()
      localStorage.setItem('threeFourteenPlayed', new Date().toDateString())
      setPlayed(true)
    }
  }

  const checkResult = () => {
    if (time >= 3.12 && time <= 3.16) {
      setResult('🎉 You nailed it! Bonus unlocked!')
    } else {
      setResult(`❌ Missed! You stopped at ${time.toFixed(2)}s.`)
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-100 via-pink-100 to-yellow-100 p-6">
      <h1 className="text-4xl font-bold text-purple-800 mb-8">
        ⏱️ 3.14 Seconds Challenge
      </h1>

      {result?.includes('🎉') && <Confetti width={width} height={height} />}

      {/* Timer Circle */}
      <div className={`timer-circle ${isRunning ? 'pulse' : ''} mb-8`}>
        <span className="text-4xl font-bold text-white">
          {time.toFixed(2)}s
        </span>
      </div>

      {/* Start / Stop Button */}
      <button
        onClick={handleStartStop}
        disabled={played}
        className={`px-8 py-4 rounded-full font-bold text-lg transition ${
          isRunning
            ? 'bg-red-500 hover:bg-red-600 text-white'
            : 'bg-green-500 hover:bg-green-600 text-white'
        } ${played ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        {isRunning ? 'STOP!' : 'START'}
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

