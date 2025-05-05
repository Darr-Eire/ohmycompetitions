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
  { emoji: 'π',  label: '0.314'       },
  { emoji: '🎁',  label: 'Surprise Gift' },
]

const sliceColors = [
  '#2563EB', // 0: deep royal blue
  '#38BDF8', // 1: sky teal
  '#22D3EE', // 2: light cyan
  '#7DD3FC', // 3: pale azure
  '#93C5FD', // 4: bright periwinkle (π)
  '#60A5FA'  // 5: soft cornflower
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

    function draw() {
      // inside useEffect draw()
ctx.clearRect(0,0,size,size)

// background
const bg = ctx.createLinearGradient(0,0,0,size)
bg.addColorStop(0,'#1e3a8a')
bg.addColorStop(1,'#60a5fa')
ctx.fillStyle = bg
ctx.fillRect(0,0,size,size)

// rotate entire wheel
ctx.save()
ctx.translate(size/2, size/2)
ctx.rotate(angle * Math.PI/180)

// draw slices & emojis together
const slice = 2 * Math.PI / prizes.length
const radius = size * 0.35

for (let i = 0; i < prizes.length; i++) {
  // slice
  ctx.beginPath()
  ctx.moveTo(0,0)
  ctx.arc(0,0, size*0.45, i*slice, (i+1)*slice)
  ctx.closePath()
  ctx.fillStyle = sliceColors[i]
  ctx.fill()
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 2
  ctx.stroke()

  // compute emoji position in rotated space
  const mid = i*slice + slice/2
  const x = Math.cos(mid) * radius
  const y = Math.sin(mid) * radius

  // draw emoji at (x,y), un‐rotated
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(-angle * Math.PI/180) // cancel the wheel’s overall rotation
  ctx.fillStyle = prizes[i].emoji === 'π' ? '#FBBF24' : '#ffffff'
  ctx.font = 'bold 32px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(prizes[i].emoji, 0, 0)
  ctx.restore()
}

ctx.restore()

// pointer
ctx.fillStyle = '#ffffff'
ctx.beginPath()
ctx.moveTo(size/2 - 12, 12)
ctx.lineTo(size/2 + 12, 12)
ctx.lineTo(size/2, 36)
ctx.closePath()
ctx.fill()


      raf = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(raf)
  }, [angle])

  return (
    <main
      className="min-h-screen flex flex-col items-center p-4"
      style={{ backgroundImage: 'linear-gradient(to bottom right, #1E3A8A, #60A5FA)' }}
    >
      <div
        className="competition-top-banner text-white text-center px-4 py-2 rounded mb-4"
        style={{ background: 'var(--primary-gradient)' }}
      >
        🎡 Mystery Wheel
      </div>

      <canvas
        ref={canvasRef}
        className="rounded-full shadow-lg mb-4"
        style={{ width: 300, height: 300 }}
      />

      <button
        onClick={spin}
        disabled={playing || played}
        className={`comp-button bg-blue-600 text-white py-2 px-6 rounded-full hover:bg-blue-700 transition ${playing || played ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {playing ? 'Spinning...' : played ? 'Already Played Today' : 'SPIN!'}
      </button>

      {result && (
        <p className="mt-4 text-lg font-semibold text-white">
          🎉 You won {result}!
        </p>
      )}
      {result && <Confetti width={width} height={height} />}
    </main>
  )
}
