'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { FaTrophy } from 'react-icons/fa';

export default function ReflexTapDuel() {
  const router = useRouter();
  const { inviteCode } = router.query;

  const [countdown, setCountdown] = useState(3);
  const [gameStarted, setGameStarted] = useState(false);
  const [flashVisible, setFlashVisible] = useState(false);
  const [reactionStart, setReactionStart] = useState(null);
  const [reactionTime, setReactionTime] = useState(null);
  const [result, setResult] = useState(null); // 'win' | 'lose'
  const [opponentTime, setOpponentTime] = useState(null); // fake for now

  // Countdown before match begins
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      const delay = Math.random() * 4000 + 3000; // 3-7s
      setTimeout(() => {
        setFlashVisible(true);
        setReactionStart(Date.now());
      }, delay);
      setGameStarted(true);
    }
  }, [countdown]);

  const handleTap = () => {
    if (!flashVisible || reactionTime) return;
    const playerTime = Date.now() - reactionStart;
    setReactionTime(playerTime);

    // Fake opponent time
    const fakeOpponent = Math.random() * 400 + 150; // 150–550ms
    setOpponentTime(Math.round(fakeOpponent));

    // Determine winner
    if (playerTime < fakeOpponent) {
      setResult('win');
      // TODO: update MongoDB with win
    } else {
      setResult('lose');
    }
  };

  return (
    <main className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white font-orbitron p-6">
      {!gameStarted ? (
        <div className="text-center text-5xl font-bold text-yellow-300 animate-pulse">
          Starting in {countdown}...
        </div>
      ) : !flashVisible ? (
        <div className="text-center text-xl text-white animate-pulse">Get Ready...</div>
      ) : !result ? (
        <button
          onClick={handleTap}
          className="bg-yellow-400 text-[#0f172a] text-4xl px-10 py-6 rounded-full shadow-xl hover:scale-105 transition font-bold"
        >
          TAP NOW!
        </button>
      ) : (
        <div className="text-center space-y-6">
          <div className="text-4xl font-bold text-cyan-400 flex items-center justify-center gap-2">
            <FaTrophy />
            {result === 'win' ? '🏆 You Win!' : '❌ You Lost!'}
          </div>
          <p className="text-white text-lg">
            Your Time: <span className="text-yellow-400 font-bold">{reactionTime} ms</span><br />
            Opponent: <span className="text-pink-400">{opponentTime} ms</span>
          </p>
          <button
            onClick={() => router.push('/battles/lobby/1v1')}
            className="mt-4 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-[#0f172a] font-bold rounded-lg shadow"
          >
            Return to Lobby
          </button>
        </div>
      )}
    </main>
  );
}
