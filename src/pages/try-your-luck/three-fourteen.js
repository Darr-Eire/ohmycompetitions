'use client'

import { useEffect, useState, useRef } from 'react'
import Confetti from 'react-confetti'
import { useWindowSize } from '@uidotdev/usehooks'
import Link from 'next/link'

// Levels & prize logic
const levels = [
  { name: 'Daily Free', fee: 0, prize: 5 },
  { name: 'Level 1', fee: 0.50, prize: 0.50 * 5 },
  { name: 'Level 2', fee: 1.00, prize: 1.00 * 5 },
  { name: 'Level 3', fee: 2.00, prize: 2.00 * 5 },
]

// Recent winners list (initial data)
const initialWinners = [
  { name: 'Alice', prize: 10, time: Date.now() - 5 * 60e3 },
  { name: 'Bob', prize: 5, time: Date.now() - 15 * 60e3 },
]

// Format time difference
const fmtRelative = ms => {
  const sec = Math.floor(ms / 1000)
  if (sec < 60) return `${sec}s ago`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  return `${Math.floor(min / 60)}h ago`
}

export default function PiGame() {
  const [running, setRunning] = useState(false)
  const [time, setTime] = useState(0)
  const [result, setResult] = useState('')
  const [winners, setWinners] = useState(initialWinners)
  const [playedFreeToday, setPlayedFreeToday] = useState(false)
  const [freeLocked, setFreeLocked] = useState(false)
  const [selectedLevel, setSelectedLevel] = useState(0)
  const intervalRef = useRef(null)
  const { width, height } = useWindowSize()

  useEffect(() => {
    const todayKey = new Date().toDateString()
    if (localStorage.getItem('piGamePlayed') === todayKey) {
      setPlayedFreeToday(true)
    }
  }, [])

  const savePlayedToday = () => {
    const todayKey = new Date().toDateString()
    localStorage.setItem('piGamePlayed', todayKey)
    setPlayedFreeToday(true)
  }

  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => {
      setTime(prev => +(prev + 0.01).toFixed(2))
    }, 10)
    return () => clearInterval(intervalRef.current)
  }, [running])

  const stop = () => {
    clearInterval(intervalRef.current)
    setRunning(false)

    if (time.toFixed(2) === "3.14") {
      const prize = levels[selectedLevel].prize
      setResult(`🏆 Perfect! You won ${prize} π`)
      addWinner({ name: 'You', prize, time: Date.now() })
    } else {
      if (selectedLevel === 0) {
        setResult('Unlucky! Try again tomorrow.')
      } else {
        setResult('Unlucky! Try again.')
      }
    }
  }

  const addWinner = (winner) => {
    setWinners(prev => [winner, ...prev].slice(0, 10))
  }

  const startAttempt = () => {
    if (selectedLevel === 0) {
      if (!playedFreeToday) {
        savePlayedToday()
        resetGame()
        setRunning(true)
      } else {
        alert('You already used today’s free play.')
      }
    } else {
      resetGame()
      setRunning(true)
    }
  }

  const resetGame = () => {
    clearInterval(intervalRef.current)
    setRunning(false)
    setTime(0)
    setResult('')
  }

  const handleLevelChange = (idx) => {
    if (selectedLevel === 0 && idx !== 0) {
      setFreeLocked(true)
    }
    setSelectedLevel(idx)
    resetGame()
  }

  return (
    <main className="app-background min-h-screen p-4 text-white flex flex-col items-center">
      <div className="max-w-md w-full space-y-4">

        {/* Title */}
        <div className="competition-top-banner title-gradient mb-4 text-center">
          3.14 Challenge
        </div>

        {/* Funky Pioneer Message */}
        <div className="text-center mb-2">
          <p className="text-xl font-bold text-cyan-300">
            Can You Beat the Pi Timer?
          </p>
          <p className="text-sm text-white mt-1">
            Hit exactly 3.14s to claim your Pi reward!
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white bg-opacity-10 rounded-2xl shadow-lg p-6 text-center">

          {/* Prize Info */}
          <div className="mb-4">
            <p className="text-lg font-semibold text-cyan-300">
              Playing for {levels[selectedLevel].prize.toFixed(2)} π Prize
            </p>
            {selectedLevel === 0 ? (
              <p className="text-sm text-white">Free Play: Win 5 π</p>
            ) : (
              <p className="text-sm text-white">
                Entry Fee: {levels[selectedLevel].fee.toFixed(2)} π → Win 5X Stake
              </p>
            )}
          </div>

          {/* Level Selector */}
          <div className="flex justify-center flex-wrap gap-2 mb-4">
            {levels.map((level, idx) => (
              <button
                key={idx}
                onClick={() => handleLevelChange(idx)}
                className={`py-1 px-4 rounded-full text-sm font-semibold ${selectedLevel === idx ? 'bg-cyan-300 text-black' : 'bg-white bg-opacity-20'}`}
                disabled={(idx === 0 && (playedFreeToday || freeLocked))}
              >
                {level.name}
              </button>
            ))}
          </div>

          {/* Timer */}
          <div className="flex justify-center items-center py-4">
            <div className="text-6xl font-mono">{time.toFixed(2)}s</div>
          </div>

          {/* Buttons */}
          <div className="flex justify-center gap-4">
            {!running && (
              <button
                onClick={startAttempt}
                className="btn-gradient py-2 px-6 text-lg rounded-full shadow-lg"
              >
                Start Play
              </button>
            )}
            {running && (
              <button
                onClick={stop}
                className="btn-gradient py-2 px-6 text-lg rounded-full shadow-lg"
              >
                Stop
              </button>
            )}
          </div>

          {/* Result */}
          {result && (
            <div className="mt-4">
              <p className="text-lg font-bold">{result}</p>
            </div>
          )}
        </div>

        {/* Terms */}
        <div className="text-center">
          <Link href="/terms" className="text-sm text-cyan-300 underline mt-2 block">
            Terms & Conditions apply
          </Link>
        </div>

        {/* Recent Winners */}
    <div className="bg-white bg-opacity-10 rounded-2xl shadow-lg p-6 text-center">
  <h2 className="text-xl font-semibold mb-4 text-cyan-300">
    🏆 Recent Winners
  </h2>
  <ul className="space-y-3">
    {winners.map((entry, idx) => (
      <li key={idx} className="bg-white bg-opacity-10 rounded-xl py-3 px-4 flex justify-between items-center shadow">
        <div className="text-left">
          <p className="font-semibold text-white">{entry.name}</p>
          <p className="text-sm text-cyan-300">Won {entry.prize} π by hitting 3.14s</p>
        </div>
        <div className="text-xs text-white opacity-70">
          {fmtRelative(Date.now() - entry.time)}
        </div>
      </li>
    ))}
  </ul>
</div>


        {/* Back Button */}
        <Link href="/try-your-luck" className="text-sm text-cyan-300 underline mt-2 mx-auto block text-center">
          Back to Mini Games
        </Link>

        {/* Confetti */}
        {result.includes('🏆') && <Confetti width={width} height={height} />}
      </div>
    </main>
  )
}
