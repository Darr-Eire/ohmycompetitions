'use client';

import React from 'react';
import Link from 'next/link';

export default function WelcomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-start px-2 sm:px-4 pt-8 sm:pt-16 bg-[#0f172a] text-white font-orbitron">
      <div className="w-full max-w-2xl bg-[#0f1b33] border border-cyan-500 rounded-xl px-4 sm:px-6 py-8 sm:py-10 backdrop-blur-md space-y-8 shadow-lg">

        {/* Hero Title */}
        <div className="text-center space-y-4">
          <h1 className="text-2xl sm:text-4xl font-extrabold font-orbitron bg-gradient-to-r from-cyan-400 to-blue-600 text-transparent bg-clip-text drop-shadow tracking-wide">
            Oh My Competitions
          </h1>

          <p className="text-white/90 text-sm sm:text-lg leading-relaxed">
            Where Pi Network Pioneers compete, win, and earn! Dive into daily challenges, spin wheels, live draws, and massive prize pools. You gotta be in it to win it!
          </p>

          <Link
            href="/homepage"
            className="inline-block bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold px-6 py-2 rounded-full shadow-lg hover:scale-105 transition text-sm sm:text-base"
          >
            Enter Oh My Competitions
          </Link>
        </div>

        {/* Feature Highlights */}
        <section className="space-y-4">
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-white/90 text-sm">
            <li className="bg-white/5 p-3 sm:p-4 rounded-md border border-cyan-600 shadow">💎 Daily Competitions & Big Giveaways</li>
            <li className="bg-white/5 p-3 sm:p-4 rounded-md border border-cyan-600 shadow">🌀 Spin-to-Win Wheel With Rare Prizes</li>
            <li className="bg-white/5 p-3 sm:p-4 rounded-md border border-cyan-600 shadow">🎯 Pi Cash Code With Instant Wins</li>
            <li className="bg-white/5 p-3 sm:p-4 rounded-md border border-cyan-600 shadow">🌍 Country-Specific Lottery Competitions</li>
          </ul>
        </section>

        {/* Testimonial Section */}
        <section className="text-center">
          <h2 className="text-lg sm:text-xl font-bold text-black mb-3">What Pioneers Are Saying</h2>
          <div className="bg-white/5 border border-cyan-600 p-3 sm:p-4 rounded-md text-xs sm:text-sm text-white/80">
            "I won my first 500π within days — the games are actually fun and real prizes show up!"<br />
            <span className="text-cyan-400 font-bold mt-2 block">— @CryptoQueen</span>
          </div>
        </section>
      </div>
    </main>
  );
}
