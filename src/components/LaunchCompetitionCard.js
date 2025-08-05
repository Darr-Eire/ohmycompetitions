'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function LaunchCompetitionCard({ comp = {}, title, prize, imageUrl }) {
  const {
    slug = '',
    entryFee = 0,
    totalTickets = 100,
    ticketsSold = 0,
    startsAt,
    endsAt,
    comingSoon = false,
    prizeBreakdown = {},
  } = comp;

  const [status, setStatus] = useState('UPCOMING');
  const [timeLeft, setTimeLeft] = useState('');
  const [showCountdown, setShowCountdown] = useState(false);

  const sold = ticketsSold || 0;
  const total = totalTickets || 100;
  const remaining = Math.max(0, total - sold);
  const progress = total > 0 ? Math.round((sold / total) * 100) : 0;

  const isSoldOut = sold >= total;
  const isLowStock = remaining <= total * 0.1 && remaining > 0;
  const isNearlyFull = remaining <= total * 0.25 && remaining > 0;

  useEffect(() => {
    if (!endsAt || comingSoon) {
      setStatus('COMING SOON');
      setShowCountdown(false);
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const start = new Date(startsAt).getTime();
      const end = new Date(endsAt).getTime();

      if (now < start) {
        setStatus('UPCOMING');
        setShowCountdown(false);
        return;
      }

      const diff = end - now;
      if (diff <= 0) {
        setStatus('ENDED');
        setShowCountdown(false);
        clearInterval(interval);
        return;
      }

      setStatus('LIVE NOW');
      setShowCountdown(diff <= 24 * 60 * 60 * 1000);

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);

      let time = '';
      if (d > 0) time += `${d}D `;
      if (h > 0 || d > 0) time += `${h}H `;
      if (m > 0 || h > 0 || d > 0) time += `${m}M `;
      if (d === 0 && h === 0) time += `${s}S`;

      setTimeLeft(time.trim());
    }, 1000);

    return () => clearInterval(interval);
  }, [endsAt, startsAt, comingSoon]);

  return (
    <div className="flex flex-col w-full max-w-xs mx-auto bg-[#0f172a] border border-cyan-600 rounded-2xl shadow-lg text-white font-orbitron overflow-hidden transition-transform duration-300 hover:scale-[1.03]">
      
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
        <h3 className="text-base font-bold text-white">{title || 'Launch Competition'}</h3>
        <span className="text-xs bg-cyan-500 text-black px-2 py-1 rounded-full whitespace-nowrap">
          Launch Week
        </span>
      </div>

      {/* Status */}
      <div className="px-4 pb-1">
        <div className={`text-center text-xs font-bold py-1 rounded-md ${
          status === 'LIVE NOW'
            ? 'bg-green-400 text-black animate-pulse'
            : status === 'COMING SOON'
              ? 'bg-yellow-500 text-black'
              : status === 'ENDED'
                ? 'bg-red-600 text-white'
                : 'bg-orange-500 text-black'
        }`}>
          {status}
        </div>
      </div>

      {/* Multiple Winners Banner */}
      <div className="text-center text-xs bg-cyan-500 text-black font-semibold py-1 mt-2 mx-4 rounded-md">
        1st, 2nd & 3rd Prizes
      </div>

      {/* Timer */}
      {showCountdown && (
        <div className="text-center mt-2 text-cyan-300 text-sm font-bold">{timeLeft}</div>
      )}

      {/* Main Details */}
      <div className="p-4 text-sm space-y-3">
        <div className="flex justify-between">
          <span className="text-cyan-300">1st Prize</span>
          <span>{prize ? `${prize} π` : 'TBA'}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-cyan-300">Entry Fee</span>
          <span>{comingSoon ? 'TBA' : `${entryFee.toFixed(2)} π`}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-cyan-300">Tickets</span>
          <span>{comingSoon ? 'TBA' : `${sold.toLocaleString()} / ${total.toLocaleString()}`}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-cyan-300">Draw Date</span>
          <span>{endsAt ? new Date(endsAt).toLocaleDateString() : 'TBA'}</span>
        </div>

        {/* Ticket Progress and Warnings */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Tickets</span>
            <div className="text-right">
              {status === 'COMING SOON' ? (
                <span className="text-sm font-semibold text-gray-300">TBA</span>
              ) : (
                <span className={`text-sm font-semibold ${
                  isSoldOut ? 'text-red-400' : 
                  isLowStock ? 'text-orange-400' : 
                  isNearlyFull ? 'text-yellow-400' : 
                  'text-gray-300'
                }`}>
                  Sold: {progress}% ({sold.toLocaleString()} / {total.toLocaleString()})
                </span>
              )}
              {isSoldOut && (
                <div className="text-xs text-red-400 font-bold">SOLD OUT</div>
              )}
              {isLowStock && !isSoldOut && (
                <div className="text-xs text-orange-400 font-bold">
                  Only {remaining} left!
                </div>
              )}
              {isNearlyFull && !isLowStock && !isSoldOut && (
                <div className="text-xs text-yellow-400">
                  {remaining} remaining
                </div>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-700 rounded-full h-2">
            {status === 'COMING SOON' ? (
              <div className="h-2 w-[20%] bg-gray-400 rounded-full animate-pulse" />
            ) : (
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  isSoldOut ? 'bg-red-500' :
                  isLowStock ? 'bg-orange-500' :
                  isNearlyFull ? 'bg-yellow-500' :
                  'bg-blue-500'
                }`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            )}
          </div>
        </div>

        {/* CTA Button */}
        <Link href={`/competitions/${slug}`} className="block mt-4">
          <button
            disabled={comingSoon}
            className={`w-full py-2 rounded-lg font-bold text-center ${
              comingSoon
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-300 to-blue-500 text-black hover:opacity-90 transition'
            }`}
          >
            {comingSoon ? 'Coming Soon' : `Enter Now`}
          </button>
        </Link>
      </div>
    </div>
  );
}
