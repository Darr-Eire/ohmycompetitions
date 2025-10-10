'use client';
import React from 'react';

export default function XPProgressBar({ xp = 0, level = 1, nextLevelXP = 100 }) {
  const pct = Math.min(100, Math.floor((xp / nextLevelXP) * 100));
  return (
    <div className="rounded-2xl border border-cyan-600 bg-[#0f172a] p-4">
      <div className="flex items-center justify-between text-xs text-white/70">
        <span className="font-semibold text-white">OMC XP</span>
        <span className="text-white/70">Level {level}</span>
      </div>
      <div className="mt-2 h-2.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-400 animate-pulse"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-1 text-[11px] text-white/60 flex items-center justify-between">
        <span>{xp}/{nextLevelXP} XP</span>
        <span>{Math.max(0, nextLevelXP - xp)} to next level</span>
      </div>
    </div>
  );
}
