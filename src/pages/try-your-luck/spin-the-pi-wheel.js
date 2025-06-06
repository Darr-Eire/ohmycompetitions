import React from 'react';
import Head from 'next/head';

export default function SpinThePiWheel() {
  return (
    <>
      <Head>
        <title>Spin The Pi Wheel | Pi Battles</title>
      </Head>

      <main className="app-background min-h-screen p-4 text-white">
        <div className="max-w-5xl mx-auto">

          {/* Title Banner */}
          <div className="competition-top-banner title-gradient mb-6 text-center">
            Spin The Pi Wheel
          </div>

          {/* Introduction */}
          <div className="competition-card p-6 mb-8 bg-white bg-opacity-10 rounded-2xl shadow-lg text-center">
            <div className="text-3xl text-cyan-300 mb-4 font-bold">
              Your Pi Luck Awaits 
            </div>

            <p className="text-white text-lg mb-4">
              Welcome to <span className="text-cyan-300 font-bold">Spin The Pi Wheel</span> — where every spin is a chance to win exclusive prizes, rare collectibles, jackpots, and more — all powered by Pi.
            </p>

            <p className="italic text-gray-300 mb-6">“One spin can change everything. Are you ready to test your Pi luck?”</p>

            <button className="btn-gradient px-10 py-4 rounded-full text-2xl font-bold shadow-xl hover:scale-110 transition">
               Coming Soon
            </button>
          </div>

          {/* How It Works */}
          <div className="competition-card p-6 mb-8 bg-white bg-opacity-10 rounded-2xl shadow-lg">
            <div className="text-3xl text-cyan-300 mb-4 font-bold text-center">
              How The Pi Wheel Works
            </div>

            <ul className="text-white text-lg space-y-4">
              <li> <span className="text-cyan-300 font-bold">Simple & Fair:</span> Spin the wheel for instant prizes using your Pi balance.</li>
              <li> <span className="text-cyan-300 font-bold">Mystery Rewards:</span> Win Pi, rare items, bonus tickets, or exclusive event access.</li>
              <li> <span className="text-cyan-300 font-bold">Exclusive Tiers:</span> Unlock VIP wheels for higher rewards and better odds.</li>
              <li> <span className="text-cyan-300 font-bold">Global Pioneer Challenge:</span> Compete on leaderboards with other Pioneers worldwide.</li>
              <li> <span className="text-cyan-300 font-bold">Transparent Odds:</span> Fair, verifiable, and decentralized spinning powered by blockchain logic.</li>
              <li><span className="text-cyan-300 font-bold">Powered by Pi:</span> Fully integrated with the Pi Network ecosystem.</li>
            </ul>
          </div>

          {/* Closing Hype */}
          <div className="competition-card p-6 mb-8 bg-white bg-opacity-10 rounded-2xl shadow-lg text-center">
            <div className="text-3xl text-cyan-300 mb-4 font-bold">
              Spin. Win. Celebrate. 
            </div>
            <p className="text-white text-lg mb-6">
              The Pi Wheel is coming soon to reward true Pioneers with exciting prizes, surprise jackpots, and endless fun — all while growing the Pi ecosystem.
            </p>

            <button className="btn-gradient px-10 py-4 rounded-full text-2xl font-bold shadow-xl hover:scale-110 transition">
              Stay Tuned
            </button>
          </div>

        </div>
      </main>
    </>
  );
}
