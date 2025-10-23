// src/pages/competitions/launch-week.js
'use client';

import Link from 'next/link';
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import Head from 'next/head';
import { RefreshCw, Sparkles, Trophy } from 'lucide-react';

const REFRESH_MS = 20000; // 20s soft live refresh

/* ------------------------------ utils ------------------------------ */
const toNum = (v, d = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};

const now = () => new Date().getTime();

function getStatus(c) {
  const comp = c.comp ?? c;
  const start = comp?.startsAt ? new Date(comp.startsAt).getTime() : null;
  const end = comp?.endsAt ? new Date(comp.endsAt).getTime() : null;
  const ts = now();
  if (start && ts < start) return 'upcoming';
  if (end && ts > end) return 'ended';
  return 'live';
}

function msToShort(ms) {
  if (ms <= 0) return '0m';
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}
// Nicely format a timestamp or date-like value
function formatDate(input, opts = {}) {
  if (input == null || Number.isNaN(input)) return 'TBA';
  const d = typeof input === 'number' ? new Date(input) : new Date(String(input));
  if (Number.isNaN(d.getTime())) return 'TBA';
  const defaults = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return d.toLocaleString(undefined, { ...defaults, ...opts });
}

function timeUntilEndMs(c) {
  const comp = c.comp ?? c;
  const end = comp?.endsAt ? new Date(comp.endsAt).getTime() : null;
  if (!end) return NaN;
  return end - now();
}

function timeLeftLabel(c) {
  const ms = timeUntilEndMs(c);
  if (!Number.isFinite(ms)) return '—';
  return msToShort(ms);
}

function ticketsProgress(c) {
  const comp = c.comp ?? c;
  const sold = toNum(comp?.ticketsSold);
  const total = Math.max(toNum(comp?.totalTickets), sold || 0);
  const pct = total > 0 ? Math.min(100, Math.round((sold / total) * 100)) : 0;
  return { sold, total, pct };
}

function feePi(c) {
  const comp = c.comp ?? c;
  const fee = comp?.entryFee;
  if (fee == null) return '—';
  const n = Number.parseFloat(fee);
  if (!Number.isFinite(n)) return String(fee);
  if (n <= 0) return 'Free';
  return (n % 1 === 0 ? n.toFixed(0) : n.toFixed(2)) + ' π';
}

const slugOf = (c) => {
  const comp = c.comp ?? c;
  return comp?.slug || comp?._id || '';
};
const titleOf = (c) => (c.title || (c.comp ?? c)?.title || 'Competition');
const keyOf = (c) => slugOf(c) || titleOf(c);

const purchaseHref = (c) => {
  const slug = slugOf(c);
  return slug ? `/ticket-purchase/${slug}` : '/ticket-purchase';
};

/* ------------------------------ Prize helpers (REAL PRIZE, never fee) ------------------------------ */
function parseNumericLike(v) {
  if (v == null) return NaN;
  if (typeof v === 'number') return Number.isFinite(v) ? v : NaN;
  if (typeof v === 'string') {
    const stripped = v.replace(/[^\d.,-]/g, '').replace(',', '.').trim();
    const n = Number(stripped);
    return Number.isFinite(n) ? n : NaN;
  }
  return NaN;
}

