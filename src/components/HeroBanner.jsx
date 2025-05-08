'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'

export default function HeroBanner() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const target = new Date('2025-05-28T22:00:00Z')
    const interval = setInterval(() => {
      const now = new Date()
      const diff = Math.max(0, target.getTime() - now.getTime())
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="text-center max-w-3xl mx-auto px-4">
      {/* Tagline */}
      <p className="text-xs uppercase tracking-widest text-white font-semibold mb-1">
        Enter the Ultimate Pi Competition
      </p>

      {/* Glowing Grand Prize */}
      <h1 className="pulse-glow text-5xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
        €250,000
      </h1>
      <p className="text-sm text-white italic mb-3">
        Main Grand Prize — Paid in Pi Equivalent
      </p>

      {/* Prize Tiers */}
      <div className="text-white/90 text-sm mb-5 space-y-1">
        <p><strong>2<sup>nd</sup> Prize:</strong> €25,000 (in Pi)</p>
        <p><strong>3<sup>rd</sup>–1000<sup>th</sup>:</strong> Smaller Pi & cash-equivalent rewards</p>
        <p><strong>Mystery Prize:</strong> One lucky winner will unlock a surprise reward</p>
      </div>

      {/* Large Themed Countdown Timer */}
      <div className="flex justify-center gap-4 sm:gap-6 font-mono text-cyan-300 mb-6">
        {Object.entries(timeLeft).map(([label, value]) => (
          <div key={label} className="flex flex-col items-center">
            <span className="text-2xl sm:text-4xl font-extrabold leading-tight drop-shadow-[0_0_6px_rgba(0,255,255,0.5)]">
              {value.toString().padStart(2, '0')}
            </span>
            <span className="uppercase text-xs sm:text-sm tracking-widest text-white/70">{label}</span>
          </div>
        ))}
      </div>

      {/* CTA Button */}
      <Link href="/ticket-purchase/main-prize">
        <button className="comp-button w-full sm:w-auto px-6 py-2">
          Enter Now
        </button>
      </Link>
    </div>
  )
}
