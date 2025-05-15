'use client';

import React from 'react';
import Link from 'next/link';

export default function WelcomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-start pt-0 px-4 bg-[#0f172a] text-white font-orbitron">
      <div className="w-full max-w-3xl bg-[#0f1b33] border border-cyan-500 rounded-2xl px-6 py-10 backdrop-blur-md space-y-10 shadow-lg">

        {/* Hero Title */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl sm:text-5xl font-extrabold font-orbitron bg-gradient-to-r from-cyan-400 to-blue-600 text-transparent bg-clip-text drop-shadow tracking-wide">
            Oh My Competitions
          </h1>
          <p className="text-white/90 text-lg sm:text-lg leading-relaxed">
            Where Pi Network Pioneers compete, win, and earn! Dive into daily challenges, spin wheels, live draws, and massive prize pools. You gotta be in it to win it!
          </p>
          <div className="mt-4">
            <Link
              href="/homepage"
              className="inline-block bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold px-8 py-3 rounded-full shadow-lg hover:scale-105 transition text-lg"
            >
              Enter Oh My Competitions
            </Link>
          </div>
        </div>

        {/* Feature Highlights */}
        <section className="space-y-6">
          <ul className="grid sm:grid-cols-2 gap-6 text-white/90 text-sm sm:text-base">
            <li className="bg-white/5 p-4 rounded-lg border border-cyan-600 shadow">💎 Daily Competitions & Big Giveaways</li>
            <li className="bg-white/5 p-4 rounded-lg border border-cyan-600 shadow">🌀 Spin-to-Win Wheel With Rare Prizes</li>
            <li className="bg-white/5 p-4 rounded-lg border border-cyan-600 shadow">🎯 Pi Cash Code With Instant Wins</li>
            <li className="bg-white/5 p-4 rounded-lg border border-cyan-600 shadow">🌍 Country-Specific Lottery Competitions</li>
          </ul>
        </section>

        {/* Testimonial Section */}
        <section className="text-center mt-10">
          <h2 className="text-xl font-bold text-black mb-3">What Pioneers Are Saying</h2>
          <div className="bg-white/5 border border-cyan-600 p-4 rounded-lg text-sm text-white/80">
            "I won my first 500π within days — the games are actually fun and real prizes show up!"<br />
            <span className="text-cyan-400 font-bold mt-2 block">— @CryptoQueen</span>
          </div>
        </section>
      </div>
    </main>
  );
}
