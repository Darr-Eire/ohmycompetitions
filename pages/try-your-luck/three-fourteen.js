'use client'

import { useState, useEffect } from 'react'
import Confetti from 'react-confetti'
import { useWindowSize } from '@uidotdev/usehooks'
import { updateDailyStreak, getStreak } from '@/lib/streak'

export default function ThreeFourteenGame() {
  const [startTime, setStartTime] = useState(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [result, setResult] = useState(null)
  const [prize, setPrize] = useState(null)
  const { width, height } = useWindowSize()

  useEffect(() => {
    const playedToday = localStorage.getItem('threeFourteenPlayed')
    if (playedToday) {
      setResult('You already played today! Come back tomorrow 🎉')
    }
  }, [])

  useEffect(() => {
    let timer
    if (playing) {
      timer = setInterval(() => {
        if (startTime) {
          setElapsedTime((Date.now() - startTime) / 1000)
        }
      }, 10)
    }
    return () => clearInterval(timer)
  }, [playing, startTime])

  const handleStart = () => {
    setStartTime(Date.now())
    setElapsedTime(0)
    setPlaying(true)
    setResult(null)
  }

  const handleStop = () => {
    setPlaying(false)
    const finalTime = elapsedTime
    const delta = Math.abs(3.14 - finalTime)

    if (delta <= 0.04) {
      const rewards = ['🎟️ Free Ticket!', '✨ 0.314 Pi!', '🏆 Reflex Badge!', '🎯 Double Entry!']
      const randomPrize = rewards[Math.floor(Math.random() * rewards.length)]
      const streak = updateDailyStreak()

      const bonus = streak % 3 === 0 ? ' 🎁 + Streak Bonus!' : ''
      setResult('🎯 Perfect timing!')
      setPrize(`${randomPrize}${bonus}`)
    } else {
      setResult(`Missed! You tapped at ${finalTime.toFixed(2)}s. Try again tomorrow!`)
    }

    localStorage.setItem('threeFourteenPlayed', new Date().toDateString())
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-6">
      {result?.includes('Perfect') && <Confetti width={width} height={height} />}
      <p className="streak-banner">🔥 Daily Streak: {getStreak()} days</p>

      <h1 className="text-3xl font-bold mb-4 text-blue-700">🎯 3.14 Seconds</h1>

      <div className="bg-white shadow-lg p-8 rounded-xl text-center space-y-4 w-full max-w-md">
        {!playing && (
          <button
            onClick={handleStart}
            disabled={!!result}
            className="bg-blue-600 text-white font-semibold py-3 px-6 rounded hover:bg-blue-700"
          >
            Start
          </button>
        )}
        {playing && (
          <>
            <p className="text-xl">Elapsed: {elapsedTime.toFixed(2)}s</p>
            <button
              onClick={handleStop}
              className="bg-green-500 text-white font-semibold py-3 px-6 rounded hover:bg-green-600"
            >
              Stop
            </button>
          </>
        )}
        {result && (
          <>
            <p className="text-lg font-bold">{result}</p>
            {prize && <p className="text-pink-600 text-xl">{prize}</p>}
          </>
        )}
      </div>
    </main>
  )
}

