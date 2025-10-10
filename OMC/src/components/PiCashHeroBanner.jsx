'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function PiCashHeroBanner() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [error, setError] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/pi-cash-code');
        if (!res.ok) throw new Error('Failed to fetch');
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error('❌ Failed to fetch PiCash data:', err);
        setError(true);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!data?.expiresAt) return;

    const target = new Date(data.expiresAt).getTime();

    const update = () => {
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

    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [data?.expiresAt]);

  if (error) {
    return <div className="text-center text-red-500">❌ Failed to load Pi Cash Code data.</div>;
  }

  if (!data) {
    return <div className="text-center text-cyan-300">Loading Pi Cash Code...</div>;
  }

  return (
    <div className="relative w-full max-w-md sm:max-w-xl mx-auto mt-2 sm:mt-4 px-2 sm:px-4 py-4 sm:py-6 border border-cyan-500 rounded-2xl text-white text-center font-orbitron overflow-hidden shadow-[0_0_60px_#00fff055] bg-[#0b1120]/30 transition-all duration-500 ease-in-out">
      <div className="absolute inset-0 -z-10 animate-pulse bg-[radial-gradient(circle_at_center,_#00fff033,_transparent)]" />

      <h1 className="text-xl sm:text-2xl font-bold text-cyan-300 mb-2 sm:mb-3 flex items-center justify-center gap-2 animate-glow-float">
        Pi Cash Code
      </h1>

      <div className="text-center mb-2 sm:mb-1">
        <div className="inline-flex items-center gap-1 sm:gap-2 px-4 sm:px-5 py-1.5 sm:py-2 rounded-xl border border-cyan-400 bg-black/30 shadow-[0_0_15px_#00f0ff88] animate-glow-float">
          <span className="text-sm sm:text-base font-bold text-cyan-300 tracking-wide">Prize Pool:</span>
          <span className="text-cyan-400 font-extrabold text-base sm:text-lg drop-shadow-md">
            {data.prizePool?.toLocaleString() ?? '0'} π
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
        <button
          onClick={() => setShowDetails(prev => !prev)}
          className="text-cyan-300 underline font-semibold hover:text-cyan-200 transition"
        >
          {showDetails ? 'Hide Details' : 'How it Works'}
        </button>

        <div
          className={`overflow-hidden transition-all duration-500 ${
            showDetails ? 'max-h-60 mt-4' : 'max-h-0'
          }`}
        >
          <ul className="list-disc list-inside space-y-1 text-white/80 text-left max-w-xs mx-auto">
            <li>The code drops every <strong className="text-white">Monday @ 3:14 PM UTC</strong></li>
            <li>Stays active for <strong className="text-white">31h 4m</strong></li>
            <li>Draw is every <strong className="text-white">Friday @ 3:14 PM UTC</strong></li>
            <li>Winner has <strong className="text-white">31m 4s</strong> to claim or it rolls over</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
