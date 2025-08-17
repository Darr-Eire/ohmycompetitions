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
      const start = startsAt ? new Date(startsAt).getTime() : 0;
      const end = new Date(endsAt).getTime();

      if (start && now < start) {
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
    <div
      className="
        flex flex-col w-full max-w-xs mx-auto
        bg-[#0f172a] border border-cyan-600 rounded-2xl shadow-lg
        text-white font-orbitron overflow-hidden
        select-none
        transition-colors duration-200
        hover:shadow-[0_0_24px_rgba(0,255,213,0.18)]
        focus:outline-none focus-visible:outline-none
      "
      // Kill the blue tap highlight on mobile Safari and avoid any transform jitter
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      {/* Header / Title */}
      <div className="px-4 pt-4 text-center">
        <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-cyan-300 to-blue-500 text-transparent bg-clip-text drop-shadow-md">
          {title}
        </h3>
      </div>

      {/* Status */}
      <div className="px-4 pt-2">
        <div
          className={`text-center text-xs font-bold py-1 rounded-md ${
            status === 'LIVE NOW'
              ? 'bg-green-400 text-black'
              : status === 'COMING SOON'
              ? 'bg-yellow-500 text-black'
              : status === 'ENDED'
              ? 'bg-red-600 text-white'
              : 'bg-orange-500 text-black'
          }`}
        >
          {status}
        </div>
      </div>

      {/* Multiple Winners Banner */}
      <div className="text-center text-xs bg-cyan-500 text-black font-semibold py-1 mt-2 mx-4 rounded-md">
        1st, 2nd & 3rd Prizes
      </div>

      {/* Subline */}
      <p className="text-center text-xs text-white mt-4">
        Join us this Launch Week and be part of Pi history
      </p>

      {/* Countdown */}
      {showCountdown && (
        <div className="text-center mt-2 text-cyan-300 text-sm font-bold">{timeLeft}</div>
      )}

      {/* Body */}
      <div className="p-4 text-sm space-y-3">
        {/* 1st Prize compact row */}
        <div
          className="
            flex flex-col items-center justify-center
            rounded-md border border-cyan-400/40
            bg-[#0b1220]/80 px-4 py-2
            shadow-[0_0_6px_rgba(0,255,213,0.12)]
          "
        >
          <span className="text-[14px] uppercase tracking-wide text-cyan-300 font-semibold">
            1st Prize
          </span>
          <span className="font-extrabold text-white text-lg tabular-nums tracking-wide mt-0.5">
            {prize ? `${prize} π` : 'TBA'}
          </span>
        </div>

        {/* Key facts */}
        <div className="flex justify-between items-center">
          <span className="text-cyan-300 font-medium">Entry Fee</span>
          <span className="text-white font-semibold">
            {comingSoon ? 'TBA' : `${entryFee.toFixed(2)} π`}
          </span>
        </div>

        <p className="flex justify-between">
          <span className="text-cyan-300">Max Per User:</span>
          <span>
            {comp?.comp?.maxTicketsPerUser
              ? comp.comp.maxTicketsPerUser.toLocaleString()
              : comp?.maxTicketsPerUser
              ? comp.maxTicketsPerUser.toLocaleString()
              : 'TBA'}
          </span>
        </p>

        <p className="flex justify-between">
          <span className="text-cyan-300">Winners:</span>
          <span>
            {comp?.comp?.winners
              ? comp.comp.winners
              : comp?.winners
              ? comp.winners
              : 'TBA'}
          </span>
        </p>

        <div className="flex justify-between">
          <span className="text-cyan-300">Draw Date</span>
          <span>{endsAt ? new Date(endsAt).toLocaleDateString() : 'TBA'}</span>
        </div>

        {/* Tickets */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-cyan-300">Tickets Sold</span>
            <div className="text-right">
              {status === 'COMING SOON' ? (
                <span className="text-sm font-semibold text-gray-300">TBA</span>
              ) : (
                <span
                  className={`text-sm font-semibold ${
                    isSoldOut
                      ? 'text-red-400'
                      : isLowStock
                      ? 'text-orange-400'
                      : isNearlyFull
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }`}
                >
                  {progress}% ({sold.toLocaleString()} / {total.toLocaleString()})
                </span>
              )}
              {isSoldOut && <div className="text-xs text-red-400 font-bold">SOLD OUT</div>}
              {isLowStock && !isSoldOut && (
                <div className="text-xs text-orange-400 font-bold">Only {remaining} left!</div>
              )}
              {isNearlyFull && !isLowStock && !isSoldOut && (
                <div className="text-xs text-yellow-400">{remaining} remaining</div>
              )}
            </div>
          </div>

          <div className="w-full bg-gray-700 rounded-full h-2">
            {status === 'COMING SOON' ? (
              <div className="h-2 w-[20%] bg-gray-400 rounded-full animate-pulse" />
            ) : (
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  isSoldOut
                    ? 'bg-red-500'
                    : isLowStock
                    ? 'bg-orange-500'
                    : isNearlyFull
                    ? 'bg-yellow-500'
                    : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            )}
          </div>
        </div>

        {/* CTA */}
        <Link
          href={`/competitions/${slug}`}
          className="block mt-4 focus:outline-none focus-visible:outline-none"
        >
          <button
            type="button"
            disabled={comingSoon}
            className={`
              w-full py-2 rounded-lg font-bold text-center
              transition-opacity duration-150
              ${comingSoon
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-300 to-blue-500 text-black hover:opacity-90'}
            `}
            // never scale on press
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            {comingSoon ? 'Coming Soon' : 'Enter Now'}
          </button>
        </Link>
      </div>
    </div>
  );
}
