'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { usePiAuth } from '../../context/PiAuthContext';

export default function StackerGame() {
  const rows = 15;
  const cols = 12;

  const { user, loginWithPi } = usePiAuth();

  const [currentRow, setCurrentRow] = useState(rows - 1);
  const [positions, setPositions] = useState([4, 5, 6]);
  const [direction, setDirection] = useState(1);
  const [lockedBlocks, setLockedBlocks] = useState([]);
  const [fallingBlocks, setFallingBlocks] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [speed, setSpeed] = useState(250);
  const [hasPaid, setHasPaid] = useState(false);
  const [paymentPending, setPaymentPending] = useState(false);

  const isFalling = (row, col) => {
    return fallingBlocks.find((b) => b.row === row && b.col === col);
  };

  const awardTicket = async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/stacker/win-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userUid: user.uid,
          username: user.username,
          game: 'stacker',
          reward: 'ticket',
        }),
      });

      const result = await response.json();
      if (result.success) {
        console.log('🏆 Ticket awarded successfully');
      } else {
        console.warn('❌ Failed to award ticket:', result.message);
      }
    } catch (error) {
      console.error('❌ Error awarding ticket:', error);
    }
  };

  const handlePurchase = async () => {
    if (!user) {
      alert("Please login with Pi to play!");
      loginWithPi();
      return;
    }

    setPaymentPending(true);
    try {
      const paymentData = await window.Pi.createPayment({
        amount: 0.2,
        memo: "Play Stacker Game",
        metadata: { game: "stacker", userId: user.uid, username: user.username },
      });

      if (paymentData?.transaction?.txid) {
        console.log("✅ Payment successful");
        setHasPaid(true);

        await fetch('/api/pi/complete-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentId: paymentData.identifier,
            txid: paymentData.transaction.txid,
            slug: 'stacker-game',
            amount: 0.2,
            userId: user.uid,
            username: user.username,
          }),
        });
      } else {
        console.warn("❌ Payment cancelled or failed");
      }
    } catch (err) {
      console.error("Payment Error:", err);
    } finally {
      setPaymentPending(false);
    }
  };

  const handleStack = useCallback(() => {
    if (gameOver || gameWon) return;

    const belowRow = lockedBlocks.find(b => b.row === currentRow + 1);
    let aligned = positions;
    let missed = [];

    if (belowRow) {
      aligned = positions.filter(p => belowRow.pos.includes(p));
      missed = positions.filter(p => !belowRow.pos.includes(p));
    }

    if (!belowRow) {
      missed = [];
    }

    if (missed.length > 0) {
      const missedBlocks = missed.map(col => ({ row: currentRow, col }));
      setFallingBlocks(prev => [...prev, ...missedBlocks]);
      setTimeout(() => {
        setFallingBlocks(prev => prev.filter(b => !missedBlocks.includes(b)));
      }, 2000);
    }

    if (aligned.length === 0) {
      setGameOver(true);
      return;
    }

    setLockedBlocks(prev => [...prev, { row: currentRow, pos: aligned }]);

    if (currentRow === 0) {
      setGameWon(true);
      awardTicket();
      return;
    }

    setSpeed(prev => Math.max(80, prev - 25));
    setCurrentRow(currentRow - 1);
    setPositions(aligned);
  }, [currentRow, positions, lockedBlocks, gameOver, gameWon]);

  useEffect(() => {
    if (gameOver || gameWon || !hasPaid) return;

    const interval = setInterval(() => {
      setPositions((prev) => {
        const next = prev.map((p) => p + direction);
        if (Math.max(...next) >= cols || Math.min(...next) < 0) {
          setDirection((d) => -d);
          return prev;
        }
        return next;
      });
    }, speed);

    return () => clearInterval(interval);
  }, [direction, speed, gameOver, gameWon, hasPaid]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleStack();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleStack]);

  const resetGame = () => {
    setCurrentRow(rows - 1);
    setPositions([4, 5, 6]);
    setDirection(1);
    setLockedBlocks([]);
    setFallingBlocks([]);
    setGameOver(false);
    setGameWon(false);
    setSpeed(250);
    setHasPaid(false);
  };

  return (
    <div className="stacker-container text-white text-center mt-32 scale-[0.9] sm:scale-[1] md:scale-[1.1]">
      <h2 className="text-2xl font-bold mb-6 text-cyan-400">🎮 Try Your Luck: Stack to Win a Ticket!</h2>

      {!user && (
        <div className="bg-red-800 bg-opacity-30 border border-red-400 p-3 rounded-xl text-center mb-4">
          <p className="text-red-300 mb-2">🔐 Login Required</p>
          <button
            onClick={loginWithPi}
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded font-bold"
          >
            Login with Pi
          </button>
        </div>
      )}

      {!hasPaid ? (
        <div className="flex flex-col items-center space-y-4">
          <p className="text-lg text-gray-300">
            Entry Fee: <span className="text-cyan-400 font-semibold">0.2π</span>
          </p>
          <button
            className="bg-cyan-600 px-6 py-2 rounded font-bold hover:bg-cyan-700 disabled:opacity-50"
            onClick={handlePurchase}
            disabled={paymentPending || !user}
          >
            {paymentPending ? "Processing..." : "Pay & Play"}
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-12 gap-[2px] bg-[#0f172a] p-2 border-2 border-cyan-500 rounded-xl mx-auto w-fit shadow-[0_0_10px_#00fff044]">
            {[...Array(rows)].map((_, row) =>
              [...Array(cols)].map((_, col) => {
                const isActive = currentRow === row && positions.includes(col);
                const isLocked = lockedBlocks.find(b => b.row === row && b.pos.includes(col));
                const falling = isFalling(row, col);

                return (
                  <div
                    key={`${row}-${col}`}
                    className={`w-6 h-6 border border-gray-800 transition-all duration-150 ${
                      isActive || isLocked ? 'bg-cyan-400 shadow-inner shadow-cyan-300' :
                      falling ? 'bg-red-500 animate-drop' : 'bg-black'
                    }`}
                  ></div>
                );
              })
            )}
          </div>

          {!gameOver && !gameWon && (
            <button
              className="mt-4 bg-cyan-600 px-4 py-2 rounded font-bold hover:bg-cyan-700"
              onClick={handleStack}
            >
              Stack (or Press Space)
            </button>
          )}

          {gameOver && (
            <div className="mt-4">
              <p className="text-red-400 font-bold text-lg">All blocks missed! Game Over 💀</p>
              <button
                className="mt-2 bg-cyan-600 px-4 py-2 rounded hover:bg-cyan-700"
                onClick={resetGame}
              >
                Try Again
              </button>
            </div>
          )}

          {gameWon && (
            <div className="mt-4">
              <p className="text-green-400 font-bold text-lg">🎉 You Won! Ticket Sent!</p>
              <button
                className="mt-2 bg-cyan-600 px-4 py-2 rounded hover:bg-cyan-700"
                onClick={resetGame}
              >
                Play Again
              </button>
            </div>
          )}
        </>
      )}

      <style jsx>{`
        @keyframes drop {
          0% {
            transform: translateY(0);
            opacity: 1;
          }
          100% {
            transform: translateY(100px);
            opacity: 0.2;
          }
        }

        .animate-drop {
          animation: drop 2s ease-in forwards;
        }
      `}</style>
    </div>
  );
}
