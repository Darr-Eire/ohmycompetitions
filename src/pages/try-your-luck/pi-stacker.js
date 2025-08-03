import React, { useState, useEffect, useRef } from 'react';

const BLOCK_SIZE = 30;
const COLUMNS = 14;
const STAGE_WIDTH = COLUMNS * BLOCK_SIZE;
const MAX_LAYERS = 13;
const START_LENGTH = 3;

export default function PiStackerGame() {
  const [stack, setStack] = useState([]);
  const [currentCols, setCurrentCols] = useState([]);
  const [position, setPosition] = useState(0);
  const [blockLength, setBlockLength] = useState(START_LENGTH);
  const [movingRight, setMovingRight] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [win, setWin] = useState(false);
  const [winReason, setWinReason] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [successfulStacks, setSuccessfulStacks] = useState(0);
  const [fallingBlocks, setFallingBlocks] = useState([]);
  const [speed, setSpeed] = useState(150);
  const intervalRef = useRef(null);

  const getCols = (startCol, length) => Array.from({ length }, (_, i) => startCol + i);

  const startGame = () => {
    const startCol = Math.floor((COLUMNS - START_LENGTH) / 2);
    const baseCols = getCols(startCol, START_LENGTH);
    setStack([baseCols]);
    setCurrentCols(baseCols);
    setBlockLength(START_LENGTH);
    setPosition(startCol);
    setMovingRight(true);
    setIsPlaying(true);
    setWin(false);
    setWinReason('');
    setAttempts((prev) => prev + 1);
    setFallingBlocks([]);
    setSpeed(150);
  };

  const stopBlock = () => {
    const prev = stack[stack.length - 1];
    const overlap = currentCols.filter((col) => prev.includes(col));
    const lost = currentCols.filter((col) => !prev.includes(col));

    const lostFalling = lost.map((col) => ({
      col,
      top: (stack.length + 1) * BLOCK_SIZE,
      id: `${Date.now()}-${col}`,
    }));
    setFallingBlocks((prev) => [...prev, ...lostFalling]);
    setTimeout(() => {
      setFallingBlocks((prev) => prev.filter((b) => !lostFalling.find((l) => l.id === b.id)));
    }, 1000);

    if (overlap.length === 0) {
      endGame(false);
      return;
    }

    const newStack = [...stack, overlap];
    setStack(newStack);
    setSpeed((prev) => Math.max(60, prev - 5));

    if (newStack.length >= MAX_LAYERS) {
      endGame(true);
      return;
    }

    const newStart = Math.min(...overlap);
    const newLength = overlap.length;
    setBlockLength(newLength);
    setPosition(newStart);
    setCurrentCols(getCols(newStart, newLength));
  };

  const endGame = async (didWin) => {
    clearInterval(intervalRef.current);
    setIsPlaying(false);

    if (didWin) {
      const newSuccessCount = successfulStacks + 1;
      setSuccessfulStacks(newSuccessCount);

      try {
        const res = await fetch('/api/check-win', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ successCount: newSuccessCount }),
        });

        const data = await res.json();
        setWin(data.win);
        setWinReason(data.reason || '');
      } catch (err) {
        console.error('Win check failed', err);
        setWin(false);
        setWinReason('Could not verify win.');
      }
    } else {
      setWin(false);
      setWinReason('');
    }
  };

  useEffect(() => {
    if (!isPlaying) return;
    intervalRef.current = setInterval(() => {
      setPosition((prev) => {
        let newPos = prev + (movingRight ? 1 : -1);
        if (newPos <= 0) {
          setMovingRight(true);
          return 0;
        } else if (newPos + blockLength > COLUMNS) {
          setMovingRight(false);
          return COLUMNS - blockLength;
        }
        return newPos;
      });
    }, speed);
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, movingRight, blockLength, speed]);

  useEffect(() => {
    setCurrentCols(getCols(position, blockLength));
  }, [position, blockLength]);

  return (
    <div className="w-full max-w-md mx-auto p-6 text-center text-white bg-black rounded-2xl shadow-lg">
      <h2 className="text-xl font-bold mb-4">🧱 Pi Stacker</h2>
      <div
        className="relative border border-cyan-500 rounded"
        style={{
          width: `${STAGE_WIDTH}px`,
          height: `${MAX_LAYERS * BLOCK_SIZE}px`,
          margin: '0 auto',
          overflow: 'hidden',
          backgroundImage: `
            linear-gradient(to right, rgba(0,255,255,0.1) 1px, transparent 1px),
            linear-gradient(to top, rgba(0,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: `${BLOCK_SIZE}px ${BLOCK_SIZE}px`,
          backgroundColor: '#111827',
        }}
      >
        {stack.map((layer, row) =>
          layer.map((col, i) => (
            <div
              key={`stack-${row}-${i}`}
              className="absolute bg-cyan-300"
              style={{
                width: `${BLOCK_SIZE}px`,
                height: `${BLOCK_SIZE}px`,
                left: `${col * BLOCK_SIZE}px`,
                bottom: `${row * BLOCK_SIZE}px`,
                borderRadius: '4px',
                boxShadow: '0 0 4px #00ffff80',
              }}
            />
          ))
        )}
        {isPlaying &&
          currentCols.map((col, i) => (
            <div
              key={`moving-${i}`}
              className="absolute bg-cyan-500 flex items-center justify-center text-white font-bold text-lg"
              style={{
                width: `${BLOCK_SIZE}px`,
                height: `${BLOCK_SIZE}px`,
                left: `${col * BLOCK_SIZE}px`,
                bottom: `${stack.length * BLOCK_SIZE}px`,
                borderRadius: '4px',
                boxShadow: '0 0 6px #00ffffaa',
              }}
            >
              π
            </div>
          ))}
        {fallingBlocks.map((b) => (
          <div
            key={b.id}
            className="absolute bg-red-500 animate-fall-down"
            style={{
              width: `${BLOCK_SIZE}px`,
              height: `${BLOCK_SIZE}px`,
              left: `${b.col * BLOCK_SIZE}px`,
              top: `${b.top}px`,
              borderRadius: '4px',
              opacity: 0.9,
            }}
          />
        ))}
      </div>

      {isPlaying ? (
        <button
          onClick={stopBlock}
          className="w-full py-2 mt-4 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded"
        >
          STOP
        </button>
      ) : (
        <>
          <button
            onClick={startGame}
            className="w-full py-2 mt-4 bg-cyan-300 hover:bg-cyan-400 text-black font-bold rounded"
          >
            {stack.length > 1 ? 'Try Again' : 'Start'}
          </button>
          {stack.length > 1 && (
            <div className="text-sm mt-3">
              {win ? (
                <p className="text-green-400 font-semibold">🎉 You win 31.4π!</p>
              ) : (
                <p className="text-red-400 font-semibold">❌ Game Over</p>
              )}
              {winReason && (
                <p className="text-xs text-yellow-400 italic mt-1">{winReason}</p>
              )}
            </div>
          )}
        </>
      )}

      <div className="mt-4 text-xs text-cyan-200 space-y-1">
        <p>Attempt: {attempts}</p>
        <p>Stacked: {stack.length - 1} / {MAX_LAYERS}</p>
        <p>Speed: {speed}ms</p>
        <p>Successful Stacks: {successfulStacks}</p>
      </div>

      <style>{`
        .animate-fall-down {
          animation: fall-down 0.7s ease-out forwards;
        }
        @keyframes fall-down {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(120px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
