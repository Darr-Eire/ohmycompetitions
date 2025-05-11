// pages/competition.js

import React, { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import { motion } from 'framer-motion';

const useWindowSize = () => {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateSize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return size;
};

const getNextDrawTimes = () => {
  const now = new Date();
  const mondayDraw = new Date(now);
  const fridayDraw = new Date(now);

  mondayDraw.setDate(now.getDate() + ((8 - now.getDay()) % 7));
  mondayDraw.setHours(15, 14, 0, 0);

  fridayDraw.setDate(now.getDate() + ((5 - now.getDay() + 7) % 7));
  fridayDraw.setHours(15, 14, 0, 0);

  return { mondayDraw, fridayDraw };
};

const ClaimBox = ({ targetDate }) => {
  const [won, setWon] = useState(false);
  const [code, setCode] = useState('');
  const [timeLeft, setTimeLeft] = useState('');
  const [prizeClaimed, setPrizeClaimed] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const diff = new Date(targetDate) - now;

      if (diff > 0) {
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeLeft(
          `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
        );
      } else {
        clearInterval(interval);
        setTimeLeft('00:00:00');
        setPrizeClaimed(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  const handleClaimPrize = () => {
    if (code === 'correct-code') {
      setWon(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    } else {
      alert('Incorrect code! Please try again.');
    }
  };

  return (
    <section className="text-center py-12 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 rounded-2xl shadow-2xl border-4 border-blue-200">
      {showConfetti && <Confetti width={width} height={height} />}
      {won ? (
        <>
          <motion.h2 className="text-5xl mb-4 text-white font-extrabold">
            🎉 YOU’VE WON THE PI CASH CODE!
          </motion.h2>
          <p className="text-lg text-gray-200">⏱️ {timeLeft} left to claim</p>
        </>
      ) : prizeClaimed ? (
        <div className="text-gray-500 italic">❌ Time's up! The prize has rolled over to next week!</div>
      ) : (
        <>
          <h3 className="text-3xl font-bold text-white mb-4">🎯 Claim the Prize Now</h3>
          <input
            type="text"
            placeholder="Enter your Pi Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="bg-black text-white border border-gray-500 px-4 py-2 rounded-md"
          />
          <p className="mt-2 text-gray-300">⏱️ {timeLeft} left</p>
          <button
            onClick={handleClaimPrize}
            className="mt-6 px-10 py-4 bg-gradient-to-r from-yellow-300 via-orange-500 to-red-600 text-black font-extrabold rounded-2xl shadow-xl hover:scale-110 hover:shadow-yellow-500 transition-all duration-300 tracking-wide uppercase border-2 border-white"
          >
            🔐 Unlock Pi Vault
          </button>
        </>
      )}
    </section>
  );
};

const CompetitionCard = ({ jackpotAmount, nextDraw }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [ticketCount, setTicketCount] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const diff = new Date(nextDraw) - now;

      if (diff > 0) {
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeLeft(
          `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
        );
      } else {
        clearInterval(interval);
        setTimeLeft('00:00:00');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [nextDraw]);

  const handleBuyTickets = () => {
    if (ticketCount < 1) return alert('You must buy at least one ticket.');
    const total = ticketCount * 10;
    alert(`You are purchasing ${ticketCount} ticket${ticketCount > 1 ? 's' : ''} for ${total} π`);
    // TODO: Integrate Pi Network payment logic here
  };

  return (
    <div className="relative bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 backdrop-blur-md p-8 rounded-xl shadow-xl border border-gray-700 max-w-lg mx-auto">
      <h2 className="text-6xl font-extrabold mb-4 bg-gradient-to-r from-yellow-300 via-red-500 to-pink-600 text-white bg-clip-text drop-shadow-[0_0_20px_rgba(255,255,255,0.7)] animate-pulse">
        Pi Cash Code
      </h2>
      <p className="text-lg mb-6 text-center text-white">
        🚨 The next draw is just around the corner! Get ready to claim your chance at winning the biggest Pi Cash jackpot ever.
      </p>
      <div className="mt-6 text-center text-white text-sm">
        <h4 className="text-xl mb-2 text-white">Prize Pool:</h4>
        <motion.p
          className="text-6xl bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white bg-clip-text font-extrabold drop-shadow-lg"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          {`${jackpotAmount} π`}
        </motion.p>
        <p className="text-sm text-white mt-2 font-semibold">
          Doubles if not claimed within 31 minutes and rolls over to next week's draw!
        </p>
      </div>
      <motion.div
        className="text-6xl font-bold text-white mb-4"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1 }}
      >
        {timeLeft}
      </motion.div>
      <div className="mt-6 text-left text-white text-lg">
        <h4 className="text-lg font-bold">How to Participate:</h4>
        <ul className="list-disc pl-5 mt-2">
          <li><strong>Monday 3:14 PM</strong>: Pi Code drop,which must be remembered and kept safe, will be then removed from all s</li>
          <li><strong>Friday 3:14 PM</strong>: Winner chosen</li>
          <li><strong>31:04 minutes</strong> to claim or prize rolls over</li>
          <li>+ <strong>20%</strong> from unclaimed ticket pool</li>
          <li><strong>More Tickets, Bigger Jackpot!</strong></li>
          <li><strong>Pi Code Entry:</strong> Enter it after the drop to qualify</li>
          <li><strong>Claim Window:</strong> 31:04 minutes once winner is chosen</li>
          <li><strong>Weekly Growth:</strong> Pool grows from rollovers and ticket sales</li>
          <li><strong>Ticket Cost:</strong> <strong>10 π</strong> each</li>
        </ul>

        <div className="mt-6">
          <h4 className="text-lg font-bold text-yellow-400 mb-2">🎟️ Buy Tickets</h4>
          <div className="flex items-center gap-4">
            <input
              type="number"
              min="1"
              value={ticketCount}
              onChange={(e) => setTicketCount(Number(e.target.value))}
              className="w-24 bg-black text-white border border-gray-600 rounded px-3 py-2"
            />
            <button
              onClick={handleBuyTickets}
              className="px-6 py-2 bg-gradient-to-r from-green-400 to-blue-500 rounded text-black font-bold hover:scale-105 transition-transform border border-white"
            >
              Buy {ticketCount} Ticket{ticketCount > 1 ? 's' : ''} for {ticketCount * 10} π
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 text-gray-400 text-xs italic">
        *Disclaimer: Participation is open to all users, but some restrictions may apply based on local laws.
      </div>
    </div>
  );
};

const CompetitionPage = () => {
  const { mondayDraw, fridayDraw } = getNextDrawTimes();
  const [jackpotAmount, setJackpotAmount] = useState(50000);

  useEffect(() => {
    const interval = setInterval(() => {
      if (new Date() > fridayDraw) {
        setJackpotAmount((prev) => prev + 1000);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [fridayDraw]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-800 text-white font-sans flex flex-col items-center justify-center px-4 py-10">
      <div className="max-w-4xl w-full space-y-10 text-center">
        <CompetitionCard jackpotAmount={jackpotAmount} nextDraw={mondayDraw} />
        <ClaimBox targetDate={fridayDraw} />
      </div>
    </div>
  );
};

export default CompetitionPage;
