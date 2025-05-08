'use client'

import { useEffect, useRef, useState } from 'react'
import Confetti from 'react-confetti'
import { useWindowSize } from '@uidotdev/usehooks'
import Link from 'next/link'

const formatRelative = ms => {
  const sec = Math.floor(ms / 1000)
  if (sec < 60) return `${sec}s ago`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const h = Math.floor(min / 60)
  return `${h}h ago`
}

export default function MysteryWheelPage() {
  const canvasRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [angle, setAngle] = useState(0)
  const [result, setResult] = useState(null)
  const [played, setPlayed] = useState(false)
  const [leaderboard, setLeaderboard] = useState([
    { name: 'Alice', prize: 'Free Ticket', time: Date.now() - 2 * 60e3 },
    { name: 'Bob', prize: 'Bonus Pi', time: Date.now() - 5 * 60e3 },
    { name: 'Charlie', prize: 'Mystery Pie', time: Date.now() - 20 * 60e3 },
  ])
  const [nextSpin, setNextSpin] = useState(0)
  const [highlightIndex, setHighlightIndex] = useState(null)
  const { width, height } = useWindowSize()

  useEffect(() => {
    const now = new Date()
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
    const tick = () => setNextSpin(tomorrow - Date.now())
    tick()
    const iv = setInterval(tick, 1000)
    return () => clearInterval(iv)
  }, [])

  useEffect(() => {
    if (localStorage.getItem('mysteryWheelPlayed') === new Date().toDateString()) {
      setPlayed(true)
    }
  }, [])

  const spin = () => {
    if (playing || played) return
    setPlaying(true)
    setResult(null)

    const prizesArr = [
      { emoji: '🎟️', label: 'Free Ticket' },
      { emoji: '🔥', label: 'Bonus Pi' },
      { emoji: '🥧', label: 'Mystery Pie' },
      { emoji: '⭐', label: '2× Entries' },
      { emoji: 'π', label: '0.314 π' },
      { emoji: '🎁', label: 'Surprise Gift' },
    ]
    const sliceColors = ['#2563EB', '#38BDF8', '#22D3EE', '#7DD3FC', '#93C5FD', '#60A5FA']
    const sliceAngle = 360 / prizesArr.length
    const targetIndex = Math.floor(Math.random() * prizesArr.length)
    const rotations = 3 + Math.random() * 2
    const finalAngle = rotations * 360 + (360 - (targetIndex * sliceAngle + sliceAngle / 2))

    const start = performance.now()
    const duration = 4000
    const from = angle

    function animate(now) {
      const t = Math.min((now - start) / duration, 1)
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
      setAngle(from + (finalAngle - from) * eased)
      if (t < 1) requestAnimationFrame(animate)
      else {
        setPlaying(false)
        setPlayed(true)
        localStorage.setItem('mysteryWheelPlayed', new Date().toDateString())
        const prize = prizesArr[targetIndex].label
        setResult(prize)
        setLeaderboard(prev => [
          { name: 'You', prize, time: Date.now() },
          ...prev,
        ].slice(0, 10))
        setHighlightIndex(targetIndex)
        setTimeout(() => setHighlightIndex(null), 2000)
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
    const prizesArr = [
      { emoji: '🎟️' }, { emoji: '🔥' }, { emoji: '🥧' },
      { emoji: '⭐' }, { emoji: 'π' }, { emoji: '🎁' }
    ]
    const sliceColors = ['#2563EB', '#38BDF8', '#22D3EE', '#7DD3FC', '#93C5FD', '#60A5FA']
    let raf

    function draw() {
      ctx.clearRect(0, 0, size, size)
      const bg = ctx.createLinearGradient(0, 0, 0, size)
      bg.addColorStop(0, '#1e3a8a')
      bg.addColorStop(1, '#60a5fa')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, size, size)

      ctx.save()
      ctx.translate(size / 2, size / 2)
      ctx.rotate((angle * Math.PI) / 180)
      const slice = (2 * Math.PI) / prizesArr.length
      const radius = size * 0.45

      prizesArr.forEach((p, i) => {
        if (i === highlightIndex) {
          ctx.save()
          ctx.shadowColor = '#FFF'
          ctx.shadowBlur = 20
          ctx.fillStyle = sliceColors[i]
          ctx.beginPath()
          ctx.moveTo(0, 0)
          ctx.arc(0, 0, radius, i * slice, (i + 1) * slice)
          ctx.closePath()
          ctx.fill()
          ctx.restore()
        }
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.arc(0, 0, radius, i * slice, (i + 1) * slice)
        ctx.closePath()
        ctx.fillStyle = sliceColors[i]
        ctx.fill()
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 2
        ctx.stroke()

        const mid = i * slice + slice / 2
        const x = Math.cos(mid) * (radius * 0.6)
        const y = Math.sin(mid) * (radius * 0.6)
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(-(angle * Math.PI) / 180)
        ctx.fillStyle = p.emoji === 'π' ? '#FBBF24' : '#fff'
        ctx.font = 'bold 32px Orbitron, monospace'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(p.emoji, 0, 0)
        ctx.restore()
      })

      ctx.restore()
      ctx.fillStyle = '#fff'
      ctx.beginPath()
      ctx.moveTo(size / 2 - 14, 14)
      ctx.lineTo(size / 2 + 14, 14)
      ctx.lineTo(size / 2, 40)
      ctx.closePath()
      ctx.fill()
      raf = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(raf)
  }, [angle, highlightIndex])

  const shareText = result ? `I just won ${result} on Mystery Wheel!` : ''
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`

  return (
    <main className="app-background flex flex-col items-center px-4 sm:px-6 py-4 text-white">
      <h1 className="title-gradient text-4xl font-orbitron">🎡 Mystery Wheel</h1>

      <div className="mt-4 w-full max-w-md space-y-4 mx-auto">
        <div className="competition-card relative overflow-hidden rounded-3xl shadow-2xl bg-white bg-opacity-10 backdrop-blur-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-600 opacity-30 mix-blend-overlay animate-pulse-slow" />
          <div className="relative z-10 p-4">
            <canvas ref={canvasRef} className="mx-auto w-64 h-64 rounded-full shadow-inner" />
            <button
              onClick={spin}
              disabled={playing || played}
              className={`btn-gradient w-full py-2 text-lg mt-4 ${playing || played ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {playing ? 'Spinning...' : played ? 'Already Played Today' : 'SPIN!'}
            </button>
            {result && (
              <div className="mt-2 text-center">
                <p className="font-bold">🎉 You won {result}!</p>
                <div className="flex justify-center space-x-4 mt-2">
                  <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className="underline">Share on Twitter</a>
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="underline">Share on WhatsApp</a>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="text-center text-sm">
          Next spin in: {new Date(nextSpin).toISOString().substr(11, 8)}
        </div>

        <div className="btn-gradient w-full p-6 rounded-3xl shadow-2xl">
          <h2 className="text-xl font-semibold mb-2 text-white">Live Leaderboard</h2>
          <ul className="space-y-1 text-sm text-white">
            {leaderboard.map((w, i) => (
              <li key={i}>{w.name} won {w.prize} · {formatRelative(Date.now() - w.time)}</li>
            ))}
          </ul>
        </div>

        {/* Back to Mini Games Button */}
        <Link
          href="/try-your-luck"
          className="btn-gradient mt-6 w-full text-center py-2 rounded-xl text-white font-semibold"
        >
          ← Back to Mini Games
        </Link>
      </div>

      {result && <Confetti width={width} height={height} />}
    </main>
  )
}
