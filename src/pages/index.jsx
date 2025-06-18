import React from 'react';
import Link from 'next/link';
import { FaXTwitter, FaFacebookF, FaDiscord, FaInstagram } from 'react-icons/fa6';

export default function IndexPage() {
  const features = [
    { icon: '💎', text: 'Daily Competitions' },
    { icon: '📲', text: 'Pi Cash Code' },
    { icon: '🎁', text: 'Crypto Giveaways' },
    { icon: '🌍', text: 'Global Lotteries' },
    { icon: '⚔️', text: 'Pi Battles' },
    { icon: '🎮', text: 'Mini Games' },
  ];

  const stats = [
    { label: 'Winners', value: '44,000+' },
    { label: 'Total Won', value: '106,400 π' },
    { label: 'Donated', value: '15,000 π' },
    { label: 'User Rated', value: '5 ★' },
  ];

  return (
    <div className="min-h-screen bg-[#0a1024] text-white flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-md bg-[#0f1b33] border border-cyan-400 rounded-2xl p-6 shadow-[0_0_30px_#00f0ff66] flex flex-col gap-6">

        {/* Title + Description */}
        <div className="text-center">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#00ffd5] to-[#0077ff] text-transparent bg-clip-text tracking-wide mb-2">
            Oh My Competitions
          </h1>
          <p className="text-white/80 text-sm leading-relaxed">
            Built for Pi Network Pioneers by Pioneers.<br />
            Next-gen crypto competitions. Real Pi prizes.<br />
            100% fair. 100% community. 100% Pi.
          </p>
        </div>

        {/* Feature Icons */}
        <div className="grid grid-cols-2 gap-3">
          {features.map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-2 bg-[#0a1024] border border-cyan-500 p-3 rounded-lg shadow-[0_0_20px_#00f0ff66]"
            >
              <span className="text-xl">{f.icon}</span>
              <span className="text-sm">{f.text}</span>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 text-center bg-[#0a1024]/80 border border-cyan-400 rounded-xl px-4 py-4 shadow-lg text-xs">
          {stats.map((s, i) => (
            <div key={i}>
              <div className="text-base font-bold text-cyan-300">{s.value}</div>
              <div className="text-white/80">{s.label}</div>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <Link
          href="/homepage"
          className="block bg-gradient-to-r from-[#00ffd5] to-[#0077ff] text-black font-bold py-3 rounded-lg shadow-lg hover:scale-105 transition text-center text-sm"
        >
          Let’s Go
        </Link>

        {/* Social Icons */}
        <div className="flex justify-center gap-5 text-2xl">
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
