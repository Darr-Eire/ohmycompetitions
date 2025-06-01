'use client';
import Head from 'next/head';
import { useState } from 'react';
import PiLotteryTabs from '@/components/PiLotteryTabs';
import PiNumberPicker from '@/components/PiNumberPicker';
import PiDrawResults from '@/components/PiDrawResults';
import PiWinnersBoard from '@/components/PiWinnersBoard';
import { DEFAULT_PICK_COUNT } from '@/data/piLotteryData';

export default function PiLotteryPage() {
  const [selected, setSelected] = useState('global');
  const [pickedNumbers, setPickedNumbers] = useState([]);

  const handleSubmit = () => {
    if (pickedNumbers.length !== DEFAULT_PICK_COUNT) {
      alert('Please select all 6 numbers.');
      return;
    }
    console.log("Submit ticket:", pickedNumbers);
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

          <button onClick={handleSubmit} className="w-full mt-5 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold rounded-lg">
            Pay 1 π & Enter
          </button>

          <PiDrawResults selected={selected} />
          <PiWinnersBoard />
        </div>
      </main>
    </>
  );
}
