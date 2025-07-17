'use client';

import React, { useState, useEffect } from 'react';
import GhostWinnerLog from '../components/GhostWinnerLog';
import ClaimedWinnersLog from '../components/ClaimedWinnersLog';
import { usePiAuth } from '../context/PiAuthContext';

export default function PiCashCodePage() {
  const { user, login } = usePiAuth();
  const [codeData, setCodeData] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const ticketPrice = 1.25;
  const totalPrice = (ticketPrice * quantity).toFixed(2);
  const [timeLeft, setTimeLeft] = useState(null);
  const [liveTickets, setLiveTickets] = useState(0);
  const [sdkReady, setSdkReady] = useState(false);

  // Modal state
  const [showSkillModal, setShowSkillModal] = useState(false);

  // Skill question and answer
  const skillQuestion = "What is 7 + 5?";
  const skillAnswer = "12";
  const [userAnswer, setUserAnswer] = useState('');
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(null); // null = not answered yet

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

  const closeSkillModal = () => {
    setShowSkillModal(false);
  };

  const handlePiPayment = async () => {
    if (!validateAnswer()) return;

    if (typeof window === 'undefined' || !window.Pi || typeof window.Pi.createPayment !== 'function') {
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
            username: user?.username
          },
        },
        {
          onReadyForServerApproval: async (paymentId) => {
            try {
              const res = await fetch('/api/pi-cash-code/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentId }),
              });
              if (!res.ok) throw new Error(await res.text());
              console.log('[✅] Payment approved');
            } catch (err) {
              console.error('[ERROR] Server approval failed:', err);
              alert('❌ Server approval failed.');
            }
          },

          onReadyForServerCompletion: async (paymentId, txid) => {
            try {
              const res = await fetch('/api/pi-cash-code/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  paymentId, 
                  txid, 
                  weekStart: codeData?.weekStart,
                  quantity,
                  userId: user?.uid,
                  username: user?.username
                }),
              });
              if (!res.ok) throw new Error(await res.text());
              const data = await res.json();
              alert(`✅ Ticket purchased! 🎟️ ID: ${data.ticketId}`);
              setShowSkillModal(false);
              
              // Refresh the code data to update ticket count
              const refreshRes = await fetch('/api/pi-cash-code');
              const refreshData = await refreshRes.json();
              setCodeData(refreshData);
              setLiveTickets(refreshData.ticketsSold || 0);
            } catch (err) {
              console.error('[ERROR] Completing payment:', err);
              alert('❌ Server completion failed.');
            }
          },

          onCancel: () => {
            console.warn('Payment cancelled');
          },

          onError: (err) => {
            console.error('Payment error:', err);
            alert('Payment failed');
          }
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

  return (
    <>
      <main className="flex justify-center items-start min-h-screen bg-transparent font-orbitron pt-6">
        <div className="backdrop-blur-lg border border-cyan-400 neon-outline text-white p-6 sm:p-8 rounded-2xl text-center space-y-6 shadow-[0_0_40px_#00ffd5aa] max-w-3xl w-full mx-auto mt-6 relative overflow-hidden">
          <h1 className="text-3xl sm:text-4xl font-bold text-cyan-300 animate-glow-float">Pi Cash Code</h1>

          <div className="bg-[#101426] border-2 border-cyan-400 rounded-xl px-6 py-3 text-2xl font-mono text-cyan-300 tracking-widest shadow-[0_0_20px_#00ffd5aa]">
            {showCode ? (codeData?.code || '????-????') : 'Code Drops Soon 🔒'}
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
            <button
              onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
              className="bg-cyan-500 text-black font-bold px-4 py-1 rounded-full hover:brightness-110"
            >
              −
            </button>
            <span className="text-2xl font-bold">{quantity}</span>
            <button
              onClick={() => setQuantity((prev) => prev + 1)}
              className="bg-cyan-500 text-black font-bold px-4 py-1 rounded-full hover:brightness-110"
            >
              +
            </button>
          </div>

          <p className="text-cyan-300 mt-2 font-semibold text-sm">Total: {totalPrice} π</p>

          {!user ? (
            <button
              onClick={login}
              className="w-full mt-4 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold rounded-lg"
            >
              Login with Pi to Purchase
            </button>
          ) : (
            <button
              onClick={openSkillModal}
              className="w-full mt-4 py-3 bg-gradient-to-r from-[#00ffd5] to-[#0077ff] text-black font-bold rounded-lg"
            >
              Purchase {quantity} Ticket(s)
            </button>
          )}

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
                <a href="/terms-conditions" className="text-xs text-cyan-400 underline hover:text-cyan-300 transition">
                  View full Terms & Conditions
                </a>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Skill Question Modal */}
      {showSkillModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f172a] border border-cyan-400 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-cyan-300 mb-4">Skill Question</h3>
            <p className="text-white mb-4">Answer correctly to proceed with purchase:</p>
            <p className="text-cyan-300 font-bold mb-4">{skillQuestion}</p>
            
            <input
              type="text"
              value={userAnswer}
            onChange={(e) => {
  const value = e.target.value;
  setUserAnswer(value);
  if (value.trim() === skillAnswer) {
    setIsAnswerCorrect(true);
  } else {
    setIsAnswerCorrect(false);
  }
}}

              className="w-full px-4 py-2 bg-black border border-cyan-400 rounded text-white mb-4"
              placeholder="Enter your answer"
            />
            
            {isAnswerCorrect === false && (
              <p className="text-red-400 text-sm mb-4">Incorrect answer. Please try again.</p>
            )}
            
            {isAnswerCorrect === true && (
              <p className="text-cyan-300 text-sm mb-4">✅ Correct! Proceeding to payment...</p>
            )}

            <div className="flex justify-end gap-4">
              <button
                onClick={closeSkillModal}
                className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handlePiPayment}
                disabled={isAnswerCorrect !== true}
                className={`px-4 py-2 rounded-lg text-black font-bold transition ${
                  isAnswerCorrect === true
                    ? 'bg-gradient-to-r from-[#00ffd5] to-[#0077ff] hover:brightness-110'
                    : 'bg-gray-500 cursor-not-allowed'
                }`}
              >
                Confirm Purchase
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
