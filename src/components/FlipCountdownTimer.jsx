'use client'
import React, { useEffect, useState } from 'react'

function formatTimeUnit(value) {
  return value.toString().padStart(2, '0')
}

function calculateTimeLeft(targetTime) {
  const now = new Date()
  const difference = targetTime - now
  if (difference <= 0) return { hours: 0, minutes: 0, seconds: 0 }

  const hours = Math.floor(difference / (1000 * 60 * 60))
  const minutes = Math.floor((difference / (1000 * 60)) % 60)
  const seconds = Math.floor((difference / 1000) % 60)
  return { hours, minutes, seconds }
}

const FlipUnit = ({ label, value }) => (
  <div className="flex flex-col items-center">
    <div className="bg-black border-2 border-cyan-400 text-cyan-200 rounded-lg px-4 py-2 text-3xl font-mono shadow-[0_0_12px_#22d3ee] min-w-[70px] text-center">
      {formatTimeUnit(value)}
    </div>
    <span className="text-sm text-white/60 mt-1">{label}</span>
  </div>
)

export default function FlipCountdownTimer({ targetTime }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(targetTime))

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetTime))
    }, 1000)

    return () => clearInterval(interval)
  }, [targetTime])

  return (
    <div className="flex gap-4 justify-center items-center">
      <FlipUnit label="Hrs" value={timeLeft.hours} />
      <FlipUnit label="Min" value={timeLeft.minutes} />
      <FlipUnit label="Sec" value={timeLeft.seconds} />
    </div>
  )
}
