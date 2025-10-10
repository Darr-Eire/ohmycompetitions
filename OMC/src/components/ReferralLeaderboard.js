'use client';

import React, { useState, useEffect } from 'react';

export default function ReferralLeaderboard() {
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    const allKeys = Object.keys(localStorage);
    const referralKeys = allKeys.filter((key) => key.startsWith('referrals_'));

    const leaderboard = referralKeys.map((key) => {
      const username = key.replace('referrals_', '');
      const count = parseInt(localStorage.getItem(key), 10);
      return { username, count };
    });

    leaderboard.sort((a, b) => b.count - a.count);
    setLeaders(leaderboard.slice(0, 10));  // show top 10
  }, []);

  if (leaders.length === 0) {
    return (
      <div className="bg-white/10 p-4 rounded-lg text-center">
        <p>No referrals yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white/10 p-4 rounded-lg">
      <h2 className="text-cyan-300 font-bold mb-3 text-lg">🏆 Top Referrers</h2>
      <ul className="space-y-2">
        {leaders.map((entry, index) => (
          <li key={index} className="flex justify-between border-b border-white/20 pb-1">
            <span>👤 {entry.username}</span>
            <span className="text-green-400 font-bold">{entry.count} referrals</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
