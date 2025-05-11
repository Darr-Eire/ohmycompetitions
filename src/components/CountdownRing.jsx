'use client'
import { useEffect, useState } from 'react'

export default function CountdownRing({ endTime, duration, color = '#22d3ee', size = 120 }) {
  const radius = size / 2 - 6
  const circumference = 2 * Math.PI * radius

  const [progress, setProgress] = useState(1)
  const [timeLeftLabel, setTimeLeftLabel] = useState('')

  useEffect(() => {
    const end = new Date(endTime).getTime()
    const interval = setInterval(() => {
      const now = Date.now()
      const remaining = Math.max(end - now, 0)
      const pct = remaining / (duration * 1000)
      setProgress(pct)

      const h = Math.floor(remaining / (1000 * 60 * 60))
      const m = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
      const s = Math.floor((remaining % (1000 * 60)) / 1000)
      setTimeLeftLabel(`${h}h ${m}m ${s}s`)

      if (remaining <= 0) clearInterval(interval)
    }, 1000)

    return () => clearInterval(interval)
  }, [endTime, duration])

  const strokeDashoffset = circumference * (1 - progress)

  return (
    <div className="relative inline-block" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle
          stroke="#334155"
          fill="transparent"
          strokeWidth="8"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{ transition: 'stroke-dashoffset 1s linear' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center font-mono text-white text-sm">
        {timeLeftLabel}
      </div>
    </div>
  )
}
