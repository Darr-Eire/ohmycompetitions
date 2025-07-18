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
<div className="h-[100dvh] overflow-hidden bg-[#0a1024] text-white px-2 py-2">

      <div className="w-full max-w-[420px] mx-auto flex flex-col gap-8">

        {/* Main Box */}
        <div className="bg-[#0f1b33] border border-cyan-400 rounded-3xl p-6 sm:p-6 shadow-[0_0_40px_#00f0ff88] flex flex-col gap-8">

          {/* Title + Tagline */}
          <div className="text-center">
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#00ffd5] to-[#0077ff] text-transparent bg-clip-text tracking-wide leading-tight">
              Oh My Competitions
            </h1>
            <p className="text-white/80 text-base leading-snug mt-3">
              Built by Pioneers. Powered by Pi.<br />
              Real rewards. Real winners. Real community.<br />
              100% fair. 100% Pi.
            </p>
          </div>

          {/* Features Grid */}
      <div className="grid grid-cols-2 gap-2 text-sm">
  {features.map((f, i) => (
    <Link
      key={i}
      href={f.href}
      className="flex items-center gap-2 px-3 py-2 bg-[#0a1024] border border-cyan-500 rounded-md shadow-[0_0_8px_#00f0ff33] hover:border-cyan-300 transition"
    >
      <span className="text-lg leading-none">{f.icon}</span>
      <span className="leading-tight">{f.text}</span>
    </Link>
  ))}
</div>


          {/* Vision for 2026 */}
          <div className="bg-[#0a1024]/90 border border-cyan-700 rounded-lg px-4 py-5 shadow-[0_0_20px_#00fff055] text-center text-base">
            <h2 className="text-lg font-bold text-cyan-300 mb-2">Our Vision for 2026</h2>
            <p className="text-white/80 mb-4 leading-snug">
              Powered by the Pi Network and supported by Pioneers like you.
            </p>
            <ul className="text-cyan-200 grid grid-cols-2 gap-y-2 text-sm font-medium">
              <li>🌍 100,000+ winners</li>
              <li>💰 500,000 π prizes</li>
              <li>🎗 25,000 π donated</li>
              <li>⭐ 5★ user-rated</li>
            </ul>
          </div>

          {/* CTA Button */}
 <Link
  href="/homepage"
  
  className="pulse-button block bg-gradient-to-r from-[#00ffd5] to-[#0077ff] text-black font-bold py-3 rounded-lg shadow-md text-center text-base"
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
