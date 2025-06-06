import React from 'react';
import Head from 'next/head';

export default function PiBattlesHome() {
  return (
    <>
      <Head>
        <title>Pioneer Arena | Pi Battles</title>
      </Head>

      <main className="app-background min-h-screen p-4 text-white">
        <div className="max-w-5xl mx-auto">

          {/* Title Banner */}
          <div className="competition-top-banner title-gradient mb-6 text-center">
            Pioneer Arena
          </div>

          {/* Introduction */}
          <div className="competition-card p-6 mb-8 bg-white bg-opacity-10 rounded-2xl shadow-lg text-center">
            <div className="text-3xl text-cyan-300 mb-4 font-bold">
              The Future of Pi Battles Starts Here
            </div>

            <p className="text-white text-lg mb-4">
              Welcome to <span className="text-cyan-300 font-bold">Pi Battles Pioneer Arena</span> — where Pioneers from across the world will soon face off in skill-based, luck-infused, high-energy competitions to win exclusive prizes, jackpots, and eternal bragging rights — all powered by Pi.
            </p>

            <p className="italic text-gray-300 mb-6">“Rome wasn’t built in a day — and neither was Pi Battles Arena.”</p>

            <button className="btn-gradient px-10 py-4 rounded-full text-2xl font-bold shadow-xl hover:scale-110 transition">
               Arena Opening Soon
            </button>
          </div>

          {/* What Makes It Special */}
          <div className="competition-card p-6 mb-8 bg-white bg-opacity-10 rounded-2xl shadow-lg">
            <div className="text-3xl text-cyan-300 mb-4 font-bold text-center">
              Why Pi Battles is Different
            </div>

      <ul className="text-white text-lg space-y-4">
  <li> <span className="text-cyan-300 font-bold">Multiple Game Modes:</span> 2-Player Duels, 5-Player Skirmishes, and 10-Player Mega Battles.</li>
  <li> <span className="text-cyan-300 font-bold">Mystery Boxes:</span> Unlock exclusive rewards and special prizes.</li>
  <li> <span className="text-cyan-300 font-bold">Jackpots:</span> Huge prize pools waiting for the winners.</li>
  <li> <span className="text-cyan-300 font-bold">Pioneer Community:</span> Connect and battle with fellow Pioneers worldwide.</li>
  <li> <span className="text-cyan-300 font-bold">Bragging Rights:</span> Earn your status on the Arena leaderboards.</li>
  <li> <span className="text-cyan-300 font-bold">Powered by Pi:</span> Transparent, fair, and decentralized gaming for the Pioneer ecosystem.</li>
</ul>

          </div>

          {/* Closing Hype */}
          <div className="competition-card p-6 mb-8 bg-white bg-opacity-10 rounded-2xl shadow-lg text-center">
            <div className="text-3xl text-cyan-300 mb-4 font-bold">
              Built for Pioneers. Powered by Pi.
            </div>
            <p className="text-white text-lg mb-6">
              Get ready for the next evolution of decentralized entertainment — where competition meets innovation, and Pioneers battle for glory.
            </p>

            <button className="btn-gradient px-10 py-4 rounded-full text-2xl font-bold shadow-xl hover:scale-110 transition">
              Watch This Space
            </button>
          </div>

        </div>
      </main>
    </>
  );
}
