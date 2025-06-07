'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PiCashHeroBanner() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  // Fetch real data from the correct endpoint
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/pi-cash-code');
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error('Failed to fetch PiCash data:', err);
      }
    };
    fetchData();
  }, []);

  // Setup countdown timer
  useEffect(() => {
    if (!data?.expiresAt) return;

    const target = new Date(data.expiresAt).getTime();

    const calculate = () => {
      const now = Date.now();
      const diff = target - now;

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

    calculate();
    const timer = setInterval(calculate, 1000);
    return () => clearInterval(timer);
  }, [data?.expiresAt]);

  // If no data yet, don't render anything
  if (!data) return null;

  return (
    <div className="relative w-full max-w-md sm:max-w-xl mx-auto mt-2 sm:mt-4 px-2 sm:px-4 py-4 sm:py-6 border border-cyan-500 rounded-2xl text-white text-center font-orbitron overflow-hidden shadow-[0_0_60px_#00fff055] bg-[#0b1120]/30">
      <div className="absolute inset-0 -z-10 animate-pulse bg-[radial-gradient(circle_at_center,_#00fff033,_transparent)]" />

      <h1 className="text-xl sm:text-2xl font-bold text-cyan-300 mb-2 sm:mb-3 flex items-center justify-center gap-2 animate-glow-float">
        Pi Cash Code
      </h1>

      <div className="text-center mb-2 sm:mb-1">
        <div className="inline-flex items-center gap-1 sm:gap-2 px-4 sm:px-5 py-1.5 sm:py-2 rounded-xl border border-cyan-400 bg-black/30 shadow-[0_0_15px_#00f0ff88] animate-glow-float">
          <span className="text-sm sm:text-base font-bold text-cyan-300 tracking-wide">Prize Pool:</span>
          <span className="text-cyan-400 font-extrabold text-base sm:text-lg drop-shadow-md">
            {data.prizePool.toLocaleString()} π
          </span>
        </div>
      </div>

      <div className="mt-3 sm:mt-4 mb-4 flex flex-col gap-3 items-center">
        <div className="flex gap-1 sm:gap-2 justify-center">
          {!timeLeft ? (
            <div className="text-cyan-400 text-sm sm:text-lg font-semibold">Loading timer...</div>
          ) : (
            Object.entries(timeLeft).map(([label, value], i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="bg-black text-white text-base sm:text-xl font-bold px-3 py-1 sm:px-4 sm:py-2 rounded-md shadow w-12 text-center">
                  {String(value).padStart(2, '0')}
                </div>
                <div className="mt-1 text-[10px] sm:text-xs text-cyan-400 font-semibold">
                  {label.toUpperCase()}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="w-[90%] max-w-xs">
          <button
            onClick={() => router.push('/pi-cash-code')}
            className="w-full py-1 text-sm sm:text-base bg-gradient-to-r from-[#00F0FF] to-[#00C2FF] rounded-md text-black font-bold shadow hover:scale-[1.02] transition"
          >
            Enter Now
          </button>
        </div>
      </div>

      <div className="mt-4 sm:mt-6 text-center text-xs sm:text-sm">
        <ul className="list-disc list-inside space-y-1 text-white/80 text-left max-w-xs mx-auto">
          <li>The code drops every Monday at <span className="font-bold text-white">3:14 PM UTC</span></li>
          <li>Stays active for <span className="font-bold text-white">31h 4m</span></li>
          <li>Draw is every Friday at <span className="font-bold text-white">3:14 PM UTC</span></li>
          <li>Winner has <span className="font-bold text-white">31m 4s</span> to submit the code</li>
        </ul>
      </div>
    </div>
  );
}
