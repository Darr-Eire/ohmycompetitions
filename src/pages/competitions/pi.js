// src/pages/competitions/pi.js
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import { RefreshCw, Sparkles } from 'lucide-react';
import { useSafeTranslation } from '../../hooks/useSafeTranslation';
import PiCompetitionCard from '@components/PiCompetitionCard';

/* ------------------------------ Subtle Background Motion ------------------------------ */
function BackgroundFX() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-40 -left-40 h-[420px] w-[420px] rounded-full blur-3xl opacity-20 bg-cyan-400 animate-float-slow" />
      <div className="absolute -bottom-40 -right-40 h-[420px] w-[420px] rounded-full blur-3xl opacity-15 bg-blue-500 animate-float-slower" />
      <div className="absolute inset-0 [background-image:radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:18px_18px] opacity-20" />
    </div>
  );
}

/* ------------------------------ Helpers (numbers & prize) ------------------------------ */
const toNum = (v, d = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};

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

/** Extract a *π number* for the prize (never the entry fee). */
function prizePiNumber(compLike) {
  if (!compLike) return NaN;
  const c = compLike.comp ?? compLike;
  const entryFee = parseNumericLike(c.entryFee);

  // prizeBreakdown: prefer first; fallback to sum
  if (c.prizeBreakdown && typeof c.prizeBreakdown === 'object') {
    const first = parseNumericLike(c.prizeBreakdown.first);
    if (Number.isFinite(first) && first > 0 && first !== entryFee) return first;
    let sum = 0;
    for (const k of Object.keys(c.prizeBreakdown)) {
      const n = parseNumericLike(c.prizeBreakdown[k]);
      if (Number.isFinite(n)) sum += n;
    }
    if (sum > 0 && sum !== entryFee) return sum;
  }

  // prizes[] array: first numeric amount
  if (Array.isArray(c.prizes)) {
    for (const p of c.prizes) {
      const n = parseNumericLike(p?.amount);
      if (Number.isFinite(n) && n > 0 && n !== entryFee) return n;
    }
  }

  // explicit π fields
  for (const key of ['prizeValuePi', 'prizePi', 'topPrizePi']) {
    const n = parseNumericLike(c[key]);
    if (Number.isFinite(n) && n > 0 && n !== entryFee) return n;
  }

  // generic prizeValue (assume π)
  const val = parseNumericLike(c.prizeValue);
  if (Number.isFinite(val) && val > 0 && val !== entryFee) return val;

  // textual firstPrize/prize
  for (const s of [c.firstPrize, c.prize, c.prizeText, c.prizeLabel]) {
    if (typeof s === 'string') {
      const n = parseNumericLike(s);
      if (Number.isFinite(n) && n > 0) return n;
    }
  }

  return NaN;
}

function feePiString(compLike) {
  const c = compLike.comp ?? compLike;
  const fee = c?.entryFee;
  if (typeof fee === 'number') return `${fee.toFixed(2)} π`;
  return '0.00 π';
}

/* ------------------------------ Empty ------------------------------ */
function EmptyState({ onRefresh, t }) {
  return (
    <div className="text-center py-16 rounded-2xl bg-white/5 mx-2 sm:mx-0">
      <Sparkles className="mx-auto mb-4" />
      <h3 className="text-xl font-semibold">{t('no_pi_competitions_yet', 'No Pi competitions yet')}</h3>
      <p className="text-white/70 mt-2">{t('check_back_soon_pi_prizes', 'Check back soon — new Pi prizes are on the way.')}</p>
      <button
        onClick={onRefresh}
        type="button"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cyan-400 text-black font-semibold px-4 py-2 hover:brightness-110 active:translate-y-px"
      >
        <RefreshCw size={16} /> {t('refresh', 'Refresh')}
      </button>
    </div>
  );
}

