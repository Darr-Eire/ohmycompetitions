'use client';
import React from 'react';
import InfoPopover from './InfoPopover';

export default function XPBar({ xp = 0, level = 1 }) {
  const nextLevelXP = 100 + (level - 1) * 50; // keep in sync with server curve
  const pct = Math.min(100, Math.floor((xp / nextLevelXP) * 100));

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3 relative">
      <div className="flex items-center justify-between text-xs text-white/70">
        <span className="font-semibold text-white">Player XP</span>
        <div className="flex items-center gap-2">
          <span className="text-white/70">Level {level}</span>
          <InfoPopover align="left" size="md" />
        </div>
      </div>
      <div className="mt-2 h-2.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-400 animate-pulse"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-1 text-[11px] text-white/50 flex items-center justify-between">
        <span>{xp}/{nextLevelXP} XP</span>
        <span>{Math.max(0, nextLevelXP - xp)} to next level</span>
      </div>
    </div>
  );
}
