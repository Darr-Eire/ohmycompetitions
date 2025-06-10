'use client';

import React, { useState, useEffect } from 'react';
import { usePiAuth } from '../context/PiAuthContext';
import GhostWinnerLog from '../components/GhostWinnerLog';
import ClaimedWinnersLog from '../components/ClaimedWinnersLog';


export default function PiCashCodePage() {
  const { user, login, loading: userLoading } = usePiAuth();
  const [codeData, setCodeData] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const ticketPrice = 1.25;
  const totalPrice = (ticketPrice * quantity).toFixed(2);
  const [timeLeft, setTimeLeft] = useState(null);
  const [liveTickets, setLiveTickets] = useState(0);

  // Fetch code data
  useEffect(() => {
    const fetchCode = async () => {
      try {
        const res = await fetch('/api/pi-cash-code');
        const data = await res.json();
        setCodeData(data);
        setLiveTickets(data.ticketsSold || 0);
      } catch (err) {
        console.error('Failed to fetch PiCash data:', err);
      }
    };
    fetchCode();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!codeData?.expiresAt) return;

    const targetTime = new Date(codeData.expiresAt).getTime();

    const updateTimeLeft = () => {
      const now = Date.now();
      const diff = targetTime - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };

    updateTimeLeft();
    const intervalId = setInterval(updateTimeLeft, 1000);
    return () => clearInterval(intervalId);
  }, [codeData?.expiresAt]);

  // Load Pi SDK
  useEffect(() => {
    loadPiSdk(() => {});
  }, []);

  const handlePurchase = async () => {
    const res = await fetch('/api/pi-cash-code-purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weekStart: codeData.weekStart, quantity }),
    });

    const result = await res.json();
    setLiveTickets(result.ticketsSold);
  };

  const now = new Date();
  const dropTime = new Date(codeData?.dropAt);
  const showCode = now >= dropTime;

  if (userLoading) return <div className="text-white text-center py-10">Loading...</div>;

  if (!user) {
    return (
      <div className="p-6 text-center text-white">
        <p className="mb-4">🔐 Please log in with Pi to access this page.</p>
        <button onClick={login} className="btn-gradient px-6 py-3 rounded-full font-bold">
          Log In
        </button>
      </div>
    );
  }

  return (
    <main className="flex justify-center items-start min-h-screen bg-transparent font-orbitron pt-6">
      <div className="backdrop-blur-lg border border-cyan-400 neon-outline text-white p-6 sm:p-8 rounded-2xl text-center space-y-6 shadow-[0_0_40px_#00ffd5aa] max-w-3xl w-full mx-auto mt-6 relative overflow-hidden">
        <h1 className="text-3xl sm:text-4xl font-bold text-cyan-300 animate-glow-float">Pi Cash Code</h1>

        <div className="bg-[#101426] border-2 border-cyan-400 rounded-xl px-6 py-3 text-2xl font-mono text-cyan-300 tracking-widest shadow-[0_0_20px_#00ffd5aa]">
          {showCode ? (codeData?.code || '????-????') : 'Code drops soon 🔒'}
        </div>

        <div className="bg-black border border-cyan-400 text-cyan-300 text-lg font-bold px-4 py-2 rounded-lg shadow-[0_0_15px_#00f0ff88]">
          Current Prize Pool: {codeData?.prizePool?.toLocaleString() || 'Loading...'} π
        </div>

        <div className="bg-black text-cyan-400 font-semibold mt-2 rounded-lg py-2">
          Tickets Sold: {liveTickets}
        </div>

        {timeLeft && (
          <div className="mt-6 flex gap-2 justify-center">
            {['days', 'hours', 'minutes', 'seconds'].map((label, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="bg-black text-white text-xl font-bold px-4 py-2 rounded-md shadow w-16 text-center">
                  {String(timeLeft[label]).padStart(2, '0')}
                </div>
                <div className="mt-1 text-xs text-cyan-400 font-semibold tracking-wide">{label.toUpperCase()}</div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-center gap-4 mt-6">
          <button onClick={() => setQuantity((prev) => Math.max(1, prev - 1))} className="bg-cyan-500 text-black font-bold px-4 py-1 rounded-full hover:brightness-110">−</button>
          <span className="text-2xl font-bold">{quantity}</span>
          <button onClick={() => setQuantity((prev) => prev + 1)} className="bg-cyan-500 text-black font-bold px-4 py-1 rounded-full hover:brightness-110">+</button>
        </div>

        <p className="text-cyan-300 mt-2 font-semibold text-sm">Total: {totalPrice} π</p>

        <button
          onClick={handlePurchase}
          className="w-full mt-4 py-3 bg-gradient-to-r from-[#00ffd5] to-[#0077ff] text-black font-bold rounded-lg"
        >
          Purchase {quantity} Ticket(s)
        </button>

        <section className="mt-8 text-center">
          <h2 className="text-1xl font-semi-bold text-black mb-2">How It Works</h2>
          <div className="inline-block text-left">
            <ul className="list-disc list-inside text-white/90 space-y-2 text-sm sm:text-base">
              <li>The code drops every Monday at <strong>3:14 PM UTC</strong>.</li>
              <li>It remains active for <strong>31 hours and 4 minutes</strong>.</li>
              <li>Friday draw at <strong>3:14 PM UTC</strong>.</li>
              <li>The winner must return the code within <strong>31 minutes and 4 seconds</strong>.</li>
            </ul>
            <div className="text-center mt-3">
              <a href="/terms" className="text-xs text-cyan-400 underline hover:text-cyan-300 transition">
                View full Terms & Conditions
              </a>
            </div>
          </div>
        </section>

        <section className="mt-10 space-y-6">
          <div className="bg-[#0b1120] bg-opacity-50 backdrop-blur-md border border-cyan-400 rounded-xl p-4 shadow-[0_0_20px_#00ffd5aa]">
            <h2 className="text-xl font-bold text-cyan-300 mb-2">👻 Ghost Winner Log</h2>
            <GhostWinnerLog />
          </div>

          <div className="bg-[#0b1120] bg-opacity-50 backdrop-blur-md border border-green-400 rounded-xl p-4 shadow-[0_0_20px_#00ffbf88]">
            <h2 className="text-xl font-bold text-green-300 mb-2">🏅 Claimed Winners</h2>
            <ClaimedWinnersLog />
          </div>
        </section>
      </div>
    </main>
  );
}
