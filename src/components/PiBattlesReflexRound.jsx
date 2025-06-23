'use client';

import { useState } from 'react';
import PiBattlesReflexRound from 'components/PiBattlesReflexRound';

export default function PiBattlesPage() {
  const [selectedBattle, setSelectedBattle] = useState(null);

  const handleBattleSelect = (type) => {
    setSelectedBattle(type);
  };

  const handleResultSubmit = (data) => {
    console.log('Battle result:', data);
    // You can route to results screen or next round here later
  };

  return (
    <main className="min-h-screen bg-[#0b1120] text-white font-orbitron flex flex-col items-center justify-center p-6">
      {!selectedBattle && (
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl mb-8 font-bold">⚔️ Pi Battles</h1>
          <p className="mb-6 text-lg text-gray-300">Choose your battle mode:</p>
          <div className="flex flex-wrap gap-6 justify-center">
            <button
              onClick={() => handleBattleSelect('reflex')}
              className="bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-3 rounded-xl shadow-md text-lg"
            >
              ⚡ Reflex Tap
            </button>
            <button
              onClick={() => alert('Memory Battle coming soon')}
              className="bg-gray-700 text-gray-400 px-6 py-3 rounded-xl text-lg cursor-not-allowed"
            >
              🧠 Memory Match
            </button>
            <button
              onClick={() => alert('Trivia Battle coming soon')}
              className="bg-gray-700 text-gray-400 px-6 py-3 rounded-xl text-lg cursor-not-allowed"
            >
              ❓ Trivia Clash
            </button>
          </div>
        </div>
      )}

      {selectedBattle === 'reflex' && (
        <div className="w-full max-w-xl mt-10">
          <PiBattlesReflexRound onResultSubmit={handleResultSubmit} />
        </div>
      )}
    </main>
  );
}
