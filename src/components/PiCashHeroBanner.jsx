'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PiCashHeroBanner() {
  const router = useRouter();
  const [codeData, setCodeData] = useState(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const fetchCode = async () => {
      try {
        const res = await fetch('/api/pi-cash-code');
        const data = await res.json();
        setCodeData(data);
      } catch (err) {
        console.error('Failed to load code:', err);
      }
    };
    fetchCode();
  }, []);

  useEffect(() => {
    if (!codeData?.expiresAt) return;

    const getRemainingTime = (end) => {
      const total = Date.parse(end) - Date.now();
      const seconds = Math.floor((total / 1000) % 60);
      const minutes = Math.floor((total / 1000 / 60) % 60);
      const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
      const days = Math.floor(total / (1000 * 60 * 60 * 24));
      return { total, days, hours, minutes, seconds };
    };

    const timer = setInterval(() => {
      const updated = getRemainingTime(codeData.expiresAt);
      setTimeLeft(updated);
      if (updated.total <= 0) clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, [codeData?.expiresAt]);

  return (
    <div className="relative max-w-xl mx-auto mt-4 px-4 py-6 border border-cyan-500 rounded-2xl text-white text-center font-orbitron overflow-hidden shadow-[0_0_60px_#00fff055] bg-[#0b1120]/30">
      <div className="absolute inset-0 -z-10 animate-pulse bg-[radial-gradient(circle_at_center,_#00fff033,_transparent)]" />

      <h1 className="text-2xl sm:text-3xl font-bold text-cyan-300 mb-3 flex items-center justify-center gap-2 animate-glow-float">
        Pi Cash Code
      </h1>

      <div className="text-lg font-mono text-cyan-300">
  {codeData?.code || 'Loading...'}
</div>


      <div className="text-center mb-1">
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-xl border border-cyan-400 bg-black/30 shadow-[0_0_15px_#00f0ff88] animate-glow-float">
          <span className="text-base sm:text-lg font-bold text-cyan-300 tracking-wide">Current Prize Pool:</span>
          <span className="text-cyan-400 font-extrabold text-lg sm:text-xl drop-shadow-md">
            {codeData?.prizePool?.toLocaleString() || '...'} π
          </span>
        </div>
      </div>

      {/* Timer */}
      <div className="mt-4 mb-6 flex gap-2 justify-center">
        {[{ label: 'DAYS', value: timeLeft.days }, { label: 'HOURS', value: timeLeft.hours }, { label: 'MINUTES', value: timeLeft.minutes }, { label: 'SECONDS', value: timeLeft.seconds }].map(({ label, value }, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="bg-black text-white text-xl font-bold px-4 py-2 rounded-md shadow w-16 text-center">
              {String(value).padStart(2, '0')}
            </div>
            <div className="mt-1 text-xs text-cyan-400 font-semibold">{label}</div>
          </div>
        ))}
      </div>

      <button
        onClick={() => router.push('/pi-cash-code')}
        className="w-full py-2 text-sm bg-gradient-to-r from-[#00F0FF] to-[#00C2FF] rounded-md text-black font-bold shadow hover:scale-[1.02] transition"
      >
        Enter Now
      </button>

      <div className="mt-4 text-center text-sm">
        <h3 className="text-lg font-bold text-cyan-300 mb-2">How It Works</h3>
        <ul className="list-disc list-inside space-y-1 text-white/80">
          <li>The code drops every Monday at <span className="font-bold text-white">3:14 PM UTC</span>.</li>
          <li>It remains active for <span className="font-bold text-white">31 hours and 4 minutes</span>.</li>
          <li>Friday draw at <span className="font-bold text-white">3:14 PM UTC</span>.</li>
          <li>The winner must return the code within <span className="font-bold text-white">31 minutes and 4 seconds</span>.</li>
        </ul>
      </div>
    </div>
  );
}
