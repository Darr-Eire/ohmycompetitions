// src/pages/competitions/pi.js
'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import Head from 'next/head';
import { RefreshCw, Sparkles, Trophy } from 'lucide-react';
import { useSafeTranslation } from '../../hooks/useSafeTranslation';

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
  if (!Number.isFinite(ms) || ms <= 0) return '0m';
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}
function timeUntilEndMs(c) {
  const comp = c.comp ?? c;
  const end = comp?.endsAt ? new Date(comp.endsAt).getTime() : NaN;
  return end - now();
}
function timeUntilStartMs(c) {
  const comp = c.comp ?? c;
  const start = comp?.startsAt ? new Date(comp.startsAt).getTime() : NaN;
  return start - now();
}
function timeLeftEndLabel(c) { return msToShort(timeUntilEndMs(c)); }
function timeLeftStartLabel(c) { return msToShort(timeUntilStartMs(c)); }

function ticketsProgress(c) {
  const comp = c.comp ?? c;
  const sold = toNum(comp?.ticketsSold);
  const total = Math.max(toNum(comp?.totalTickets), sold || 0);
  const pct = total > 0 ? Math.min(100, Math.round((sold / total) * 100)) : 0;
  return { sold, total, pct };
}

const slugOf = (c) => {
  const comp = c.comp ?? c;
  return comp?.slug || comp?._id || '';
};
const titleOf = (c) => (c.title || (c.comp ?? c)?.title || 'Competition');
const keyOf   = (c) => slugOf(c) || titleOf(c);
const purchaseHref = (c) => {
  const slug = slugOf(c);
  return slug ? `/ticket-purchase/${slug}` : '/ticket-purchase';
};

/* prize helpers (REAL Pi prize, never the entry fee) */
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
  const entryFee = parseNumericLike(raw.entryFee);

  for (const key of ['prizeValuePi', 'prizePi', 'topPrizePi']) {
    const n = parseNumericLike(raw[key]);
    if (Number.isFinite(n) && n > 0 && n !== entryFee) return `${n.toLocaleString()} π`;
  }
  if (Array.isArray(raw.prizes)) {
    for (const p of raw.prizes) {
      const n = parseNumericLike(p?.amount);
      if (Number.isFinite(n) && n > 0 && n !== entryFee) return `${n.toLocaleString()} π`;
    }
  }
  const val = parseNumericLike(raw.prizeValue);
  if (Number.isFinite(val) && val > 0 && val !== entryFee) return `${val.toLocaleString()} π`;

  for (const s of [raw.firstPrize, raw.prize, raw.prizeText, raw.prizeLabel]) {
    if (typeof s === 'string') {
      const n = parseNumericLike(s);
      if (Number.isFinite(n) && n > 0) return `${n.toLocaleString()} π`;
    }
  }
  return '— π';
}
function feePi(c) {
  const comp = c.comp ?? c;
  const fee = comp?.entryFee;
  if (typeof fee === 'number') return `${fee.toFixed(2)} π`;
  const n = Number.parseFloat(fee);
  return Number.isFinite(n) ? `${n.toFixed(2)} π` : '0.00 π';
}

/* ------------------------------ background ------------------------------ */
function BackgroundFX() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-40 -left-40 h-[420px] w-[420px] rounded-full blur-3xl opacity-20 bg-cyan-400 animate-float-slow" />
      <div className="absolute -bottom-40 -right-40 h-[420px] w-[420px] rounded-full blur-3xl opacity-15 bg-blue-500 animate-float-slower" />
      <div className="absolute inset-0 [background-image:radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:18px_18px] opacity-20" />
    </div>
  );
}

