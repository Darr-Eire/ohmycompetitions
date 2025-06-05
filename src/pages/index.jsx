import React from 'react';
import Link from 'next/link';
import { FaXTwitter, FaFacebookF, FaDiscord, FaInstagram } from 'react-icons/fa6';

export default function IndexPage() {
  return (
    <div className="h-screen bg-[#0a1024] text-white flex items-center justify-center px-3 py-2">
      <div className="w-full max-w-sm bg-[#0f1b33] border border-cyan-400 rounded-2xl px-4 py-4 backdrop-blur-md shadow-[0_0_30px_#00f0ff66] flex flex-col h-full">

        {/* Header */}
        <div className="text-center mb-3">
          <h1 className="text-2xl font-extrabold bg-gradient-to-r from-[#00ffd5] to-[#0077ff] text-transparent bg-clip-text tracking-wide">
            Oh My Competitions
          </h1>
          <p className="text-white/80 text-sm mt-2 leading-relaxed">
            Welcome to Oh My Competitions<br />
            Built for Pi Network Pioneers by Pioneers<br />
            Experience next generation crypto competitions, community powered prizes and daily opportunities to grow your Pi journey<br />
            100% fair 100% community 100% Pi
          </p>
        </div>

        {/* Features */}
        <div className="flex flex-col gap-2 my-3 flex-grow">
          {[
            { icon: '💎', text: 'Daily Competitions' },
            { icon: '📲', text: 'Pi Cash Code' },
            { icon: '🎁', text: 'Crypto Giveaways' },
            { icon: '🌍', text: 'Global Lotteries' }
          ].map((feature, index) => (
            <div key={index} className="flex items-center gap-2 bg-[#0a1024] border border-cyan-500 p-3 rounded-lg shadow-[0_0_20px_#00f0ff66]">
              <div className="text-xl">{feature.icon}</div>
              <div className="text-xs">{feature.text}</div>
            </div>
          ))}
        </div>

        {/* Stats */}
<div className="flex justify-center mb-4">
  <div className="grid grid-cols-2 gap-2 w-full px-3 py-3 bg-[#0a1024]/80 border border-cyan-400 rounded-xl shadow-lg text-center text-xs">
    <div>
      <div className="text-base font-bold text-cyan-300">44,000+</div>
      <div className="text-white/80">Winners</div>
    </div>
    <div>
      <div className="text-base font-bold text-cyan-300">106,400 π</div>
      <div className="text-white/80">Total Won</div>
    </div>
    <div>
      <div className="text-base font-bold text-cyan-300">15,000 π</div>
      <div className="text-white/80">Donated</div>
    </div>
    <div>
      <div className="text-base font-bold text-cyan-300">5 ★</div>
      <div className="text-white/80">User Rated</div>
    </div>
  </div>
</div>



        {/* CTA */}
        <div className="mb-3">
          <Link
            href="/homepage"
            className="block bg-gradient-to-r from-[#00ffd5] to-[#0077ff] text-black font-bold px-6 py-3 rounded-lg shadow-lg hover:scale-105 transition text-sm w-full text-center"
          >
            Let's Go
          </Link>
        </div>

        {/* Social Icons */}
        <div className="flex justify-center gap-5 text-2xl mb-1">
          <Link href="https://twitter.com" target="_blank"><FaXTwitter className="hover:text-cyan-400 transition" /></Link>
          <Link href="https://facebook.com" target="_blank"><FaFacebookF className="hover:text-cyan-400 transition" /></Link>
          <Link href="https://discord.com" target="_blank"><FaDiscord className="hover:text-cyan-400 transition" /></Link>
          <Link href="https://instagram.com" target="_blank"><FaInstagram className="hover:text-cyan-400 transition" /></Link>
        </div>

      </div>
    </div>
  )
}

IndexPage.getLayout = function PageLayout(page) {
  return <>{page}</>;
}
