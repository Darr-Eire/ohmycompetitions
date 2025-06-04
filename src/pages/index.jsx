import React from 'react';
import Link from 'next/link';

export default function IndexPage() {
  return (
    <div className="min-h-screen bg-[#0a1024] text-white flex items-center justify-center px-3 py-6">
      <div className="w-full max-w-sm bg-[#0f1b33] border border-cyan-400 rounded-2xl px-4 py-6 backdrop-blur-md space-y-6 shadow-[0_0_30px_#00f0ff66]">

        <div className="text-center space-y-2">
          <h1 className="text-2xl font-extrabold bg-gradient-to-r from-[#00ffd5] to-[#0077ff] text-transparent bg-clip-text tracking-wide drop-shadow-[0_0_15px_#00f0ff]">
            Oh My Competitions
          </h1>
          <p className="text-white/90 text-sm leading-snug">
            Where Pi Network Pioneers compete, win, and earn! Daily challenges, spins, live draws & prize pools.
          </p>
          <Link
            href="/homepage"
            className="inline-block bg-gradient-to-r from-[#00ffd5] to-[#0077ff] text-black font-bold px-6 py-2 rounded-lg shadow hover:scale-105 transition text-sm"
          >
            Let's Go
          </Link>
        </div>

        <ul className="grid grid-cols-1 gap-3 text-sm text-white/90">
          {[
            '💎 Daily Competitions & Giveaways',
            '🌀 Spin-to-Win Wheels',
            '🎯 Pi Cash Code',
            '🔗 Big Crypto Giveaways',
            '🌍 Country Lotteries'
          ].map((feature, index) => (
            <li key={index} className="bg-[#0a1024] border border-cyan-500 p-3 rounded-lg shadow-[0_0_30px_#00f0ff66]">
              {feature}
            </li>
          ))}
        </ul>

      </div>
    </div>
  )
}

// Disable layout for index.jsx
IndexPage.getLayout = function PageLayout(page) {
  return <>{page}</>;
}
