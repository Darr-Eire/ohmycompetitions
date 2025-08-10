'use client';

import React, { useState, useEffect } from 'react';
import { usePiAuth } from '../context/PiAuthContext';
import LiveActivityFeed from '../components/LiveActivityFeed';
import CodeHistory from '../components/CodeHistory';

export default function PiCashCodePage() {
  const { user, login } = usePiAuth();
  const [codeData, setCodeData] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const ticketPrice = 1.25;
  const totalPrice = (ticketPrice * quantity).toFixed(2);
  const [timeLeft, setTimeLeft] = useState(null);
  const [liveTickets, setLiveTickets] = useState(0);
  const [sdkReady, setSdkReady] = useState(false);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const skillQuestion = 'What is 7 + 5?';
  const skillAnswer = '12';
  const [userAnswer, setUserAnswer] = useState('');
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(null);

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

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://sdk.minepi.com/pi-sdk.js';
    script.onload = () => {
      window.Pi.init({ version: '2.0', sandbox: process.env.NEXT_PUBLIC_PI_SANDBOX === 'true' });
      setSdkReady(true);
    };
    document.head.appendChild(script);
  }, []);

  const validateAnswer = () => {
    const trimmed = userAnswer.trim();
    if (trimmed === skillAnswer) {
      setIsAnswerCorrect(true);
      return true;
    } else {
      setIsAnswerCorrect(false);
      return false;
    }
  };

  const openSkillModal = () => {
    if (!user) {
      alert('Please login with Pi to purchase tickets');
      return;
    }
    setUserAnswer('');
    setIsAnswerCorrect(null);
    setShowSkillModal(true);
  };

  const handlePiPayment = async () => {
    if (!validateAnswer()) return;

    if (!window?.Pi?.createPayment) {
      alert('⚠️ Pi SDK not ready. Make sure you are in the Pi Browser.');
      return;
    }

    try {
      window.Pi.createPayment(
        {
          amount: parseFloat(totalPrice),
          memo: `Pi Cash Code Entry Week ${codeData?.weekStart}`,
          metadata: {
            type: 'pi-cash-ticket',
            weekStart: codeData?.weekStart,
            quantity,
            userId: user?.uid,
            username: user?.username,
          },
        },
        {
          onReadyForServerApproval: async (paymentId) => {
            await fetch('/api/pi-cash-code/approve', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId }),
            });
          },
          onReadyForServerCompletion: async (paymentId, txid) => {
            await fetch('/api/pi-cash-code/complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                paymentId,
                txid,
                weekStart: codeData?.weekStart,
                quantity,
                userId: user?.uid,
                username: user?.username,
              }),
            });

            await fetch('/api/pi-cash-code/log-activity', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username: user?.username, quantity }),
            });

            const refreshRes = await fetch('/api/pi-cash-code');
            const refreshData = await refreshRes.json();
            setCodeData(refreshData);
            setLiveTickets(refreshData.ticketsSold || 0);
            setShowSkillModal(false);
          },
          onCancel: () => console.warn('Payment cancelled'),
          onError: (err) => {
            console.error('Payment error:', err);
            alert('Payment failed');
          },
        }
      );
    } catch (err) {
      console.error('Payment failed', err);
      alert('Payment error');
    }
  };

  const now = new Date();
  const dropTime = new Date(codeData?.dropAt);
  const showCode = now >= dropTime;

  const unlockProgress = () => {
    if (!codeData?.dropAt || !codeData?.expiresAt) return 0;
    const total = new Date(codeData.expiresAt) - new Date(codeData.dropAt);
    const elapsed = Date.now() - new Date(codeData.dropAt);
    return Math.min(100, Math.floor((elapsed / total) * 100));
  };

  const progressPercent = unlockProgress();

  return (
    <main className="min-h-screen bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white px-4 py-10 font-sans">
      <div className="max-w-3xl mx-auto backdrop-blur-md bg-white/5 border border-cyan-500 rounded-2xl shadow-lg p-6 sm:p-10 space-y-8">

        {/* HEADER & DESCRIPTION */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-cyan-300 drop-shadow-md tracking-tight">
            Pi Cash Code
          </h1>
          <p className="text-white text-sm sm:text-base font-medium max-w-xl mx-auto leading-snug">
            Have you got what it takes to <span className="text-cyan-400 font-semibold">Keep The Code Safe</span> and conquer the <span className="text-cyan-400 font-semibold">Pi Cash Code</span> prize pool?
          </p>
        </div>

        {/* CODE DISPLAY */}
        <div className="w-full text-center px-2">
          <div className="inline-block bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] border border-cyan-500 text-cyan-300 font-mono text-2xl sm:text-3xl tracking-widest px-6 py-4 rounded-lg shadow-md">
            {showCode ? codeData?.code || '0000-0000' : 'XXXX-XXXX'}
          </div>
        </div>

        {/* TIMER */}
        {timeLeft && (
          <div className="grid grid-cols-4 gap-2 justify-center text-center">
            {['days', 'hours', 'minutes', 'seconds'].map((label, i) => (
              <div key={i}>
                <div className="bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] border border-cyan-500 text-white text-xl font-bold py-2 rounded-lg shadow-inner">
                  {String(timeLeft[label]).padStart(2, '0')}
                </div>
                <p className="text-cyan-300 text-sm mt-1">{label.toUpperCase()}</p>
              </div>
            ))}
          </div>
        )}

        {/* PRIZE POOL */}
        <div className="text-center border border-cyan-400 rounded-xl py-4 px-6 bg-black/30">
          <p className="text-lg text-cyan-300 font-semibold">
            Prize Pool: <span className="text-white">{codeData?.prizePool?.toLocaleString() || '...'}</span> π
          </p>
        </div>

        {/* PROGRESS BAR */}
        <div className="mt-3 w-full h-2 bg-cyan-900 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-cyan-200 transition-all duration-700 ease-in-out motion-reduce:transition-none"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* LIVE FEED */}
        <div className="flex justify-center">
          <LiveActivityFeed />
        </div>

        {/* TICKETS SOLD */}
        <div className="text-center border border-cyan-400 rounded-xl py-4 px-6 bg-black/30">
          <p className="text-lg text-cyan-300 font-semibold">
            Tickets Sold: <span className="text-white">{liveTickets}</span>
          </p>
        </div>

        {/* QUANTITY CONTROLS */}
        <div className="flex items-center justify-center gap-6">
          <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="text-black font-bold bg-cyan-300 hover:bg-cyan-400 rounded-full px-4 py-1">−</button>
          <span className="text-2xl font-bold">{quantity}</span>
          <button onClick={() => setQuantity(q => q + 1)} className="text-black font-bold bg-cyan-300 hover:bg-cyan-400 rounded-full px-4 py-1">+</button>
        </div>
        <p className="text-center text-cyan-300 text-sm font-semibold">Total: {totalPrice} π</p>

        {/* LOGIN / PURCHASE BUTTON */}
        {!user ? (
          <button onClick={login} className="w-full py-3 rounded-lg bg-cyan-300 text-black font-bold hover:brightness-110">
            Login with Pi to Purchase
          </button>
        ) : (
          <button onClick={openSkillModal} className="w-full py-3 rounded-lg bg-gradient-to-r from-[#00ffd5] to-[#0077ff] text-black font-bold hover:brightness-110">
            Purchase {quantity} Ticket{quantity > 1 ? 's' : ''}
          </button>
        )}

<div className="bg-black/30 border border-cyan-400 rounded-2xl p-6 space-y-4">
  <h3 className="text-xl font-bold text-cyan-300 text-center">How It Works</h3>
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    {[
  '1. Secure your ticket(s) now',
      '2. Stand by for the Pi Cash Code drop',
      '3. Lock down the code and stay poised',
      '4. If selected, submit instantly to seize your prize',
    ].map((step, i) => (
      <div
        key={i}
        className="flex items-center space-x-3 p-4 bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a]
                   border border-cyan-500 rounded-lg shadow-md"
      >
        <div className="flex-none w-8 h-8 flex items-center justify-center bg-[#00ffd5] rounded-full text-black font-bold text-lg">
          {i + 1}
        </div>
        <p className="text-white font-medium">{step}</p>
      </div>
    ))}
  </div>
</div>


{/* PRIZE POOL BREAKDOWN */}

<div className="bg-black/30 border border-cyan-400 rounded-2xl p-6 max-w-md mx-auto">
  <h3 className="text-xl font-bold text-cyan-300 text-center mb-4">
    Prize Pool Breakdown
  </h3>
  <div className="flex justify-center">
    {[{ label: 'Pi Cash Code Prize', prize: '11,000 π' }].map(
      ({ label, prize }, i) => (
        <div
          key={i}
          className="flex flex-col items-center p-4 bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a]
                     border border-cyan-500 rounded-lg shadow-md"
        >
          <span className="text-cyan-300 font-mono text-sm uppercase tracking-widest">
            {label}
          </span>
          <span className="text-white font-bold text-lg mt-2">{prize}</span>
        </div>
      )
    )}
  </div>
</div>


{/* ────────────────────────────── */}
{/* ACCESSIBILITY INDICATORS */}
{/* ────────────────────────────── */}
<div className="bg-black/30 border border-cyan-400 rounded-2xl p-6">
  <div className="flex flex-wrap justify-center gap-4">
    {[
 { icon: '🎟️', label: '1.25 π To Enter' },
    { icon: '🌐', label: 'Global Draw' },
    { icon: '🗝️', label: 'Code Needed To Win' },
    ].map(({ icon, label }, i) => (
      <div
        key={i}
        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a]
                   border border-cyan-500 rounded-full shadow-sm"
      >
        <span className="text-lg">{icon}</span>
        <span className="text-white font-medium">{label}</span>
      </div>
    ))}
  </div>
</div>



        {/* CODE HISTORY */}
        <div className="flex justify-center">
          <CodeHistory />
        </div>
      </div>

      {showSkillModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white/90 rounded-lg p-6 max-w-sm w-full text-black space-y-4">
            <h2 className="text-lg font-semibold">Skill Test</h2>
            <p>{skillQuestion}</p>
            <input
              type="text"
              className="w-full border border-gray-400 rounded px-3 py-2"
              value={userAnswer}
              onChange={e => setUserAnswer(e.target.value)}
            />
            {isAnswerCorrect === false && <p className="text-red-600">Incorrect — try again!</p>}
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowSkillModal(false)} className="px-4 py-2">Cancel</button>
              <button onClick={handlePiPayment} className="px-4 py-2 bg-cyan-300 rounded text-black font-bold">
                Submit
              </button>
            </div>
          </div>
            <div className="text-center mt-4">
    <a
      href="/terms-conditions"
      target="_blank"
      rel="noopener noreferrer"
      className="text-xs text-cyan-400 underline hover:text-cyan-300"
    >
      View full Terms &amp; Conditions
    </a>
  </div>
        </div>
      )}
    </main>
  );
}
