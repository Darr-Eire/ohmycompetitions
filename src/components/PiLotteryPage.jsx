'use client';
import { useState, useEffect } from 'react';

const DEFAULT_PICK_COUNT = 6;
const DEFAULT_MAX_NUMBER = 49;

const countryData = {
  NG: { name: 'Nigeria', flag: '🇳🇬' },
  IN: { name: 'India', flag: '🇮🇳' },
  VN: { name: 'Vietnam', flag: '🇻🇳' },
  US: { name: 'United States', flag: '🇺🇸' },
  KR: { name: 'South Korea', flag: '🇰🇷' },
  ID: { name: 'Indonesia', flag: '🇮🇩' },
  PH: { name: 'Philippines', flag: '🇵🇭' },
  IE: { name: 'Ireland', flag: '🇮🇪' },
  PK: { name: 'Pakistan', flag: '🇵🇰' },
  BD: { name: 'Bangladesh', flag: '🇧🇩' },
  KE: { name: 'Kenya', flag: '🇰🇪' },
  BR: { name: 'Brazil', flag: '🇧🇷' }
};

const getFlag = (code) => countryData[code]?.flag || '🏳️';
const getCountryName = (code) => countryData[code]?.name || code;

export default function PiLotteryPage() {
  const [lotteryType, setLotteryType] = useState('global');
  const [countryCode, setCountryCode] = useState('IE');
  const [pickedNumbers, setPickedNumbers] = useState([]);
  const [drawCountdown, setDrawCountdown] = useState('Loading...');

  const max = DEFAULT_MAX_NUMBER;

  const topWinners = [
    { name: 'PiMaster23', prize: 1500 },
    { name: 'LuckyMiner', prize: 850 },
    { name: 'Stacker77', prize: 600 },
  ];

  const lastWeekDraws = {
    global: {
      numbers: [7, 13, 21, 28, 34, 45],
      bonus: 10,
    },
    countries: {
      NG: { numbers: [6, 10, 17, 24, 36, 49], bonus: 7 },
      IN: { numbers: [2, 12, 18, 23, 30, 44], bonus: 3 },
      VN: { numbers: [5, 9, 14, 22, 31, 38], bonus: 19 },
      US: { numbers: [3, 9, 19, 27, 35, 42], bonus: 12 },
      KR: { numbers: [4, 8, 16, 25, 33, 46], bonus: 6 },
      ID: { numbers: [1, 6, 13, 20, 29, 39], bonus: 11 },
      PH: { numbers: [11, 17, 22, 30, 36, 48], bonus: 15 },
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const nextDraw = new Date();
      nextDraw.setUTCHours(0, 0, 0, 0);
      nextDraw.setUTCDate(nextDraw.getUTCDate() + (lotteryType === 'global' ? (7 - nextDraw.getUTCDay()) : 1));
      const diff = nextDraw - now;
      const hours = Math.floor(diff / 1000 / 60 / 60);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setDrawCountdown(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);
    return () => clearInterval(interval);
  }, [lotteryType]);

  const toggleNumber = (num) => {
    if (pickedNumbers.includes(num)) {
      setPickedNumbers(pickedNumbers.filter(n => n !== num));
    } else if (pickedNumbers.length < DEFAULT_PICK_COUNT) {
      setPickedNumbers([...pickedNumbers, num]);
    }
  };

  const quickPick = () => {
    const nums = new Set();
    while (nums.size < DEFAULT_PICK_COUNT) {
      nums.add(Math.floor(Math.random() * max) + 1);
    }
    setPickedNumbers(Array.from(nums));
  };

  const handleSubmit = () => {
    if (pickedNumbers.length !== DEFAULT_PICK_COUNT) return alert("Pick all numbers");
    const main = pickedNumbers.slice(0, 5);
    const bonus = pickedNumbers[5];
    console.log("SUBMIT:", { main, bonus, lotteryType, countryCode });
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white px-4 py-6 font-orbitron">
      <div className="max-w-3xl mx-auto bg-[#1e293b] border border-cyan-500 rounded-lg p-4 sm:p-6 shadow-lg space-y-4 text-center">

        

        <div className="text-cyan-300 font-bold text-3xl">
          {lotteryType === 'country'
            ? `${getFlag(countryCode)} ${getCountryName(countryCode)} Lottery`
            : '🌍 Global Pi Lottery'}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <label htmlFor="country-select" className="text-sm text-cyan-300"> Country:</label>
          <select
            id="country-select"
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            className="bg-[#0f172a] border border-cyan-400 text-white px-3 py-1 rounded text-sm"
          >
            {Object.entries(countryData).map(([code, { name, flag }]) => (
              <option key={code} value={code}>
                {flag} {name}
              </option>
            ))}
          </select>
        </div>

        <div className="text-cyan-300 text-sm font-semibold">
           Next Draw: <span className="animate-pulse">{drawCountdown}</span>
        </div>

        <div className="text-cyan-300 font-semibold">Pick 6 Numbers</div>

        <div className="grid grid-cols-7 gap-1 justify-center px-4 sm:px-0">
          {Array.from({ length: max }, (_, i) => i + 1).map(num => {
            const isPicked = pickedNumbers.includes(num);
            const index = pickedNumbers.indexOf(num);
            const isBonus = index === 5;
            return (
              <button
                key={num}
                onClick={() => toggleNumber(num)}
                className={`w-9 h-9 sm:w-10 sm:h-10 text-xs sm:text-sm rounded-full font-bold transition ${
                  isPicked
                    ? isBonus
                      ? 'bg-purple-500 text-white'
                      : 'bg-cyan-300 text-black'
                    : 'bg-[#0f172a] border border-cyan-400 text-white hover:bg-cyan-600'
                }`}
              >
                {num}
              </button>
            );
          })}
        </div>

        <div className="text-sm text-gray-400 mt-1">
          <button onClick={quickPick} className="text-blue-300 underline hover:text-cyan-400">
            🔄 Quick Pick
          </button>
        </div>

        <div className="bg-[#1e293b] border border-cyan-700 p-3 rounded-lg">
          <div className="text-xs text-gray-400">🎫 Your Ticket:</div>
          {pickedNumbers.length === 6 ? (
            <div className="space-y-1 text-lg font-extrabold tracking-wider">
              <div className="text-cyan-300">🎯 Main Numbers: {pickedNumbers.slice(0, 5).join(' • ')}</div>
              <div className="text-purple-400">⭐ Bonus Ball: {pickedNumbers[5]}</div>
            </div>
          ) : (
            <div className="text-cyan-500 text-lg">—</div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          className="w-full py-3 text-base font-bold bg-gradient-to-r from-cyan-400 to-blue-500 text-black rounded-lg hover:from-blue-500 hover:to-cyan-400 transition"
        >
          Pay 1 π & Enter Now
        </button>
<div className="text-xs text-gray-400 mt-2 text-center px-2">
  By entering, you agree to the{' '}
<a href="/pi-lottery-terms" className="text-cyan-300 underline hover:text-cyan-400">
  Pi Lottery Terms & Conditions
</a>
</div>


        <div className="mx-auto w-full max-w-2xl mt-8 bg-[#1e293b] border border-cyan-400 rounded-lg p-5 shadow-xl">
          <h2 className="text-xl sm:text-2xl font-bold text-cyan-300 mb-4 text-center">🧠 Last Week's Winning Numbers</h2>

          <div className="bg-[#0f172a] border border-cyan-400 rounded-lg p-4 mb-4">
            <h3 className="text-lg font-semibold text-cyan-300 mb-2">🌍 Global Draw</h3>
            <div className="flex flex-wrap justify-center gap-2 mb-2">
              {lastWeekDraws.global.numbers.map((num, i) => (
                <div key={i} className="w-10 h-10 sm:w-11 sm:h-11 bg-cyan-300 text-black rounded-full flex items-center justify-center font-bold text-sm sm:text-base shadow-md">{num}</div>
              ))}
            </div>
            <div className="text-sm text-purple-300 font-semibold">⭐ Bonus Ball</div>
            <div className="w-10 h-10 sm:w-11 sm:h-11 bg-purple-500 text-white mx-auto rounded-full flex items-center justify-center font-bold shadow-md">
              {lastWeekDraws.global.bonus}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(lastWeekDraws.countries).map(([code, data]) => (
              <div key={code} className="bg-[#0f172a] border border-cyan-600 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-blue-300 mb-2">
                  {getFlag(code)} {getCountryName(code)}
                </h3>
                <div className="flex flex-wrap justify-center gap-2 mb-2">
                  {data.numbers.map((n, i) => (
                    <div key={i} className="w-9 h-9 bg-cyan-300 text-black rounded-full flex items-center justify-center font-bold text-sm shadow">
                      {n}
                    </div>
                  ))}
                </div>
                <div className="text-xs text-purple-300 font-semibold text-center">⭐ Bonus Ball</div>
                <div className="w-9 h-9 bg-purple-500 text-white mx-auto rounded-full flex items-center justify-center font-bold shadow">
                  {data.bonus}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto w-full max-w-2xl mt-8 bg-[#1e293b] border border-cyan-400 rounded-lg p-5 shadow-xl">
          <h2 className="text-xl sm:text-2xl font-bold text-cyan-300 mb-4 text-center">🏆 Top Winners</h2>
          <ul className="text-sm text-white space-y-2 px-4">
            {topWinners.map((winner, i) => (
              <li key={i} className="flex justify-between border-b border-cyan-700 py-2">
                <span className="text-cyan-300 font-semibold">#{i + 1} {winner.name}</span>
                <span className="text-cyan-300 font-bold">{winner.prize.toLocaleString()} π</span>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}
