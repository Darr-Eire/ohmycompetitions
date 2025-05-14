'use client';

import React from 'react';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <main className="min-h-screen py-10 px-4 bg-[#0b1120] text-white font-orbitron">
      <div className="max-w-3xl mx-auto border border-cyan-400 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-[0_0_30px_#00fff055]">
        <h1 className="text-3xl sm:text-4xl font-bold text-cyan-300 mb-6 text-center animate-glow-float">
          Pi Cash Code — Terms & Conditions
        </h1>

        <ol className="list-decimal list-inside space-y-4 text-sm sm:text-base text-white/90 leading-relaxed">
          <li>
            <strong>Eligibility:</strong> Participation is limited to verified Pi Network Pioneers with an active Pi account.
          </li>

          <li>
            <strong>Entry Fee:</strong> Each entry ticket costs <span className="text-cyan-300 font-bold">1.25 π</span>. Multiple entries are allowed per person.
          </li>

          <li>
            <strong>Code Drop:</strong> A new code is released every Monday at <strong>3:14 PM UTC</strong> and expires after <strong>31 hours and 4 minutes</strong>.
          </li>

          <li>
            <strong>Draw Timing:</strong> A winner is selected every Friday at <strong>3:14 PM UTC</strong>. If the winner fails to respond with the correct code within <strong>31 minutes and 4 seconds</strong>, the prize rolls over and increases.
          </li>

          <li>
            <strong>Winner Claim:</strong> The selected winner must submit the exact code from the same week via the claim form. Failure to do so forfeits the prize.
          </li>

          <li>
            <strong>Prize Rollover:</strong> If unclaimed, the prize pool increases by <span className="text-cyan-300 font-bold">25%</span> and continues to the following week's draw.
          </li>

          <li>
            <strong>Ticket Rollover:</strong> <span className="text-cyan-300 font-bold">20%</span> of non-winning tickets automatically roll into the next week's draw.
          </li>

          <li>
            <strong>Fraud Prevention:</strong> Any suspicious or automated behavior will result in immediate disqualification and possible account suspension.
          </li>

          <li>
            <strong>Changes:</strong> We reserve the right to update these terms at any time. Continued participation implies acceptance of any changes.
          </li>
        </ol>

        <div className="text-center mt-8 text-sm text-cyan-400">
          Last updated: May 14, 2025
        </div>

        <div className="mt-8 text-center">
          <Link href="/pi-cash-code">
            <span className="inline-block px-6 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold text-sm rounded-md shadow hover:brightness-110 transition">
              ← Back to Pi Cash Code
            </span>
          </Link>
        </div>
      </div>
    </main>
  );
}
