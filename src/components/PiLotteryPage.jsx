'use client';

import { useState, useEffect } from 'react';
import BuyTicketButton from '../components/BuyTicketButton';

const DEFAULT_MAX_NUMBER = 50;
const DEFAULT_PICK_COUNT = 6;

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
  BR: { name: 'Brazil', flag: '🇧🇷' },
};

export default function PiLotteryPage() {
  const [showCountries, setShowCountries] = useState(false);
  const [lotteryType, setLotteryType] = useState('global');
  const [countryCode, setCountryCode] = useState('IE');
  const [pickedNumbers, setPickedNumbers] = useState([]);
  const [drawCountdown, setDrawCountdown] = useState('Loading...');
  const max = DEFAULT_MAX_NUMBER;

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

  const renderPicked = () => {
    if (pickedNumbers.length === 0) return 'None yet';
    return pickedNumbers.map((n, i) => (
      <span key={n} className={i === 5 ? 'text-yellow-400 font-bold' : ''}>
        {n}{i < pickedNumbers.length - 1 ? ', ' : ''}
      </span>
    ));
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white px-4 py-6 font-orbitron">
      <div className="max-w-3xl mx-auto bg-[#1e293b] border border-cyan-500 rounded-lg p-6 space-y-4">
        <h1 className="text-3xl font-bold text-center text-cyan-300">Pi Global Lottery</h1>

        <p className="text-center text-white/90 text-sm sm:text-base">
          Pick 5 numbers and a bonus ball. Each ticket costs 1 π. Jackpot every week. Global and country-specific draws supported.
        </p>

        <div className="flex flex-col items-center gap-4">
          <div className="relative w-full max-w-xs">
            <button
              onClick={() => setShowCountries(prev => !prev)}
              className="w-full px-4 py-2 bg-[#0f172a] border border-cyan-400 text-white rounded-xl font-bold flex items-center justify-between"
            >
              <span>{countryData[countryCode]?.flag} {countryData[countryCode]?.name}</span>
              <span>▼</span>
            </button>

            {showCountries && (
              <div className="absolute mt-2 w-full bg-[#0f172a] border border-cyan-400 rounded-xl z-50 max-h-60 overflow-y-auto shadow-lg">
                {Object.entries(countryData).map(([code, { name, flag }]) => (
                  <button
                    key={code}
                    onClick={() => {
                      setCountryCode(code);
                      setPickedNumbers([]);
                      setShowCountries(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-cyan-800 text-white"
                  >
                    {flag} {name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="text-cyan-300">Next Draw: {drawCountdown}</div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: max }, (_, i) => i + 1).map(num => {
              const isPicked = pickedNumbers.includes(num);
              const isBonus = pickedNumbers.length === DEFAULT_PICK_COUNT && pickedNumbers[5] === num;

              return (
                <button
                  key={num}
                  onClick={() => toggleNumber(num)}
                  className={`relative w-10 h-10 rounded-full font-bold ${
                    isPicked
                      ? isBonus
                        ? 'bg-yellow-400 text-black'
                        : 'bg-cyan-300 text-black'
                      : 'bg-[#0f172a] border border-cyan-400 text-white'
                  }`}
                >
                  {num}
                  {isBonus && (
                    <span className="absolute -top-2 -right-2 bg-black text-yellow-400 text-xs rounded px-1">B</span>
                  )}
                </button>
              );
            })}
          </div>

          <button onClick={quickPick} className="mt-2 text-cyan-300 underline">Quick Pick</button>

          <div className="text-center text-white text-lg">
            Picked: {renderPicked()}
          </div>

          <div className="w-full mt-4 px-4 py-3 bg-[#0f172a] border border-cyan-400 rounded-xl text-sm text-white space-y-2 text-center">
            <h3 className="text-cyan-300 font-bold mb-2">Prize Breakdown</h3>
            <div className="space-y-1">
              <div className="flex justify-between px-4">
                <span>Match 5 + Bonus</span>
                <span className="text-cyan-300 font-bold">🏆 Jackpot</span>
              </div>
              <div className="flex justify-between px-4">
                <span>Match 5</span>
                <span className="text-cyan-300">2,000 π</span>
              </div>
              <div className="flex justify-between px-4">
                <span>Match 4</span>
                <span className="text-cyan-300">500 π</span>
              </div>
              <div className="flex justify-between px-4">
                <span>Match 3</span>
                <span className="text-cyan-300">100 π</span>
              </div>
              <div className="flex justify-between px-4">
                <span>Match 2</span>
                <span className="text-cyan-300">Entry Fee × 20</span>
              </div>
            </div>
          </div>

          {pickedNumbers.length === DEFAULT_PICK_COUNT ? (
            <BuyTicketButton
              amount={1.00}
              memo="Pi Lottery Ticket"
              metadata={{
                type: 'pi-lottery-ticket',
                mainNumbers: pickedNumbers.slice(0, 5),
                bonusNumber: pickedNumbers[5],
                countryCode,
                lotteryType,
              }}
              buttonLabel="Coming Soon"
              disabled={true}
            />
          ) : (
            <button
              disabled
              className="mt-4 w-full py-3 rounded-xl font-bold text-black bg-gradient-to-r from-[#00ffd5] to-[#0077ff] opacity-60 cursor-not-allowed"
            >
              Coming Soon
            </button>
          )}

          {/* Terms & Conditions Link */}
          <div className="mt-6 text-center">
            <a href="/terms" className="text-xs text-cyan-400 underline hover:text-cyan-300 transition">
              View full Terms & Conditions
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
