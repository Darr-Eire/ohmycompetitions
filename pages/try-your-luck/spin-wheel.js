'use client';

import Head from 'next/head';
import { useState } from 'react';
import dynamic from 'next/dynamic';

// Lazy load to avoid SSR issues
const Roulette = dynamic(() => import('react-custom-roulette').then(mod => mod.Roulette), {
  ssr: false,
});

const segments = [
  { option: '0.25π 🔥' },
  { option: 'Retry Token 🔥' },
  { option: 'Free Entry 💎' },
  { option: '0.5π 💎' },
  { option: 'Nothing 😢' },
  { option: '1π 💎' },
  { option: 'Ticket Discount 🔥' },
  { option: '5π 🎁' },
];

export default function SpinWheelPage() {
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeIndex, setPrizeIndex] = useState(0);
  const [result, setResult] = useState(null);

  const spin = () => {
    const index = Math.floor(Math.random() * segments.length);
    setPrizeIndex(index);
    setMustSpin(true);
    setResult(null);
  };

  const handleStop = () => {
    setMustSpin(false);
    setResult(segments[prizeIndex].option);
  };

  return (
    <>
      <Head><title>Spin the Wheel | OhMyCompetitions</title></Head>

      <main className="min-h-screen bg-[#0f172a] text-white font-orbitron flex flex-col items-center justify-start py-10 px-4">
        <h1 className="text-3xl font-bold text-cyan-400 mb-2">🎯 Spin & Win</h1>
        <p className="text-sm text-cyan-300 mb-6 text-center">
          Spin for a chance to win real Pi rewards, retry tokens, or free tickets.
        </p>

        <div className="w-full max-w-xs sm:max-w-md mb-6">
          <Roulette
            mustStartSpinning={mustSpin}
            prizeNumber={prizeIndex}
            data={segments}
            onStopSpinning={handleStop}
            backgroundColors={['#00ffff', '#00c2ff']}
            textColors={['#000']}
          />
        </div>

        <button
          onClick={spin}
          className="bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold py-2 px-6 rounded-md hover:scale-105 transition"
        >
          Spin Now (0.5π)
        </button>

        {result && (
          <p className="mt-6 text-xl text-yellow-300 font-bold animate-pulse">
            🎉 You won: {result}
          </p>
        )}
      </main>
    </>
  );
}
