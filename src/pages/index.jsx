import React from 'react';
import Link from 'next/link';

export default function IndexPage() {
  return (
    <div className="h-screen bg-[#0a1024] text-white flex items-center justify-center px-3 py-3">
      <div className="w-full max-w-sm bg-[#0f1b33] border border-cyan-400 rounded-2xl px-3 py-4 backdrop-blur-md shadow-[0_0_40px_#00f0ff66] flex flex-col h-full">

        {/* Top Title */}
        <div className="text-center mb-2">
          <h1 className="text-2xl font-extrabold bg-gradient-to-r from-[#00ffd5] to-[#0077ff] text-transparent bg-clip-text tracking-wide drop-shadow-[0_0_20px_#00f0ff]">
            Oh My Competitions
          </h1>
          <p className="text-white/80 text-xs mt-1">
            Win Big, Play Daily. Powered by Pi Network.
          </p>
        </div>

        {/* Features */}
        <div className="flex flex-col gap-2 my-3">
          {[
            { icon: '💎', text: 'Daily Competitions' },
            { icon: '🎡', text: 'Spin-to-Win Prizes' },
            { icon: '📲', text: 'Pi Cash Code' },
            { icon: '🎁', text: 'Crypto Giveaways' },
            { icon: '🌍', text: 'Global Lotteries' }
          ].map((feature, index) => (
            <div key={index} className="flex items-center gap-2 bg-[#0a1024] border border-cyan-500 p-2 rounded-lg shadow-[0_0_20px_#00f0ff66]">
              <div className="text-xl">{feature.icon}</div>
              <div className="text-xs">{feature.text}</div>
            </div>
          ))}
        </div>

        {/* Stats Block */}
        <div className="flex justify-center mt-4">
          <div className="grid grid-cols-2 gap-3 w-full max-w-md px-4 py-4 bg-gradient-to-r from-cyan-300 to-blue-500 rounded-xl shadow-lg text-black text-center text-xs">
            <div>
              <div className="text-lg font-bold">44,000+</div>
              <div>Winners</div>
            </div>
            <div>
              <div className="text-lg font-bold">106,400 π</div>
              <div>Total Won</div>
            </div>
            <div>
              <div className="text-lg font-bold">15,000 π</div>
              <div>Donated</div>
            </div>
            <div>
              <div className="text-lg font-bold">5★</div>
              <div>User Rated</div>
            </div>
          </div>
        </div>

        <div className="flex-grow"></div>

        {/* CTA */}
        <div className="pt-2">
          <Link
            href="/homepage"
            className="block bg-gradient-to-r from-[#00ffd5] to-[#0077ff] text-black font-bold px-5 py-2 rounded-lg shadow-lg hover:scale-105 transition text-sm w-full text-center"
          >
            Let's Go 🚀
          </Link>
        </div>

      </div>
    </div>
  )
}

// Disable global layout for index.jsx
IndexPage.getLayout = function PageLayout(page) {
  return <>{page}</>;
}
