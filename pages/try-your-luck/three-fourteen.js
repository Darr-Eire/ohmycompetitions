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
    if (localStorage.getItem('threeFourteenPlayed')) {
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
    function draw() {
      ctx.clearRect(0, 0, size, size)
      const bg = ctx.createLinearGradient(0, 0, 0, size)
      bg.addColorStop(0, '#1E3A8A')
      bg.addColorStop(1, '#2563eb')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, size, size)

      ctx.save()
      ctx.globalAlpha = 0.2
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, size, size)
      ctx.restore()

      ctx.save()
      ctx.translate(size/2, size/2)
      const halo = ctx.createRadialGradient(0,0,0,0,0,size*0.6)
      halo.addColorStop(0,'rgba(255,255,255,0.2)')
      halo.addColorStop(1,'transparent')
      ctx.fillStyle = halo
      ctx.beginPath()
      ctx.arc(0,0,size*0.6,0,2*Math.PI)
      ctx.fill()
      ctx.restore()

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
        ctx.rotate((2*Math.PI)/60)
      }
      ctx.restore()

      ctx.save()
      ctx.translate(size/2, size/2)
      const ring = ctx.createRadialGradient(0,0,size*0.35,0,0,size*0.48)
      ring.addColorStop(0,'#93c5fd')
      ring.addColorStop(1,'#1e3a8a')
      ctx.fillStyle = ring
      ctx.beginPath()
      ctx.arc(0,0,size*0.48,0,2*Math.PI)
      ctx.fill()
      ctx.restore()

      const angle = (time % 10)/10 * 2*Math.PI - Math.PI/2
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

      ctx.save()
      ctx.translate(size/2, size/2)
      ctx.fillStyle = '#fff'
      ctx.beginPath()
      ctx.arc(0,0,8,0,2*Math.PI)
      ctx.fill()
      ctx.restore()

      ctx.font = 'bold 32px Orbitron, monospace'
      ctx.textAlign = 'center'
      ctx.fillStyle = '#fff'
      ctx.fillText(`${formatTime(time)}s`, size/2, size*0.9)

      frameId = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(frameId)
  }, [time])

  return (
    <main className="app-background min-h-screen flex flex-col items-center justify-center p-4 text-white">
      {result.includes('🏆') && <Confetti width={width} height={height} />}

      <div className="competition-card max-w-lg w-full bg-white bg-opacity-10 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden relative">
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
    </main>
  )
}
