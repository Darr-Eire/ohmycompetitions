'use client';

import { useState } from 'react';
import Link from 'next/link';

const BATTLE_MODES = [
  {
    id: '1v1',
    title: '⚔️ 1v1 Duel',
    desc: 'No teammates. No excuses. Just you, your reflexes, and the glory. Only one walks away a winner.',
    players: '2 players',
    color: 'from-pink-500 to-red-500',
  },
  {
    id: '2v2',
    title: '🧠 2v2 Teams',
    desc: 'Pair up with a fellow Pioneer. Outsmart, outplay, and outlast the opposition in perfect sync.',
    players: '4 players',
    color: 'from-blue-500 to-purple-500',
  },
  {
    id: '5v5',
    title: '🎯 5v5 Clash',
    desc: 'Five pioneers. Five opponents. Team up, strategize, and dominate the arena for ultimate Pi glory.',
    players: '10 players',
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 'royale',
    title: '🔥 Pi Royale',
    desc: '10 enter, 1 walks away. Earn bragging rights, climb the leaderboard, and be crowned Pioneer of the Week.',
    players: '10 players',
    color: 'from-yellow-500 to-orange-500',
  },
];

export default function PiBattlesLobbyPage() {
  const correctAnswer = '9'; // Skill question answer
  const [skillAnswer, setSkillAnswer] = useState('');
  const isCorrect = skillAnswer.trim() === correctAnswer;

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] px-4 py-10 text-white font-orbitron">

      {/* Coming Soon Banner */}
      <div className="bg-gradient-to-r from-[#0f172a]/70 via-[#1e293b]/70 to-[#0f172a]/70 border border-cyan-400 p-4 text-center text-white font-semibold text-xl rounded-md shadow-lg mb-8">
        🚨 Pi Battles Are Coming Soon 🚨
        <p className="text-sm mt-2">💥 Stay tuned for updates and be ready for explosive fun 💥</p>
      </div>

      <div className="max-w-3xl mx-auto">

        {/* Skill Question */}
        <div className="mb-6 max-w-md mx-auto">
          <label htmlFor="skill-question" className="block mb-2 font-semibold text-cyan-300">
            Skill Question (required):
          </label>
          <p className="mb-2 text-white">What is 6 + 3?</p>
          <input
            id="skill-question"
            type="text"
            value={skillAnswer}
            onChange={e => setSkillAnswer(e.target.value)}
            placeholder="Enter your answer"
            className="w-full px-4 py-2 rounded-lg bg-white/10 border border-cyan-500 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
          {skillAnswer && !isCorrect && (
            <p className="mt-1 text-red-500 text-sm">Incorrect answer. You must answer correctly to proceed.</p>
          )}
        </div>

        {/* Instructions */}
        <p className="text-white mt-2 text-center">
          Choose your game mode, join live matches, or check past victories.
        </p>

        {/* Battle Modes */}
        <section className="mb-10">
          <h2 className="text-center text-white font-bold text-lg mb-4 px-4 py-3 rounded-xl shadow-[0_0_30px_#00fff055] bg-gradient-to-r from-[#0f172a]/70 via-[#1e293b]/70 to-[#0f172a]/70 border border-cyan-400">
            Select a Pi Bomb Game Format
          </h2>

          <div className="space-y-4">
            {BATTLE_MODES.map(mode => (
              <Link
                key={mode.id}
                href={isCorrect ? `/battles/lobby/${mode.id}` : '#'}
                className={`block ${isCorrect ? 'cursor-pointer' : 'cursor-not-allowed pointer-events-none opacity-60'}`}
                aria-disabled={!isCorrect}
                onClick={e => {
                  if (!isCorrect) e.preventDefault();
                }}
              >
                <div
                  className={`p-5 rounded-2xl shadow-[0_0_20px_#00fff055] bg-gradient-to-r ${mode.color} border border-cyan-400 text-center`}
                >
                  <h3 className="text-xl font-bold text-white mb-1">{mode.title}</h3>
                  <p className="text-sm text-white/90 mb-1">{mode.desc}</p>
                  <p className="text-xs text-white/70">{mode.players}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Footer Links */}
        <div className="text-center mt-4">
          <Link href="/terms-conditions" className="text-xs text-cyan-400 underline hover:text-cyan-300">
            View full Terms & Conditions
          </Link>
        </div>
      </div>
    </main>
  );
}
