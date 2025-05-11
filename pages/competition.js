import React, { useState, useEffect } from 'react';
import Countdown from 'react-countdown';

// Helper function to calculate the next Monday and Friday draw times
const getNextDrawTimes = () => {
  const now = new Date();
  const mondayDraw = new Date(now);
  const fridayDraw = new Date(now);

  // Set the next Monday at 3:14 PM
  mondayDraw.setDate(now.getDate() + ((7 - now.getDay()) % 7)); // Next Monday
  mondayDraw.setHours(15, 14, 0, 0); // 3:14 PM

  // Set the next Friday at 3:14 PM
  fridayDraw.setDate(now.getDate() + ((5 - now.getDay()) + 7) % 7); // Next Friday
  fridayDraw.setHours(15, 14, 0, 0); // 3:14 PM

  return { mondayDraw, fridayDraw };
};

// ClaimBox Component
const ClaimBox = ({ targetDate }) => {
  const [won, setWon] = useState(false);
  const [code, setCode] = useState('');
  const [timeLeft, setTimeLeft] = useState('');
  const [prizeClaimed, setPrizeClaimed] = useState(false);

  useEffect(() => {
    const countdownInterval = setInterval(() => {
      const now = new Date();
      const diff = new Date(targetDate) - now;

      if (diff > 0) {
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeLeft(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
      } else {
        clearInterval(countdownInterval);
        setTimeLeft('00:00:00');
        setPrizeClaimed(true);
      }
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [targetDate]);

  const handleClaimPrize = () => {
    if (code === 'correct-code') {
      setWon(true);
    } else {
      alert('Incorrect code! Please try again.');
    }
  };

  return (
    <section className="text-center py-12 border-b border-gray-700">
      {won ? (
        <>
          <h2 className="text-4xl mb-4 text-green-400 animate__animated animate__fadeIn">🎉 YOU’VE WON THE PI CASH CODE!</h2>
          <input
            type="text"
            placeholder="Enter your code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="bg-black text-white border border-gray-500 px-4 py-2 text-lg rounded-md"
          />
          <p className="mt-2 text-lg text-gray-400 animate__animated animate__fadeIn">⏱️ {timeLeft} left to claim your prize</p>
          <button
            onClick={handleClaimPrize}
            className="mt-4 px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg transform transition-all hover:scale-105"
          >
            ✅ Unlock Pi Vault
          </button>
        </>
      ) : prizeClaimed ? (
        <div className="text-gray-500 italic animate__animated animate__fadeIn">❌ Time's up! The prize has rolled over to next week!</div>
      ) : (
        <div className="text-gray-500 italic animate__animated animate__fadeIn">WAITING FOR NEXT DROP…</div>
      )}
    </section>
  );
};

// JackpotSection Component
const JackpotSection = ({ jackpotAmount }) => (
  <section className="text-center py-12 border-b border-gray-700 bg-gradient-to-r from-yellow-400 to-red-600 text-white shadow-lg">
    <h3 className="text-4xl font-bold mb-4"> CURRENT JACKPOT</h3>
    <div className="text-5xl font-bold text-yellow-100">{`$${jackpotAmount}`}</div>
    <div className="mt-2 text-xl text-gray-100">💰 + 🔁 20% Rollover ticket Pool</div>
  </section>
);

// CompetitionCard Component
const CompetitionCard = ({ jackpotAmount, nextDraw }) => (
  <div className="bg-gradient-to-r from-gray-800 via-black to-gray-700 text-white p-8 rounded-xl shadow-xl border border-gray-700 animate__animated animate__fadeInUp max-w-lg mx-auto">
    <h2 className="text-4xl font-extrabold mb-4 text-center text-yellow-400">
      Pi Cash Code Competition – The Biggest Weekly Pi Drop!
    </h2>
    <p className="text-lg mb-4 text-center text-gray-300">
      Every week, a lucky winner has the chance to claim a cash prize by unlocking the Pi Code. Make sure to tune in every Monday and Friday for your chance to win big!
    </p>

    <div className="mb-6">
      <h3 className="text-2xl text-yellow-400">Time Left Until Next Code</h3>
      <Countdown
        date={nextDraw}
        renderer={({ hours, minutes, seconds }) => (
          <div className="text-6xl font-bold text-white">
            {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
        )}
      />
    </div>

    <div className="bg-gray-800 p-6 rounded-lg border border-gray-600 shadow-md">
      <h4 className="text-xl mb-2 text-yellow-300"> Prize Pool:</h4>
      <p className="text-4xl text-yellow-400">{`$${jackpotAmount}`}</p>
      <p className="text-sm text-gray-400 mt-2"><strong>Prize will double if not claimed within 31 minutes and 4 seconds and will roll over to next week's draw!!</strong></p>
    </div>

    <div className="mt-8 text-gray-300 text-sm">
      <h4 className="font-bold text-lg"> How to Participate:</h4>
      <ul className="list-disc pl-5 mt-2">
        <li><strong> Every Monday at 3:14 PM, a new Pi Code will be revealed!</strong></li>
        <li><strong> Every Friday at 3:14 PM, a lucky winner is drawn to enter the Pi Code!</strong></li>
        <li><strong> The winner has exactly 31 minutes and 4 seconds to claim their prize!</strong></li>
        <li><strong> If the winner doesn't claim the prize, the jackpot rolls over to next week!</strong></li>
        <li><strong> 20% of all losing ticket values will be added to next week's jackpot!</strong></li>
      </ul>
    </div>
  </div>
);

// CompetitionPage Component
const CompetitionPage = () => {
  const { mondayDraw, fridayDraw } = getNextDrawTimes(); // Get the next Monday and Friday draw times
  const [jackpotAmount, setJackpotAmount] = useState(5000); // Set initial jackpot amount

  useEffect(() => {
    const interval = setInterval(() => {
      if (new Date() > fridayDraw) {
        // If the current time is after Friday's 3:14 PM, rollover prize logic
        setJackpotAmount(jackpotAmount + 1000); // Example of adding 1000 (could be 20% of pool)
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [fridayDraw, jackpotAmount]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-800 text-white font-mono flex flex-col items-center justify-center">
      <div className="max-w-4xl w-full">
        <CompetitionCard jackpotAmount={jackpotAmount} nextDraw={mondayDraw} />
      </div>

      <ClaimBox targetDate={fridayDraw} />
      <JackpotSection jackpotAmount={jackpotAmount} />
    </div>
  );
};

export default CompetitionPage;
