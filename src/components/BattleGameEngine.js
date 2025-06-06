"use client";
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function BattleGameEngine({ result }) {
  const [current, setCurrent] = useState(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    let timeout;
    if (step === 0) {
      timeout = setTimeout(() => setStep(1), 1000);
    } else if (step === 1) {
      // Random suspense reveal order
      const randomPlayer = Math.random() > 0.5 ? 0 : 1;
      setCurrent(result.playerResults[randomPlayer]);
      timeout = setTimeout(() => setStep(2), 2000);
    } else if (step === 2) {
      timeout = setTimeout(() => setStep(3), 2000);
    }
    return () => clearTimeout(timeout);
  }, [step, result]);

  if (step === 0) {
    return <div className="text-4xl text-center">🔥 Battle starting...</div>;
  }

  if (step === 1) {
    return (
      <motion.div className="text-5xl text-center text-yellow-400"
        initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ duration: 1 }}>
        Opening Box For: {current.username}
      </motion.div>
    );
  }

  if (step === 2) {
    return (
      <motion.div className="text-5xl text-center text-blue-400"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
        Prize: {current.prize} ({current.prizeValue} pts)
      </motion.div>
    );
  }

  return (
    <div className="text-6xl text-center text-green-400 font-bold">
      🎯 Winner: {result.winner.username} 🎯
    </div>
  );
}
