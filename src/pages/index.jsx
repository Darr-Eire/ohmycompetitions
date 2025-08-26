'use client';

import React from 'react';
import Link from 'next/link';
import { FaXTwitter, FaFacebookF, FaDiscord, FaInstagram } from 'react-icons/fa6';

export default function IndexPage() {
  const features = [
    { icon: '🔄', text: 'Daily Competitions', href: '/competitions/daily' },
    { icon: '🚀', text: 'Launch Week', href: '/competitions/launch-week' },
    { icon: '🎁', text: 'Pi Giveaways', href: '/competitions/pi' },
    { icon: '🏆', text: 'Pi Stages', href: '/battles' },
    { icon: '🎮', text: 'Mini Games', href: '/try-your-luck' },
    { icon: '❓', text: 'Mystery Features', href: '' },
  ];

  return (
    <div className="min-h-[100dvh] bg-[#0a1024] text-white px-2 py-0 overflow-y-auto">
      <div className="w-full max-w-[420px] mx-auto flex flex-col gap-8">

        {/* Main Box */}
        <div className="bg-[#0f1b33] border border-cyan-400 rounded-3xl p-6 shadow-[0_0_30px_#00f0ff88] flex flex-col gap-5">

          {/* Title + Tagline */}
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-[#00ffd5] to-[#0077ff] text-transparent bg-clip-text tracking-wide leading-tight">
              Oh My Competitions
            </h1>
            <p className="text-white text-sm mt-1">
              Built by Pioneers. For Pioneers. All Powered by Pi.
            </p>
          </div>

          {/* About OMC Section */}
          <div className="bg-[#0a1024]/90 border border-cyan-600 rounded-lg px-4 py-4 shadow-[0_0_20px_#00fff055] text-sm leading-relaxed">
            <h2 className="text-base font-bold text-cyan-300 mb-2 text-center">
              What is Oh My Competitions
            </h2>
            <p className="text-white">
              OMC is a decentralized platform where Pioneers compete in fun, fair competitions using Pi as currency. Every experience is powered by Pi.
            </p>
            <ul className="list-disc pl-5 mt-3 text-cyan-200 space-y-1">
              <li>🔁 Peer-to-peer Pi transactions</li>
              <li>🎫 Unique, trackable ticket IDs</li>
              <li>🤝 Giftable tickets and Pi vouchers</li>
              <li>🎉 Multiple winners, real rewards</li>
            </ul>
          </div>

          <Link
            href="/tutorial"
            className="text-center block mx-auto text-sm text-cyan-300 underline hover:text-cyan-100"
          >
            View Tutorial
          </Link>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-1 text-sm">
            {features.map((f, i) => (
              <Link
                key={i}
                href={f.href}
                className="flex items-center gap-2 px-3 py-2 bg-[#0a1024] border border-cyan-500 rounded-md shadow-[0_0_8px_#00f0ff33] hover:border-cyan-300 transition"
              >
                <span className="text-lg">{f.icon}</span>
                <span>{f.text}</span>
              </Link>
            ))}
          </div>

          {/* CTA Button */}
          <div className="flex flex-col items-center gap-1">
            <Link
              href="/homepage"
              className="pulse-button block w-full bg-gradient-to-r from-[#00ffd5] to-[#0077ff] text-black font-bold py-3 rounded-lg shadow-md text-center text-base"
            >
              Let’s Go
            </Link>
          </div>
        </div>

        {/* Social Icons */}
        <div className="flex justify-center gap-5 text-2xl">
          <Link href="https://twitter.com" target="_blank">
            <FaXTwitter className="hover:text-cyan-400 transition" />
          </Link>
          <Link href="https://facebook.com" target="_blank">
            <FaFacebookF className="hover:text-cyan-400 transition" />
          </Link>
          <Link href="https://discord.com" target="_blank">
            <FaDiscord className="hover:text-cyan-400 transition" />
          </Link>
          <Link href="https://instagram.com" target="_blank">
            <FaInstagram className="hover:text-cyan-400 transition" />
          </Link>
        </div>
      </div>
    </div>
  );
}

IndexPage.getLayout = function PageLayout(page) {
  return <>{page}</>;
};
