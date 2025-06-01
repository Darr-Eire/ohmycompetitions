'use client';
import { topWinners } from '@/data/piLotteryData';

export default function PiWinnersBoard() {
  return (
    <div className="bg-[#1e293b] border border-cyan-400 rounded-lg p-4 mt-8 shadow-lg">
      <h2 className="text-lg font-bold text-cyan-300 mb-3 text-center">🏆 Top Winners</h2>
      <ul className="text-sm text-white space-y-2">
        {topWinners.map((winner, i) => (
          <li key={i} className="flex justify-between border-b border-cyan-700 py-2">
            <span className="text-cyan-300 font-semibold">#{i + 1} {winner.name}</span>
            <span className="text-cyan-300 font-bold">{winner.prize.toLocaleString()} π</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
