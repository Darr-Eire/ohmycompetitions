// pages/try-your-luck/three-fourteen.js
'use client'

import { useState, useRef, useEffect } from 'react'
import Confetti from 'react-confetti'
import { useWindowSize } from '@uidotdev/usehooks'
import { updateDailyStreak, getStreak } from '@/lib/streak'

export default function ThreeFourteenGame() {
  const [start, setStart] = useState(false)
  const [time, setTime] = useState(0)
  const [result, setResult] = useState('')
  const [stopped, setStopped] = useState(false)
  const interval = useRef(null)
  const { width, height } = useWindowSize()

  useEffect(() => {
    let played = localStorage.getItem('threeFourteenPlayed')
    if (played) setResult('⏳ You already played today!')
  }, [])

  const handleStart = () => {
    setResult('')
    setTime(0)
    setStopped(false)
    setStart(true)
    interval.current = setInterval(() => {
      setTime(prev => prev + 0.01)
    }, 10)
  }

  const handleStop = () => {
    clearInterval(interval.current)
    setStopped(true)
    localStorage.setItem('threeFourteenPlayed', new Date().toDateString())

    const diff = Math.abs(3.14 - time)
    if (diff < 0.05) {
      const reward = '🏆 Perfect Timing! 1 Free Ticket!'
      setResult(reward)
      updateDailyStreak()
    } else {
      setResult(`⛔ Too ${time > 3.14 ? 'late' : 'early'}! You got ${time.toFixed(2)}s`)
    }
  }

  return (
    <main className="page">
      <div className="competition-card max-w-xl w-full">
        {/* Title */}
        <div className="competition-top-banner">⏱️ 3.14 Seconds</div>

        <div className="text-center">
          <p className="streak-banner mb-4">🔥 Daily Streak: {getStreak()} days</p>

          <div className="mb-6">
            <div className="text-4xl font-bold text-purple-700 mb-4">
              {time.toFixed(2)}s
            </div>
            {!start && !result && (
              <button
                onClick={handleStart}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Start
              </button>
            )}
            {start && !stopped && (
              <button
                onClick={handleStop}
                className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700"
              >
                Stop
              </button>
            )}
          </div>

          {result && (
            <>
              <p className="text-lg font-semibold text-purple-800">{result}</p>
              {result.includes('🏆') && <Confetti width={width} height={height} />}
            </>
          )}
        </div>
      </div>
    </main>
  )
}
