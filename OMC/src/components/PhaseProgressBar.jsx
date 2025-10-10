'use client'
import { useEffect, useState } from 'react'

export default function PhaseProgressBar({ startTime, endTime }) {
  const [progress, setProgress] = useState(0)
  const [label, setLabel] = useState('')

  useEffect(() => {
    const update = () => {
      const now = Date.now()
      const start = new Date(startTime).getTime()
      const end = new Date(endTime).getTime()
      const total = end - start
      const elapsed = now - start

      const pct = Math.min(Math.max(elapsed / total, 0), 1)
      setProgress(pct)
      setLabel(`${Math.floor(pct * 100)}%`)
    }

    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [startTime, endTime])

  return (
    <div className="w-full relative mt-6">
      {/* Label */}
      <div className="text-xs text-white/70 font-mono text-right mb-1 pr-1">{label}</div>

      {/* Bar Background */}
      <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden border border-cyan-500 shadow-inner">
        <div
          className="h-full bg-gradient-to-r from-yellow-300 via-cyan-300 to-cyan-500 shadow-[0_0_10px_#00ffff66] transition-all duration-1000 ease-linear"
          style={{ width: `${(progress * 100).toFixed(2)}%` }}
        />
      </div>
    </div>
  )
}
