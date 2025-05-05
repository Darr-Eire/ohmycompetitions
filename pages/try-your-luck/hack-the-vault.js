// pages/try-your-luck/hack-the-vault.js
'use client'

import { useEffect, useRef, useState } from 'react'

export default function HackTheVaultPage() {
  const canvasRef = useRef(null)
  const [status, setStatus]     = useState('idle')    // 'idle' | 'hacking' | 'shake' | 'won' | 'lost'
  const [countdown, setCountdown] = useState(60)
  const [digits, setDigits]      = useState([0, 0, 0])
  const target = [4, 2, 9]
  const boxW = 350, boxH = 120        // logical drawing size
  const dialCount = digits.length

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
    if (digits.every((d,i)=>d===target[i])) setStatus('won')
    else {
      setStatus('shake')
      setTimeout(()=> setStatus('hacking'), 300)
    }
  }

  // draw + timer
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    // scale for high‑DPI and responsive
    const containerW = canvas.parentElement.clientWidth
    canvas.width = boxW
    canvas.height = boxH + 40
    canvas.style.width = '100%'
    canvas.style.height = `${((boxH+40)/boxW)*100}%`

    let raf, countdownId, shakeProg = 0
    const easeOut = t => t*(2-t)

    const draw = () => {
      ctx.clearRect(0,0,canvas.width,canvas.height)
      // background
      const bg = ctx.createLinearGradient(0,0,0,canvas.height)
      bg.addColorStop(0,'#1E3A8A'); bg.addColorStop(1,'#2563eb')
      ctx.fillStyle = bg; ctx.fillRect(0,0,canvas.width,canvas.height)
      // title
      ctx.fillStyle = '#fff'; ctx.font='20px monospace'; ctx.textAlign='center'
      ctx.fillText('HACK THE VAULT', canvas.width/2, 24)
      // timer
      if (status==='hacking') {
        const flash = countdown<10 && Math.floor(performance.now()/500)%2
        ctx.fillStyle = flash ? '#fee':'#fff'
        ctx.font='16px monospace'
        ctx.fillText(`Time: ${countdown}s`, canvas.width/2, 44)
      }
      // box
      const bx = (canvas.width-boxW)/2, by=50
      let ox=bx, oy=by
      if (status==='shake' && shakeProg<1) {
        const s = easeOut(shakeProg)*6
        ox += (Math.random()*2-1)*s
        oy += (Math.random()*2-1)*s
        shakeProg += 0.1
      }
      ctx.save()
      ctx.shadowColor='rgba(96,165,250,0.8)'; ctx.shadowBlur=15
      ctx.strokeStyle='#60a5fa'; ctx.lineWidth=4
      ctx.strokeRect(ox,oy,boxW,boxH)
      ctx.restore()
      // dials
      const dw = boxW/dialCount, cy=oy+boxH/2
      digits.forEach((d,i)=>{
        const cx = ox + i*dw + dw/2
        // face
        const grad = ctx.createRadialGradient(cx,cy,8,cx,cy,dw*0.4)
        grad.addColorStop(0,'#93c5fd'); grad.addColorStop(1,'#1e3a8a')
        ctx.fillStyle=grad; ctx.beginPath()
        ctx.arc(cx,cy,dw*0.4,0,2*Math.PI); ctx.fill()
        // ring
        ctx.strokeStyle='#60a5fa'; ctx.lineWidth=2
        ctx.beginPath(); ctx.arc(cx,cy,dw*0.4,0,2*Math.PI); ctx.stroke()
        // digit
        ctx.fillStyle='#fff'; ctx.font='24px monospace'
        ctx.textAlign='center'; ctx.fillText(d,cx,cy+8)
      })
      // pointer
      ctx.fillStyle='#fff'
      ctx.beginPath()
      ctx.moveTo(canvas.width/2 - 10, oy-5)
      ctx.lineTo(canvas.width/2 + 10, oy-5)
      ctx.lineTo(canvas.width/2, oy+10)
      ctx.fill()
      raf=requestAnimationFrame(draw)
    }
    draw()
    if (status==='hacking') {
      countdownId=setInterval(()=>{
        setCountdown(c=>{
          if (c<=1) { clearInterval(countdownId); setStatus('lost'); return 0 }
          return c-1
        })
      },1000)
    }
    return ()=>{
      cancelAnimationFrame(raf)
      clearInterval(countdownId)
    }
  },[digits,status,countdown])

  return (
    <div className="p-4 text-center text-white">
      {status==='idle' && (
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded mb-4 w-2/3 max-w-xs mx-auto"
          onClick={()=>{
            setStatus('hacking'); setCountdown(60); setDigits([0,0,0])
          }}
        >
          Start Hacking
        </button>
      )}

      {(status==='won' || status==='lost') && (
        <p className={`text-lg font-bold mb-4 ${status==='won' ? 'text-green-400':'text-red-400'}`}>
          {status==='won' ? '🎉 Vault Opened! You Win!':'💥 Time’s up. You Lost.'}
        </p>
      )}

      <div className="w-full max-w-md mx-auto">
        <canvas ref={canvasRef} className="rounded-lg shadow-md" />
      </div>

      {status==='hacking' && (
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          {digits.map((d,i)=>(
            <div key={i} className="flex flex-col items-center">
              <button
                onClick={()=>changeDigit(i,1)}
                className="bg-blue-600 hover:bg-blue-700 text-white w-8 h-8 rounded"
              >
                ▲
              </button>
              <div className="text-xl my-1">{d}</div>
              <button
                onClick={()=>changeDigit(i,-1)}
                className="bg-blue-600 hover:bg-blue-700 text-white w-8 h-8 rounded"
              >
                ▼
              </button>
            </div>
          ))}
        </div>
      )}

      {status==='hacking' && (
        <button
          className="btn-primary mt-6 py-2 px-6 w-2/3 max-w-xs mx-auto block"
          onClick={enterCode}
        >
          Enter Code
        </button>
      )}
    </div>
  )
}

