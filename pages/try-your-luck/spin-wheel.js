'use client';

import Head from 'next/head';
import { useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically load roulette to avoid SSR issues
const Roulette = dynamic(
  () => import('react-custom-roulette').then(mod => mod.default),
  { ssr: false }
);

const segments = [
  { option: '0.25π 🔥', style: { backgroundColor: '#00FFFF' } },
  { option: 'Retry Token 🔥', style: { backgroundColor: '#00C2FF' } },
  { option: 'Free Entry 💎', style: { backgroundColor: '#99FFCC' } },
  { option: '0.5π 💎', style: { backgroundColor: '#00DDDD' } },
  { option: 'Nothing 😢', style: { backgroundColor: '#222' } },
  { option: '1π 💎', style: { backgroundColor: '#33FFFF' } },
  { option: 'Ticket Discount 🔥', style: { backgroundColor: '#00C2FF' } },
  { option: '5π 🎁', style: { backgroundColor: '#FFD700' } },
];

export default function SpinWheelPage() {
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeIndex, setPrizeIndex] = useState(0);
  const [result, setResult] = useState(null);
  const [spinning, setSpinning] = useState(false);

  const handleSpin = () => {
    if (spinning) return;

    const index = Math.floor(Math.random() * segments.length);
    setPrizeIndex(index);
    setMustSpin(true);
    setSpinning(true);
    setResult(null);
  };

  const handleStop = () => {
    setMustSpin(false);
    setSpinning(false);
    setResult(segments[prizeIndex].option);
  };

  return (
    <>
      <Head><title>Spin the Wheel | OhMyCompetitions</title></Head>

      <main className="min-h-screen px-4 py-8 bg-[#0b1120] text-white font-orbitron flex flex-col items-center justify-start">
        <h1 className="text-3xl sm:text-4xl font-bold text-cyan-400 mb-2">🎯 Spin & Win</h1>
        <p className="text-sm text-cyan-300 mb-6 text-center">
          Pay <span className="font-bold">0.5π</span> to spin for real rewards: bonus π, retry tokens, discounts, jackpots.
        </p>

        <div className="w-full max-w-sm mb-4">
          <Roulette
            mustStartSpinning={mustSpin}
            prizeNumber={prizeIndex}
            data={segments}
            backgroundColors={['#0ff', '#00C2FF']}
            textColors={['#000']}
            outerBorderColor="#00FFFF"
            innerBorderColor="#003344"
            onStopSpinning={handleStop}
          />
        </div>

        <button
          onClick={handleSpin}
          disabled={spinning}
          className={`mt-2 py-2 px-6 text-sm sm:text-base font-bold rounded-md transition ${
            spinning
              ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
              : 'bg-gradient-to-r from-cyan-400 to-blue-500 text-black hover:scale-105'
          }`}
        >
          {spinning ? 'Spinning...' : 'Spin Now (0.5π)'}
        </button>

        <p className="text-xs text-teal-400 mt-3 text-center max-w-sm">
          Daily free spin available if you’ve entered any competition in the last 7 days.
        </p>

        {result && (
          <div className="mt-6 text-xl font-bold text-yellow-300 animate-pulse">
            🎉 You won: {result}
          </div>
        )}
      </main>
    </>
  );
}
