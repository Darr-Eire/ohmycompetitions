'use client';
import React from 'react';
import StackerGame from './try-your-luck/stackergame';


export default function StackerPage() {
  const mockUser = { uid: "user123", name: "Darren" };

  return (
    <main className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-start py-10">
      <StackerGame user={mockUser} />

      {/* Optional: Live Leaderboard / Recent Attempts */}
      <div className="mt-10 w-full max-w-md text-white text-center px-4">
        <h3 className="text-xl font-semibold mb-3 text-cyan-400">🏆 Recent Plays</h3>
        <ul className="bg-[#1e293b] p-4 rounded-xl space-y-2 text-sm shadow">
          <li className="flex justify-between"><span>🔥 Darren</span><span>Win</span></li>
          <li className="flex justify-between"><span>🧊 Alex</span><span>Loss</span></li>
          <li className="flex justify-between"><span>🌟 Sam</span><span>Win</span></li>
        </ul>
      </div>
    </main>
  );
}
