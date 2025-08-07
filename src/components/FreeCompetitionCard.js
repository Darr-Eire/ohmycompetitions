// src/components/FreeCompetitionCard.js
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import '@fontsource/orbitron';

export default function FreeCompetitionCard({ comp, title, prize }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  const startsAt = comp?.startsAt ? new Date(comp.startsAt) : null;
  const endsAt = comp?.endsAt ? new Date(comp.endsAt) : null;

  const formattedStart = startsAt
    ? startsAt.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : 'TBA';

  const formattedEnd = endsAt
    ? endsAt.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : 'TBA';

  const sold = comp.ticketsSold ?? 0;
  const total = comp.totalTickets ?? 0;
  const percent = total > 0 ? Math.min(100, Math.floor((sold / total) * 100)) : 0;

  useEffect(() => {
    if (!endsAt) return;
    const interval = setInterval(() => {
      const now = Date.now();
      const diff = endsAt.getTime() - now;
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

  return (
    <div className="flex justify-center py-8">
      <section className="w-full max-w-lg bg-gradient-to-r from-[#111827] to-[#0f172a] rounded-2xl border border-cyan-400 shadow-[0_0_40px_#00f2ff44] text-white font-orbitron text-center p-6 space-y-6">
        {/* Header */}
        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wide">
           {title} 
        </h2>

        {/* Draw Date & Status */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 text-sm">
          <span className="bg-white/10 px-3 py-1 rounded-full text-cyan-200 font-medium">
            📅 Draw Date: {formattedEnd}
          </span>
          <span className="bg-gradient-to-r from-orange-400 to-orange-500 text-black font-bold px-3 py-1 rounded-full animate-pulse">
            Coming Soon
          </span>
        </div>

        {/* Main Details Panel */}
   {/* Main Details Panel */}
<div className="bg-white/5 rounded-lg p-6 text-sm text-gray-200 space-y-3 text-left">
  <div className="flex justify-between">
    <span className="font-semibold text-cyan-300">Prize:</span>
    <span>{prize}</span>
  </div>
  <div className="flex justify-between">
    <span className="font-semibold text-cyan-300">Winners:</span>
    <span>Multiple Winners</span>
  </div>
  <div className="flex justify-between">
    <span className="font-semibold text-cyan-300">Entry Fee:</span>
    <span className="font-bold">FREE</span>
  </div>
  <div className="flex justify-between">
    <span className="font-semibold text-cyan-300">Start:</span>
    <span>{formattedStart}</span>
  </div>
  <div className="flex justify-between">
    <span className="font-semibold text-cyan-300">Draw Date:</span>
    <span>{formattedEnd}</span>
  </div>
  <div className="flex justify-between">
    <span className="font-semibold text-cyan-300">Total Tickets:</span>
    <span>{total.toLocaleString()}</span>
  </div>
  <div className="flex justify-between">
    <span className="font-semibold text-cyan-300">Location:</span>
    <span>{comp.location || 'Online Global Draw'}</span>
  </div>
</div>


        {/* Progress Bar & Sold */}
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

        {/* View Details Button */}
        <div className="flex justify-center mt-6">
          <Link
            href={`/competitions/${comp.slug}`}
            className="bg-gradient-to-r from-[#00ffd5] to-[#0077ff] text-black font-bold text-lg px-6 py-2 rounded-2xl shadow-[0_0_20px_#00ffd5aa] hover:scale-105 transition-transform duration-200"
          >
            View Details
          </Link>
        </div>

        {/* Terms link */}
        <div className="text-center pt-4">
          <Link href="/terms-conditions" className="text-sm text-cyan-300 underline hover:text-cyan-400">
            View Full Terms & Conditions
          </Link>
        </div>
      </section>
    </div>
  );
}
