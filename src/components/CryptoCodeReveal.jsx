import React, { useEffect, useState } from 'react';

const CryptoCodeReveal = ({ code = '????-????', isRevealed = false }) => {
  const [displayedChars, setDisplayedChars] = useState(Array(code.length).fill(''));
  const speed = 40; // ms between shuffles
  const lockDelay = 150; // ms delay per character lock

  useEffect(() => {
    if (!isRevealed) {
      setDisplayedChars(Array(code.length).fill('▓'));
      return;
    }

    const actualChars = code.split('');
    const tempChars = [...displayedChars];

    actualChars.forEach((char, idx) => {
      if (char === '-') {
        tempChars[idx] = '-';
        return;
      }

      let shuffleInterval;
      setTimeout(() => {
        shuffleInterval = setInterval(() => {
          tempChars[idx] = Math.floor(Math.random() * 10).toString();
          setDisplayedChars([...tempChars]);
        }, speed);

        // Lock the real digit after some time
        setTimeout(() => {
          clearInterval(shuffleInterval);
          tempChars[idx] = char;
          setDisplayedChars([...tempChars]);
        }, 400);
      }, idx * lockDelay);
    });
  }, [isRevealed, code]);

  return (
    <div className="w-full text-center mt-6">
      <div className="inline-flex gap-3 bg-gradient-to-br from-[#0f172a] to-black border border-cyan-600 rounded-2xl px-6 py-8 sm:px-10 sm:py-10 shadow-[inset_0_0_30px_#00ffd511] backdrop-blur-lg">

        {displayedChars.map((char, i) => (
          <div
            key={i}
            className={`w-12 sm:w-14 h-14 sm:h-16 flex items-center justify-center text-2xl sm:text-3xl font-mono rounded-md
              ${
                char === '-'
                  ? 'text-cyan-500'
                  : isRevealed
                  ? 'bg-black text-cyan-300 border border-cyan-500 shadow-[0_0_12px_#00ffeebb] hover:scale-105 transition'
                  : 'bg-[#101820] text-[#00ffcc33] border border-cyan-900 animate-pulse'
              }`}
          >
            {char}
          </div>
        ))}
      </div>

      {!isRevealed && (
        <div className="mt-4 text-cyan-400 text-sm tracking-widest font-semibold animate-fadeIn">
          Pi Code Locked — Awaiting Drop
        </div>
      )}
    </div>
  );
};

export default CryptoCodeReveal;
