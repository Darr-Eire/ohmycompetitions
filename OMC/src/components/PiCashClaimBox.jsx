'use client';

import { useState, useEffect } from 'react';

export default function PiCashClaimBox({ winner, onClaimSuccess, onClaimExpired }) {
  const [codeInput, setCodeInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [expired, setExpired] = useState(false);

  // Calculate countdown timer
  useEffect(() => {
    if (!winner?.claimExpiresAt) return;

    const updateTimer = () => {
      const now = Date.now();
      const expiryTime = new Date(winner.claimExpiresAt).getTime();
      const diff = expiryTime - now;

      if (diff <= 0) {
        setTimeLeft({ minutes: 0, seconds: 0 });
        setExpired(true);
        if (onClaimExpired) onClaimExpired();
        return;
      }

      const minutes = Math.floor(diff / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [winner?.claimExpiresAt, onClaimExpired]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!codeInput.trim() || loading || expired) return;

    setLoading(true);
    setStatus('Submitting code...');

    try {
      const response = await fetch('/api/pi-cash-code-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submittedCode: codeInput.trim(),
          uid: winner.uid,
          username: winner.username
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setStatus(`🎉 Success! You've claimed ${result.prizeAmount || 'your'} π!`);
        if (onClaimSuccess) onClaimSuccess(result);
      } else {
        setStatus(`❌ ${result.message || 'Invalid code. Please try again.'}`);
      }
    } catch (error) {
      console.error('Claim error:', error);
      setStatus('❌ Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!winner) return null;

  if (expired) {
    return (
      <div className="bg-red-900/20 border border-red-500 rounded-xl p-6 text-center">
        <h3 className="text-xl font-bold text-red-400 mb-2">⏰ Claim Window Expired</h3>
        <p className="text-gray-300">
          Sorry, the 31 minutes and 4 seconds claim window has expired. 
          The prize will roll over to next week's pool.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-500 rounded-xl p-6 shadow-[0_0_30px_rgba(255,255,0,0.3)]">
      <h3 className="text-2xl font-bold text-yellow-400 text-center mb-4">
        🎯 You Won Pi Cash Code!
      </h3>
      
      <div className="text-center mb-4">
        <p className="text-white mb-2">Enter the secret code to claim your prize:</p>
        
        {timeLeft && (
          <div className="bg-black/50 rounded-lg p-3 mb-4">
            <p className="text-yellow-300 font-bold text-lg">
              Time Remaining: {timeLeft.minutes}:{String(timeLeft.seconds).padStart(2, '0')}
            </p>
            <p className="text-xs text-gray-400">
              (31 minutes and 4 seconds total)
            </p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
            placeholder="Enter Pi Cash Code (e.g., ABCD-1234)"
            className="w-full px-4 py-3 text-center text-lg font-mono bg-black/50 border border-yellow-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
            disabled={loading || expired}
            maxLength={9} // ABCD-1234 format
          />
        </div>

        <button
          type="submit"
          disabled={!codeInput.trim() || loading || expired}
          className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold rounded-lg hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Submitting...' : 'Claim Prize'}
        </button>
      </form>

      {status && (
        <div className={`mt-4 p-3 rounded-lg text-center ${
          status.includes('Success') || status.includes('🎉') 
            ? 'bg-green-900/20 border border-green-500 text-green-400'
            : 'bg-red-900/20 border border-red-500 text-red-400'
        }`}>
          {status}
        </div>
      )}

      <div className="mt-4 text-center text-sm text-gray-400">
        <p>Can't find the code? Check the Pi Cash Code page or our social media:</p>
        <div className="flex justify-center gap-4 mt-2">
          <a href="https://x.com/OhMyComps" target="_blank" className="text-cyan-400 hover:underline">
            @OM_Competitions
          </a>
          <a href="https://instagram.com/ohmycompetitions" target="_blank" className="text-cyan-400 hover:underline">
            @ohmycompetitions
          </a>
        </div>
      </div>
    </div>
  );
} 