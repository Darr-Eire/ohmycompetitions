import React from 'react';
import Head from 'next/head';

export default function PiBattlesPage() {
  return (
    <>
      <Head>
        <title>Pioneer Arena | Pi Battles</title>
      </Head>

      <main className="app-background min-h-screen p-4 text-white">
        <div className="max-w-5xl mx-auto">

          {/* Title Banner */}
          <div className="competition-top-banner title-gradient mb-6 text-center">
            Pioneer Arena — Pi Battles
          </div>

          {/* Introduction */}
          <div className="competition-card p-6 mb-8 bg-white bg-opacity-10 rounded-2xl shadow-lg text-center">
            <div className="text-3xl text-cyan-300 mb-4 font-bold">
              The Future of Pi Gaming Starts Here
            </div>

            <p className="text-white text-lg mb-4">
              Welcome to <span className="text-cyan-300 font-bold">Pi Battles Pioneer Arena</span> — where Pioneers from across the world will soon face off in skill-based, high-energy, real-time battles to win exclusive prizes, jackpots, and ultimate bragging rights — all powered by the Pi Network.
            </p>

            <p className="italic text-gray-300 mb-6">“Rome wasn’t built in a day — and neither was Pi Battles Arena.”</p>

            <button className="btn-gradient px-10 py-4 rounded-full text-2xl font-bold shadow-xl hover:scale-110 transition">
               Arena Opening Soon
            </button>
          </div>

          {/* Battle Game Modes */}
          <div className="competition-card p-6 mb-8 bg-white bg-opacity-10 rounded-2xl shadow-lg">
            <div className="text-3xl text-cyan-300 mb-4 font-bold text-center">
              Battle Game Modes
            </div>

            <ul className="text-white text-lg space-y-4">
              <li> <span className="text-cyan-300 font-bold">2-Player Duels:</span> Head-to-head instant battles for quick rewards.</li>
              <li> <span className="text-cyan-300 font-bold">5-Player Skirmishes:</span> Medium battles with growing prize pools.</li>
              <li> <span className="text-cyan-300 font-bold">10-Player Mega Battles:</span> Massive jackpot showdowns for top Pioneers.</li>
            </ul>
          </div>

          {/* Battle System Details */}
          <div className="competition-card p-6 mb-8 bg-white bg-opacity-10 rounded-2xl shadow-lg">
            <div className="text-3xl text-cyan-300 mb-4 font-bold text-center">
              How Pi Battles Works
            </div>

            <ul className="text-white text-lg space-y-4">
              <li> <span className="text-cyan-300 font-bold">Skill & Strategy:</span> Real-time gameplay mixed with decision making and luck.</li>
              <li> <span className="text-cyan-300 font-bold">Mystery Boxes:</span> Win additional rewards randomly while battling.</li>
              <li> <span className="text-cyan-300 font-bold">Jackpots:</span> Huge growing prize pools per game room.</li>
              <li> <span className="text-cyan-300 font-bold">Pioneer Network:</span> Play with real verified Pioneers across the world.</li>
              <li> <span className="text-cyan-300 font-bold">Fair & Transparent:</span> Fully powered by Pi, decentralized logic, and provably fair outcomes.</li>
            </ul>
          </div>

          {/* Final Call To Action */}
          <div className="competition-card p-6 mb-8 bg-white bg-opacity-10 rounded-2xl shadow-lg text-center">
            <div className="text-3xl text-cyan-300 mb-4 font-bold">
              Built for Pioneers. Powered by Pi.
            </div>
            <p className="text-white text-lg mb-6">
              Get ready for the most advanced decentralized battle platform ever designed for the Pi Network.
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
