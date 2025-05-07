// pages/try-your-luck/slot-machine.js
'use client'

import { useEffect, useRef, useState } from 'react'
import Confetti from 'react-confetti'
import { useWindowSize } from '@uidotdev/usehooks'

const symbols = ['🥧','⭐','🔥','🔒','🪙','🎁']

export default function PiSlotMachine() {
  const canvasRef = useRef(null)
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState(null)
  const [played, setPlayed] = useState(false)
  const { width, height } = useWindowSize()

  // Prevent replay
  useEffect(() => {
    if (localStorage.getItem('slotMachinePlayed') === new Date().toDateString()) {
      setPlayed(true)
    }
  }, [])

  // Reel state
  const reels = useRef([0,0,0])
  const velocities = useRef([0,0,0])

  const startSpin = () => {
    if (spinning || played) return
    setResult(null)
    setSpinning(true)
    // initialize velocities
    velocities.current = [0.5,0.4,0.3]
  }

  // Draw loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width = 300
    const H = canvas.height = 200
    let raf

    const draw = () => {
      ctx.clearRect(0,0,W,H)
      // background
      const bg = ctx.createLinearGradient(0,0,0,H)
      bg.addColorStop(0,'#001f3f')
      bg.addColorStop(1,'#001740')
      ctx.fillStyle = bg
      ctx.fillRect(0,0,W,H)
      // frosted slot area
      const slotW = W/3
      reels.current.forEach((pos,i) => {
        const x = i*slotW
        ctx.save()
        ctx.fillStyle='rgba(255,255,255,0.1)'
        ctx.fillRect(x,0,slotW,H)
        ctx.fillStyle='rgba(255,255,255,0.15)'
        ctx.fillRect(x+4,4,slotW-8,H-8)
        ctx.strokeStyle='rgba(255,255,255,0.6)'
        ctx.lineWidth=3
        ctx.strokeRect(x+2,2,slotW-4,H-4)
        ctx.restore()
        // update spin
        if(spinning) {
          velocities.current[i] = Math.max(0, velocities.current[i] - 0.005)
          if(velocities.current[i] > 0) {
            reels.current[i] = (pos + velocities.current[i]) % symbols.length
          }
        }
        // draw symbol
        ctx.font='48px monospace'
        ctx.textAlign='center'
        ctx.textBaseline='middle'
        ctx.fillStyle='#fff'
        const idx = Math.floor(reels.current[i])
        ctx.fillText(symbols[idx], x+slotW/2, H/2)
      })
      // stop condition
      if(spinning && velocities.current.every(v=>v===0)) {
        setSpinning(false)
        setPlayed(true)
        localStorage.setItem('slotMachinePlayed', new Date().toDateString())
        const [a,b,c] = reels.current.map(r=>Math.floor(r))
        if(a===b && b===c) setResult('🎉 Jackpot! You matched all 3!')
        else setResult('❌ No match. Try again tomorrow!')
      }
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [spinning])

  return (
    <main className="app-background min-h-screen flex items-center justify-center px-4 sm:px-6 py-8 text-white">
      <div className="w-full max-w-md mx-auto">
        {result?.includes('Jackpot') && <Confetti width={width} height={height} />}

        <div className="competition-card relative bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-600 opacity-30 mix-blend-overlay animate-pulse-slow"></div>
          <div className="relative z-10 p-6 space-y-6">
            <h1 className="title-gradient text-3xl font-orbitron text-center">🎰 Pi Slot Machine</h1>

            <canvas
              ref={canvasRef}
              className="mx-auto w-full max-w-xs h-48 rounded shadow-inner"
            />

            <button
              onClick={startSpin}
              disabled={spinning||played}
              className={`btn-gradient w-full py-3 text-xl ${spinning||played?'opacity-50 cursor-not-allowed':''}`}
            >
              {spinning? 'Spinning...' : played? 'Already Played Today' : 'SPIN!'}
            </button>

            {result && (
              <p className="text-center text-lg font-bold mt-2">{result}</p>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}