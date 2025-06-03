'use client';
import { lastWeekResults, countryData } from '@data/piLotteryData';


export default function PiDrawResults({ selected }) {
  const result = lastWeekResults[selected];

  return (
    <div className="bg-[#1e293b] border border-cyan-400 rounded-lg p-4 mt-6 shadow-lg">
      <h2 className="text-lg font-bold text-cyan-300 mb-3 text-center">
        Last Week: {countryData[selected].flag} {countryData[selected].name}
      </h2>

      <div className="flex flex-wrap justify-center gap-2 mb-2">
        {result.numbers.map((num, i) => (
          <div key={i} className="w-10 h-10 bg-cyan-300 text-black rounded-full flex items-center justify-center font-bold shadow">
            {num}
          </div>
        ))}
      </div>

      <div className="text-sm text-purple-300 font-semibold text-center">⭐ Bonus Ball</div>
      <div className="w-10 h-10 bg-purple-500 text-white mx-auto rounded-full flex items-center justify-center font-bold shadow">
        {result.bonus}
      </div>
    </div>
  );
}
