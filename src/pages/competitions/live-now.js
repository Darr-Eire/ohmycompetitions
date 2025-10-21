// src/pages/competitions/all.js
'use client';
import Link from 'next/link';
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { RefreshCw, Sparkles, Trophy } from 'lucide-react';

const GiftTicketModal = dynamic(() => import('@components/GiftTicketModal'), { ssr: false });

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

  // 2) prizes[] array: use first numeric amount as π
  if (Array.isArray(raw.prizes) && raw.prizes.length) {
    for (const p of raw.prizes) {
      const n = parseNumericLike(p?.amount ?? p?.value ?? p);
      if (Number.isFinite(n) && (!Number.isFinite(entryFee) || n !== entryFee) && n > 0) {
        return `${n.toLocaleString()} π`;
      }
    }
  }

  // 3) generic numeric prizeValue (assume π) if it's not the fee
  const val = parseNumericLike(raw.prizeValue);
  if (Number.isFinite(val) && (!Number.isFinite(entryFee) || val !== entryFee) && val > 0) {
    return `${val.toLocaleString()} π`;
  }

  // 4) last resort: text fallbacks
  const textCandidates = [
    raw.topPrize,
    raw.prizeLabel,
    raw.prizeText,
    raw.prize,
    c.prize,
  ].filter(Boolean);
  if (textCandidates.length) return String(textCandidates[0]);

  return 'TBA';
}

const formatDate = (d) => {
  if (!d) return '—';
  const ts = typeof d === 'number' ? d : new Date(d).getTime();
  if (!Number.isFinite(ts)) return '—';
  return new Date(ts).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

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

/* ------------------------------ card (stacked details, no icons) ------------------------------ */
function LiveCard({ data, onGift, onShare }) {
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

  // Fee as "Free" or "x π"
  const feeText = feePi(data);

  return (
    <article
      className="
        group relative rounded-2xl border border-white/10 bg-white/5
        overflow-hidden transition-all duration-200 hover:bg-white/10
      "
    >
      {/* Media (slightly taller for breathing room) */}
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <img
          src={data.imageUrl || '/pi.jpeg'}
          alt={theTitle}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          loading="lazy"
          decoding="async"
        />
        {/* Status chip (text only) */}
        <div className="absolute left-2 top-2">
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
      </div>

      {/* Body: everything stacked under the image */}
      <div className="p-3.5 sm:p-4">
        {/* Title + fee chip */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[15px] sm:text-[16px] font-semibold leading-snug line-clamp-2">
            {theTitle}
          </h3>
          <span className="shrink-0 rounded-md bg-cyan-500/15 border border-cyan-400/30 px-2 py-1 text-[11px] font-bold text-cyan-300">
            {feeText}
          </span>
        </div>

        {/* Stacked details (all real data) */}
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
          <button onClick={() => onGift(data)} className="text-[12px] underline text-cyan-300">
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
    <div className="text-center py-12 rounded-xl border border-white/10 bg-white/5 mx-4 my-8">
      <Sparkles className="mx-auto mb-4 text-cyan-400" size={32} />
      <h3 className="text-lg font-semibold">No {label} right now</h3>
      <p className="text-white/70 mt-2">New challenges are on the horizon. Stay tuned!</p>
      <button
        onClick={onRefresh}
        type="button"
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold px-4 py-2 hover:brightness-110 active:translate-y-px transition-all"
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
export default function AllCompetitionsPage() {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('Live'); // default to Live
  const [tick, setTick] = useState(0);

  // Gift modal state
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
      if (!json?.success || !Array.isArray(json?.data)) throw new Error(json?.error || 'Bad response shape');
      setCompetitions(json.data);
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

  // Filters
  const filters = useMemo(() => {
    const set = new Set(['Live', 'Ending Soon', 'All']); // guaranteed tabs
    for (const c of competitions) {
      const theme = (c.theme || c?.comp?.theme || '').trim();
      if (theme) set.add(theme.charAt(0).toUpperCase() + theme.slice(1));
    }
    return Array.from(set);
  }, [competitions]);

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
      return { ...item, __status: status, __score: score, __end: end, theme: (item.theme || item?.comp?.theme || '').toLowerCase() };
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
    const theme = activeFilter.toLowerCase();
    return normalized
      .filter((n) => n.theme === theme)
      .sort((a, b) => {
        const rank = { live: 0, upcoming: 1, ended: 2 };
        const r = rank[a.__status] - rank[b.__status];
        return r !== 0 ? r : a.__score - b.__score;
      });
  }, [normalized, activeFilter]);

  const liveCount = normalized.filter(n => n.__status === 'live').length;
  const totalPrizePool = useMemo(() => {
    // If your backend mixes fee into prizeValue, consider adding a separate prizePool field server-side.
    return competitions.reduce((sum, c) => sum + (toNum((c.comp ?? c)?.prizeValue, 0)), 0);
  }, [competitions]);

  const openGift = (c) => {
    setGiftComp(c.comp ?? c);
    setGiftOpen(true);
    if (navigator.vibrate) navigator.vibrate(15);
  };

  const go = (c) => {
    window.location.href = purchaseHref(c);
  };

  return (
    <>
      <Head>
        <title>Live Pi Competitions | OhMyCompetitions</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>

      <main className="relative min-h-[100svh] text-white bg-[#0f1b33]">
        <BackgroundFX />

        {/* Slim header */}
        <header className="relative z-10 pt-[calc(12px+env(safe-area-inset-top))] pb-3 sm:pb-4">
          <div className="mx-auto w-full max-w-[min(94vw,1400px)] px-2 sm:px-4">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div>
                <h1 className="text-[22px] sm:text-[28px] font-extrabold tracking-tight">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ffd5] to-[#0077ff]">
                    Live Competitions
                  </span>
                </h1>
                <p className="text-white/70 text-[13px] sm:text-[14px]">
                  Real-time feed. Ending soon first. Europe/Dublin time.
                </p>
              </div>

              {/* compact stats */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div className="web3-stat-card !px-3 !py-2">
                  <Trophy size={18} className="text-yellow-300" />
                  <span className="text-[10px] text-white/70">Total Pool</span>
                  <span className="text-[14px] font-bold text-cyan-300">{totalPrizePool.toLocaleString()} π</span>
                </div>
                <div className="web3-stat-card !px-3 !py-2">
                  <Sparkles size={18} className="text-purple-300" />
                  <span className="text-[10px] text-white/70">Live Now</span>
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
                  <span className="text-[12px] font-bold text-pink-300">~{Math.round(REFRESH_MS/1000)}s</span>
                </button>
              </div>
            </div>
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

        {/* sticky filters */}
        <div className="sticky top-[calc(6px+env(safe-area-inset-top))] z-20 bg-[#0f1b33]/95 backdrop-blur-sm border-y border-white/10">
          <div className="mx-auto w-full max-w-[min(94vw,1400px)] px-2 sm:px-4">
            <div className="flex gap-2 overflow-x-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {['Live', 'Ending Soon', 'All', ...filters.filter(f => !['Live','Ending Soon','All'].includes(f))].map((f) => (
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
              <EmptyState onRefresh={() => location.reload()} label="competitions" />
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
                    onShare={() => {}}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Gift modal */}
      {giftOpen && giftComp && (
        <GiftTicketModal
          isOpen={giftOpen}
          onClose={() => setGiftOpen(false)}
          comp={giftComp}
        />
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
