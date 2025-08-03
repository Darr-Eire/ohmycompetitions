'use client';

import React, { useState, useEffect } from 'react';
import GhostWinnerLog from '../components/GhostWinnerLog';
import ClaimedWinnersLog from '../components/ClaimedWinnersLog';
import { usePiAuth } from '../context/PiAuthContext';
import CryptoCodeReveal from '../components/CryptoCodeReveal';
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
            username: user?.username,
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
                  username: user?.username,
                }),
              });

              if (!res.ok) throw new Error(await res.text());
              const data = await res.json();
              alert(`✅ Ticket purchased! 🎟️ ID: ${data.ticketId}`);
              setShowSkillModal(false);

              // ✅ Log to live activity feed
              await fetch('/api/pi-cash-code/log-activity', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: user?.username, quantity }),
              });

              // Refresh data
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
    const now = Date.now();
    const elapsed = now - new Date(codeData.dropAt);
    return Math.min(100, Math.floor((elapsed / total) * 100));
  };

  const progressPercent = unlockProgress();

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-[#0c1f27] to-black text-white px-4 py-10 font-sans">
      <div className="max-w-3xl mx-auto backdrop-blur-md bg-white/5 border border-cyan-500 rounded-2xl shadow-lg p-6 sm:p-10 space-y-8">

        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold text-cyan-300 drop-shadow-md tracking-tight">
            Pi Cash Code
          </h1>
          <p className="text-white text-sm sm:text-base font-medium max-w-xl mx-auto leading-snug">
            Have you got what it takes to <span className="text-cyan-400 font-semibold">Keep The Code Safe</span> and conquer the <span className="text-cyan-400 font-semibold">Pi Cash Code</span> prize pool?
          </p>
        </div>

        <div className="text-center border border-cyan-400 rounded-xl py-4 px-6 bg-black/30">
          <p className="text-lg text-cyan-300 font-semibold">
            Prize Pool: <span className="text-white">{codeData?.prizePool?.toLocaleString() || '...'}</span> π
          </p>
        </div>

        <CryptoCodeReveal code={codeData?.code || '????-????'} isRevealed={showCode} />
        <div className="mt-2 w-full h-2 bg-cyan-900 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-cyan-400 to-cyan-200 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
        </div>

        <div className="text-center border border-cyan-400 rounded-xl py-4 px-6 bg-black/30">
          <p className="text-lg text-cyan-300 font-semibold">
            Tickets Sold: <span className="text-white">{liveTickets}</span>
          </p>
        </div>

      <div className="flex justify-center">
  <LiveActivityFeed />
</div>


        {timeLeft && (
          <div className="grid grid-cols-4 gap-2 justify-center text-center">
            {['days', 'hours', 'minutes', 'seconds'].map((label, i) => (
              <div key={i}>
                <div className="bg-black border border-cyan-500 text-white text-xl font-bold py-2 rounded-lg shadow-inner">
                  {String(timeLeft[label]).padStart(2, '0')}
                </div>
                <p className="text-cyan-300 text-sm mt-1">{label.toUpperCase()}</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-center gap-6">
          <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="text-black font-bold bg-cyan-300 hover:bg-cyan-400 rounded-full px-4 py-1">−</button>
          <span className="text-2xl font-bold">{quantity}</span>
          <button onClick={() => setQuantity((q) => q + 1)} className="text-black font-bold bg-cyan-300 hover:bg-cyan-400 rounded-full px-4 py-1">+</button>
        </div>

        <p className="text-center text-cyan-300 text-sm font-semibold">Total: {totalPrice} π</p>

        {!user ? (
          <button onClick={login} className="w-full py-3 rounded-lg bg-cyan-300 text-black font-bold hover:brightness-110">
            Login with Pi to Purchase
          </button>
        ) : (
          <button onClick={openSkillModal} className="w-full py-3 rounded-lg bg-gradient-to-r from-[#00ffd5] to-[#0077ff] text-black font-bold hover:brightness-110">
            Purchase {quantity} Ticket{quantity > 1 ? 's' : ''}
          </button>
        )}

        <section className="text-sm text-white/90 text-center space-y-2 mt-8">
          <p>🕒 Code drops every <strong>Monday at 3:14 PM UTC</strong>.</p>
          <p>⏳ Active for <strong>31h 4m</strong>, draw on <strong>Friday 3:14 PM UTC</strong>.</p>
          <p>🏆 Winners must return code in <strong>31m 4s</strong>.</p>
          <a href="/terms-conditions" className="block mt-3 text-xs text-cyan-400 underline hover:text-cyan-300">
            View full Terms & Conditions
          </a>
        </section>
 <div className="flex justify-center">
        <CodeHistory />     

</div>
      </div>
    </main>
  );
}
