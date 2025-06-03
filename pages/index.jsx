'use client';

import React from 'react';
import Link from 'next/link';

export default function WelcomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-start px-4 bg-[#0a1024] text-white font-orbitron">
      <div className="w-full max-w-3xl bg-[#0f1b33] border border-cyan-400 rounded-2xl px-6 py-10 mt-10 backdrop-blur-md space-y-10 shadow-[0_0_50px_#00f0ff66]">

        {/* Hero Title */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-[#00ffd5] to-[#0077ff] text-transparent bg-clip-text tracking-wide drop-shadow-[0_0_25px_#00f0ff]">
            Oh My Competitions
          </h1>
          <p className="text-white/90 text-base sm:text-lg leading-relaxed">
            Where Pi Network Pioneers compete, win, and earn! Dive into daily challenges, spin wheels, live draws, and massive prize pools. You gotta be in it to win it!
          </p>
          <Link
            href="/homepage"
            className="inline-block bg-gradient-to-r from-[#00ffd5] to-[#0077ff] text-black font-bold px-8 py-3 rounded-xl shadow hover:scale-105 transition text-base"
          >
            Let's Go
          </Link>
        </div>

        {/* Features */}
        <ul className="grid grid-cols-1 gap-4 text-base text-white/90">
          <li className="bg-[#0a1024] border border-cyan-500 p-4 rounded-xl shadow-[0_0_50px_#00f0ff66]">
            💎 Daily Competitions & Big Giveaways
          </li>
          <li className="bg-[#0a1024] border border-cyan-500 p-4 rounded-xl shadow-[0_0_50px_#00f0ff66]">
            🌀 Spin-to-Win Wheel With Rare Prizes
          </li>
          <li className="bg-[#0a1024] border border-cyan-500 p-4 rounded-xl shadow-[0_0_50px_#00f0ff66]">
            🎯 Pi Cash Code With Instant Wins
          </li>
          <li className="bg-[#0a1024] border border-cyan-500 p-4 rounded-xl shadow-[0_0_50px_#00f0ff66]">
            🔗 Big Crypto Giveaways
          </li>
          <li className="bg-[#0a1024] border border-cyan-500 p-4 rounded-xl shadow-[0_0_50px_#00f0ff66]">
            🌍 Country-Specific Lottery Competitions
          </li>
        </ul>

      </div>
    </main>
  );
}
