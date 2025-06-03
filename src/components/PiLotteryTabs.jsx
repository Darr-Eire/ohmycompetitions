'use client';
import { countryData } from '@data/piLotteryData';

export default function PiLotteryTabs({ selected, setSelected }) {
  return (
    <div className="flex overflow-x-auto space-x-2 py-4 px-2">
      {Object.entries(countryData).map(([code, data]) => (
        <button
          key={code}
          onClick={() => setSelected(code)}
          className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-bold transition ${
            selected === code
              ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-black shadow'
              : 'bg-[#1e293b] text-white border border-cyan-600'
          }`}
        >
          {data.flag} {data.name}
        </button>
      ))}
    </div>
  );
}
