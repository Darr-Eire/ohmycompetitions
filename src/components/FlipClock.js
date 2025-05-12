'use client'
import React, { useState, useEffect } from 'react'

export default function FlipClock({ targetTime }) {
  const [timeLeft, setTimeLeft] = useState(getTimeDiff(targetTime))

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeDiff(targetTime))
    }, 1000)
    return () => clearInterval(interval)
  }, [targetTime])

  return (
    <div className="flex justify-center gap-4 text-center text-white text-xs">
      <FlipUnit label="DAYS" value={timeLeft.days} />
      <FlipUnit label="HRS" value={timeLeft.hours} />
      <FlipUnit label="MIN" value={timeLeft.minutes} />
      <FlipUnit label="SEC" value={timeLeft.seconds} />
    </div>
  )
}

function FlipUnit({ label, value }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-black text-cyan-400 rounded-md px-4 py-2 text-xl font-mono shadow-md min-w-[60px]">
        {String(value).padStart(2, '0')}
      </div>
      <div className="text-white/70 mt-1 text-[10px] tracking-wide">{label}</div>
    </div>
  )
}

function getTimeDiff(target) {
  const total = Math.max(0, target - new Date().getTime())
  const seconds = Math.floor((total / 1000) % 60)
  const minutes = Math.floor((total / 1000 / 60) % 60)
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24)
  const days = Math.floor(total / (1000 * 60 * 60 * 24))
  return { total, days, hours, minutes, seconds }
}
