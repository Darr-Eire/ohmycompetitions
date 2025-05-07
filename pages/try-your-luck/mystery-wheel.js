// pages/try-your-luck/mystery-wheel.js
'use client'

import { useEffect, useRef, useState } from 'react'
import Confetti from 'react-confetti'
import { useWindowSize } from '@uidotdev/usehooks'

const prizes = [
  { emoji: '🎟️', label: 'Free Ticket' },
  { emoji: '🔥',  label: 'Bonus Pi'   },
  { emoji: '🥧',  label: 'Mystery Pie' },
  { emoji: '⭐',  label: '2× Entries'  },
  { emoji: 'π',   label: '0.314 π'     },
  { emoji: '🎁',  label: 'Surprise Gift' },
]

const sliceColors = [
  '#2563EB',
  '#38BDF8',
  '#22D3EE',
  '#7DD3FC',
  '#93C5FD',
  '#60A5FA',
]

export default function MysteryWheelPage() {
  const canvasRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [angle, setAngle] = useState(0)
  const [result, setResult] = useState(null)
  const [played, setPlayed] = useState(false)
  const { width, height } = useWindowSize()

  useEffect(() => {
    if (localStorage.getItem('mysteryWheelPlayed') === new Date().toDateString()) {
      setPlayed(true)
    }
  }, [])

  const spin = () => {
    if (playing || played) return
    setPlaying(true)
    setResult(null)

    const sliceAngle = 360 / prizes.length
    const targetIndex = Math.floor(Math.random() * prizes.length)
    const rotations = 3 + Math.random() * 2
    const finalAngle = rotations * 360 + (360 - (targetIndex * sliceAngle + sliceAngle / 2))

    const start = performance.now()
    const duration = 4000
    const from = angle

    function animate(now) {
      const t = Math.min((now - start) / duration, 1)
      const eased = t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2
      setAngle(from + (finalAngle - from) * eased)
      if (t < 1) requestAnimationFrame(animate)
      else {
        setPlaying(false)
        setPlayed(true)
        localStorage.setItem('mysteryWheelPlayed', new Date().toDateString())
        setResult(prizes[targetIndex].label)
      }
    }
    requestAnimationFrame(animate)
  }

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

      // Background gradient
      const bg = ctx.createLinearGradient(0, 0, 0, size)
      bg.addColorStop(0, '#1e3a8a')
      bg.addColorStop(1, '#60a5fa')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, size, size)

      // Draw wheel
      ctx.save()
      ctx.translate(size/2, size/2)
      ctx.rotate((angle * Math.PI) / 180)
      const slice = (2 * Math.PI) / prizes.length
      const radius = size * 0.45
      for (let i = 0; i < prizes.length; i++) {
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.arc(0, 0, radius, i * slice, (i + 1) * slice)
        ctx.closePath()
        ctx.fillStyle = sliceColors[i]
        ctx.fill()
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 2
        ctx.stroke()
        // Emoji
        const mid = i * slice + slice / 2
        const x = Math.cos(mid) * (radius * 0.6)
        const y = Math.sin(mid) * (radius * 0.6)
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(-angle * Math.PI / 180)
        ctx.fillStyle = prizes[i].emoji === 'π' ? '#FBBF24' : '#ffffff'
        ctx.font = 'bold 32px Orbitron, monospace'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(prizes[i].emoji, 0, 0)
        ctx.restore()
      }
      ctx.restore()

      // Pointer
      ctx.fillStyle = '#fff'
      ctx.beginPath()
      ctx.moveTo(size/2 - 14, 14)
      ctx.lineTo(size/2 + 14, 14)
      ctx.lineTo(size/2, 40)
      ctx.closePath()
      ctx.fill()

      raf = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(raf)
  }, [angle])

  return (
    <main className="app-background min-h-screen flex flex-col items-center justify-center p-4 text-white">
      {result && <Confetti width={width} height={height} />}

      <div className="competition-card relative w-full max-w-md bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-600 opacity-30 mix-blend-overlay animate-pulse-slow"></div>
        <div className="relative z-10 p-6 space-y-6">
          <h1 className="title-gradient text-3xl font-orbitron text-center">🎡 Mystery Wheel</h1>

          <canvas
            ref={canvasRef}
            className="mx-auto w-72 h-72 rounded-full shadow-inner"
          />

          <button
            onClick={spin}
            disabled={playing || played}
            className={`btn-gradient w-full py-3 text-xl ${playing || played ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {playing ? 'Spinning...' : played ? 'Already Played Today' : 'SPIN!'}
          </button>

          {result && (
            <p className="text-center text-lg font-bold mt-2">
              🎉 You won {result}!
            </p>
          )}
        </div>
      </div>
    </main>
  )
}