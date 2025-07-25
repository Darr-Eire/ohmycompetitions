'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import '@fontsource/orbitron';

export default function PiToTheMoonPage() {
  const [timeLeft, setTimeLeft] = useState('');

  // Competition data
  const startsAt = ''; // TBA
  const endsAt = '2025-08-31T18:00:00Z';
  const total = 5000;
  const sold = 0;
  const percent = Math.min(100, Math.floor((sold / total) * 100));

  // Countdown
  useEffect(() => {
    if (!endsAt) return;

    const end = new Date(endsAt).getTime();

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft('Ended');
      } else {
        const hrs = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${hrs}h ${mins}m ${secs}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endsAt]);

  const formattedDate = endsAt
    ? new Date(endsAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'TBA';

  return (
    <section className="w-full py-10 px-4 bg-gradient-to-r from-[#111827] to-[#0f172a] rounded-2xl border border-cyan-400 shadow-[0_0_40px_#00f2ff44] text-white font-orbitron max-w-2xl mx-auto text-center space-y-6">
      <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wide">
        ✦ Pi To The Moon ✦
      </h2>

      <div className="flex justify-center items-center gap-4 text-sm">
        <span className="bg-white/10 px-3 py-1 rounded-full text-cyan-200 font-medium">
          {formattedDate}
        </span>
        <span className="bg-gradient-to-r from-orange-400 to-orange-500 px-3 py-1 rounded-full animate-pulse">
          Coming Soon
        </span>
      </div>

      <div className="bg-white/5 rounded-lg p-4 text-sm space-y-2">
        <p><span className="font-semibold text-cyan-300">Prize:</span> 10,000 π</p>
        <p><span className="font-semibold text-cyan-300">Entry Fee:</span> <span>Free</span></p>
        <p><span className="font-semibold text-cyan-300">Start:</span> TBA</p>
        <p><span className="font-semibold text-cyan-300">Draw Date:</span> TBA</p>
        <p><span className="font-semibold text-cyan-300">Total Tickets:</span> {total.toLocaleString()}</p>
        <p><span className="font-semibold text-cyan-300">Location:</span> Online Global Draw</p>
        <p className="text-cyan-200 italic pt-2">
          This competition will start soon and is dedicated to early users of Oh My Competitions who made a purchase and helped us launch and grow stronger!
        </p>
      </div>

      <div className="w-full">
        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#00ffd5] via-blue-400 to-[#0077ff]"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Sold: <span className="text-white">{sold.toLocaleString()}</span> / {total.toLocaleString()} ({percent}%)
        </p>
      </div>

      <div className="flex justify-center mt-6">
        <button
          disabled
          className="bg-cyan-300 text-black font-bold text-lg px-8 py-3 rounded-2xl shadow-[0_0_20px_#00ffd5aa] opacity-70 cursor-not-allowed"
        >
          Enter Now
        </button>
      </div>

      <div className="text-center pt-4">
        <Link href="/terms-conditions" className="text-sm text-cyan-300 underline hover:text-cyan-400">
          View Full Terms & Conditions
        </Link>
      </div>
    </section>
  );
}
