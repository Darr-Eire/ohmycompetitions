'use client';

import { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from '@uidotdev/usehooks';
import Link from 'next/link';
import { usePiAuth } from '../../context/PiAuthContext';

const PRIZE_POOL = 50;
const NUM_DIGITS = 4;

export default function VaultPro() {
  const { width, height } = useWindowSize();
  const { user, loginWithPi } = usePiAuth();
  const [code, setCode] = useState([]);
  const [digits, setDigits] = useState(Array(NUM_DIGITS).fill(0));
  const [status, setStatus] = useState('idle');
  const [correctIndexes, setCorrectIndexes] = useState([]);
  const [retryUsed, setRetryUsed] = useState(false);
  const [dailyUsed, setDailyUsed] = useState(false);
  const [skillAnswer, setSkillAnswer] = useState('');
  const [payoutStatus, setPayoutStatus] = useState('');
  const [sendingPayout, setSendingPayout] = useState(false);
  const correctAnswer = '9'; // skill question: 6 + 3

  useEffect(() => {
    if (status === 'playing') {
      const newCode = Array.from({ length: NUM_DIGITS }, () => Math.floor(Math.random() * 10));
      setCode(newCode);
      
      // 🚨 DEV TESTING: Show secret code in console
      console.log('🔓 HACK THE VAULT - Secret Code:', newCode.join(''));
      console.log('🔓 Individual digits:', newCode);
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
      alert("You've already used your free daily attempt.");
      return;
    }
    
    if (!user) {
      alert("Please login with Pi to play Hack the Vault!");
      loginWithPi();
      return;
    }
    
    setDigits(Array(NUM_DIGITS).fill(0));
    setRetryUsed(false);
    setStatus('playing');
    setDailyUsed(true);
    setSkillAnswer('');
    setPayoutStatus('');
  };

  const enterCode = () => {
    if (skillAnswer.trim() !== correctAnswer) {
      alert('Answer the skill question correctly before cracking the code.');
      return;
    }

    const correct = digits.map((d, idx) => d === code[idx]);
    const isWin = correct.every(Boolean);

    if (isWin) {
      setStatus('success');
      // Send Pi payout
      sendPiPayout();
    } else {
      setCorrectIndexes(correct);
      setStatus('hint');
    }
  };

  const sendPiPayout = async () => {
    if (!user) {
      setPayoutStatus('❌ User not logged in');
      return;
    }

    setSendingPayout(true);
    setPayoutStatus('💰 Sending Pi payout...');

    try {
      const response = await fetch('/api/try-your-luck/hack-vault-win', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userUid: user.uid,
          username: user.username,
          prizeAmount: PRIZE_POOL
        })
      });

      const result = await response.json();

      if (result.success) {
        setPayoutStatus(`✅ ${result.message}`);
        console.log('🎉 Pi payout successful:', result);
      } else {
        setPayoutStatus(`❌ ${result.error || 'Payout failed'}`);
        console.error('❌ Pi payout failed:', result);
      }
    } catch (error) {
      console.error('❌ Payout API error:', error);
      setPayoutStatus('❌ Failed to send payout. Please contact support.');
    } finally {
      setSendingPayout(false);
    }
  };

  const handleRetry = () => {
    setRetryUsed(true);
    setDigits(Array(NUM_DIGITS).fill(0));
    setStatus('playing');
    setSkillAnswer('');
  };

  const reset = () => {
    setStatus('idle');
    setSkillAnswer('');
    setPayoutStatus('');
  };

  return (
    <main className="min-h-screen px-4 py-12 bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white font-orbitron flex flex-col items-center">
      <div className="max-w-md w-full space-y-4 border border-cyan-700 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-[0_0_30px_#00fff055]">

        <div className="text-center mb-2">
          <h1 className="bg-gradient-to-r from-[#0f172a]/70 via-[#1e293b]/70 to-[#0f172a]/70 border border-cyan-700 shadow-[0_0_30px_#00fff055] w-full max-w-md text-center px-4 py-3 rounded-3xl text-cyan-300">
            Hack The Vault
          </h1>
        </div>

        {/* User Status */}
        {!user && (
          <div className="bg-red-800 bg-opacity-30 border border-red-400 p-3 rounded-xl text-center">
            <p className="text-red-300 mb-2">🔐 Login Required</p>
            <button
              onClick={loginWithPi}
              className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded font-bold"
            >
              Login with Pi
            </button>
          </div>
        )}

        {user && (
          <div className="bg-green-800 bg-opacity-30 border border-green-400 p-3 rounded-xl text-center">
            <p className="text-green-300">✅ Logged in as {user.username}</p>
          </div>
        )}

        <p className="text-center text-white text-lg mb-2">
          Crack the secret 4-digit vault and win <span className="text-cyan-300">{PRIZE_POOL} π</span>. One free daily chance.
        </p>

        <div className="bg-white bg-opacity-10 rounded-2xl shadow-lg p-6 text-center">

          {status === 'idle' && (
            <button
              onClick={startGame}
              disabled={dailyUsed || !user}
              className={`w-full py-3 rounded-full text-lg font-semibold text-white ${
                dailyUsed || !user ? 'bg-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] hover:brightness-110 shadow-[0_0_30px_#00fff055] border border-cyan-700'
              }`}
            >
              {!user ? 'Login Required' : dailyUsed ? 'Already Played Today' : 'Free Daily Attempt'}
            </button>
          )}

          {status === 'playing' && (
            <>
              <p className="text-yellow-300 font-semibold text-lg mb-4">Crack Code:</p>
              <div className="flex justify-center gap-4 mb-6">
                {digits.map((digit, i) => (
                  <div key={i} className="flex flex-col items-center space-y-2">
                    <button
                      onClick={() => adjustDigit(i, 1)}
                      className="bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white font-semibold w-10 h-10 rounded-full text-lg shadow-[0_0_30px_#00fff055] border border-cyan-700"
                    >
                      ▲
                    </button>
                    <div className="text-3xl font-mono">{digit}</div>
                    <button
                      onClick={() => adjustDigit(i, -1)}
                      className="bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white font-semibold w-10 h-10 rounded-full text-lg shadow-[0_0_30px_#00fff055] border border-cyan-700"
                    >
                      ▼
                    </button>
                  </div>
                ))}
              </div>

              {/* Skill Question */}
              <div className="mb-4 text-left">
                <label htmlFor="skill-question" className="block font-semibold mb-1">
                  Skill Question (required):
                </label>
                <p className="text-sm mb-1">What is 6 + 3?</p>
                <input
                  id="skill-question"
                  type="text"
                  value={skillAnswer}
                  onChange={(e) => setSkillAnswer(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-white/10 border border-cyan-500 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  placeholder="Enter your answer"
                />
                {skillAnswer && skillAnswer.trim() !== correctAnswer && (
                  <p className="text-sm text-red-400 mt-1">
                    Incorrect answer. You must answer correctly to proceed.
                  </p>
                )}
              </div>

              <button
                onClick={enterCode}
                disabled={skillAnswer.trim() !== correctAnswer}
                className={`bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white font-semibold w-full py-3 text-lg rounded-full shadow-[0_0_30px_#00fff055] border border-cyan-700 hover:brightness-110 transition
                ${skillAnswer.trim() !== correctAnswer ? 'cursor-not-allowed opacity-70' : ''}`}
              >
                Crack Code
              </button>
            </>
          )}

          {status === 'hint' && (
            <>
              <p className="text-yellow-300 font-semibold text-lg mb-3">Close Pioneer! Correct digits:</p>
              <div className="flex justify-center gap-4 mb-4">
                {digits.map((d, i) => (
                  <div
                    key={i}
                    className={`w-14 h-14 flex justify-center items-center rounded-full text-2xl font-bold ${
                      correctIndexes[i] ? 'bg-green-400 text-black' : 'bg-red-400 text-black'
                    }`}
                  >
                    {d}
                  </div>
                ))}
              </div>

              {!retryUsed ? (
                <button
                  onClick={handleRetry}
                  className="bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white font-semibold w-full py-3 text-lg rounded-full shadow-[0_0_30px_#00fff055] border border-cyan-700 hover:brightness-110 transition"
                >
                  Retry Attempt
                </button>
              ) : (
                <>
                  <p className="text-red-400 font-semibold mb-2">The Vault stays locked... See you tomorrow 🚀</p>
                  <button
                    onClick={reset}
                    className="bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white font-semibold w-full py-3 rounded-full shadow-[0_0_30px_#00fff055] border border-cyan-700 hover:brightness-110 transition"
                  >
                    Back to Menu
                  </button>
                </>
              )}
            </>
          )}

          {status === 'success' && (
            <>
              <Confetti width={width} height={height} />
              <p className="text-green-400 font-bold text-xl mb-4">🎉 You cracked the Vault & won {PRIZE_POOL} π!</p>
              
              {/* Payout Status */}
              {payoutStatus && (
                <div className={`p-3 rounded-lg mb-4 ${
                  payoutStatus.includes('✅') ? 'bg-green-800 bg-opacity-30 border border-green-400' :
                  payoutStatus.includes('❌') ? 'bg-red-800 bg-opacity-30 border border-red-400' :
                  'bg-yellow-800 bg-opacity-30 border border-yellow-400'
                }`}>
                  <p className="text-sm">{payoutStatus}</p>
                  {sendingPayout && (
                    <div className="flex justify-center items-center mt-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-300"></div>
                      <span className="ml-2 text-xs">Processing...</span>
                    </div>
                  )}
                </div>
              )}
              
              <button
                onClick={reset}
                className="bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white font-semibold w-full py-3 rounded-full shadow-[0_0_30px_#00fff055] border border-cyan-700 hover:brightness-110 transition"
              >
                Play Again Tomorrow
              </button>
            </>
          )}

        </div>

        <div className="text-center mt-6">
          <Link href="/terms/vault-pro-plus" className="text-sm text-cyan-300 underline">
            Vault Pro Terms & Conditions
          </Link>
        </div>

        <Link href="/try-your-luck" className="text-sm text-cyan-300 underline block text-center mt-2">
          Back to Mini Games
        </Link>
      </div>
    </main>
  );
}
