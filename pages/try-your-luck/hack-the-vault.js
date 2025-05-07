// pages/try-your-luck/hack-the-vault.js
'use client'

import { useEffect, useRef, useState } from 'react'
import Confetti from 'react-confetti'
import { useWindowSize } from '@uidotdev/usehooks'

export default function HackTheVaultPage() {
  const canvasRef = useRef(null)
  const [status, setStatus] = useState('idle') // 'idle' | 'hacking' | 'shake' | 'won' | 'lost'
  const [countdown, setCountdown] = useState(60)
  const [digits, setDigits] = useState([0, 0, 0])
  const { width, height } = useWindowSize()
  const target = [4, 2, 9]

  const changeDigit = (i, delta) => {
    if (status !== 'hacking') return
    setDigits(d => {
      const nd = [...d]
      nd[i] = (nd[i] + delta + 10) % 10
      return nd
    })
  }

  const enterCode = () => {
    if (status !== 'hacking') return
    if (digits.every((d, i) => d === target[i])) {
      setStatus('won')
    } else {
      setStatus('shake')
      setTimeout(() => setStatus('hacking'), 300)
    }
  }

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
      const bg = ctx.createLinearGradient(0, 0, 0, canvas.height)
      bg.addColorStop(0, '#1E3A8A')
      bg.addColorStop(1, '#2563eb')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, canvas.width, canvas.height)

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

      const bx = (canvas.width - boxW) / 2, by = 50
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

      const dw = boxW / digits.length, cy = oy + boxH / 2
      digits.forEach((d, i) => {
        const cx = ox + i * dw + dw / 2
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

        ctx.fillStyle = '#fff'
        ctx.font = '24px monospace'
        ctx.textAlign = 'center'
        ctx.fillText(d, cx, cy + 8)
      })

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
      <div className="competition-card bg-white bg-opacity-10 rounded-2xl shadow-lg w-full max-w-md text-center p-6">
        <div className="title-gradient mb-4">
          🔐 Hack the Vault
        </div>

        {status === 'won' && <Confetti width={width} height={height} />}

        {status === 'idle' && (
          <button
            className="btn-gradient w-full mb-4"
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
          <p className={`text-lg font-bold mb-4 ${status === 'won' ? 'text-green-400' : 'text-red-400'}`}>
            {status === 'won'
              ? '🎉 Vault Opened! You Win!'
              : '💥 Time’s up. You Lost.'}
          </p>
        )}

        <canvas ref={canvasRef} className="mx-auto w-full rounded-lg shadow-md mb-4" />

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
    </main>
  )
}