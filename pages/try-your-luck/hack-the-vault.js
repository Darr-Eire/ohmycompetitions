// pages/try-your-luck/hack-the-vault.js
'use client'

import { useEffect, useRef, useState } from 'react'

export default function HackTheVaultPage() {
  const canvasRef = useRef(null)
  const [status, setStatus] = useState('idle')        // 'idle' | 'hacking' | 'won' | 'lost'
  const [countdown, setCountdown] = useState(60)
  const [digits, setDigits] = useState([0, 0, 0])      // the three wheels

  const target = [4, 2, 9]    // secret combo
  const boxW = 380, boxH = 140
  const dialCount = digits.length

  // Change a dial up/down
  const changeDigit = (idx, delta) => {
    if (status !== 'hacking') return
    setDigits(d => {
      const nd = [...d]
      nd[idx] = (nd[idx] + delta + 10) % 10
      return nd
    })
  }

  // Handle “Enter Code”
  const enterCode = () => {
    if (status !== 'hacking') return
    if (digits.every((d, i) => d === target[i])) {
      setStatus('won')
    } else {
      // Shake effect on wrong entry
      setStatus('shake')
      setTimeout(() => {
        setStatus('hacking')
      }, 500)
    }
  }

  // Canvas render & timer
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    // Ensure pixel-perfect
    canvas.width = 500
    canvas.height = 300
    canvas.style.width = '500px'
    canvas.style.height = '300px'

    let renderId, countdownId, shakeProgress = 0

    const easeOut = t => t * (2 - t)

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Background gradient
      const bg = ctx.createLinearGradient(0, 0, 0, canvas.height)
      bg.addColorStop(0, '#1e3a8a')
      bg.addColorStop(1, '#2563eb')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Title
      ctx.font = '28px monospace'
      ctx.textAlign = 'center'
      ctx.fillStyle = '#fff'
      ctx.fillText('HACK THE VAULT', canvas.width/2, 40)

      // Timer
      if (status === 'hacking') {
        const flash = countdown < 10 && Math.floor(performance.now()/500)%2
        ctx.font = '20px monospace'
        ctx.fillStyle = flash ? '#fee' : '#fff'
        ctx.fillText(`Time left: ${countdown}s`, canvas.width/2, 70)
      }

      // Box position, shake on wrong code
      const boxX0 = (canvas.width - boxW)/2
      const boxY0 = 90
      let boxX = boxX0, boxY = boxY0
      if (status === 'shake' && shakeProgress < 1) {
        const s = easeOut(shakeProgress)*8
        boxX += (Math.random()*2-1)*s
        boxY += (Math.random()*2-1)*s
        shakeProgress += 0.1
      }

      // Vault border glow
      ctx.shadowColor = 'rgba(96,165,250,0.8)'
      ctx.shadowBlur = 20
      ctx.lineWidth = 4
      ctx.strokeStyle = '#60a5fa'
      ctx.strokeRect(boxX, boxY, boxW, boxH)
      ctx.shadowBlur = 0

      // Draw dials
      const dialW = boxW / dialCount
      digits.forEach((digit, i) => {
        const cx = boxX + i*dialW + dialW/2
        const cy = boxY + boxH/2

        // Face gradient
        const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 40)
        grad.addColorStop(0, '#93c5fd')
        grad.addColorStop(1, '#1e3a8a')
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(cx, cy, 40, 0, Math.PI*2)
        ctx.fill()

        // Ring
        ctx.lineWidth = 3
        ctx.strokeStyle = '#60a5fa'
        ctx.beginPath()
        ctx.arc(cx, cy, 40, 0, Math.PI*2)
        ctx.stroke()

        // Number
        ctx.fillStyle = '#fff'
        ctx.font = '36px monospace'
        ctx.textAlign = 'center'
        ctx.fillText(String(digit), cx, cy+12)
      })

      renderId = requestAnimationFrame(draw)
    }

    draw()

    // Countdown
    if (status === 'hacking') {
      countdownId = setInterval(() => {
        setCountdown(c => {
          if (c <= 1) {
            clearInterval(countdownId)
            setStatus('lost')
            return 0
          }
          return c-1
        })
      }, 1000)
    }

    return () => {
      cancelAnimationFrame(renderId)
      clearInterval(countdownId)
    }
  }, [digits, status, countdown])

  return (
    <div style={{ textAlign:'center', padding:'2rem', color:'#fff' }}>
      {status==='idle' && (
        <button
          style={{ padding:'0.5rem 1rem', fontSize:'1rem', background:'#60a5fa',
                   border:'none', borderRadius:'4px', color:'#05082a', cursor:'pointer' }}
          onClick={()=>{
            setStatus('hacking')
            setCountdown(60)
            setDigits([0,0,0])
          }}
        >
          Start Hacking
        </button>
      )}

      {status==='won' && (
        <p style={{ color:'#a3e635', fontSize:'1.25rem' }}>🎉 Vault Opened! You Win! 🎉</p>
      )}
      {status==='lost' && (
        <p style={{ color:'#f87171', fontSize:'1.25rem' }}>💥 Time’s up. You Lost. 💥</p>
      )}

      <canvas
        ref={canvasRef}
        style={{ display:'block', margin:'1rem auto', borderRadius:'8px' }}
      />

      {status==='hacking' && (
        <div style={{ display:'flex', justifyContent:'center', gap:'2rem', marginTop:'1rem' }}>
          {digits.map((d,i)=>(
            <div key={i} style={{ textAlign:'center' }}>
              <button onClick={()=>changeDigit(i,+1)}>▲</button>
              <div style={{ fontSize:'1.5rem', margin:'0.5rem 0' }}>{d}</div>
              <button onClick={()=>changeDigit(i,-1)}>▼</button>
            </div>
          ))}
        </div>
      )}

      {status==='hacking' && (
        <button className="btn-primary mt-4" onClick={enterCode}>
          Enter Code
       </button>
      )}
    </div>
  )
}
