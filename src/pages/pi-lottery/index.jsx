'use client';
import Head from 'next/head';
import { useState } from 'react';
import PiLotteryTabs from '@components/PiLotteryTabs';
import PiNumberPicker from '@components/PiNumberPicker';
import PiDrawResults from '@components/PiDrawResults';
import PiWinnersBoard from '@components/PiWinnersBoard';
import { DEFAULT_PICK_COUNT } from '@data/piLotteryData';

export default function PiLotteryPage() {
  const [selected, setSelected] = useState('global');
  const [pickedNumbers, setPickedNumbers] = useState([]);

  const comingSoon = false; // Set true to disable entry and show "Coming Soon"

  const handleSubmit = () => {
    if (pickedNumbers.length !== DEFAULT_PICK_COUNT) {
      alert('Please select all 6 numbers.');
      return;
    }
    console.log('Submit ticket:', pickedNumbers);
    // Add your payment logic here
  };

  return (
    <>
      <Head>
        <title>Pi Lottery | OhMyCompetitions</title>
      </Head>

      <main className="min-h-screen bg-[#0f172a] text-white font-orbitron px-3 py-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-4 bg-gradient-to-r from-[#00ffd5] to-[#0077ff] bg-clip-text text-transparent">
            Pi Lottery
          </h1>

          <PiLotteryTabs selected={selected} setSelected={setSelected} />

          <div className="mt-4 text-center text-cyan-300 font-semibold text-lg">Pick 6 Numbers</div>

          <PiNumberPicker pickedNumbers={pickedNumbers} setPickedNumbers={setPickedNumbers} />

        <div className="p-4 pt-0 mt-auto">
  {comingSoon ? (
    <button
      disabled
      className="w-full py-3 bg-gradient-to-r from-[#00ffd5] to-[#0077ff] opacity-60 cursor-not-allowed font-bold text-black rounded-lg shadow"
    >
      Coming Soon
    </button>
  ) : (
    <button
      onClick={handleSubmit}
      disabled={pickedNumbers.length !== DEFAULT_PICK_COUNT}
      className={`w-full mt-5 py-3 font-bold rounded-lg text-black ${
        pickedNumbers.length === DEFAULT_PICK_COUNT
          ? 'bg-gradient-to-r from-[#00ffd5] to-[#0077ff] cursor-pointer shadow'
          : 'bg-gradient-to-r from-[#00ffd5] to-[#0077ff] cursor-not-allowed'
      }`}
    >
      Coming Soon
    </button>
  )}
</div>


          <PiDrawResults selected={selected} />
          <PiWinnersBoard />
        </div>
      </main>
    </>
  );
}
