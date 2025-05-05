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

  // Prevent replay if already played today
  useEffect(() => {
    if (localStorage.getItem('threeFourteenPlayed')) {
      setResult('⏳ You already played today!')
    }
  }, [])

  const formatTime = t => {
    const s = Math.floor(t)
    const ms = Math.floor((t - s) * 100)
    return `${s}.${ms.toString().padStart(2,'0')}`
  }

  // Timer logic
  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => {
      setTime(prev => +(prev + 0.01).toFixed(2))
    }, 10)
    return () => clearInterval(intervalRef.current)
  }, [running])

  // Stop the timer
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

  // Enhanced canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const size = 300
    canvas.width = size
    canvas.height = size

    let frameId
    let blink = true

    function draw() {
      ctx.clearRect(0, 0, size, size)

      // background blending
      const bg = ctx.createLinearGradient(0, 0, 0, size)
      bg.addColorStop(0, 'rgba(30,58,138,0.85)')
      bg.addColorStop(1, 'rgba(96,165,250,0.85)')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, size, size)

      // frosted overlay
      ctx.fillStyle = 'rgba(255,255,255,0.1)'
      ctx.fillRect(0, 0, size, size)

      // halo glow
      ctx.save()
      ctx.translate(size/2, size/2)
      const halo = ctx.createRadialGradient(0,0,size*0.3,0,0,size*0.6)
      halo.addColorStop(0,'rgba(255,255,255,0.2)')
      halo.addColorStop(1,'transparent')
      ctx.fillStyle = halo
      ctx.beginPath()
      ctx.arc(0, 0, size*0.6, 0, Math.PI*2)
      ctx.fill()
      ctx.restore()

      // tick marks
      ctx.save()
      ctx.translate(size/2, size/2)
      ctx.strokeStyle = 'rgba(255,255,255,0.4)'
      ctx.lineWidth = 2
      for (let i=0; i<60; i++) {
        const len = i % 5 ? 6 : 12
        ctx.beginPath()
        ctx.moveTo(0, -size/2 + 20)
        ctx.lineTo(0, -size/2 + 20 + len)
        ctx.stroke()
        ctx.rotate((Math.PI*2)/60)
      }
      ctx.restore()

      // metallic ring
      ctx.save()
      ctx.translate(size/2, size/2)
      const ring = ctx.createRadialGradient(0,0,size*0.35,0,0,size*0.48)
      ring.addColorStop(0,'#93c5fd')
      ring.addColorStop(0.7,'#1e3a8a')
      ring.addColorStop(1,'#1e3a8a')
      ctx.fillStyle = ring
      ctx.beginPath()
      ctx.arc(0,0,size*0.48,0,Math.PI*2)
      ctx.fill()
      ctx.restore()

      // hand
      const angle = (time % 10)/10*Math.PI*2 - Math.PI/2
      ctx.save()
      ctx.translate(size/2, size/2)
      ctx.rotate(angle)
      ctx.shadowColor = 'rgba(0,0,0,0.4)'
      ctx.shadowBlur = 8
      ctx.fillStyle = '#ffa726'
      ctx.beginPath()
      ctx.moveTo(-4,0)
      ctx.lineTo(4,0)
      ctx.lineTo(2,-size*0.35)
      ctx.lineTo(-2,-size*0.35)
      ctx.closePath()
      ctx.fill()
      ctx.restore()
      ctx.shadowBlur = 0

      // center cap
      ctx.save()
      ctx.translate(size/2, size/2)
      ctx.fillStyle = '#fff'
      ctx.beginPath()
      ctx.arc(0,0,8,0,Math.PI*2)
      ctx.fill()
      ctx.restore()

      // time readout
      ctx.font = 'bold 32px monospace'
      ctx.textAlign = 'center'
      ctx.fillStyle = '#fff'
      ctx.fillText(`${formatTime(time)}s`, size/2, size*0.9)

      frameId = requestAnimationFrame(draw)
    }

    const blinkId = setInterval(() => blink = !blink, 500)
    draw()
    return () => {
      cancelAnimationFrame(frameId)
      clearInterval(blinkId)
    }
  }, [time, running, result])

  return (
    <main
      className="min-h-screen flex flex-col items-center p-4"
      style={{ backgroundImage:'linear-gradient(to bottom right,#1E3A8A,#60A5FA)' }}
    >
      {result.includes('🏆') && <Confetti width={width} height={height} />}

      {/* Title */}
      <div
        className="competition-top-banner text-white text-center px-4 py-2 rounded"
        style={{ background:'var(--primary-gradient)', marginBottom: '0.5rem' }}
      >
        ⏱️ 3.14 Stopwatch Challenge
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          width: 300,
          height: 300,
          borderRadius: '50%',
          boxShadow: '0 0 20px rgba(0,0,0,0.2)',
          marginTop: '-0.5rem'
        }}
      />

      {/* Controls */}
      <div className="flex gap-4 mt-2 mb-4">
        {!running && !result && (
          <button
            onClick={() => { setTime(0); setResult(''); setRunning(true) }}
            className="comp-button bg-blue-600 text-white py-2 px-6 rounded-full hover:bg-blue-700 transition"
          >
            Start
          </button>
        )}
        {running && (
          <button
            onClick={stop}
            className="comp-button bg-pink-600 text-white py-2 px-6 rounded-full hover:bg-pink-700 transition"
          >
            Stop
          </button>
        )}
        {result && !running && (
          <button
            onClick={() => window.location.reload()}
            className="comp-button bg-gray-600 text-white py-2 px-6 rounded-full hover:bg-gray-700 transition"
          >
            Reset
          </button>
        )}
      </div>

      {result && (
        <p className="text-white text-lg font-semibold mb-2">{result}</p>
      )}
      <p className="text-yellow-300 text-sm">
        🔥 Streak: {getStreak()} days 🔥
      </p>
    </main>
  )
}
