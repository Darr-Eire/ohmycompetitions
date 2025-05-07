// pages/try-your-luck/slot-machine.js
'use client'

import { useEffect, useRef, useState } from 'react'
import Confetti from 'react-confetti'
import { useWindowSize } from '@uidotdev/usehooks'

// Extended symbols array with 5 more icons
const symbols = [
  '🥧', '⭐', '🔥', '🔒', '🪙', '🎁',
  '💎', '🍀', '🎲', '🥇', '🎫'
]

// Mock initial leaderboard
const initialBoard = [
  { name: 'Alice',   prize: '🥧', time: Date.now() - 2 * 60e3 },
  { name: 'Bob',     prize: '⭐', time: Date.now() - 5 * 60e3 },
  { name: 'Charlie', prize: '🔥', time: Date.now() - 20 * 60e3 },
]

// Helper to format “5m ago”, etc.
const fmtRelative = ms => {
  const sec = Math.floor(ms / 1000)
  if (sec < 60) return `${sec}s ago`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  return `${Math.floor(min / 60)}h ago`
}

export default function PiSlotMachine() {
  const canvasRef = useRef(null)
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState(null)
  const [played, setPlayed] = useState(false)
  const [board, setBoard] = useState(initialBoard)
  const { width, height } = useWindowSize()

  // Prevent replay today
  useEffect(() => {
    if (localStorage.getItem('slotMachinePlayed') === new Date().toDateString()) {
      setPlayed(true)
    }
  }, [])

  // Reel state
  const reels = useRef([0, 0, 0])
  const velocities = useRef([0.5, 0.4, 0.3])

  const startSpin = () => {
    if (spinning || played) return
    setResult(null)
    setSpinning(true)
    velocities.current = [0.5, 0.4, 0.3]
  }

  // Push result into leaderboard when it changes
  useEffect(() => {
    if (!result) return
    const entry = {
      name: 'You',
      prize: result.startsWith('🎉') ? '🎉 Jackpot!' : '❌ No match',
      time: Date.now(),
    }
    setBoard(prev => [entry, ...prev].slice(0, 10))
  }, [result])

  // Social share URLs
  const shareText = result
    ? `I ${result.startsWith('🎉') ? 'hit the Jackpot' : 'tried the Pi Slot Machine'}!`
    : ''
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`

  // Draw loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = (canvas.width = 300)
    const H = (canvas.height = 200)
    let raf

    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      // background gradient
      const bg = ctx.createLinearGradient(0, 0, 0, H)
      bg.addColorStop(0, '#001f3f')
      bg.addColorStop(1, '#001740')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, W, H)

      const slotW = W / 3
      reels.current.forEach((pos, i) => {
        const x = i * slotW
        // frosted window
        ctx.save()
        ctx.fillStyle = 'rgba(255,255,255,0.1)'
        ctx.fillRect(x, 0, slotW, H)
        ctx.fillStyle = 'rgba(255,255,255,0.15)'
        ctx.fillRect(x + 4, 4, slotW - 8, H - 8)
        ctx.strokeStyle = 'rgba(255,255,255,0.6)'
        ctx.lineWidth = 3
        ctx.strokeRect(x + 2, 2, slotW - 4, H - 4)
        ctx.restore()

        if (spinning) {
          velocities.current[i] = Math.max(0, velocities.current[i] - 0.005)
          if (velocities.current[i] > 0) {
            reels.current[i] = (pos + velocities.current[i]) % symbols.length
          }
        }

        // draw symbol
        ctx.font = '48px monospace'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = '#fff'
        const idx = Math.floor(reels.current[i])
        ctx.fillText(symbols[idx], x + slotW / 2, H / 2)
      })

      // stop condition
      if (spinning && velocities.current.every(v => v === 0)) {
        setSpinning(false)
        setPlayed(true)
        localStorage.setItem('slotMachinePlayed', new Date().toDateString())

        const [a, b, c] = reels.current.map(r => Math.floor(r))
        if (a === b && b === c) setResult('🎉 Jackpot! You matched all 3!')
        else setResult('❌ No match. Try again tomorrow!')
      }

      raf = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(raf)
  }, [spinning])

  return (
    <main className="app-background min-h-screen flex flex-col items-center px-4 sm:px-6 py-8 text-white">
      <div className="w-full max-w-md mx-auto space-y-4">
        {result?.includes('Jackpot') && <Confetti width={width} height={height} />}

        {/* Slot Machine Card */}
        <div className="competition-card relative bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-600 opacity-30 mix-blend-overlay animate-pulse-slow" />
          <div className="relative z-10 p-6 space-y-6">
            <h1 className="title-gradient text-3xl font-orbitron text-center">
              🎰 Pi Slot Machine
            </h1>
            <canvas
              ref={canvasRef}
              className="mx-auto w-full max-w-xs h-48 rounded shadow-inner"
            />
            <button
              onClick={startSpin}
              disabled={spinning || played}
              className={`btn-gradient w-full py-3 text-xl ${
                spinning || played ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {spinning ? 'Spinning...' : played ? 'Already Played Today' : 'SPIN!'}
            </button>

            {result && (
              <div className="text-center space-y-2">
                <p className="text-lg font-bold">{result}</p>
                <div className="flex justify-center space-x-4">
                  <a
                    href={twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    Share on Twitter
                  </a>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    Share on WhatsApp
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Live Leaderboard */}
        <div className="btn-gradient w-full rounded-3xl shadow-2xl p-4">
          <h2 className="text-xl font-semibold mb-2 text-white">Live Leaderboard</h2>
          <ul className="space-y-1 text-sm text-white">
            {board.map((entry, i) => (
              <li key={i}>
                {entry.name} {entry.prize} · {fmtRelative(Date.now() - entry.time)}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  )
}
