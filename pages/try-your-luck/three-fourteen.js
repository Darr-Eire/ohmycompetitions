// pages/try-your-luck/three-fourteen.js
'use client'

import { useEffect, useRef, useState } from 'react'
import Confetti from 'react-confetti'
import { useWindowSize } from '@uidotdev/usehooks'
import { updateDailyStreak, getStreak } from '@/lib/streak'

export default function ThreeFourteenGame() {
  const canvasRef = useRef(null)
  const [running, setRunning] = useState(false)
  const [time, setTime] = useState(0)
  const [result, setResult] = useState('')
  const intervalRef = useRef(null)
  const { width, height } = useWindowSize()

  useEffect(() => {
    if (localStorage.getItem('threeFourteenPlayed') === new Date().toDateString()) {
      setResult('⏳ You already played today!')
    }
  }, [])

  const formatTime = t => t.toFixed(2)

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
    localStorage.setItem('threeFourteenPlayed', new Date().toDateString())
    const diff = Math.abs(3.14 - time)
    if (diff <= 0.05) {
      updateDailyStreak()
      setResult('🏆 Perfect! You unlocked a prize!')
    } else {
      setResult(`❌ You stopped at ${formatTime(time)}s. Try again tomorrow!`)
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const size = 300
    canvas.width = size
    canvas.height = size

    let frameId
    const draw = () => {
      ctx.clearRect(0, 0, size, size)
      // ... existing drawing logic remains unchanged ...
    }
    draw()
    return () => cancelAnimationFrame(frameId)
  }, [time])

  return (
    <main className="app-background min-h-screen flex items-center justify-center px-4 sm:px-6 py-8 text-white">
      <div className="w-full max-w-md mx-auto">
        {result.includes('🏆') && <Confetti width={width} height={height} />}

        <div className="competition-card relative bg-white bg-opacity-10 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-600 opacity-30 mix-blend-screen animate-pulse-slow"></div>
          <div className="relative z-10 p-8 space-y-6">
            <div className="title-gradient text-3xl font-orbitron">⏱️ 3.14 Stopwatch Challenge</div>

            <canvas ref={canvasRef} className="mx-auto w-72 h-72 rounded-full shadow-inner" />

            <div className="flex gap-4 justify-center">
              {!running && !result && (
                <button
                  onClick={() => { setTime(0); setResult(''); setRunning(true) }}
                  className="btn-gradient py-3 px-6 text-lg"
                >
                  Start
                </button>
              )}
              {running && (
                <button
                  onClick={stop}
                  className="btn-gradient py-3 px-6 text-lg"
                >
                  Stop
                </button>
              )}
              {!running && result && (
                <button
                  onClick={() => window.location.reload()}
                  className="btn-gradient py-3 px-6 text-lg"
                >
                  Reset
                </button>
              )}
            </div>

            {result && (
              <p className="text-center text-lg font-bold mt-2">{result}</p>
            )}
            <p className="text-center text-yellow-300">🔥 Streak: {getStreak()} days 🔥</p>
          </div>
        </div>
      </div>
    </main>
  )
}