function prizePiDisplay(c) {
  const raw = c.comp ?? c;

  // Never confuse fee with prize
  const entryFee = parseNumericLike(raw.entryFee);

  // 1) Explicit Pi prize fields
  const piFields = ['prizeValuePi', 'prizePi', 'topPrizePi'];
  for (const key of piFields) {
    const n = parseNumericLike(raw[key]);
    if (Number.isFinite(n) && (!Number.isFinite(entryFee) || n !== entryFee) && n > 0) {
      return `${n.toLocaleString()} π`;
    }
  }

  // 2) prizes[] array
  if (Array.isArray(raw.prizes) && raw.prizes.length) {
    for (const p of raw.prizes) {
      const n = parseNumericLike(p?.amount ?? p?.value ?? p);
      if (Number.isFinite(n) && (!Number.isFinite(entryFee) || n !== entryFee) && n > 0) {
        return `${n.toLocaleString()} π`;
      }
    }
  }

  // 3) generic numeric prizeValue (assume π)
  const val = parseNumericLike(raw.prizeValue);
  if (Number.isFinite(val) && (!Number.isFinite(entryFee) || val !== entryFee) && val > 0) {
    return `${val.toLocaleString()} π`;
  }

  // 4) textual fallbacks
  const textCandidates = [raw.topPrize, raw.prizeLabel, raw.prizeText, raw.prize, c.prize].filter(Boolean);
  if (textCandidates.length) return String(textCandidates[0]);

  return 'TBA';
}

/* ------------------------------ background ------------------------------ */
function BackgroundFX() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-1/3 left-1/2 -translate-x-1/2 w-[1100px] h-[1100px] rounded-full blur-3xl opacity-10 bg-gradient-to-br from-cyan-500/40 to-blue-600/40" />
      <div className="absolute bottom-1/3 right-1/3 w-[700px] h-[700px] rounded-full blur-3xl opacity-10 bg-gradient-to-tl from-purple-500/40 to-pink-500/40" />
      <div className="absolute inset-0 [background-image:radial-gradient(rgba(255,255,255,0.07)_1.5px,transparent_1.5px)] [background-size:22px_22px] opacity-10" />
    </div>
  );
}

