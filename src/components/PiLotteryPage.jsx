'use client';

import { useState, useEffect } from 'react';
import BuyTicketButton from '../components/BuyTicketButton';

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

export default function PiLotteryPage() {
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

  return (
    <div className="min-h-screen bg-[#0f172a] text-white px-4 py-6 font-orbitron">
      <div className="max-w-3xl mx-auto bg-[#1e293b] border border-cyan-500 rounded-lg p-6 space-y-4">

        <h1 className="text-3xl font-bold text-center text-cyan-300">🌍 Pi Global Lottery</h1>

        <div className="flex flex-col items-center gap-4">
          <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} className="p-2 bg-black text-white border border-cyan-300 rounded">
            {Object.entries(countryData).map(([code, { name, flag }]) => (
              <option key={code} value={code}>{flag} {name}</option>
            ))}
          </select>

          <div className="text-cyan-300">Next Draw: {drawCountdown}</div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: max }, (_, i) => i + 1).map(num => (
              <button
                key={num}
                onClick={() => toggleNumber(num)}
                className={`w-10 h-10 rounded-full font-bold ${
                  pickedNumbers.includes(num)
                    ? 'bg-cyan-300 text-black'
                    : 'bg-[#0f172a] border border-cyan-400 text-white'
                }`}>
                {num}
              </button>
            ))}
          </div>

          <button onClick={quickPick} className="mt-2 text-cyan-300 underline">🎲 Quick Pick</button>

          <div className="text-center text-white text-lg">
            🎟️ Picked: {pickedNumbers.join(', ') || 'None yet'}
          </div>

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
            buttonLabel="Pay 1 π & Enter Lottery"
            disabled={pickedNumbers.length !== DEFAULT_PICK_COUNT}
          />
        </div>
      </div>
    </div>
  );
}