/* ---------------------------------- Page ---------------------------------- */
export default function PiCompetitionsPage() {
  const { t } = useSafeTranslation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function fetchPi() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/competitions/all', { headers: { 'cache-control': 'no-cache' } });
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const json = await res.json();
      const data = Array.isArray(json?.data) ? json.data : [];

      const now = Date.now();
      const livePi = data.filter((c) => {
        const theme = c?.theme || c?.comp?.theme;
        const isPi = theme?.toLowerCase() === 'pi';
        const statusOk = (c?.comp?.status ?? 'active') === 'active';
        const ends = c?.comp?.endsAt ? new Date(c.comp.endsAt).getTime() : Infinity;
        return isPi && statusOk && now < ends;
      });

      setItems(livePi);
    } catch (e) {
      console.error('❌ Error loading Pi competitions:', e);
      setError(t('couldnt_load_pi_competitions', "Couldn't load Pi competitions."));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPi();
  }, []);

  // Normalize for grid
  const cards = useMemo(() => {
    return (items || []).map((item) => {
      const comp = item.comp ?? item;
      const fee = feePiString({ comp });
      return {
        key: comp.slug || comp._id || item.title,
        comp,
        title: item.title || comp.title,
        prize: item.prize || comp.prize,
        fee,
        imageUrl: item.imageUrl || comp.imageUrl, // PiCompetitionCard may render a banner instead of this
        endsAt: comp.endsAt,
        href: item.href,
      };
    });
  }, [items]);

  /* ------------------------- REAL hero stats (no fakes) ------------------------- */
  const liveCount = cards.length;

  const soonestStr = useMemo(() => {
    const soonest =
      cards
        .map(s => new Date(s.endsAt))
        .filter(d => Number.isFinite(d.getTime()))
        .sort((a, b) => a - b)[0] || null;
    return soonest
      ? new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(soonest)
      : 'TBA';
  }, [cards]);

  const minFeeStr = useMemo(() => {
    const fees = cards
      .map(s => toNum((s.comp?.entryFee), NaN))
      .filter(Number.isFinite);
    if (!fees.length) return '—';
    const min = Math.min(...fees);
    return `${min.toFixed(2)} π`;
  }, [cards]);

  const totalPrizePoolStr = useMemo(() => {
    const total = cards.reduce((sum, c) => {
      const n = prizePiNumber(c.comp);
      return Number.isFinite(n) ? sum + n : sum;
    }, 0);
    return total > 0 ? `${total.toLocaleString()} π` : '—';
  }, [cards]);

  if (loading) {
    return (
      <main className="app-background min-h-[100svh] text-white bg-[#0f1b33] pt-[calc(10px+env(safe-area-inset-top))] md:pt-[calc(80px+env(safe-area-inset-top))] relative">
        <BackgroundFX />
        <div className="max-w-screen-lg mx-auto px-4 sm:px-0">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-400 mx-auto" />
            <p className="mt-4 text-cyan-300">{t('loading_pi_competitions', 'Loading Pi competitions…')}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <Head>
        <title>{t('pi_competitions_title', 'Pi Competitions | OhMyCompetitions')}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>

      <main className="app-background min-h-[100svh] text-white bg-[#0f1b33] pt-[calc(10px+env(safe-area-inset-top))] md:pt-[calc(80px+env(safe-area-inset-top))] relative">
        <BackgroundFX />

        {/* Hero */}
        <div className="max-w-screen-lg mx-auto px-3 sm:px-4">
          <h1 className="text-2xl font-bold text-center mb-1 bg-gradient-to-r from-[#00FFD5] to-[#0077FF] bg-clip-text text-transparent">
            {t('pi_competitions', 'Pi Competitions')}
          </h1>

          <div className="text-center max-w-2xl mx-auto mb-4 mt-3 space-y-2">
            {error ? (
              <p className="text-red-300">{error}</p>
            ) : (
              <>
                <p className="text-white/90">
                  {t('dive_into_pi_competitions', 'Dive into Pi-powered competitions — win tech, Pi and more.')}
                </p>

                {/* REAL stats row */}
                <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                  <span className="text-[11px] sm:text-xs px-2 py-1 rounded-lg bg-white/10 text-white/80">
                    🔴 {t('live_now', 'Live now')}: <b className="text-white">{liveCount}</b>
                  </span>
                  <span className="text-[11px] sm:text-xs px-2 py-1 rounded-lg bg-white/10 text-white/80">
                    ⏳ {t('soonest_draw', 'Soonest draw')}: <b className="text-white">{soonestStr}</b>
                  </span>
                  <span className="text-[11px] sm:text-xs px-2 py-1 rounded-lg bg-white/10 text-white/80">
                    🎟 {t('min_entry_fee', 'Min entry fee')}: <b className="text-white">{minFeeStr}</b>
                  </span>
                  <span className="text-[11px] sm:text-xs px-2 py-1 rounded-lg bg-white/10 text-white/80">
                    🏆 {t('total_prize_pool', 'Total prize pool')}: <b className="text-white">{totalPrizePoolStr}</b>
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* CONTENT — responsive grid (no carousel, no extra borders) */}
        <section className="pb-14">
          <div className="max-w-screen-lg mx-auto px-2 sm:px-4">
            {(!error && cards.length > 0) ? (
              <div
                className="
                  grid
                  grid-cols-2
                  sm:grid-cols-3
                  lg:grid-cols-4
                  gap-2 sm:gap-3 lg:gap-4
                "
              >
                {cards.map((s) => (
                  <div key={s.key} className="select-none">
                    <PiCompetitionCard
                      comp={{ ...s.comp, comingSoon: s.comp?.comingSoon ?? false }}
                      title={s.title}
                      prize={s.prize}
                      fee={s.fee}
                      imageUrl={s.imageUrl}
                      endsAt={s.endsAt}
                      href={s.href}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState onRefresh={fetchPi} t={t} />
            )}
          </div>
        </section>
      </main>

      {/* Background float animations */}
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

        @media (prefers-reduced-motion: reduce) {
          * { scroll-behavior: auto !important; animation: none !important; transition: none !important; }
        }
      `}</style>
    </>
  );
}

