'use client';

import React from 'react';
import Link from 'next/link';
import { FaXTwitter, FaFacebookF, FaDiscord, FaInstagram } from 'react-icons/fa6';

export default function IndexPage() {
  const features = [
    { icon: '💎', text: 'Daily Competitions' },
    { icon: '📲', text: 'Pi Cash Code' },
    { icon: '🎁', text: 'Crypto Giveaways' },
    { icon: '⚔️', text: 'Pi Battles' },
    { icon: '🎮', text: 'Mini Games' },
    { icon: '🧩', text: 'Mystery Features Coming' },

  ];

  const stats = [
    { label: 'Total Winners', value: '100,000+' },
    { label: 'Pi Distributed', value: '250,000 π' },
    { label: 'Donated to Causes', value: '25,000 π' },
    { label: 'User Satisfaction', value: '4.9 ★' },
  ];

  return (
 <div className="min-h-screen bg-[#0a1024] text-white flex justify-center px-4 pt-2 pb-8">

  <div className="w-full max-w-sm bg-[#0f1b33] border border-cyan-400 rounded-2xl p-5 shadow-[0_0_30px_#00f0ff66] flex flex-col gap-6">

    {/* Title + Description */}
    <div className="text-center">
      <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-[#00ffd5] to-[#0077ff] text-transparent bg-clip-text tracking-wide mb-2">
        Oh My Competitions
      </h1>
      <p className="text-white/80 text-sm sm:text-base leading-snug">
        Built for Pi Network Pioneers by Pioneers.<br />
        Next-gen crypto competitions. Real Pi prizes.<br />
        100% fair. 100% community. 100% Pi.
      </p>
    </div>

    {/* Feature Icons */}
    <div className="grid grid-cols-2 gap-3">
      {[
        { icon: '💎', text: 'Daily Competitions', href: '/competitions/daily' },
        { icon: '📲', text: 'Pi Cash Code', href: '/pi-cash-code' },
        { icon: '🎁', text: 'Pi Giveaways', href: '/competitions/pi' },
        { icon: '⚔️', text: 'Pi Battles', href: '/competitions/pibattles' },
        { icon: '🎮', text: 'Mini Games', href: '/try-your-luck' },
        { icon: '🧩', text: 'Mystery Features Coming', href: '/future' },
      ].map((f, i) => (
        <Link
          key={i}
          href={f.href}
          className="flex items-center gap-2 bg-[#0a1024] border border-cyan-500 p-2 rounded-md shadow-[0_0_15px_#00f0ff44] hover:border-cyan-300 transition"
        >
          <span className="text-lg">{f.icon}</span>
          <span className="text-xs text-white">{f.text}</span>
        </Link>
      ))}
    </div>

    {/* Vision Section */}
    <div className="bg-[#0a1024]/90 border border-cyan-700 rounded-lg px-4 py-5 shadow-[0_0_15px_#00fff033] text-center text-xs sm:text-sm">
      <h2 className="text-base font-bold text-cyan-300 mb-2">Our Vision for 2026</h2>
      <p className="text-white/80 mb-3 leading-snug">
        Powered by the Pi Network and supported by Pioneers like you.
      </p>
      <ul className="text-cyan-200 space-y-1 font-medium">
        <li>🌍 100,000+ global winners</li>
        <li>💰 500,000 π in Pi prizes</li>
        <li>🎗 25,000 π donated</li>
        <li>⭐ 5★ user-rated experience</li>
      </ul>
    </div>

    {/* CTA Button */}
    <Link
      href="/homepage"
      className="block bg-gradient-to-r from-[#00ffd5] to-[#0077ff] text-black font-bold py-3 rounded-md shadow-md hover:scale-105 transition text-center text-sm"
    >
      Let’s Go
    </Link>

    {/* Social Icons */}
    <div className="flex justify-center gap-4 text-xl pt-1">
      <Link href="https://twitter.com" target="_blank"><FaXTwitter className="hover:text-cyan-400 transition" /></Link>
      <Link href="https://facebook.com" target="_blank"><FaFacebookF className="hover:text-cyan-400 transition" /></Link>
      <Link href="https://discord.com" target="_blank"><FaDiscord className="hover:text-cyan-400 transition" /></Link>
      <Link href="https://instagram.com" target="_blank"><FaInstagram className="hover:text-cyan-400 transition" /></Link>
    </div>

  </div>
</div>

  );
}

IndexPage.getLayout = function PageLayout(page) {
  return <>{page}</>;
};
