'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import '@fontsource/orbitron';

export default function PiToTheMoonPage() {
  const [timeLeft, setTimeLeft] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  // Competition data
  const startsAt = ''; // TBA
  const endsAt = '2025-10-01T18:00:00Z';
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

      {/* Date & Status */}
      <div className="flex justify-center items-center gap-4 text-sm">
        <span className="bg-white/10 px-3 py-1 rounded-full text-cyan-200 font-medium">
          {formattedDate}
        </span>
        <span className="bg-gradient-to-r from-orange-400 to-orange-500 px-3 py-1 rounded-full animate-pulse">
          Coming Soon
        </span>
      </div>

      {/* Main Details Panel */}
    <div className="bg-white/5 rounded-lg p-6 text-sm space-y-4">
  <p>
    <span className="font-semibold text-cyan-300">Prize:</span>{' '}
    7,500 π
  </p>
  <p>
    <span className="font-semibold text-cyan-300">Winners:</span>{' '}
    Multiple Winners
  </p>
  <p>
    <span className="font-semibold text-cyan-300">Entry Fee:</span>{' '}
    Free
  </p>
  <p>
    <span className="font-semibold text-cyan-300">Start:</span>{' '}
    TBA
  </p>
  <p>
    <span className="font-semibold text-cyan-300">Draw Date:</span>{' '}
    TBA
  </p>
  <p>
    <span className="font-semibold text-cyan-300">Total Tickets:</span>{' '}
    {total.toLocaleString()}
  </p>
  <p>
    <span className="font-semibold text-cyan-300">Location:</span>{' '}
    Online Global Draw
  </p>

  <hr className="border-gray-700 my-4" />




{/* ──────────────────────────────────────────── */}
{/* HOW IT WORKS / STEPS */}
{/* ──────────────────────────────────────────── */}
<div className="bg-white/5 rounded-lg p-6 text-sm space-y-4">
  <h3 className="text-lg font-semibold text-white">How It Works</h3>
  <div className="flex flex-col sm:flex-row justify-between gap-4">
    <div className="flex-1 flex items-start space-x-3">
      <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-cyan-300 text-black font-bold rounded-full">
        1
      </div>
      <p>Sign up for an Oh My Competitions account</p>
    </div>
    <div className="flex-1 flex items-start space-x-3">
      <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-cyan-300 text-black font-bold rounded-full">
        2
      </div>
      <p>Earn your free ticket automatically when the app launches</p>
    </div>
    <div className="flex-1 flex items-start space-x-3">
      <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-cyan-300 text-black font-bold rounded-full">
        3
      </div>
      <p>Get the live draw results right in the app</p>
    </div>
    <div className="flex-1 flex items-start space-x-3">
      <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-cyan-300 text-black font-bold rounded-full">
        4
      </div>
      <p>Claim your prize instantly to your Pi wallet</p>
    </div>
  </div>
</div>

{/* ──────────────────────────────────────────── */}
{/* PRIZE POOL BREAKDOWN */}
{/* ──────────────────────────────────────────── */}
<div className="bg-white/5 rounded-lg p-6 text-sm space-y-4">
  <h3 className="text-lg font-semibold text-white">Prize Pool Breakdown</h3>
  <table className="w-full text-left text-xs">
    <thead>
      <tr className="border-b border-gray-700">
        <th className="pb-2">Place</th>
        <th className="pb-2">Prize</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-700">
      <tr>
        <td className="py-2">1<sup>st</sup> Place</td>
        <td className="py-2">3,000 π</td>
      </tr>
      <tr>
        <td className="py-2">2<sup>nd</sup>–5<sup>th</sup> Place</td>
        <td className="py-2">1,000 π each</td>
      </tr>
      <tr>
        <td className="py-2">6<sup>th</sup>–10<sup>th</sup> Place</td>
        <td className="py-2">100 π each</td>
      </tr>
    </tbody>
  </table>
</div>



{/* ──────────────────────────────────────────── */}
{/* ACCESSIBILITY INDICATORS */}
{/* ──────────────────────────────────────────── */}
<div className="bg-white/5 rounded-lg p-6 text-sm flex flex-wrap justify-center gap-6">
  <div className="flex items-center space-x-2">
    {/* Replace with your SVG icon */}
    <span className="w-5 h-5 bg-cyan-300 rounded-full flex items-center justify-center text-black font-bold">✔</span>
    <span>Free to enter</span>
  </div>
  <div className="flex items-center space-x-2">
    <span className="w-5 h-5 bg-cyan-300 rounded-full flex items-center justify-center text-black font-bold">🌐</span>
    <span>Global draw</span>
  </div>
  <div className="flex items-center space-x-2">
    <span className="w-5 h-5 bg-cyan-300 rounded-full flex items-center justify-center text-black font-bold">🤝</span>
    <span>No purchase necessary</span>
  </div>
</div>
  {/* Centered Toggle */}
  <div className="flex justify-center">
    <button
      onClick={() => setShowDetails(!showDetails)}
      className="text-xs text-cyan-300 underline hover:text-cyan-400 focus:outline-none"
    >
      {showDetails
        ? 'Hide full competition details'
        : 'Show full competition details'}
    </button>
  </div>
  {/* Dropdown Content */}
  {showDetails && (
    <div className="mt-4 space-y-3 text-left text-sm">
      <p className="text-white italic">
        This competition is a special thank-you to our early Oh My Competitions
        users who believed in us from day one. Your support helped us launch
        and grow—every ticket you’ve purchased brings us closer to bigger
        prizes and more fun for everyone. We couldn’t have done it without you!
      </p>
      <p className="text-cyan-200 italic">
        We’ll open entries once the app is fully up and running, and a free
        ticket will be automatically credited to your account for simply
        using the platform and helping us grow.
      </p>
    </div>
  )}
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

      {/* Coming Soon Button */}
      <div className="flex justify-center mt-6">
        <button
          disabled
          className="bg-cyan-300 text-black font-bold text-lg px-8 py-3 rounded-2xl shadow-[0_0_20px_#00ffd5aa] opacity-70 cursor-not-allowed"
        >
          Coming Soon
        </button>
      </div>

      {/* Terms link */}
      <div className="text-center pt-4">
        <Link href="/terms-conditions" className="text-sm text-cyan-300 underline hover:text-cyan-400">
          View Full Terms & Conditions
        </Link>
      </div>
    </section>
  );
}
