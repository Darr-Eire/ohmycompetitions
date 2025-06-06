'use client';

import { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from '@uidotdev/usehooks';
import Link from 'next/link';
import { loadPiSdk } from '../../lib/pi';


const PRIZE_POOL = 50;
const RETRY_FEE = 1;
const NUM_DIGITS = 4;

export default function VaultPro() {
  const { width, height } = useWindowSize();
  const [sdkReady, setSdkReady] = useState(false);
  const [code, setCode] = useState([]);
  const [digits, setDigits] = useState(Array(NUM_DIGITS).fill(0));
  const [status, setStatus] = useState('idle');
  const [correctIndexes, setCorrectIndexes] = useState([]);
  const [retryUsed, setRetryUsed] = useState(false);
  const [dailyUsed, setDailyUsed] = useState(false);

  useEffect(() => {
    loadPiSdk(setSdkReady);
  }, []);

  useEffect(() => {
    if (status === 'playing') {
      const newCode = Array.from({ length: NUM_DIGITS }, () => Math.floor(Math.random() * 10));
      setCode(newCode);
    }
  }, [status]);

  const adjustDigit = (i, delta) => {
    setDigits(prev => {
      const updated = [...prev];
      updated[i] = (updated[i] + delta + 10) % 10;
      return updated;
    });
  };

  const startGame = () => {
    if (dailyUsed) {
      alert("You’ve already used your free daily attempt.");
      return;
    }
    setDigits(Array(NUM_DIGITS).fill(0));
    setRetryUsed(false);
    setStatus('playing');
    setDailyUsed(true);
  };

  const enterCode = () => {
    const correct = digits.map((d, idx) => d === code[idx]);
    const isWin = correct.every(Boolean);

    if (isWin) {
      setStatus('success');
    } else {
      setCorrectIndexes(correct);
      setStatus('hint');
    }
  };

  const handleRetryPayment = () => {
    if (!sdkReady || typeof window === 'undefined' || !window.Pi) {
      alert('⚠️ Pi SDK not ready.');
      return;
    }

    window.Pi.createPayment(
      {
        amount: RETRY_FEE,
        memo: 'Vault Pro Retry',
        metadata: { type: 'vault-pro-retry' },
      },
      {
        onReadyForServerApproval: async (paymentId) => {
          try {
            await fetch('/api/payments/approve', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId }),
            });
            console.log('[✅] Retry approved');
          } catch (err) {
            console.error('[ERROR] Approving retry:', err);
            alert('❌ Server approval failed.');
          }
        },

        onReadyForServerCompletion: async (paymentId, txid) => {
          try {
            await fetch('/api/payments/complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId, txid }),
            });
            console.log('[✅] Retry completed');
            setRetryUsed(true);
            setStatus('playing');
          } catch (err) {
            console.error('[ERROR] Completing retry:', err);
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
  };

  const reset = () => setStatus('idle');

  return (
    <main className="app-background min-h-screen flex flex-col items-center px-4 py-12 text-white">
      <div className="max-w-md w-full space-y-4">

        <div className="text-center mb-2">
          <h1 className="title-gradient text-2xl font-bold text-white">Pi Vault</h1>
        </div>

        <p className="text-center text-white text-lg mb-2">
          Crack the secret 4-digit vault and win <span className="text-cyan-300">{PRIZE_POOL} π</span>. One free daily chance.
        </p>

        <div className="bg-white bg-opacity-10 rounded-2xl shadow-lg p-6 text-center">

          {status === 'idle' && (
            <button onClick={startGame} disabled={dailyUsed}
              className={`w-full py-3 rounded-full text-lg font-semibold text-white ${dailyUsed ? 'bg-gray-500 cursor-not-allowed' : 'btn-gradient'}`}>
              Free Daily Attempt
            </button>
          )}

          {status === 'playing' && (
            <>
              <p className="text-yellow-300 font-semibold text-lg mb-4">Crack Code:</p>
              <div className="flex justify-center gap-4 mb-6">
                {digits.map((digit, i) => (
                  <div key={i} className="flex flex-col items-center space-y-2">
                    <button onClick={() => adjustDigit(i, 1)} className="btn-gradient w-10 h-10 rounded-full text-lg">▲</button>
                    <div className="text-3xl font-mono">{digit}</div>
                    <button onClick={() => adjustDigit(i, -1)} className="btn-gradient w-10 h-10 rounded-full text-lg">▼</button>
                  </div>
                ))}
              </div>
              <button onClick={enterCode} className="btn-gradient w-full py-3 text-lg rounded-full shadow-lg">Crack Code</button>
            </>
          )}

          {status === 'hint' && (
            <>
              <p className="text-yellow-300 font-semibold text-lg mb-3">Close Pioneer! Correct digits:</p>
              <div className="flex justify-center gap-4 mb-4">
                {digits.map((d, i) => (
                  <div key={i} className={`w-14 h-14 flex justify-center items-center rounded-full text-2xl font-bold ${correctIndexes[i] ? 'bg-green-400 text-black' : 'bg-red-400 text-black'}`}>
                    {d}
                  </div>
                ))}
              </div>

              {!retryUsed ? (
                <button onClick={handleRetryPayment} className="btn-gradient w-full py-3 text-lg rounded-full shadow-lg">
                  Pay {RETRY_FEE} π for Retry
                </button>
              ) : (
                <>
                  <p className="text-red-400 font-semibold mb-2">The Vault stays locked... See you tomorrow 🚀</p>
                  <button onClick={reset} className="btn-gradient w-full py-3">Back to Menu</button>
                </>
              )}
            </>
          )}

          {status === 'success' && (
            <>
              <Confetti width={width} height={height} />
              <p className="text-green-400 font-bold text-xl mb-4">🎉 You cracked the Vault & won {PRIZE_POOL} π!</p>
              <button onClick={reset} className="btn-gradient w-full py-3">Play Again Tomorrow</button>
            </>
          )}

        </div>

        <div className="text-center mt-6">
          <Link href="/terms/vault-pro-plus" className="text-sm text-cyan-300 underline">Pi Vault Terms & Conditions</Link>
        </div>

        <Link href="/try-your-luck" className="text-sm text-cyan-300 underline block text-center mt-2">
          Back to Mini Games
        </Link>

      </div>
    </main>
  );
}
