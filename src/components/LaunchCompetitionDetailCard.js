'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import '@fontsource/orbitron';

export default function LaunchCompetitionDetailCard({
  comp,
  title,
  prize,
  fee,
  imageUrl,
  endsAt,
  startsAt,
  ticketsSold,
  totalTickets,
  status,
}) {
  const formattedStart = startsAt
    ? new Date(startsAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'TBA';

  const formattedEnd = endsAt
    ? new Date(endsAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'TBA';

  const availableTickets = Math.max(
    0,
    (totalTickets ?? 0) - (ticketsSold ?? 0)
  );

  const percent =
    totalTickets > 0
      ? Math.min(100, Math.floor((ticketsSold / totalTickets) * 100))
      : 0;

  // Countdown timer
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!endsAt) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const end = new Date(endsAt).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft('Draw closed');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setTimeLeft(`${days}d ${hours}h ${mins}m`);
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 60000); // update every min
    return () => clearInterval(timer);
  }, [endsAt]);

  return (
    <div className="flex justify-center py-0">
      <div className="relative w-full max-w-xl">
        {/* Outer Glow */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-green-400/15 via-cyan-500/10 to-blue-500/15 blur-xl" />
        <div className="relative rounded-3xl p-[1.5px] bg-[linear-gradient(135deg,rgba(0,255,213,0.6),rgba(0,119,255,0.5))]">
          {/* Card body */}
          <section className="rounded-3xl bg-[#0b1220]/95 backdrop-blur-xl border border-cyan-300 text-white font-orbitron p-5 sm:p-6">
            {/* Title */}
            <h2 className="text-2xl sm:text-[28px] font-extrabold tracking-wide text-center bg-gradient-to-r from-green-300 via-cyan-300 to-blue-300 bg-clip-text text-transparent drop-shadow">
              {title}
            </h2>
            <p className="mt-2 text-center text-cyan-300 text-sm italic">
              Your journey to victory starts here — play smart, dream big, and claim the Pi prize!
            </p>

            {/* Status */}
            {status === 'active' && (
              <div className="mt-4 text-center">
                <span className="inline-block rounded-full bg-gradient-to-r from-green-400 to-green-600 text-black font-bold px-4 py-1 animate-pulse">
                  Live Now
                </span>
                <div className="mt-2 text-cyan-300 text-sm">
                   Draw Date: <span className="text-white">{formattedEnd}</span>
                </div>
                <div className="text-lg font-bold text-cyan-300 mt-1">
                   {timeLeft}
                </div>
              </div>
            )}
            {status === 'upcoming' && (
              <div className="mt-4 text-center">
                <span className="inline-block rounded-full bg-yellow-400 text-black font-bold px-4 py-1">
                  ⏳ Coming Soon
                </span>
              </div>
            )}
            {status === 'ended' && (
              <div className="mt-4 text-center">
                <span className="inline-block rounded-full bg-red-500 text-white font-bold px-4 py-1">
                  ❌ Closed
                </span>
              </div>
            )}

{/* Prize Breakdown */}
{(comp?.prizeBreakdown || comp?.firstPrize || comp?.secondPrize || comp?.thirdPrize) && (
  <div className="mt-5 flex flex-col items-center gap-3">
    <div className="flex flex-wrap justify-center gap-3">
      <Stat
        label="1st Prize"
        value={`${comp?.prizeBreakdown?.first ?? comp?.firstPrize ?? '—'} π`}
        customClass="border-yellow-300/50 bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 text-yellow-300 shadow-[0_0_15px_rgba(255,215,0,0.5)]"
      />
      <Stat
        label="2nd Prize"
        value={`${comp?.prizeBreakdown?.second ?? comp?.secondPrize ?? '—'} π`}
        customClass="border-gray-300/50 bg-gradient-to-r from-gray-300/20 to-gray-500/20 text-gray-300 shadow-[0_0_15px_rgba(192,192,192,0.5)]"
      />
      <Stat
        label="3rd Prize"
        value={`${comp?.prizeBreakdown?.third ?? comp?.thirdPrize ?? '—'} π`}
        customClass="border-orange-300/50 bg-gradient-to-r from-orange-400/20 to-orange-600/20 text-orange-300 shadow-[0_0_15px_rgba(205,127,50,0.5)]"
      />
    </div>
  </div>
)}



            {/* Key Details */}
            <div className="mt-5 grid grid-cols-2 gap-3">
              <Stat
                label="Tickets Sold"
                value={`${ticketsSold ?? 0} / ${totalTickets ?? 0}`}
                customClass="border-cyan-300/50 text-cyan-300"
              />
              <Stat
                label="Available"
                value={`${availableTickets} left`}
                customClass="border-cyan-300/50 text-cyan-300"
              />
              <Stat
                label="Winners"
                value={comp.winners || 'Multiple'}
                customClass="border-cyan-300/50 text-cyan-300"
              />
              <Stat
                label="Max/User"
                value={comp.maxTicketsPerUser || 'N/A'}
                customClass="border-cyan-300/50 text-cyan-300"
              />
            </div>

            {/* Progress Bar */}
            <div className="mt-5">
              <div className="flex items-center justify-between text-[11px] text-white mb-1">
                <span>Progress</span>
                <span>{percent}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-white overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-green-400 via-cyan-400 to-blue-400 transition-[width] duration-700 ease-out"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>

            {/* CTA */}
            <div className="mt-6 flex justify-center">
              <Link
                href={`/competitions/${comp.slug}/enter`}
                className="w-full py-2 rounded-md font-bold text-black bg-gradient-to-r from-[#00ffd5] to-[#0077ff] hover:from-[#00e6c7] hover:to-[#0066e6] transition-transform duration-200 hover:scale-105 mt-1 text-center"
              >
                Enter Now
              </Link>
            </div>

            {/* Terms */}
            <div className="mt-4 text-center">
              <Link
                href="/terms-conditions"
                className="text-sm text-cyan-300 underline hover:text-cyan-200"
              >
                View Full Terms & Conditions
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, highlight = false, strong = false, customClass = '' }) {
  return (
    <div
      className={`rounded-xl border px-3 py-2 text-[12px] ${customClass} ${
        highlight
          ? 'border-amber-300/30 bg-amber-300/10'
          : !customClass
          ? 'border-white/10 bg-white/5'
          : ''
      }`}
    >
      <div
        className={`uppercase tracking-wide ${
          highlight ? 'text-amber-200' : 'text-cyan-300'
        } text-[11px]`}
      >
        {label}
      </div>
      <div
        className={`mt-0.5 ${
          strong ? 'text-white font-bold' : 'text-white/90'
        }`}
      >
        {value}
      </div>
    </div>
  );
}
