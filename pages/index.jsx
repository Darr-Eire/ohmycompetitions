'use client';

import React from 'react';
import Link from 'next/link';

export default function WelcomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0f172a] text-white font-orbitron px-4 py-8">
      <div className="w-full max-w-md bg-[#0f1b33] border border-cyan-500 rounded-xl shadow-[0_0_80px_#00fff066] px-6 py-8 backdrop-blur-md space-y-8">

        {/* Hero Title */}
        <div className="text-center space-y-3">
          <h1 className="text-2xl sm:text-4xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-600 text-transparent bg-clip-text tracking-wide drop-shadow-[0_0_15px_#00f0ff]">
            Oh My Competitions
          </h1>
          <p className="text-white/90 text-sm sm:text-base leading-relaxed">
            Where Pi Network Pioneers compete, win, and earn! Dive into daily challenges, spin wheels, live draws, and massive prize pools. You gotta be in it to win it!
          </p>
          <Link
            href="/homepage"
            className="inline-block bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold px-6 py-2.5 rounded-md shadow hover:scale-105 transition text-sm"
          >
            Lets Go
          </Link>
        </div>

        {/* Features */}
        <ul className="grid grid-cols-1 gap-3 text-sm text-white/90">
          <li className="bg-[#0f172a] border border-cyan-600 p-3 rounded-lg shadow-[0_0_20px_#00f0ff22]">
            💎 Daily Competitions & Big Giveaways
          </li>
          <li className="bg-[#0f172a] border border-cyan-600 p-3 rounded-lg shadow-[0_0_20px_#00f0ff22]">
            🌀 Spin-to-Win Wheel With Rare Prizes
          </li>
          <li className="bg-[#0f172a] border border-cyan-600 p-3 rounded-lg shadow-[0_0_20px_#00f0ff22]">
            🎯 Pi Cash Code With Instant Wins
          </li>
          <li className="bg-[#0f172a] border border-cyan-600 p-3 rounded-lg shadow-[0_0_20px_#00f0ff22]">
            🌍 Country-Specific Lottery Competitions
          </li>
        </ul>

        {/* Testimonial */}
        <div className="text-center space-y-2 text-sm text-white/80">
          <div className="bg-[#0f172a] border border-cyan-600 p-4 rounded-lg shadow-[0_0_20px_#00f0ff22]">
            “I won my first 500π within days — the games are actually fun and real prizes show up!”
            <div className="text-cyan-400 font-bold mt-1">— @CryptoQueen</div>
          </div>
        </div>
      </div>
    </main>
  );
}