/* ------------------------------ OMC Prize Banner (always shown) ------------------------------ */
function PrizeBanner({ title, prizeText }) {
  // Reuse the numeric parser from above
  const ensurePiSymbol = (txt) => {
    if (!txt) return 'Prize TBA';
    const s = String(txt).trim();
    if (/[π]/.test(s)) return s; // already has π
    const n = parseNumericLike(s);
    if (Number.isFinite(n)) return `${n.toLocaleString()} π`;
    return s;
  };

  const displayPrize = ensurePiSymbol(prizeText);

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden">
      {/* Neon gradient base */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#00ffd5] via-[#00b7ff] to-[#005eff]" />

      {/* Cyber grid / dots */}
      <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(rgba(255,255,255,0.7)_1.5px,transparent_1.5px)] [background-size:22px_22px]" />

      {/* Radial glow rings */}
      <div className="absolute -inset-10 opacity-30 blur-2xl pointer-events-none">
        <div className="absolute left-1/3 top-1/3 w-72 h-72 rounded-full bg-cyan-300/40" />
        <div className="absolute right-1/4 bottom-1/4 w-72 h-72 rounded-full bg-blue-400/40" />
      </div>

      {/* Inner glow frame */}
      <div className="absolute inset-0 ring-1 ring-white/20 shadow-[0_0_50px_#22d3ee66_inset]" />

      {/* Content */}
      <div className="relative h-full w-full flex items-center justify-center text-center px-3">
        <div className="max-w-[86%] select-none">
          {/* BIG PRIZE */}
          <div className="text-black drop-shadow-[0_3px_14px_rgba(255,255,255,0.7)]">
            <div className="inline-flex items-baseline gap-1 rounded-2xl bg-white/35 px-3 py-1.5 ring-1 ring-white/60 shadow-[0_8px_28px_rgba(34,211,238,0.55)]">
              <span className="text-[20px] font-black leading-none sm:text-[28px] tracking-tight">
                {displayPrize}
              </span>
            </div>
          </div>

          {/* Title */}
          <h3
            className="
              mt-2 mx-auto w-full
              text-center
              text-[14px] sm:text-[16px]
              font-extrabold leading-snug
              text-black/90 line-clamp-2
            "
          >
            {title}
          </h3>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ card (stacked details) ------------------------------ */
function LiveCard({ data, onGift }) {
  const comp = data.comp ?? data;
  const status = getStatus(data);
  const { sold, total, pct } = ticketsProgress(data);

  // Dates
  const startTs = comp?.startsAt ? new Date(comp.startsAt).getTime() : null;
  const endTs = comp?.endsAt ? new Date(comp.endsAt).getTime() : null;

  // Show countdown only when ≤ 48h
  const msLeft = Number.isFinite(endTs) ? endTs - now() : NaN;
  const showCountdown48 = Number.isFinite(msLeft) && msLeft > 0 && msLeft <= 48 * 60 * 60 * 1000;
  const timeLeft = showCountdown48 ? msToShort(msLeft) : (status === 'ended' ? 'Ended' : formatDate(endTs));

  const theTitle = titleOf(data);
  const prizeText = prizePiDisplay(data);
  const feeText = feePi(data);

  return (
    <article
      className="
        group relative rounded-2xl border border-white/10 bg-white/5
        overflow-hidden transition-all duration-200 hover:bg-white/10
      "
    >
      {/* OMC Prize Banner (no images) */}
      <PrizeBanner title={theTitle} prizeText={prizeText} />

      {/* Status chip BELOW the banner */}
      <div className="px-3.5 sm:px-4 pt-2 flex justify-center">
        {status === 'live' && (
          <span className="rounded-md bg-emerald-500/25 px-2 py-0.5 text-emerald-200 text-[11px] font-bold">
            LIVE
          </span>
        )}
        {status === 'upcoming' && (
          <span className="rounded-md bg-yellow-500/25 px-2 py-0.5 text-yellow-100 text-[11px] font-bold">
            UPCOMING
          </span>
        )}
        {status === 'ended' && (
          <span className="rounded-md bg-white/25 px-2 py-0.5 text-white/90 text-[11px] font-bold">
            FINISHED
          </span>
        )}
      </div>

      {/* Body: everything stacked under the banner */}
      <div className="p-3.5 sm:p-4">
        {/* Title centered */}
        <div className="flex items-start justify-center">
          <h3 className="text-center mx-auto text-[15px] sm:text-[16px] font-semibold leading-snug line-clamp-2">
            {theTitle}
          </h3>
        </div>

        {/* Stacked details */}
        <div className="mt-3 space-y-1.5 text-[13px] text-white">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-white/60">Fee</span>
            <span className="font-semibold">{feeText}</span>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-white/60">Tickets</span>
            <span className="font-semibold">
              {total ? `${sold}/${total}` : sold}
            </span>
          </div>
          {status === 'upcoming' && (
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-white/60">Starts</span>
              <span className="font-semibold">{formatDate(startTs)}</span>
            </div>
          )}
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-white/60">Ends</span>
            <span className="font-semibold tabular-nums">{timeLeft}</span>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-3">
          <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* CTA button */}
        <div className="mt-3">
          <Link
            href={purchaseHref(data)}
            className="
              block w-full text-center rounded-lg
              bg-gradient-to-r from-green-400 to-cyan-500
              text-black font-extrabold px-3 py-2 text-[13px]
              hover:brightness-110 active:translate-y-px transition-all
            "
          >
            More Details
          </Link>
        </div>

        {/* Gift link */}
        <div className="mt-2 text-center">
          <button onClick={() => onGift(data)} className="text-[12px] underline text-cyan-300" type="button">
            Gift a ticket
          </button>
        </div>
      </div>
    </article>
  );
}

/* ------------------------------ empty/skeleton ------------------------------ */
function EmptyState({ onRefresh, label = 'competitions' }) {
  return (
    <div className="text-center py-12 rounded-2xl border border-white/10 bg-white/5 mx-4 my-8">
      <Sparkles className="mx-auto mb-4 text-cyan-400" size={32} />
      <h3 className="text-lg font-semibold">No {label} right now</h3>
      <p className="text-white/70 mt-2">New challenges are on the horizon. Stay tuned!</p>
      <button
        onClick={onRefresh}
        type="button"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cyan-400 text-black font-semibold px-4 py-2 hover:brightness-110 active:translate-y-px transition-all"
      >
        <RefreshCw size={16} /> Refresh
      </button>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
      <div className="aspect-[4/3] bg-white/10" />
      <div className="p-3 space-y-2">
        <div className="h-4 w-3/4 bg-white/10 rounded" />
        <div className="h-3 w-1/2 bg-white/10 rounded" />
        <div className="h-2 w-full bg-white/10 rounded" />
      </div>
    </div>
  );
}

