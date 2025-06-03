'use client';

import Head from 'next/head';
import { useState } from 'react';
import dynamic from 'next/dynamic';

const Roulette = dynamic(() => import('react-custom-roulette').then(mod => mod.Roulette), {
  ssr: false,
});

// 13 total segments: 8 prizes + 5 try again
const segments = [
  { option: '0.25π 🔥' },
  { option: 'Retry Token 🔥' },
  { option: 'Free Entry 💎' },
  { option: '0.5π 💎' },
  { option: 'Ticket Discount 🔥' },
  { option: '1π 💎' },
  { option: '5π 🎁' },
  { option: 'Bonus Spin 🎁' },
  { option: 'Try Again 😢' },
  { option: 'Try Again 😢' },
  { option: 'Try Again 😢' },
  { option: 'Try Again 😢' },
  { option: 'Try Again 😢' },
];

export default function SpinWheelPage() {
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeIndex, setPrizeIndex] = useState(0);
  const [result, setResult] = useState(null);
  const [spinsLeft, setSpinsLeft] = useState(1); // you can later hook this to your backend

  const spin = () => {
    if (spinsLeft <= 0) return;

    const index = Math.floor(Math.random() * segments.length);
    setPrizeIndex(index);
    setMustSpin(true);
    setResult(null);
    setSpinsLeft(spinsLeft - 1);
  };

  const handleStop = () => {
    setMustSpin(false);
    setResult(segments[prizeIndex].option);
  };

  return (
    <>
      <Head><title>Spin the Wheel | OhMyCompetitions</title></Head>

      <main className="min-h-screen app-background text-white font-orbitron flex flex-col items-center justify-start py-10 px-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent mb-2">
          🎯 Spin & Win
        </h1>
        <p className="text-sm text-cyan-300 mb-6 text-center">
          Spin for a chance to win Pi prizes, free entries, retry tokens or discounts.
        </p>

        <div className="w-full max-w-xs sm:max-w-md mb-6">
          <Roulette
            mustStartSpinning={mustSpin}
            prizeNumber={prizeIndex}
            data={segments}
            onStopSpinning={handleStop}
            backgroundColors={['#00ffff', '#00c2ff']}
            textColors={['#000']}
            outerBorderColor={'#00ffd5'}
            innerBorderColor={'#0f172a'}
            radiusLineColor={'#0077ff'}
          />
        </div>

        <button
          onClick={spin}
          disabled={spinsLeft <= 0}
          className={`font-bold py-2 px-6 rounded-md transition ${spinsLeft <= 0
            ? 'bg-gray-600 cursor-not-allowed'
            : 'bg-gradient-to-r from-cyan-400 to-blue-500 text-black hover:scale-105'}`}
        >
          {spinsLeft > 0 ? 'Spin Now (0.5π)' : 'Come Back Tomorrow'}
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

