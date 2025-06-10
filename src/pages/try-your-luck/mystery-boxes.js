// File: src/pages/try-your-luck/mystery-boxes.js

'use client';

import Head from 'next/head';
import { useState } from 'react';
import { mysteryBoxes, openMysteryBox } from 'data/mystery-boxes-data';

export default function MysteryBoxesPage() {
  const [reward, setReward] = useState(null);
  const [openedBox, setOpenedBox] = useState(null);
  const [selectedBoxId, setSelectedBoxId] = useState(mysteryBoxes[0].id);
  const [isOpening, setIsOpening] = useState(false);

  const selectedBox = mysteryBoxes.find(box => box.id === selectedBoxId);
  const meanPrize = selectedBox.chances.reduce((sum, chance, i) => {
    const value = parseFloat(selectedBox.rewards[i]) || 0;
    return sum + value * chance;
  }, 0).toFixed(4);

  const handleOpenBox = async () => {
    try {
      setIsOpening(true);
      setOpenedBox(null);
      setReward(null);
      await new Promise(r => setTimeout(r, 1500));
      const result = openMysteryBox(selectedBoxId);
      setOpenedBox(result);
      setReward(result.reward);
    } catch (error) {
      alert(error.message);
    } finally {
      setIsOpening(false);
    }
  };

  return (
    <>
      <Head>
        <title>Mystery Boxes | OhMyCompetitions</title>
      </Head>
      <main className="app-background min-h-screen p-4 text-white">
        <div className="max-w-5xl mx-auto">
          <div className="competition-top-banner title-gradient mb-6 text-center">
            Mystery Boxes
          </div>

          <div className="competition-card p-6 mb-8 bg-white bg-opacity-10 rounded-2xl shadow-lg text-center">
            <div className="text-3xl text-cyan-300 mb-4 font-bold">Try Your Luck With Pi</div>
            <p className="text-white text-lg mb-2">
              Choose a box, spend a little Pi, and reveal your reward — from bonus Pi to exciting extras.
            </p>
            <p className="text-white text-sm italic mb-2">🎯 Avg reward: <span className="text-green-300 font-bold">{meanPrize} Pi</span></p>
            <p className="text-yellow-300 text-xs">Odds calculated using weighted Pi reward values</p>
          </div>

          <div className="flex justify-center gap-4 mb-8">
            {mysteryBoxes.map(box => (
              <button
                key={box.id}
                className={`px-4 py-2 rounded-full font-bold transition border ${box.id === selectedBoxId ? 'bg-white text-black' : 'bg-transparent border-white text-white'}`}
                onClick={() => setSelectedBoxId(box.id)}
              >
                {box.name}
              </button>
            ))}
          </div>

          <div className="text-center mb-8">
            <img src={selectedBox.image} alt={selectedBox.name} className="mx-auto w-32 h-32 mb-4" />
            <h3 className="text-2xl font-bold mb-2" style={{ color: selectedBox.themeColor }}>{selectedBox.name}</h3>
            <p className="text-white mb-2">Cost: {selectedBox.priceInPi} Pi</p>

            <div className="text-white text-sm mb-4">
              <div className="mb-1 font-semibold">Possible Prizes:</div>
              <ul className="space-y-1">
                {selectedBox.rewards.map((reward, i) => (
                  <li key={i}>{reward} <span className="text-xs text-gray-300">({Math.round(selectedBox.chances[i] * 100)}%)</span></li>
                ))}
              </ul>
            </div>

            <button
              className="btn-gradient px-6 py-3 mt-4 rounded-full text-lg font-bold shadow hover:scale-105 transition disabled:opacity-50"
              onClick={handleOpenBox}
              disabled={isOpening}
            >
              {isOpening ? 'Opening...' : 'Open Mystery Box'}
            </button>
          </div>

          {openedBox && (
            <div className="competition-card mt-10 p-6 bg-white bg-opacity-10 rounded-2xl shadow-lg text-center animate-pulse">
              <h2 className="text-3xl font-bold mb-4 text-cyan-300">🎉 You opened a {openedBox.name}!</h2>
              <img src={openedBox.image} alt="reward" className="mx-auto w-40 h-40 mb-4" />
              <p className="text-white text-2xl">
                You won: <span className="font-bold" style={{ color: openedBox.themeColor }}>{reward}</span>
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
