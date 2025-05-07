// pages/try-your-luck/three-fourteen.js
'use client'

import { useEffect, useRef, useState } from 'react'
import Confetti from 'react-confetti'
import { useWindowSize } from '@uidotdev/usehooks'
import { updateDailyStreak, getStreak } from '@/lib/streak'

// initial mock leaderboard
const initialBoard = [
  { name: 'Alice',   result: '🏆 Perfect!', time: Date.now() - 2 * 60e3 },
  { name: 'Bob',     result: '❌ 3.12s',    time: Date.now() - 5 * 60e3 },
  { name: 'Charlie', result: '❌ 3.20s',    time: Date.now() - 20 * 60e3 },
]

// helper to format “5m ago”, etc.
const fmtRelative = ms => {
  const sec = Math.floor(ms / 1000)
  if (sec < 60) return `${sec}s ago`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  return `${Math.floor(min / 60)}h ago`
}

export default function ThreeFourteenGame() {
  const canvasRef = useRef(null)
  const [running, setRunning] = useState(false)
  const [time, setTime] = useState(0)
  const [result, setResult] = useState('')
  const [board, setBoard] = useState(initialBoard)
  const intervalRef = useRef(null)
  const { width, height } = useWindowSize()

  // block replay
  useEffect(() => {
    if (localStorage.getItem('threeFourteenPlayed') === new Date().toDateString()) {
      setResult('⏳ You already played today!')
    }
  }, [])

  // ticker
  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => {
      setTime(prev => +(prev + 0.01).toFixed(2))
    }, 10)
    return () => clearInterval(intervalRef.current)
  }, [running])

  // stop logic
  const stop = () => {
    clearInterval(intervalRef.current)
    setRunning(false)
    localStorage.setItem('threeFourteenPlayed', new Date().toDateString())

    const diff = Math.abs(3.14 - time)
    const outcome = diff <= 0.05 ? '🏆 Perfect!' : `❌ ${time.toFixed(2)}s`
    if (diff <= 0.05) updateDailyStreak()

    setResult(outcome)
    setBoard(prev => [
      { name: 'You', result: outcome, time: Date.now() },
      ...prev,
    ].slice(0, 10))
  }

  // canvas draw loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const size = 300
    canvas.width = size
    canvas.height = size
    let raf

    const draw = () => {
      ctx.clearRect(0, 0, size, size)

      // background gradient
      const bg = ctx.createLinearGradient(0, 0, 0, size)
      bg.addColorStop(0, '#1E3A8A')
      bg.addColorStop(1, '#2563eb')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, size, size)

      // tick marks
      ctx.save()
      ctx.translate(size/2, size/2)
      ctx.strokeStyle = 'rgba(255,255,255,0.4)'
      ctx.lineWidth = 2
      for (let i = 0; i < 60; i++) {
        const len = i % 5 ? 6 : 12
        ctx.beginPath()
        ctx.moveTo(0, -size/2 + 20)
        ctx.lineTo(0, -size/2 + 20 + len)
        ctx.stroke()
        ctx.rotate((2 * Math.PI) / 60)
      }
      ctx.restore()

      // needle
      ctx.save()
      ctx.translate(size/2, size/2)
      const angle = (time % 10) / 10 * 2 * Math.PI - Math.PI/2
      ctx.rotate(angle)
      ctx.fillStyle = '#ffa726'
      ctx.beginPath()
      ctx.moveTo(-4, 0)
      ctx.lineTo(4, 0)
      ctx.lineTo(2, -size * 0.35)
      ctx.lineTo(-2, -size * 0.35)
      ctx.closePath()
      ctx.fill()
      ctx.restore()

      // center dot
      ctx.save()
      ctx.translate(size/2, size/2)
      ctx.fillStyle = '#fff'
      ctx.beginPath()
      ctx.arc(0, 0, 8, 0, 2 * Math.PI)
      ctx.fill()
      ctx.restore()

      // time text
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 32px Orbitron, monospace'
      ctx.textAlign = 'center'
      ctx.fillText(`${time.toFixed(2)}s`, size/2, size * 0.9)

      raf = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(raf)
  }, [time])

  // share URLs
  const shareText = result.includes('❌') ? `I got ${result.slice(2)} on 3.14 Challenge!` : `I nailed 3.14s!`
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`

  return (
    <main className="app-background flex flex-col items-center px-4 sm:px-6 py-4 text-white">
      {/* Banner */}
      <h1 className="btn-gradient text-white text-3xl font-semibold px-4 py-2 rounded-3xl shadow-lg mb-6">
        ⏱️ 3.14 Stopwatch<br/> Challenge
      </h1>

      {/* Card & Controls */}
      <div className="w-full max-w-md mx-auto space-y-4">
        <div className="competition-card relative bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-600 opacity-30 mix-blend-screen animate-pulse-slow" />
          <div className="relative z-10 p-4 space-y-4">
            <canvas ref={canvasRef} className="mx-auto w-64 h-64 rounded-full shadow-inner" />

            <div className="flex justify-center gap-4">
              {!running && !result && (
                <button
                  onClick={() => { setTime(0); setResult(''); setRunning(true) }}
                  className="btn-gradient py-2 px-4 text-lg"
                >
                  Start
                </button>
              )}
              {running && (
                <button onClick={stop} className="btn-gradient py-2 px-4 text-lg">
                  Stop
                </button>
              )}
              {!running && result && (
                <button onClick={() => window.location.reload()} className="btn-gradient py-2 px-4 text-lg">
                  Reset
                </button>
              )}
            </div>

            {result && (
              <div className="text-center space-y-2">
                <p className="text-lg font-bold">{result}</p>
                <div className="flex justify-center space-x-4">
                  <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className="underline">
                    Share on Twitter
                  </a>
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="underline">
                    Share on WhatsApp
                  </a>
                </div>
              </div>
            )}

            <p className="text-center text-yellow-300">🔥 Streak: {getStreak()} days 🔥</p>
          </div>
        </div>

        {/* Live Leaderboard */}
        <div className="btn-gradient w-full rounded-3xl shadow-2xl p-4">
          <h2 className="text-xl font-semibold mb-2 text-white">Live Leaderboard</h2>
          <ul className="space-y-1 text-sm text-white">
            {board.map((entry, idx) => (
              <li key={idx}>
                {entry.name} {entry.result} · {fmtRelative(Date.now() - entry.time)}
              </li>
            ))}
          </ul>
        </div>

        {result.includes('🏆') && <Confetti width={width} height={height} />}
      </div>
    </main>
  )
}

