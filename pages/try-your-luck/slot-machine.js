// pages/try-your-luck/slot-machine.js
'use client'

import { useEffect, useRef, useState } from 'react'
import Confetti from 'react-confetti'
import { useWindowSize } from '@uidotdev/usehooks'

const symbols = ['🥧','⭐','🔥','🔒','🪙','🎁,🥧','⭐','🔥','🔒','🪙','🎁']

export default function PiSlotMachine() {
  const canvasRef = useRef(null)
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState(null)
  const [played, setPlayed] = useState(false)
  const { width, height } = useWindowSize()

  // Reel state: current index, velocity, spinning flag
  const reelsRef = useRef([
    { index: 0, velocity: 0, spinning: false },
    { index: 0, velocity: 0, spinning: false },
    { index: 0, velocity: 0, spinning: false }
  ])

  // Block replay if already played today
  useEffect(() => {
    if (localStorage.getItem('slotMachinePlayed') === new Date().toDateString()) {
      setPlayed(true)
    }
  }, [])

  // Start spin: initialize velocities and spinning flags
  const startSpin = () => {
    if (played || spinning) return
    setResult(null)
    setSpinning(true)
    reelsRef.current = reelsRef.current.map((r, i) => ({
      index: r.index,
      // faster start for left reel, slower for right
      velocity: 0.5 + i * 0.25,
      spinning: true
    }))
  }

  // Canvas render loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width = 300
    const H = canvas.height = 200
    let raf

    function draw() {
      ctx.clearRect(0, 0, W, H)

      // Background gradient
      const bg = ctx.createLinearGradient(0, 0, 0, H)
      bg.addColorStop(0, '#1e3a8a')
      bg.addColorStop(1, '#60a5fa')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, W, H)

      const slotW = W / 3
      // Draw each reel
      reelsRef.current.forEach((r, i) => {
        const x = i * slotW

        // -- Frosted-glass background --
        ctx.save()
        ctx.fillStyle = 'rgba(255,255,255,0.1)'
        ctx.fillRect(x, 0, slotW, H)
        ctx.fillStyle = 'rgba(255,255,255,0.15)'
        ctx.fillRect(x + 4, 4, slotW - 8, H - 8)
        ctx.lineWidth = 3
        ctx.strokeStyle = 'rgba(255,255,255,0.6)'
        ctx.strokeRect(x + 2, 2, slotW - 4, H - 4)
        ctx.restore()

        // -- Spin logic & easing --
        if (r.spinning) {
          r.index += r.velocity
          // decelerate
          r.velocity = Math.max(0, r.velocity - 0.005 - i * 0.001)
          if (r.velocity === 0) r.spinning = false
        }
        r.index = ((r.index % symbols.length) + symbols.length) % symbols.length

        // -- Draw symbol --
        ctx.font = '52px monospace'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = '#fff'
        ctx.fillText(symbols[Math.floor(r.index)], x + slotW / 2, H / 2)
      })

      // When all reels stopped, finalize result
      if (spinning && reelsRef.current.every(r => !r.spinning)) {
        setSpinning(false)
        localStorage.setItem('slotMachinePlayed', new Date().toDateString())
        const [a, b, c] = reelsRef.current.map(r => Math.floor(r.index))
        if (a === b && b === c) {
          setResult('🎉 Jackpot! You matched all 3!')
        } else {
          setResult('❌ No match. Try again tomorrow!')
        }
      }

      raf = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(raf)
  }, [spinning])

  return (
    <main
      className="min-h-screen flex flex-col items-center p-4"
      style={{ backgroundImage: 'linear-gradient(to bottom right, #1E3A8A, #60A5FA)' }}
    >
      {/* Top Banner */}
      <div
        className="competition-top-banner text-white text-center px-4 py-2 rounded mb-4"
        style={{ background: 'var(--primary-gradient)' }}
      >
        🎰 Pi Slot Machine
      </div>

      {/* Canvas Slot */}
      <canvas
        ref={canvasRef}
        style={{
          width: 300,
          height: 200,
          borderRadius: '8px',
          boxShadow: '0 0 20px rgba(0,0,0,0.3)',
          marginBottom: '1rem'
        }}
      />

      {/* Spin Button */}
      <button
        onClick={startSpin}
        disabled={played || spinning}
        className={`
          comp-button bg-blue-600 text-white py-2 px-6 rounded-full
          hover:bg-blue-700 transition
          ${(played || spinning) ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {spinning ? 'Spinning...' : played ? 'Already Played Today' : 'SPIN!'}
      </button>

      {/* Result & Confetti */}
      {result && <p className="mt-4 text-lg font-bold text-white">{result}</p>}
      {result?.includes('Jackpot') && <Confetti width={width} height={height} />}
    </main>
  )
}
