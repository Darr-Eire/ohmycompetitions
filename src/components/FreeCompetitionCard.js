// src/components/FreeCompetitionCard.js
'use client';

import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import '@fontsource/orbitron';

export default function FreeCompetitionCard({ comp = {}, title, prize }) {
  const [timeLeft, setTimeLeft] = useState('');

  const startsAt = comp?.startsAt ? new Date(comp.startsAt) : null;
  const endsAt   = comp?.endsAt   ? new Date(comp.endsAt)   : null;

  const formattedStart = startsAt
    ? startsAt.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : 'TBA';

  const formattedEnd = endsAt
    ? endsAt.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : 'TBA';

  const sold  = comp?.ticketsSold ?? 0;
  const total = comp?.totalTickets ?? 0;
  const percent = total > 0 ? Math.min(100, Math.floor((sold / total) * 100)) : 0;

  const statusLabel = useMemo(() => {
    if (!startsAt && !endsAt) return 'Coming Soon';
    const now = Date.now();
    if (startsAt && now < startsAt.getTime()) return 'Coming Soon';
    if (endsAt && now >= endsAt.getTime())   return 'Closed';
    return 'Open';
  }, [startsAt, endsAt]);

  useEffect(() => {
    if (!endsAt) return;
    const tick = () => {
      const now = Date.now();
      const diff = endsAt.getTime() - now;
      if (diff <= 0) setTimeLeft('Ended');
      else {
        const hrs  = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${hrs}h ${mins}m ${secs}s`);
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [endsAt]);

  return (
    <div className="flex justify-center py-8">
      {/* Outer glow & animated border frame */}
      <div className="relative w-full max-w-xl">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-400/15 via-blue-500/10 to-fuchsia-500/15 blur-xl" />
        <div className="relative rounded-3xl p-[1.5px] bg-[linear-gradient(135deg,rgba(0,255,213,0.6),rgba(0,119,255,0.5))] [mask-composite:exclude]">
          {/* Card body */}
          <section className="rounded-3xl bg-[#0b1220]/95 backdrop-blur-xl border border-white/10 text-white font-orbitron p-5 sm:p-6">

            {/* Top row: Title + status */}
            <div className="flex flex-col items-center gap-3">
              <h2 className="text-2xl sm:text-[28px] font-extrabold tracking-wide text-center bg-gradient-to-r from-cyan-300 via-sky-300 to-blue-300 bg-clip-text text-transparent drop-shadow">
                {title}
              </h2>

              <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-cyan-200">
                  📅 Draw: <span className="text-white">{formattedEnd}</span>
                </span>

                <span
                  className={`rounded-full px-3 py-1 font-bold ${statusLabel === 'Open'
                    ? 'bg-emerald-400 text-black'
                    : statusLabel === 'Closed'
                    ? 'bg-rose-500 text-white'
                    : 'bg-gradient-to-r from-orange-400 to-amber-500 text-black animate-pulse'
                  }`}
                >
                  {statusLabel}
                </span>

                {timeLeft && (
                  <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-cyan-200">
                    ⏳ {timeLeft}
                  </span>
                )}
              </div>
            </div>

            {/* Stats / details */}
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-2">
              <StatChip label="Prize" value={prize} highlight />
              <StatChip label="Entry Fee" value="FREE" strong />
              <StatChip label="Winners" value="Multiple" />
              <StatChip label="Start" value={formattedStart} />
              <StatChip label="Draw Date" value={formattedEnd} />
              <StatChip label="Location" value={comp.location || 'Global • Online'} />
            </div>

            {/* Progress */}
            <div className="mt-5">
              <div className="flex items-center justify-between text-[11px] text-white/70 mb-1">
                <span>Tickets</span>
                <span>
                  {sold.toLocaleString()} / {total.toLocaleString()} ({percent}%)
                </span>
              </div>
              <div
                className="h-2 w-full rounded-full bg-white/10 overflow-hidden"
                role="progressbar"
                aria-valuenow={percent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Tickets sold"
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#00ffd5] via-sky-400 to-[#0077ff] transition-[width] duration-700 ease-out"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>

            {/* CTA */}
            <div className="mt-6 flex items-center justify-center">
              <Link
                href={`/competitions/${comp.slug}`}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#00ffd5] to-[#0077ff] px-6 py-2.5 text-black text-lg font-extrabold shadow-[0_0_24px_#00ffd570] hover:brightness-110 active:scale-[0.99] transition"
              >
                View Details
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Terms */}
            <div className="mt-4 text-center">
              <Link href="/terms-conditions" className="text-sm text-cyan-300 underline hover:text-cyan-200">
                View Full Terms & Conditions
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

/* ---------- tiny UI helper ---------- */
function StatChip({ label, value, highlight = false, strong = false }) {
  return (
    <div className={`rounded-xl border px-3 py-2 text-[12px] ${
      highlight
        ? 'border-amber-300/30 bg-amber-300/10'
        : 'border-white/10 bg-white/5'
    }`}>
      <div className={`uppercase tracking-wide ${highlight ? 'text-amber-200' : 'text-cyan-300'} text-[11px]`}>
        {label}
      </div>
      <div className={`mt-0.5 ${strong ? 'text-white font-bold' : 'text-white/90'}`}>
        {value}
      </div>
    </div>
  );
}