/* ------------------------------ PRIZE BANNER ONLY (no images) ------------------------------ */
function PrizeBanner({ title, prizeText }) {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#6EE7F9] via-[#22D3EE] to-[#3B82F6]" />
      <div className="absolute inset-0 opacity-15 [background-image:radial-gradient(rgba(255,255,255,0.7)_1.5px,transparent_1.5px)] [background-size:22px_22px]" />
      <div className="relative h-full w-full flex items-center justify-center px-4 text-center">
        <div className="max-w-[85%]">
          <div className="text-base sm:text-lg font-bold tracking-tight text-black drop-shadow-[0_1px_8px_rgba(255,255,255,0.55)] line-clamp-2">
            {title}
          </div>
          <div className="mt-2 text-3xl sm:text-4xl font-black text-black drop-shadow-[0_1px_10px_rgba(255,255,255,0.55)]">
            {prizeText}
          </div>
          <div className="mt-2 inline-flex items-center gap-1 rounded-md bg-white/80 px-2 py-0.5 text-[12px] font-extrabold text-black">
            Prize Pool · π
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ card (stacked details) ------------------------------ */
function PiLiveCard({ data }) {
  const status = getStatus(data);
  const { sold, total, pct } = ticketsProgress(data);

  const theTitle = titleOf(data);
  const prizeText = prizePiDisplay(data);
  const feeText = feePi(data);

  const msLeftEnd = timeUntilEndMs(data);
  const msLeftStart = timeUntilStartMs(data);

  const showCountdownEnd   = Number.isFinite(msLeftEnd)   && msLeftEnd   > 0 && msLeftEnd   <= 48 * 3600 * 1000;
  const showCountdownStart = Number.isFinite(msLeftStart) && msLeftStart > 0 && msLeftStart <= 48 * 3600 * 1000;

  const timeLabel =
    status === 'upcoming'
      ? (showCountdownStart ? timeLeftStartLabel(data) : '—')
      : (showCountdownEnd   ? timeLeftEndLabel(data)   : (status === 'ended' ? 'Ended' : '—'));

  return (
    <article
      className="
        group relative rounded-2xl border border-white/10 bg-white/5
        overflow-hidden transition-all duration-200 hover:bg-white/10
      "
    >
      {/* Prize banner (always) */}
      <div className="relative">
        <PrizeBanner title={theTitle} prizeText={prizeText} />
        <div className="absolute left-2 top-2">
          {status === 'live' && (
            <span className="rounded-md bg-emerald-500/25 px-2 py-0.5 text-emerald-200 text-[11px] font-bold">LIVE</span>
          )}
          {status === 'upcoming' && (
            <span className="rounded-md bg-yellow-500/25 px-2 py-0.5 text-yellow-100 text-[11px] font-bold">COMING SOON</span>
          )}
          {status === 'ended' && (
            <span className="rounded-md bg-white/25 px-2 py-0.5 text-white/90 text-[11px] font-bold">FINISHED</span>
          )}
        </div>
      </div>

      {/* Body: stacked details */}
      <div className="p-3.5 sm:p-4">
        {/* Title + fee chip */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[15px] sm:text-[16px] font-semibold leading-snug line-clamp-2">{theTitle}</h3>
          <span className="shrink-0 rounded-md bg-cyan-500/15 border border-cyan-400/30 px-2 py-1 text-[11px] font-bold text-cyan-300">
            {feeText}
          </span>
        </div>

        {/* Stacked details */}
        <div className="mt-3 space-y-1.5 text-[13px] text-white/85">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-white/60">Prize</span>
            <span className="font-semibold">{prizeText}</span>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-white/60">Tickets</span>
            <span className="font-semibold">
              {sold}/{total} <span className="text-white/55">• {pct}% sold</span>
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-white/60">{status === 'upcoming' ? 'Starts' : 'Ends'}</span>
            <span className="font-semibold tabular-nums">{timeLabel}</span>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-white/60">Fee</span>
            <span className="font-semibold">{feeText}</span>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-3">
          <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* CTA */}
        <div className="mt-3">
          <a
            href={purchaseHref(data)}
            className="
              block w-full text-center rounded-lg
              bg-gradient-to-r from-green-400 to-cyan-500
              text-black font-extrabold px-3 py-2 text-[13px]
              hover:brightness-110 active:translate-y-px transition-all
            "
          >
            More Details
          </a>
        </div>
      </div>
    </article>
  );
}

/* ------------------------------ empty/skeleton ------------------------------ */
function EmptyState({ onRefresh, t }) {
  return (
    <div className="text-center py-16 rounded-2xl border border-white/10 bg-white/5 mx-4 my-8">
      <Sparkles className="mx-auto mb-4 text-cyan-400" size={32} />
      <h3 className="text-lg font-semibold">{t('no_pi_competitions_yet', 'No Pi competitions yet')}</h3>
      <p className="text-white/70 mt-2">{t('check_back_soon_pi_prizes', 'Check back soon — new Pi prizes are on the way.')}</p>
      <button
        onClick={onRefresh}
        type="button"
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold px-4 py-2 hover:brightness-110 active:translate-y-px transition-all"
      >
        <RefreshCw size={16} /> {t('refresh', 'Refresh')}
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

/* ---------------------------------- Page ---------------------------------- */
export default function PiCompetitionsPage() {
  const { t } = useSafeTranslation();

  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // default tab: Coming Soon
  const [activeFilter, setActiveFilter] = useState('Coming Soon');

  const fetchPi = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/competitions/all', { headers: { 'cache-control': 'no-cache' } });
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const json = await res.json();
      const data = Array.isArray(json?.data) ? json.data : [];

      const piOnly = data.filter((c) => {
        const theme = (c?.theme || c?.comp?.theme || '').toLowerCase();
        return theme === 'pi';
      });

      setCompetitions(piOnly);
    } catch (e) {
      console.error('❌ Error loading Pi competitions:', e);
      setError(t('couldnt_load_pi_competitions', "Couldn't load Pi competitions."));
      setCompetitions([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchPi();
  }, [fetchPi]);

  // normalize + derived times for sorting
  const normalized = useMemo(() => {
    return competitions.map((item) => {
      const comp = item.comp ?? item;
      const status = getStatus(item);
      const end   = comp?.endsAt   ? new Date(comp.endsAt).getTime()   : Number.POSITIVE_INFINITY;
      const start = comp?.startsAt ? new Date(comp.startsAt).getTime() : Number.POSITIVE_INFINITY;
      const score = status === 'upcoming' ? start : end;
      return { ...item, __status: status, __end: end, __start: start, __score: score };
    });
  }, [competitions]);

  const endingSoon = useMemo(() => {
    const cutoff = now() + 60 * 60 * 1000;
    return normalized
      .filter((n) => n.__status === 'live' && n.__end < cutoff)
      .sort((a, b) => a.__end - b.__end);
  }, [normalized]);

  const startingSoon = useMemo(() => {
    const cutoff = now() + 60 * 60 * 1000;
    return normalized
      .filter((n) => n.__status === 'upcoming' && n.__start < cutoff)
      .sort((a, b) => a.__start - b.__start);
  }, [normalized]);

  const filtered = useMemo(() => {
    if (activeFilter === 'Coming Soon') {
      return normalized
        .filter((n) => n.__status === 'upcoming')
        .sort((a, b) => a.__start - b.__start);
    }
    if (activeFilter === 'Live') {
      return normalized
        .filter((n) => n.__status === 'live')
        .sort((a, b) => a.__score - b.__score);
    }
    if (activeFilter === 'Ending Soon') {
      return normalized
        .filter((n) => n.__status === 'live')
        .sort((a, b) => a.__end - b.__end)
        .slice(0, 24);
    }
    // All: upcoming first, then live, then ended
    return normalized
      .slice()
      .sort((a, b) => {
        const rank = { upcoming: 0, live: 1, ended: 2 };
        const r = (rank[a.__status] ?? 99) - (rank[b.__status] ?? 99);
        return r !== 0 ? r : a.__score - b.__score;
      });
  }, [normalized, activeFilter]);

  const liveCount = normalized.filter(n => n.__status === 'live').length;

  const totalPrizePool = useMemo(() => {
    // Sum of π prizes where we can detect a numeric value
    return normalized.reduce((sum, c) => {
      const txt = prizePiDisplay(c);
      const n = parseNumericLike(txt);
      return Number.isFinite(n) ? sum + n : sum;
    }, 0);
  }, [normalized]);

  return (
    <>
      <Head>
        <title>{t('pi_competitions_title', 'Pi Competitions | OhMyCompetitions')}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>

      <main className="relative min-h-[100svh] text-white bg-[#0f1b33]">
        <BackgroundFX />

        {/* header */}
        <header className="relative z-10 pt-[calc(12px+env(safe-area-inset-top))] pb-3 sm:pb-4">
          <div className="mx-auto w-full max-w-[min(94vw,1400px)] px-2 sm:px-4">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div>
                <h1 className="text-[22px] sm:text-[28px] font-extrabold tracking-tight">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ffd5] to-[#0077ff]">
                    {t('pi_competitions', 'Pi Competitions')}
                  </span>
                </h1>
                <p className="text-white/70 text-[13px] sm:text-[14px]">
                  {t('dive_into_pi_competitions', 'Dive into Pi-powered competitions — win tech, Pi and more.')}
                </p>
              </div>

              {/* compact stats */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div className="web3-stat-card !px-3 !py-2">
                  <Trophy size={18} className="text-yellow-300" />
                  <span className="text-[10px] text-white/70">{t('total_prize_pool', 'Total prize pool')}</span>
                  <span className="text-[14px] font-bold text-cyan-300">
                    {totalPrizePool ? `${totalPrizePool.toLocaleString()} π` : '—'}
                  </span>
                </div>
                <div className="web3-stat-card !px-3 !py-2">
                  <span className="text-[18px]">🔴</span>
                  <span className="text-[10px] text-white/70">{t('live_now', 'Live Now')}</span>
                  <span className="text-[14px] font-bold text-blue-400">{liveCount}</span>
                </div>
                <button
                  onClick={() => location.reload()}
                  className="web3-stat-card !px-3 !py-2 active:translate-y-px"
                  title="Refresh"
                  type="button"
                >
                  <RefreshCw size={18} className="text-orange-300" />
                  <span className="text-[10px] text-white/70">Updated</span>
                  <span className="text-[12px] font-bold text-pink-300">~20s</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* sticky filters (default Coming Soon) */}
        <div className="sticky top-[calc(6px+env(safe-area-inset-top))] z-20 bg-[#0f1b33]/95 backdrop-blur-sm border-y border-white/10">
          <div className="mx-auto w-full max-w-[min(94vw,1400px)] px-2 sm:px-4">
            <div className="flex gap-2 overflow-x-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {['Coming Soon', 'Live', 'Ending Soon', 'All'].map((f) => (
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

        {/* Ticker: Starts soon when Coming Soon tab, otherwise Ends soon */}
        {((activeFilter === 'Coming Soon' ? startingSoon : endingSoon).length > 0) && (
          <div className="sticky top-[calc(44px+env(safe-area-inset-top))] z-30 bg-[#0f1b33]/95 px-3 py-2 border-b border-white/10 text-[12px]">
            <div className="mx-auto w-full max-w-[min(94vw,1400px)]">
              <div className="flex gap-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {(activeFilter === 'Coming Soon' ? startingSoon : endingSoon).slice(0, 4).map((c) => (
                  <a
                    key={keyOf(c)}
                    href={purchaseHref(c)}
                    className="shrink-0 inline-flex items-center gap-2 px-2 py-1 rounded-md bg-white/5 hover:bg-white/10"
                  >
                    <span className="rounded-sm bg-pink-500/20 text-pink-300 px-1.5 py-0.5 text-[11px]">
                      {activeFilter === 'Coming Soon' ? 'Starts' : 'Ends'}{' '}
                      {activeFilter === 'Coming Soon' ? timeLeftStartLabel(c) : timeLeftEndLabel(c)}
                    </span>
                    <span className="text-white/80 truncate max-w-[200px]">{titleOf(c)}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* grid */}
        <section className="py-6 sm:py-8">
          <div className="mx-auto w-full max-w-[min(94vw,1400px)] px-2 sm:px-4">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-4">
                {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : error ? (
              <EmptyState onRefresh={() => location.reload()} t={t} />
            ) : filtered.length === 0 ? (
              <EmptyState onRefresh={() => location.reload()} t={t} />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-4">
                {filtered.map((item) => (
                  <PiLiveCard key={keyOf(item)} data={item} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* compact global styles */}
      <style jsx global>{`
        @keyframes float-slow {
          0% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(18px) translateX(6px); }
          100% { transform: translateY(0) translateX(0); }
        }
        @keyframes float-slower {
          0% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-14px) translateX(-8px); }
          100% { transform: translateY(0) translateX(0); }
        }
        .animate-float-slow { animation: float-slow 12s ease-in-out infinite; }
        .animate-float-slower { animation: float-slower 16s ease-in-out infinite; }

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

        @media (prefers-reduced-motion: reduce) {
          * { scroll-behavior: auto !important; animation: none !important; transition: none !important; }
        }
      `}</style>
    </>
  );
}
