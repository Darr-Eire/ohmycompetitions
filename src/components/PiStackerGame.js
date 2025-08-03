import React, { useState, useEffect, useRef } from 'react';

const BLOCK_HEIGHT = 30;
const MAX_STACK = 8;
const ENTRY_COST = 1;
const WIN_REWARD = 31.4;
const WINNING_ATTEMPT = 41;

export default function PiStackerGame() {
  const [stack, setStack] = useState([]);
  const [current, setCurrent] = useState(null);
  const [direction, setDirection] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [win, setWin] = useState(false);
  const gameRef = useRef(null);

  // Start new game
  const startGame = () => {
    setStack([{ width: 100, left: 0 }]);
    setCurrent({ width: 100, left: 0 });
    setDirection(1);
    setIsPlaying(true);
    setWin(false);
  };

  // Stop current block and stack it
  const dropBlock = () => {
    if (!current) return;

    const prev = stack[stack.length - 1];
    const overlap = getOverlap(prev, current);

    if (overlap.width <= 0) {
      endGame(false);
      return;
    }

    const newBlock = {
      width: overlap.width,
      left: overlap.left,
    };

    const updatedStack = [...stack, newBlock];
    setStack(updatedStack);

    if (updatedStack.length === MAX_STACK + 1) {
      endGame(true);
      return;
    }

    setCurrent({ width: overlap.width, left: 0 });
  };

  // End game: win or lose
  const endGame = (didWin) => {
    setIsPlaying(false);
    setWin(didWin);
    setAttempts((prev) => prev + 1);
  };

  // Block movement loop
  useEffect(() => {
    if (!isPlaying || !current) return;

    const interval = setInterval(() => {
      setCurrent((prev) => {
        let newLeft = prev.left + direction * 2;
        if (newLeft <= 0 || newLeft + prev.width >= 100) {
          setDirection((d) => -d);
          newLeft = Math.max(0, Math.min(100 - prev.width, newLeft));
        }
        return { ...prev, left: newLeft };
      });
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [isPlaying, current, direction]);

  // Calculate overlap between blocks
  const getOverlap = (prev, curr) => {
    const start = Math.max(prev.left, curr.left);
    const end = Math.min(prev.left + prev.width, curr.left + curr.width);
    const width = Math.max(0, end - start);
    return { left: start, width };
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 text-center text-white bg-black rounded-2xl shadow-lg relative">
      <h2 className="text-xl font-bold mb-4">🧱 Pi Stacker</h2>

      <div ref={gameRef} className="relative h-[300px] bg-gray-900 border border-cyan-500 rounded mb-4 overflow-hidden">
        {[...stack, current].filter(Boolean).map((block, i) => (
          <div
            key={i}
            className="absolute bg-cyan-300 rounded"
            style={{
              top: `${270 - i * BLOCK_HEIGHT}px`,
              left: `${block.left}%`,
              width: `${block.width}%`,
              height: `${BLOCK_HEIGHT}px`,
              transition: 'left 0.05s linear',
            }}
          />
        ))}
      </div>

      {isPlaying ? (
        <button
          onClick={dropBlock}
          className="w-full py-2 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded mb-2"
        >
          STOP
        </button>
      ) : (
        <>
          <button
            onClick={startGame}
            className="w-full py-2 bg-cyan-300 hover:bg-cyan-400 text-black font-bold rounded mb-2"
          >
            {stack.length > 1 ? 'Try Again' : 'Start'}
          </button>

          {stack.length > 1 && (
            <div className="text-sm mt-2">
              {win ? (
                <p className="text-green-400 font-semibold">
                  🎉 You win {WIN_REWARD}π!
                </p>
              ) : (
                <p className="text-red-400 font-semibold">❌ Game Over</p>
              )}
            </div>
          )}
        </>
      )}

      <div className="mt-4 text-xs text-cyan-200 space-y-1">
        <p>Attempt: {attempts}</p>
        <p>Prize every {WINNING_ATTEMPT} paid plays</p>
      </div>
    </div>
  );
}
