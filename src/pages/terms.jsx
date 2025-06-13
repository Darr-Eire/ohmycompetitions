'use client';

import React from 'react';
import Link from 'next/link';

export default function PiLotteryTermsPage() {
  return (
    <main className="min-h-screen py-10 px-4 bg-[#0f172a] text-white font-orbitron flex justify-center items-start">
      <div className="w-full max-w-3xl border border-cyan-500 rounded-2xl shadow-[0_0_40px_#00fff088] p-0 overflow-hidden">

        {/* Neon title bar */}
        <div className="bg-gradient-to-r from-cyan-400 to-blue-500 py-3 text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-black uppercase tracking-wide">
            Pi Lottery Terms & Conditions
          </h1>
        </div>

        <div className="px-6 py-6 sm:py-8 bg-[#1e293b]">
          <p className="text-center text-white/90 text-sm sm:text-base mb-6">
            Welcome to the official Pi Lottery. Please review the following terms before participating.
          </p>

          {/* Section: General Rules */}
          <div className="mb-6 border border-cyan-600 rounded-lg p-4">
            <h2 className="text-lg font-bold text-cyan-400 mb-3 text-center border-b border-cyan-800 pb-1 uppercase">
              General Rules
            </h2>
            <ul className="list-disc list-inside text-white/90 text-sm sm:text-base space-y-1">
              <li>You must have a verified Pi Wallet to enter.</li>
              <li>Tickets cost exactly 1 π and cannot be refunded.</li>
              <li>Each ticket represents one entry for the upcoming draw.</li>
              <li>You may enter as many times as you want before the deadline.</li>
            </ul>
          </div>

          {/* Section: Number Selection */}
          <div className="mb-6 border border-cyan-600 rounded-lg p-4">
            <h2 className="text-lg font-bold text-cyan-400 mb-3 text-center border-b border-cyan-800 pb-1 uppercase">
              Number Selection
            </h2>
            <ul className="list-disc list-inside text-white/90 text-sm sm:text-base space-y-1">
              <li>Select 5 main numbers and 1 bonus ball (6 total).</li>
              <li>Once submitted, your numbers are final and stored securely.</li>
              <li>If you win, your wallet must still be linked to claim the prize.</li>
            </ul>
          </div>

          {/* Section: Winning & Payouts */}
          <div className="mb-6 border border-cyan-600 rounded-lg p-4">
            <h2 className="text-lg font-bold text-cyan-400 mb-3 text-center border-b border-cyan-800 pb-1 uppercase">
              Winning & Payouts
            </h2>
            <ul className="list-disc list-inside text-white/90 text-sm sm:text-base space-y-1">
              <li>Winners are drawn automatically and publicly.</li>
              <li>Jackpots increase with more ticket purchases.</li>
              <li>Winners receive Pi directly via Pi Wallet within 48 hours.</li>
            </ul>
          </div>

          {/* Section: Fairness & Security */}
          <div className="mb-6 border border-cyan-600 rounded-lg p-4">
            <h2 className="text-lg font-bold text-cyan-400 mb-3 text-center border-b border-cyan-800 pb-1 uppercase">
              Fairness & Security
            </h2>
            <ul className="list-disc list-inside text-white/90 text-sm sm:text-base space-y-1">
              <li>Draws are randomized and cannot be manipulated.</li>
              <li>All ticket data is stored securely and transparently.</li>
              <li>Any attempts to cheat or exploit will result in disqualification.</li>
            </ul>
          </div>

          <div className="text-center mt-8 text-sm text-cyan-400">
            Last updated:  14, 2025
          </div>

          <div className="mt-6 text-center">
            <Link href="/lottery">
              <span className="inline-block px-6 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold text-sm rounded-md shadow hover:brightness-110 transition">
                 Back to Lottery
              </span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
