"use client";
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PvPBattleEngine({ result }) {
  const [health, setHealth] = useState({ player1: 100, player2: 100 });
  const [log, setLog] = useState([]);
  const [phase, setPhase] = useState('countdown');
  const [winner, setWinner] = useState(null);
  const [damage, setDamage] = useState(null);

  const p1 = result.playerResults[0];
  const p2 = result.playerResults[1];

  // Countdown phase before battle
  const [countdown, setCountdown] = useState(3);
  useEffect(() => {
    if (phase !== 'countdown') return;

    if (countdown > 0) {
      setTimeout(() => setCountdown(countdown - 1), 1000);
    } else {
      setPhase('battle');
    }
  }, [countdown, phase]);

  useEffect(() => {
    if (phase === 'battle') runBattle();
  }, [phase]);

  const runBattle = () => {
    let p1Health = 100;
    let p2Health = 100;
    const rounds = [];

    while (p1Health > 0 && p2Health > 0) {
      const p1Hit = randomDamage();
      const p2Hit = randomDamage();

      p2Health -= p1Hit;
      if (p2Health < 0) p2Health = 0;
      rounds.push({ attacker: p1.username, defender: p2.username, dmg: p1Hit });

      if (p2Health <= 0) break;

      p1Health -= p2Hit;
      if (p1Health < 0) p1Health = 0;
      rounds.push({ attacker: p2.username, defender: p1.username, dmg: p2Hit });
    }

    animateBattle(rounds);
  };

  const randomDamage = () => {
    const base = Math.floor(Math.random() * 15) + 10;
    return Math.random() < 0.2 ? base * 2 : base; // 20% chance critical hit
  };

  const animateBattle = (rounds) => {
    let i = 0;

    const interval = setInterval(() => {
      const action = rounds[i];
      setLog(prev => [...prev, `${action.attacker} hits ${action.defender} for ${action.dmg} dmg`]);
      setDamage(action);

      if (action.defender === p2.username) {
        setHealth(prev => ({ ...prev, player2: Math.max(0, prev.player2 - action.dmg) }));
      } else {
        setHealth(prev => ({ ...prev, player1: Math.max(0, prev.player1 - action.dmg) }));
      }

      i++;

      if (i >= rounds.length) {
        clearInterval(interval);
        setTimeout(() => {
          setWinner(result.winner.username);
          setPhase('end');
        }, 1000);
      }
    }, 900);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#020617] text-white p-8 font-orbitron flex flex-col items-center justify-center">
      <h1 className="text-5xl mb-10 text-cyan-400 drop-shadow-lg">⚔️ Battle Arena</h1>

      {phase === 'countdown' && (
        <div className="text-7xl font-bold mb-10 animate-pulse">{countdown > 0 ? countdown : 'FIGHT!'}</div>
      )}

      <div className="flex w-full justify-around mb-10 items-center relative">

        {/* Player 1 */}
        <div className="w-1/3 flex flex-col items-center">
          <div className="w-32 h-32 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mb-4 shadow-xl border-4 border-white" />
          <p className="text-2xl">{p1.username}</p>

          <div className="w-full bg-gray-700 rounded-lg mt-3">
            <motion.div
              className="bg-green-400 h-6 rounded-lg"
              animate={{ width: `${health.player1}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Fight Icon */}
        <div className="text-6xl">⚔️</div>

        {/* Player 2 */}
        <div className="w-1/3 flex flex-col items-center">
          <div className="w-32 h-32 bg-gradient-to-r from-yellow-400 to-red-500 rounded-full mb-4 shadow-xl border-4 border-white" />
          <p className="text-2xl">{p2.username}</p>

          <div className="w-full bg-gray-700 rounded-lg mt-3">
            <motion.div
              className="bg-green-400 h-6 rounded-lg"
              animate={{ width: `${health.player2}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Damage Numbers */}
        <AnimatePresence>
          {damage && (
            <motion.div
              key={Math.random()}
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 0, y: -50 }}
              exit={{ opacity: 0 }}
              className="absolute text-5xl font-bold text-red-400"
            >
              -{damage.dmg}
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Combat Log */}
      <div className="h-48 overflow-y-auto mb-10 border-t border-cyan-500 pt-4 w-full max-w-xl text-center">
        {log.map((entry, idx) => (
          <p key={idx} className="text-lg">{entry}</p>
        ))}
      </div>

      {phase === 'end' && (
        <div className="text-6xl font-bold text-green-400 mt-6">
          🎯 Winner: {winner} 🎯
        </div>
      )}
    </div>
  );
}
