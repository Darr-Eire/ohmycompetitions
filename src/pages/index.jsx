'use client';

import React from 'react';
import Link from 'next/link';
import { FaXTwitter, FaFacebookF, FaDiscord, FaInstagram } from 'react-icons/fa6';

export default function IndexPage() {
  const features = [
    { icon: '💎', text: 'Daily Competitions', href: '/competitions/daily' },
    { icon: '📲', text: 'Pi Cash Code', href: '/pi-cash-code' },
    { icon: '🎁', text: 'Pi Giveaways', href: '/competitions/pi' },
    { icon: '⚔️', text: 'Pi Battles', href: '/competitions/pibattles' },
    { icon: '🎮', text: 'Mini Games', href: '/try-your-luck' },
    { icon: '🧩', text: 'Mystery Features Coming', href: '/future' },
  ];

  return (
    <div className="h-screen bg-[#0a1024] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-[400px] flex flex-col gap-6">

        {/* Bordered Box Section */}
        <div className="bg-[#0f1b33] border border-cyan-400 rounded-2xl p-4 sm:p-5 shadow-[0_0_30px_#00f0ff66] flex flex-col gap-5">

          {/* Title + Description */}
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-[#00ffd5] to-[#0077ff] text-transparent bg-clip-text tracking-wide leading-tight">
              Oh My Competitions
            </h1>
            <p className="text-white/80 text-xs sm:text-sm leading-snug mt-1">
              Built by Pioneers. Powered by Pi.<br />
              Real rewards. Real winners. Real community.<br />
              100% fair. 100% Pi.
            </p>
          </div>

          {/* Feature Icons */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {features.map((f, i) => (
              <Link
                key={i}
                href={f.href}
                className="flex items-center gap-1 px-2 py-2 bg-[#0a1024] border border-cyan-500 rounded-md shadow-[0_0_10px_#00f0ff33] hover:border-cyan-300 transition"
              >
                <span className="text-lg leading-none">{f.icon}</span>
                <span className="leading-tight">{f.text}</span>
              </Link>
            ))}
          </div>

          {/* Vision Section */}
          <div className="bg-[#0a1024]/90 border border-cyan-700 rounded-lg px-3 py-4 shadow-[0_0_15px_#00fff033] text-center text-xs sm:text-sm">
            <h2 className="text-sm sm:text-base font-bold text-cyan-300 mb-2">Our Vision for 2026</h2>
            <p className="text-white/80 mb-3 leading-snug">
              Powered by the Pi Network and supported by Pioneers like you.
            </p>
            <ul className="text-cyan-200 grid grid-cols-2 gap-y-1 text-[0.7rem] font-medium">
              <li>🌍 100,000+ winners</li>
              <li>💰 500,000 π prizes</li>
              <li>🎗 25,000 π donated</li>
              <li>⭐ 5★ user-rated</li>
            </ul>
          </div>

          {/* CTA Button */}
          <Link
            href="/homepage"
            className="block bg-gradient-to-r from-[#00ffd5] to-[#0077ff] text-black font-bold py-2 rounded-md shadow-md hover:scale-105 transition text-center text-sm"
          >
            Let’s Go
          </Link>
        </div>
      </div>
    </div>
  );
}

IndexPage.getLayout = function PageLayout(page) {
  return <>{page}</>;
};