/* ------------------------------ page ------------------------------ */
export default function LaunchWeekCompetitionsPage() {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('Live'); // same tabs
  const [tick, setTick] = useState(0);

  // Gift info-modal state
  const [giftOpen, setGiftOpen] = useState(false);
  const [giftComp, setGiftComp] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch('/api/competitions/all', {
        method: 'GET',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'cache-control': 'no-cache' },
      });
      if (!res.ok) throw new Error(`Failed to fetch competitions (${res.status})`);
      const json = await res.json();

      let arr = [];
      if (Array.isArray(json)) arr = json;
      else if (Array.isArray(json?.data)) arr = json.data;
      else if (Array.isArray(json?.competitions)) arr = json.competitions;

      // Only LAUNCH theme
      const launchOnly = arr.filter((c) => (c.theme || c?.comp?.theme || '').toLowerCase() === 'launch');
      setCompetitions(launchOnly);
    } catch (e) {
      console.error(e);
      setError('Failed to load competitions. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const id = setInterval(() => setTick((t) => t + 1), REFRESH_MS);
    return () => clearInterval(id);
  }, [fetchData]);

  useEffect(() => {
    if (tick > 0) fetchData();
  }, [tick, fetchData]);

  // Normalized & sort helpers
  const normalized = useMemo(() => {
    return competitions.map((item) => {
      const comp = item.comp ?? item;
      const status = getStatus(item);
      const end = comp?.endsAt ? new Date(comp.endsAt).getTime() : Number.POSITIVE_INFINITY;
      const start = comp?.startsAt ? new Date(comp.startsAt).getTime() : 0;
      const score =
        status === 'live'
          ? end
          : status === 'upcoming'
          ? start
          : end;
      return { ...item, __status: status, __score: score, __end: end };
    });
  }, [competitions]);

  // Ending soon list (< 60 min & live)
  const endingSoon = useMemo(() => {
    const cutoff = now() + 60 * 60 * 1000;
    return normalized
      .filter((n) => n.__status === 'live' && n.__end < cutoff)
      .sort((a, b) => a.__end - b.__end);
  }, [normalized]);

  const filtered = useMemo(() => {
    if (activeFilter === 'Live') return normalized.filter(n => n.__status === 'live').sort((a, b) => a.__score - b.__score);
    if (activeFilter === 'Ending Soon') {
      return normalized
        .filter(n => n.__status === 'live')
        .sort((a, b) => a.__end - b.__end)
        .slice(0, 24);
    }
    if (activeFilter === 'All') {
      return normalized
        .slice()
        .sort((a, b) => {
          const rank = { live: 0, upcoming: 1, ended: 2 };
          const r = rank[a.__status] - rank[b.__status];
          return r !== 0 ? r : a.__score - b.__score;
        });
    }
    return normalized;
  }, [normalized, activeFilter]);

  const liveCount = normalized.filter(n => n.__status === 'live').length;
  const totalPrizePool = useMemo(() => {
    return competitions.reduce((sum, c) => sum + (toNum((c.comp ?? c)?.prizeValue, 0)), 0);
  }, [competitions]);

  // ======= HERO extra stats (data-driven) =======
  const upcomingCount = useMemo(
    () => normalized.filter((n) => n.__status === 'upcoming').length,
    [normalized]
  );
  const endedCount = useMemo(
    () => normalized.filter((n) => n.__status === 'ended').length,
    [normalized]
  );

  const { totalSoldAll, totalTicketsAll } = useMemo(() => {
    let sold = 0, total = 0;
    for (const c of competitions) {
      const comp = c.comp ?? c;
      sold += toNum(comp?.ticketsSold, 0);
      total += Math.max(toNum(comp?.totalTickets, 0), toNum(comp?.ticketsSold, 0));
    }
    return { totalSoldAll: sold, totalTicketsAll: total };
  }, [competitions]);

  const avgEntryFee = useMemo(() => {
    const fees = competitions
      .map((c) => toNum((c.comp ?? c)?.entryFee, NaN))
      .filter((n) => Number.isFinite(n) && n >= 0);
    if (!fees.length) return 0;
    const sum = fees.reduce((a, b) => a + b, 0);
    return Math.round((sum / fees.length) * 100) / 100;
  }, [competitions]);

  const nextEnding = useMemo(() => {
    const target = normalized
      .filter((n) => n.__status === 'live')
      .sort((a, b) => a.__end - b.__end)[0];
    if (!target) return null;
    return {
      title: titleOf(target),
      endsAt: (target.comp ?? target)?.endsAt,
    };
  }, [normalized]);

  const nextEndsIn = useMemo(() => {
    if (!nextEnding?.endsAt) return null;
    const ms = new Date(nextEnding.endsAt).getTime() - now();
    return msToShort(ms);
  }, [nextEnding, tick]);
  // ==============================================

  const openGift = (c) => {
    setGiftComp(c.comp ?? c);
    setGiftOpen(true);
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(15);
  };

  const go = (c) => {
    window.location.href = purchaseHref(c);
  };

  return (
    <>
      <Head>
        <title>Launch Week Competitions | OhMyCompetitions</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>

      <main className="relative min-h-[100svh] text-white bg-[#0f1b33]">
        <BackgroundFX />

        {/* HERO (data-driven) */}
        <header className="relative z-10 pt-[calc(14px+env(safe-area-inset-top))] pb-4 sm:pb-6">
          <div className="mx-auto w-full max-w-[min(94vw,1400px)] px-2 sm:px-4">
            <section
              className="
                relative overflow-hidden rounded-2xl
                bg-gradient-to-br from-[#071225] via-[#0f1b33] to-[#122449]
                border border-white/10
                shadow-[0_10px_40px_rgba(0,0,0,0.35)]
              "
              aria-labelledby="launch-hero-title"
            >
              {/* ambient glows */}
              <div className="pointer-events-none absolute -top-20 -left-20 h-64 w-64 rounded-full bg-cyan-500/25 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
              <div className="pointer-events-none absolute inset-0 opacity-10 [background-image:radial-gradient(rgba(255,255,255,0.08)_1.5px,transparent_1.5px)] [background-size:22px_22px]" />

              <div className="relative grid gap-5 p-4 sm:p-6 lg:grid-cols-[1.1fr_0.9fr]">
                {/* Left: title + meta */}
                <div className="flex flex-col justify-center gap-3">
                  <h1
                    id="launch-hero-title"
                    className="text-center lg:text-left text-[24px] sm:text-[30px] font-extrabold tracking-tight"
                  >
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ffd5] to-[#0077ff]">
                      Launch Week Competitions
                    </span>
                  </h1>

                  <p className="text-center lg:text-left text-white/80 text-[13px] sm:text-[15px]">
                    Hand-picked competitions, tech, instant wins and more. Real-time pools, fair odds, and transparent tickets.
                  </p>

                  {/* CTA row */}
                  <div className="mt-1 flex flex-col sm:flex-row items-center lg:items-start gap-2 sm:gap-3">
                    <button
                      onClick={() => location.reload()}
                      type="button"
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-extrabold px-4 py-2 active:translate-y-px hover:brightness-110"
                      title="Refresh data"
                    >
                      <RefreshCw size={16} /> Refresh
                      <span className="text-[11px] ml-1 opacity-80">
                        ~{Math.round(REFRESH_MS / 1000)}s
                      </span>
                    </button>

                    <Link
                      href="/competitions/all"
                      className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/40 bg-white/5 px-4 py-2 text-[13px] font-semibold text-cyan-200 hover:bg-white/10"
                    >
                      View All Competitions
                    </Link>

                    {nextEnding && (
                      <span
                        className="inline-flex items-center gap-2 rounded-xl bg-amber-400/15 text-amber-200 border border-amber-400/30 px-3 py-1.5 text-[12px] font-semibold"
                        title="Next ending live competition"
                      >
                        <Sparkles size={14} className="text-amber-300" />
                        Ends {nextEndsIn ?? 'soon'}: <span className="truncate max-w-[160px] ml-1">{nextEnding.title}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: stat blocks */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                  {/* Total Pool */}
                  <div className="web3-stat-card !px-3 !py-2">
                    <Trophy size={18} className="text-yellow-300" />
                    <span className="text-[10px] text-white/70">Total Pool</span>
                    <span className="text-[16px] font-bold text-cyan-300">
                      {totalPrizePool.toLocaleString()} π
                    </span>
                  </div>

                  {/* Live Now */}
                  <div className="web3-stat-card !px-3 !py-2">
                    <Sparkles size={18} className="text-purple-300" />
                    <span className="text-[10px] text-white/70">Live Now</span>
                    <span className="text-[16px] font-bold text-blue-400">
                      {liveCount}
                    </span>
                  </div>

                  {/* Upcoming */}
                  <div className="web3-stat-card !px-3 !py-2">
                    <svg viewBox="0 0 24 24" className="h-4 w-4 text-cyan-300" aria-hidden="true">
                      <path fill="currentColor" d="M7 11h10v2H7v-2zm-4 0a9 9 0 1 1 18 0A9 9 0 0 1 3 11zm9-7a7 7 0 1 0 .001 14.001A7 7 0 0 0 12 4z" />
                    </svg>
                    <span className="text-[10px] text-white/70">Upcoming</span>
                    <span className="text-[16px] font-bold text-cyan-300">
                      {upcomingCount}
                    </span>
                  </div>

                  {/* Ended */}
                  <div className="web3-stat-card !px-3 !py-2">
                    <svg viewBox="0 0 24 24" className="h-4 w-4 text-white/80" aria-hidden="true">
                      <path fill="currentColor" d="M12 2a10 10 0 1 1-.001 20.001A10 10 0 0 1 12 2Zm1 5v6h5v2h-7V7h2Z" />
                    </svg>
                    <span className="text-[10px] text-white/70">Ended</span>
                    <span className="text-[16px] font-bold text-white/80">
                      {endedCount}
                    </span>
                  </div>

                  {/* Tickets */}
                  <div className="web3-stat-card !px-3 !py-2">
                    <svg viewBox="0 0 24 24" className="h-4 w-4 text-pink-300" aria-hidden="true">
                      <path fill="currentColor" d="M3 7a2 2 0 0 1 2-2h6v2a2 2 0 1 0 4 0V5h4a2 2 0 0 1 2 2v3h-2a2 2 0 1 0 0 4h2v3a2 2 0 0 1-2 2h-4v-2a2 2 0 1 0-4 0v2H5a2 2 0 0 1-2-2v-3h2a2 2 0 1 0 0-4H3V7Z" />
                    </svg>
                    <span className="text-[10px] text-white/70">Tickets Sold</span>
                    <span className="text-[16px] font-bold text-pink-300">
                      {totalSoldAll.toLocaleString()}
                      {totalTicketsAll ? (
                        <span className="text-[11px] text-white/60"> / {totalTicketsAll.toLocaleString()}</span>
                      ) : null}
                    </span>
                  </div>

                  {/* Avg Fee */}
                  <div className="web3-stat-card !px-3 !py-2">
                    <svg viewBox="0 0 24 24" className="h-4 w-4 text-emerald-300" aria-hidden="true">
                      <path fill="currentColor" d="M12 1 3 5v6c0 5 4 9 9 12 5-3 9-7 9-12V5l-9-4Z" />
                    </svg>
                    <span className="text-[10px] text-white/70">Avg Entry</span>
                    <span className="text-[16px] font-bold text-emerald-300">
                      {avgEntryFee ? `${avgEntryFee.toFixed(2)} π` : '—'}
                    </span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </header>

        {/* Ending Soon Ticker */}
        {endingSoon.length > 0 && (
          <div className="sticky top-[calc(44px+env(safe-area-inset-top))] z-30 bg-[#0f1b33]/95 px-3 py-2 border-b border-white/10 text-[12px]">
            <div className="mx-auto w-full max-w-[min(94vw,1400px)]">
              <div className="flex gap-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {endingSoon.slice(0, 4).map((c) => (
                  <button
                    key={keyOf(c)}
                    onClick={() => go(c)}
                    className="shrink-0 inline-flex items-center gap-2 px-2 py-1 rounded-md bg-white/5 hover:bg-white/10"
                    type="button"
                  >
                    <span className="rounded-sm bg-pink-500/20 text-pink-300 px-1.5 py-0.5 text-[11px]">
                      Ends {timeLeftLabel(c)}
                    </span>
                    <span className="text-white/80 truncate max-w-[200px]">
                      {titleOf(c)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* sticky filters (same tabs, launch-only dataset) */}
        <div className="sticky top-[calc(6px+env(safe-area-inset-top))] z-20 bg-[#0f1b33]/95 backdrop-blur-sm border-y border-white/10">
          <div className="mx-auto w-full max-w-[min(94vw,1400px)] px-2 sm:px-4">
            <div className="flex gap-2 overflow-x-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {['Live', 'Ending Soon', 'All'].map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition
                    ${activeFilter === f
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                      : 'text-white/70 hover:text-white hover:bg-white/10 border border-white/20'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* grid */}
        <section className="py-6 sm:py-8">
          <div className="mx-auto w-full max-w-[min(94vw,1400px)] px-2 sm:px-4">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-4">
                {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : error ? (
              <EmptyState onRefresh={() => location.reload()} label="launch competitions" />
            ) : filtered.length === 0 ? (
              <EmptyState onRefresh={() => location.reload()} label={activeFilter.toLowerCase()} />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-4">
                {filtered.map((item) => (
                  <LiveCard
                    key={keyOf(item)}
                    data={item}
                    onGift={(c) => {
                      setGiftComp(c.comp ?? c);
                      setGiftOpen(true);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {giftOpen && giftComp && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Gift Tickets"
          onClick={() => setGiftOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-cyan-400 bg-[#101426] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-cyan-900/50 flex items-center justify-between">
              <h4 className="text-lg font-bold text-cyan-300">Gift Tickets</h4>
              <button onClick={() => setGiftOpen(false)} className="text-cyan-200 hover:text-white text-sm">
                Close
              </button>
            </div>

            <div className="p-4 space-y-2">
              <p className="text-white/90">
                Gifting tickets to other users is coming very soon.
              </p>
              {(giftComp?.title || giftComp?.comp?.title) && (
                <p className="text-sm text-white/70">
                  You’ll be able to gift tickets for: <span className="font-semibold">
                    {giftComp?.title ?? giftComp?.comp?.title}
                  </span>
                </p>
              )}
            </div>

            <div className="px-4 pb-4">
              <button
                onClick={() => setGiftOpen(false)}
                className="w-full py-2 rounded-md font-bold text-black bg-gradient-to-r from-[#00ffd5] to-[#0077ff] hover:brightness-110"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* compact global styles */}
      <style jsx global>{`
        body { background-color: #0f1b33; color: white; }

        .web3-stat-card {
          background: rgba(255,255,255,0.08);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 0.75rem;
          padding: 0.75rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        }
        .web3-stat-card svg { margin-bottom: 0.25rem; }
      `}</style>
    </>
  );
}
