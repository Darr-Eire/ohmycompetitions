'use client'

import { useState, useRef, useEffect } from 'react'
import Confetti from 'react-confetti'
import { useWindowSize } from '@uidotdev/usehooks'
import { updateDailyStreak, getStreak } from '@/lib/streak'

export default function RealStopwatchGame() {
  const [running, setRunning] = useState(false)
  const [time, setTime] = useState(0)
  const [result, setResult] = useState('')
  const intervalRef = useRef(null)
  const { width, height } = useWindowSize()

  useEffect(() => {
    const played = localStorage.getItem('threeFourteenPlayed')
    if (played) setResult('⏳ You already played today!')
  }, [])

  const formatTime = (seconds) => {
    const whole = Math.floor(seconds)
    const decimal = Math.floor((seconds - whole) * 100)
    return `${whole}.${decimal.toString().padStart(2, '0')}`
  }

  const startTimer = () => {
    setResult('')
    setTime(0)
    setRunning(true)

    intervalRef.current = setInterval(() => {
      setTime(prev => parseFloat((prev + 0.01).toFixed(2)))
    }, 10)
  }

  const stopTimer = () => {
    clearInterval(intervalRef.current)
    setRunning(false)

    const diff = Math.abs(3.14 - time)
    localStorage.setItem('threeFourteenPlayed', new Date().toDateString())

    if (diff <= 0.05) {
      updateDailyStreak()
      setResult('🏆 Perfect! You unlocked a prize!')
    } else {
      setResult(`❌ You stopped at ${formatTime(time)}s. Try again tomorrow!`)
    }
  }

  const rotation = (time % 10) * 36 // 360 degrees in 10s

  return (
    <main className="min-h-screen bg-gradient-to-br from-yellow-100 via-white to-purple-100 flex items-center justify-center p-4">
      {result.includes('🏆') && <Confetti width={width} height={height} />}

      <div className="competition-card max-w-md w-full p-6 text-center shadow-2xl rounded-xl bg-white">
        <div className="competition-top-banner text-lg font-semibold mb-4">
          ⏱️ 3.14 Stopwatch Game
        </div>

        <p className="text-blue-700 text-sm mb-4">🔥 Streak: {getStreak()} days</p>

        {/* Stopwatch Dial */}
        <div className="relative w-64 h-64 rounded-full border-[10px] border-gray-800 bg-gray-100 mx-auto shadow-inner flex items-center justify-center">
          <div
            className="absolute w-1 h-28 bg-red-600 origin-bottom z-10"
            style={{ transform: `rotate(${rotation}deg)` }}
          />
          <div className="w-4 h-4 bg-red-700 rounded-full z-20" />
          <div className="absolute text-3xl font-mono font-bold text-purple-800">
            {formatTime(time)}s
          </div>
        </div>

        {/* Controls */}
        <div className="mt-6 space-x-3">
          {!running && !result && (
            <button
              onClick={startTimer}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded shadow"
            >
              Start
            </button>
          )}
          {running && (
            <button
              onClick={stopTimer}
              className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded shadow"
            >
              Stop
            </button>
          )}
        </div>

        {/* Result */}
        {result && (
          <div className="mt-6 text-lg font-semibold text-purple-800">
            {result}
          </div>
        )}
      </div>
    </main>
  )
}

