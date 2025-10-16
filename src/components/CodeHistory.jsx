'use client';
import React from 'react';

export default function CodeHistory({ history = [] }) {
  // Ensure history is always an array
  const safeHistory = Array.isArray(history) ? history : [];

  return (
    <div className="p-4 bg-[#0a1024]/60 rounded-xl border border-cyan-600 shadow-[0_0_20px_#00fff055]">
      <h3 className="text-cyan-300 text-lg font-bold mb-3 font-orbitron">
        Recent Pi Cash Code History
      </h3>

      {safeHistory.length === 0 ? (
        <p className="text-white/70 text-sm italic">No history found yet.</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {safeHistory.map((entry, i) => (
            <li key={i} className="border border-cyan-800 p-3 rounded-md">
              <div className="flex justify-between">
                <span className="text-cyan-300">
                  Week {entry.weekStart || i + 1}
                </span>
                <span className="text-white">
                  Code: {entry.code || '—'}
                </span>
              </div>
              <div className="text-cyan-200 text-xs mt-1">
                Winner: {entry.winner || '—'}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
