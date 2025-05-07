// pages/try-your-luck/hack-the-vault.js
'use client'

import { useEffect, useRef, useState } from 'react'
import Confetti from 'react-confetti'
import { useWindowSize } from '@uidotdev/usehooks'

// Mock initial winners
const initialBoard = [
  { name: 'Alice', time: Date.now() - 2 * 60e3 },
  { name: 'Bob',   time: Date.now() - 5 * 60e3 },
  { name: 'Charlie', time: Date.now() - 20 * 60e3 },
]

// Format “5m ago” etc.
const fmtRelative = ms => {
  const sec = Math.floor(ms/1000)
  if (sec < 60) return `${sec}s ago`
  const min = Math.floor(sec/60)
  if (min < 60) return `${min}m ago`
  return `${Math.floor(min/60)}h ago`
}

export default function HackTheVaultPage() {
  const canvasRef = useRef(null)
  const [status, setStatus] = useState('idle') // idle | hacking | shake | won | lost
  const [countdown, setCountdown] = useState(60)
  const [digits, setDigits] = useState([0, 0, 0])
  const [board, setBoard] = useState(initialBoard)
  const { width, height } = useWindowSize()
  const target = [4, 2, 9]

  // Build share text & URLs
  const shareText = status === 'won'
    ? `I hacked the vault in the Hack The Vault challenge!`
    : status === 'lost'
      ? `I tried hacking the vault in the Hack The Vault challenge!`
      : ''
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`

  // Digit change
  const changeDigit = (i, delta) => {
    if (status !== 'hacking') return
    setDigits(d => {
      const nd = [...d]
      nd[i] = (nd[i] + delta + 10) % 10
      return nd
    })
  }

  // Enter code logic
  const enterCode = () => {
    if (status !== 'hacking') return
    if (digits.every((d, i) => d === target[i])) {
      setStatus('won')
    } else {
      setStatus('shake')
      setTimeout(() => setStatus('hacking'), 300)
    }
  }

  // Log winner to leaderboard
  useEffect(() => {
    if (status === 'won') {
      setBoard(prev => [
        { name: 'You', time: Date.now() },
        ...prev
      ].slice(0, 10))
    }
  }, [status])

  // Canvas & countdown
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const boxW = 350, boxH = 120
    canvas.width = boxW
    canvas.height = boxH + 40
    canvas.style.width = '100%'
    canvas.style.height = `${((boxH + 40) / boxW) * 100}%`

    let raf, countdownId, shakeProg = 0
    const easeOut = t => t * (2 - t)

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Background
      const bg = ctx.createLinearGradient(0, 0, 0, canvas.height)
      bg.addColorStop(0, '#1E3A8A')
      bg.addColorStop(1, '#2563eb')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Title & timer
      ctx.fillStyle = '#fff'
      ctx.font = '20px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('HACK THE VAULT', canvas.width / 2, 24)
      if (status === 'hacking') {
        const flash = countdown < 10 && Math.floor(performance.now() / 500) % 2
        ctx.fillStyle = flash ? '#fee' : '#fff'
        ctx.font = '16px monospace'
        ctx.fillText(`Time: ${countdown}s`, canvas.width / 2, 44)
      }

      // Code box (with shake if wrong)
      const bx = (canvas.width - boxW) / 2
      let by = 50
      let ox = bx, oy = by
      if (status === 'shake' && shakeProg < 1) {
        const s = easeOut(shakeProg) * 6
        ox += (Math.random() * 2 - 1) * s
        oy += (Math.random() * 2 - 1) * s
        shakeProg += 0.1
      }
      ctx.save()
      ctx.shadowColor = 'rgba(0,255,255,0.4)'
      ctx.shadowBlur = 15
      ctx.strokeStyle = '#00ffd5'
      ctx.lineWidth = 4
      ctx.strokeRect(ox, oy, boxW, boxH)
      ctx.restore()

      // Digits
      const dw = boxW / digits.length
      const cy = oy + boxH / 2
      digits.forEach((d, i) => {
        const cx = ox + i * dw + dw / 2
        // Ring
        const grad = ctx.createRadialGradient(cx, cy, 8, cx, cy, dw * 0.4)
        grad.addColorStop(0, '#00ffd5')
        grad.addColorStop(1, '#0077ff')
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(cx, cy, dw * 0.4, 0, 2 * Math.PI)
        ctx.fill()
        ctx.strokeStyle = '#39ff14'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(cx, cy, dw * 0.4, 0, 2 * Math.PI)
        ctx.stroke()
        // Number
        ctx.fillStyle = '#fff'
        ctx.font = '24px monospace'
        ctx.textAlign = 'center'
        ctx.fillText(d, cx, cy + 8)
      })

      // Arrow pointer
      ctx.fillStyle = '#fff'
      ctx.beginPath()
      ctx.moveTo(canvas.width / 2 - 10, oy - 5)
      ctx.lineTo(canvas.width / 2 + 10, oy - 5)
      ctx.lineTo(canvas.width / 2, oy + 10)
      ctx.closePath()
      ctx.fill()

      raf = requestAnimationFrame(draw)
    }
    draw()

    // Countdown timer
    if (status === 'hacking') {
      countdownId = setInterval(() => {
        setCountdown(c => {
          if (c <= 1) {
            clearInterval(countdownId)
            setStatus('lost')
            return 0
          }
          return c - 1
        })
      }, 1000)
    }

    return () => {
      cancelAnimationFrame(raf)
      clearInterval(countdownId)
    }
  }, [digits, status, countdown])

  return (
    <main className="app-background min-h-screen flex flex-col items-center px-4 py-12 text-white">
      <div className="w-full max-w-md mx-auto space-y-4">
        {/* Main card */}
        <div className="competition-card bg-white bg-opacity-10 rounded-2xl shadow-lg w-full text-center p-6">
          <div className="title-gradient mb-4 text-2xl">🔐 Hack the Vault</div>
          {status === 'won' && <Confetti width={width} height={height} />}

          {status === 'idle' && (
            <button
              className="btn-gradient w-full mb-4 py-2"
              onClick={() => {
                setStatus('hacking')
                setCountdown(60)
                setDigits([0, 0, 0])
              }}
            >
              Start Hacking
            </button>
          )}

          {(status === 'won' || status === 'lost') && (
            <div className="text-center space-y-2 mb-4">
              <p
                className={`text-lg font-bold ${
                  status === 'won' ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {status === 'won'
                  ? '🎉 Vault Opened! You Win!'
                  : '💥 Time’s up. You Lost.'}
              </p>
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

          <canvas
            ref={canvasRef}
            className="mx-auto w-full rounded-lg shadow-md mb-4"
          />

          {status === 'hacking' && (
            <div className="flex justify-center gap-4 mb-4">
              {digits.map((d, i) => (
                <div key={i} className="flex flex-col items-center">
                  <button
                    onClick={() => changeDigit(i, +1)}
                    className="bg-blue-600 hover:bg-blue-700 text-white w-10 h-10 rounded"
                  >
                    ▲
                  </button>
                  <div className="text-2xl my-1">{d}</div>
                  <button
                    onClick={() => changeDigit(i, -1)}
                    className="bg-blue-600 hover:bg-blue-700 text-white w-10 h-10 rounded"
                  >
                    ▼
                  </button>
                </div>
              ))}
            </div>
          )}

          {status === 'hacking' && (
            <button
              className="btn-gradient w-full py-2"
              onClick={enterCode}
            >
              Enter Code
            </button>
          )}
        </div>

        {/* Live Leaderboard */}
        <div className="btn-gradient w-full rounded-3xl shadow-2xl p-4">
          <h2 className="text-xl font-semibold mb-2 text-white">
            Live Leaderboard
          </h2>
          <ul className="space-y-1 text-sm text-white">
            {board.map((entry, i) => (
              <li key={i}>
                {entry.name} opened the vault {fmtRelative(Date.now() - entry.time)}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  )
}
