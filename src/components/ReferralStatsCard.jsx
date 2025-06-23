'use client';

import { useState } from 'react';

export default function ReferralStatsCard({
  username = 'unknown',
  signupCount = 0,
  ticketsEarned = 0,
  miniGamesBonus = 0,
}) {
  const referralUrl = `https://ohmycompetitions.com/signup?ref=${username}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralUrl);
    alert('✅ Referral link copied!');
  };

  return (
    <div className="bg-[#1e293b] p-4 rounded-md border border-cyan-600 space-y-3 text-center mt-4">
      <h3 className="text-lg font-semibold text-white">Referral Program</h3>
      <p className="text-sm text-gray-400">
        Invite friends, earn tickets and Pi rewards!
      </p>

      <p className="text-xs text-cyan-400 break-all">
        Your Link:{' '}
        <span className="font-mono text-white">{referralUrl}</span>
      </p>

      <button
        className="text-xs text-cyan-300 underline"
        onClick={handleCopy}
      >
        Copy Referral Link
      </button>

      <div className="grid grid-cols-3 gap-2 text-[10px] mt-3">
        <div className="bg-[#0f172a] p-2 rounded-md border border-cyan-500">
          <p className="text-gray-400 mb-1">👥 Signups</p>
          <p className="text-white font-bold text-sm">{signupCount}</p>
        </div>
        <div className="bg-[#0f172a] p-2 rounded-md border border-cyan-300">
          <p className="text-gray-400 mb-1">🎫 Tickets Earned</p>
          <p className="text-white font-bold text-sm">{ticketsEarned}</p>
        </div>
        <div className="bg-[#0f172a] p-2 rounded-md border border-green-500">
          <p className="text-gray-400 mb-1">💰 Bonus Mini Games Entries</p>
          <p className="text-white font-bold text-sm">{miniGamesBonus}</p>
        </div>
      </div>

      <div className="mt-3 flex justify-center gap-4 text-cyan-400 text-xs">
        <a
          href={`https://t.me/share/url?url=${referralUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          Share on Telegram
        </a>
        <a
          href={`https://twitter.com/intent/tweet?text=Join+me+on+OhMyCompetitions!+${referralUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          Share on X
        </a>
      </div>
    </div>
  );
}
