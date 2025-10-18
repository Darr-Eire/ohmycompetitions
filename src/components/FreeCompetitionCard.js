// src/components/FreeCompetitionCard.js
'use client';

import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import { useSafeTranslation } from '../hooks/useSafeTranslation';
import '@fontsource/orbitron';

function parseDateLike(v) {
  if (!v && v !== 0) return null;
  if (v instanceof Date) return Number.isFinite(v.getTime()) ? v : null;
  if (typeof v === 'number') {
    const d = new Date(v);
    return Number.isFinite(d.getTime()) ? d : null;
  }
  if (typeof v === 'string') {
    const trimmed = v.trim();
    if (!trimmed) return null;
    // numeric timestamp string?
    if (/^\d+$/.test(trimmed)) {
      const d = new Date(Number(trimmed));
      return Number.isFinite(d.getTime()) ? d : null;
    }
    const d = new Date(trimmed);
    return Number.isFinite(d.getTime()) ? d : null;
  }
  return null;
}

export default function FreeCompetitionCard({ comp = {}, title, prize }) {
  const { t } = useSafeTranslation();
  const [timeLeft, setTimeLeft] = useState('');

  // Support both flat and nested structures
  const startsAtRaw = comp?.startsAt ?? comp?.comp?.startsAt ?? null;
  const endsAtRaw   = comp?.endsAt   ?? comp?.comp?.endsAt   ?? null;

  const startsAt = parseDateLike(startsAtRaw);
  const endsAt   = parseDateLike(endsAtRaw);

  const dateFmt = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  const formattedStart = startsAt ? startsAt.toLocaleString(undefined, dateFmt) : t('tba', 'TBA');
  const formattedEnd   = endsAt   ? endsAt.toLocaleString(undefined, dateFmt)   : t('tba', 'TBA');

  const sold  = Number(comp?.ticketsSold ?? comp?.comp?.ticketsSold ?? 0);
  const total = Number(comp?.totalTickets ?? comp?.comp?.totalTickets ?? 0);
  const percent = total > 0 ? Math.min(100, Math.floor((sold / total) * 100)) : 0;

  const statusLabel = useMemo(() => {
    const now = Date.now();
    if (!startsAt && !endsAt) return t('coming_soon', 'Coming Soon');
    if (startsAt && now < startsAt.getTime()) return t('coming_soon', 'Coming Soon');
    if (endsAt && now >= endsAt.getTime())   return t('closed', 'Closed');
    return t('open', 'Open');
  }, [startsAt, endsAt, t]);

  useEffect(() => {
    if (!endsAt) return;
    const tick = () => {
      const now = Date.now();
      const diff = endsAt.getTime() - now;
      if (diff <= 0) {
        setTimeLeft(t('ended', 'Ended'));
        return;
      }
      const hrs  = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${hrs}h ${mins}m ${secs}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endsAt, t]);

  // ✅ Detect Launch Week
  const isLaunchWeek =
    (title?.toLowerCase().includes('launch week')) ||
    (comp?.slug?.includes?.('launch-week')) ||
    (comp?.comp?.slug?.includes?.('launch-week'));

  return (
    <div className="flex justify-center py-8">
      {/* Outer glow & animated border frame */}
      <div className="relative w-full max-w-xl">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-400/15 via-blue-500/10 to-fuchsia-500/15 blur-xl" />
        <div className="relative rounded-3xl p-[1.5px] bg-[linear-gradient(135deg,rgba(0,255,213,0.6),rgba(0,119,255,0.5))] [mask-composite:exclude]">
          {/* Card body */}
          <section
            className={`rounded-3xl backdrop-blur-xl border text-white font-orbitron p-5 sm:p-6
              ${isLaunchWeek
                ? 'bg-gradient-to-br from-yellow-400 via-orange-400 to-red-500 border-yellow-300 shadow-[0_0_30px_rgba(255,200,0,0.8)]'
                : 'bg-[#0b1220]/95 border-white/10'}
            `}
          >
            {/* Top row: Title + status + dates */}
            <div className="flex flex-col items-center gap-3">
              <h2
                className={`text-2xl sm:text-[28px] font-extrabold tracking-wide text-center drop-shadow
                  ${isLaunchWeek
                    ? 'text-black'
                    : 'bg-gradient-to-r from-cyan-300 via-sky-300 to-blue-300 bg-clip-text text-transparent'}
                `}
              >
                {title}
              </h2>

              <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
                {/* Show BOTH Start and Draw, pulled from real data */}
                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-cyan-200">
                  🟢 {t('start', 'Start')}: <span className="text-white">{formattedStart}</span>
                </span>
                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-cyan-200">
                  🎯 {t('draw', 'Draw')}: <span className="text-white">{formattedEnd}</span>
                </span>

                <span
                  className={`rounded-full px-3 py-1 font-bold ${
                    statusLabel === t('open', 'Open')
                      ? 'bg-emerald-400 text-black'
                      : statusLabel === t('closed', 'Closed')
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
              <StatChip label={t('prize', 'Prize')} value={prize} highlight />
              <StatChip label={t('entry_fee', 'Entry Fee')} value={t('free', 'FREE')} strong />
              <StatChip label={t('winners', 'Winners')} value={t('multiple', 'Multiple')} />
              <StatChip label={t('start', 'Start')} value={formattedStart} />
              <StatChip label={t('draw_date', 'Draw Date')} value={formattedEnd} />
              <StatChip label={t('location', 'Location')} value={comp.location || t('online', 'Online')} />
            </div>

            {/* Progress */}
            <div className="mt-5">
              <div className="flex items-center justify-between text-[11px] text-white/70 mb-1">
                <span>{t('tickets', 'Tickets')}</span>
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
                aria-label={t('tickets_sold', 'Tickets sold')}
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
                href={`/competitions/${comp.slug ?? comp?.comp?.slug ?? ''}`}
                className={`inline-flex items-center gap-2 rounded-2xl px-6 py-2.5 text-lg font-extrabold shadow-lg hover:brightness-110 active:scale-[0.99] transition
                  ${isLaunchWeek
                    ? 'bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 text-black'
                    : 'bg-gradient-to-r from-[#00ffd5] to-[#0077ff] text-black'}
                `}
              >
                {isLaunchWeek ? `🚀 ${t('enter_now', 'Enter Now')}` : t('view_detail', 'View Detail')}
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Terms */}
            <div className="mt-4 text-center">
              <Link href="/terms-conditions" className="text-sm text-cyan-300 underline hover:text-cyan-200">
                {t('view_full_terms', 'View Full Terms & Conditions')}
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function StatChip({ label, value, highlight = false, strong = false }) {
  return (
    <div
      className={`rounded-xl border px-3 py-2 text-[12px] ${
        highlight ? 'border-amber-300/30 bg-amber-300/10' : 'border-white/10 bg-white/5'
      }`}
    >
      <div className={`uppercase tracking-wide ${highlight ? 'text-amber-200' : 'text-cyan-300'} text-[11px]`}>
        {label}
      </div>
      <div className={`mt-0.5 ${strong ? 'text-white font-bold' : 'text-white/90'}`}>{value}</div>
    </div>
  );
}
