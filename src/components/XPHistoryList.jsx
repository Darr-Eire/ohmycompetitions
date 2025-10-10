'use client';
import React from 'react';

export default function XPHistoryList({ history = [] }) {
  if (!history.length) {
    return (
      <div className="text-center text-sm text-gray-400 py-4">
        No XP activity yet. Play stages to earn XP!
      </div>
    );
  }
  return (
    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
      {history.map((h, i) => (
        <div
          key={`${h.createdAt || i}-${h.reason || 'xp'}`}
          className="flex items-center justify-between bg-[#0f172a] border border-white/10 rounded-lg px-3 py-2"
        >
          <div className="text-xs">
            <div className="text-white font-semibold">
              {prettyReason(h.reason)}
            </div>
            <div className="text-[11px] text-white/50">
              {new Date(h.createdAt || Date.now()).toLocaleString()}
            </div>
          </div>
          <div className="text-sm font-bold text-emerald-400">
            +{h.amount} XP
          </div>
        </div>
      ))}
    </div>
  );
}

function prettyReason(r = '') {
  const key = r.toLowerCase();
  if (key.includes('join')) return 'Entered a Stage';
  if (key.includes('advance')) return 'Advanced to Next Stage';
  if (key.includes('win')) return 'Won Finals';
  if (key.includes('bonus')) return 'Bonus XP';
  if (key.includes('redeem')) return 'Redeemed XP';
  return r || 'XP Earned';
}
