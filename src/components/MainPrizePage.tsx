'use client'
import React from 'react'

export default function MainPrizePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d0d0d] via-[#111827] to-black text-white px-4 py-10 flex flex-col items-center">
      
      {/* Grand Prize Badge */}
      <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-black text-sm sm:text-base font-bold uppercase px-6 py-2 rounded-full shadow-lg inline-block mb-6 animate-pulse tracking-wide">
        🔥 GRAND PRIZE — Win 250,000 in Pi
      </div>

      {/* Title */}
      <h1 className="text-5xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-100 drop-shadow-[0_0_20px_rgba(255,255,100,0.5)] text-center mb-6 pulse-glow">
        250,000 Pi Giveaway
      </h1>

      {/* Card Container */}
      <div className="bg-black/30 backdrop-blur-md border border-yellow-300/20 rounded-2xl p-6 w-full max-w-2xl shadow-2xl">
        
        {/* Image with border glow */}
        <div className="rounded-xl overflow-hidden border-2 border-yellow-400/60 shadow-yellow-500 shadow-lg mb-6">
          <img src="/images/250000.png" alt="250K Prize" className="w-full object-cover" />
        </div>

        {/* Prize Info */}
        <p className="text-white/90 text-lg font-semibold mb-4 text-center">
          Prize: 250,000 in Pi (One Winner)
        </p>

        {/* Countdown */}
        <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-black/30 border border-yellow-300/40 text-yellow-200 text-sm font-mono shadow-inner animate-pulse">
          ⏳ Ends In: <span className="font-bold">500h 34m 17s</span>
        </div>

        {/* Details */}
        <div className="text-white/80 text-sm space-y-2 mb-6">
          <p><strong>Date:</strong> May 28, 2025</p>
          <p><strong>Time:</strong> 10:00 PM UTC</p>
          <p><strong>Location:</strong> Global Online Draw</p>
          <p><strong>Entry Fee:</strong> 15 π</p>
          <p><strong>Price per ticket:</strong> <span className="text-yellow-300 font-bold">15.00 π</span></p>
        </div>

        {/* Quantity + Total */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-white font-bold text-lg">Total: 15.00 π</p>
          <div className="flex items-center gap-2">
            <button className="bg-yellow-400 text-black px-3 py-1 rounded-lg font-bold">−</button>
            <span className="text-white">1</span>
            <button className="bg-yellow-400 text-black px-3 py-1 rounded-lg font-bold">+</button>
          </div>
        </div>

        {/* Call To Action */}
        <button className="w-full bg-gradient-to-r from-yellow-300 to-yellow-500 text-black font-bold py-3 rounded-full shadow-lg hover:scale-105 transition-all duration-200 animate-bounce-slow">
           Enter Now to Win 250,000 Pi
        </button>
      </div>
    </div>
  )
}
