'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PiCashHeroBanner() {
  const router = useRouter()
  const [ticketCount, setTicketCount] = useState(1)
  const ticketPrice = 1.25
  const prizePool = 15000
  const code = '343pi433'
  const endTime = new Date(Date.now() + 1000 * 60 * 60 * 31 + 1000 * 60 * 4) // 31h 4m from now

  const increment = () => setTicketCount((prev) => Math.min(prev + 1, 50))
  const decrement = () => setTicketCount((prev) => Math.max(prev - 1, 1))

  return (
    <div className="relative max-w-xl mx-auto mt-4 px-4 py-6 border border-cyan-500 rounded-2xl text-white text-center font-orbitron overflow-hidden shadow-[0_0_60px_#00fff055] bg-[#0b1120]/30">
      {/* Pulsing Background */}
      <div className="absolute inset-0 -z-10 animate-pulse bg-[radial-gradient(circle_at_center,_#00fff033,_transparent)]" />

      {/* Title */}
      <h1 className="text-2xl sm:text-3xl font-bold text-cyan-300 mb-3 flex items-center justify-center gap-2 animate-glow-float">
        Pi Cash Code
      </h1>

      {/* Code Display */}
      <div className="inline-block bg-[#0a0f1d] border border-cyan-400 text-cyan-300 px-6 py-2 rounded-md text-lg font-mono tracking-widest shadow-[0_0_12px_#00f0ff66] mb-4">
        {code}
      </div>

      {/* Prize Pool */}
      <div className="text-center mb-1">
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-xl border border-cyan-400 bg-black/30 shadow-[0_0_15px_#00f0ff88] animate-glow-float">
          <span className="text-base sm:text-lg font-bold text-cyan-300 tracking-wide">Current Prize Pool:</span>
          <span className="text-cyan-400 font-extrabold text-lg sm:text-xl drop-shadow-md">{prizePool.toLocaleString()} π</span>
        </div>
      </div>

      {/* Timer Display */}
      <div className="mt-4 mb-6">
        {/* Implement your timer here */}
        {/* You can use a countdown library or create a custom timer */}
      </div>

      {/* Enter Now Button */}
      <button
        onClick={() => router.push('/pi-cash-code')}  // This triggers navigation to /pi-cash-code
        className="w-full py-2 text-sm bg-gradient-to-r from-[#00F0FF] to-[#00C2FF] rounded-md text-black font-bold shadow hover:scale-[1.02] transition"
      >
        Enter Now
      </button>

      {/* How It Works */}
      <div className="mt-4 text-center text-sm">
        <h3 className="text-lg font-bold text-cyan-300 mb-2"> How It Works</h3>
        <ul className="list-disc list-inside space-y-1 text-white/80">
          <li>The code drops every Monday at <span className="font-bold text-white">3:14 PM UTC</span>.</li>
          <li>It remains active for <span className="font-bold text-white">31 hours and 4 minutes</span>.</li>
          <li>Friday draw at <span className="font-bold text-white">3:14 PM UTC</span>.</li>
          <li>The winner must return the code within <span className="font-bold text-white">31 minutes and 4 seconds</span>.</li>
        </ul>
      </div>
    </div>
  )
}
