// src/pages/competitions/all.js
'use client';

import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import Head from 'next/head';
import { ChevronLeft, ChevronRight, RefreshCw, Sparkles } from 'lucide-react';
import CompetitionCard from '@components/CompetitionCard';
import PiCompetitionCard from '@components/PiCompetitionCard';
import DailyCompetitionCard from '@components/DailyCompetitionCard';
import FreeCompetitionCard from '@components/FreeCompetitionCard';
import CryptoGiveawayCard from '@components/CryptoGiveawayCard';
import LaunchCompetitionCard from '@components/LaunchCompetitionCard';

/* ------------------------------ Tagline Rotator ------------------------------ */
function TaglineRotator() {
  const taglines = [
    'Pi-powered prizes. Tech, Pi & more.',
    'Compete. Win. Repeat. 🔥',
    'Epic rewards — all powered by Pi.',
    'Join the action ⚡ Entry from 0.00 π',
  ];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % taglines.length), 3500);
    return () => clearInterval(id);
  }, []);

  return (
    <p className="text-center text-white/80 text-sm sm:text-base mt-1 transition-opacity duration-500 ease-in-out">
      {taglines[index]}
    </p>
  );
}

/* ------------------------------ Subtle Background Motion ------------------------------ */
function BackgroundFX() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* soft blobs tuned for #0f1b33 */}
      <div className="absolute -top-40 -left-40 h-[420px] w-[420px] rounded-full blur-3xl opacity-20 bg-cyan-400 animate-float-slow" />
      <div className="absolute -bottom-40 -right-40 h-[420px] w-[420px] rounded-full blur-3xl opacity-15 bg-blue-500 animate-float-slower" />
      {/* particle grid subtler on dark */}
      <div className="absolute inset-0 [background-image:radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:18px_18px] opacity-20" />
    </div>
  );
}

/* ------------------------------ Live Counter (frontend trickle) ------------------------------ */
function useLiveCounter(initial = 420) {
  const [count, setCount] = useState(initial);
  useEffect(() => {
    const tick = () => setCount((c) => c + Math.floor(1 + Math.random() * 5));
    const id = setInterval(tick, 2000 + Math.random() * 2000);
    return () => clearInterval(id);
  }, []);
  return count;
}

/* ------------------------------ Skeleton / Empty ------------------------------ */
function SkeletonSlide() {
  return (
    <div className="snap-start basis-full shrink-0">
      <div className="px-3 sm:px-4">
        <div className="mx-auto w-full max-w-[min(92vw,820px)] animate-pulse rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
          <div className="h-48 sm:h-64 bg-white/10" />
          <div className="p-4 space-y-3">
            <div className="h-6 w-2/3 bg-white/10 rounded" />
            <div className="h-4 w-1/2 bg-white/10 rounded" />
            <div className="h-10 w-full bg-white/10 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onRefresh, label = 'competitions' }) {
  return (
    <div className="text-center py-16 rounded-2xl border border-white/10 bg-white/5 mx-4">
      <Sparkles className="mx-auto mb-4" />
      <h3 className="text-xl font-semibold">No {label} right now</h3>
      <p className="text-white/70 mt-2">Check back soon — new prizes drop regularly.</p>
      <button
        onClick={onRefresh}
        type="button"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cyan-400 text-black font-semibold px-4 py-2 hover:brightness-110 active:translate-y-px"
      >
        <RefreshCw size={16} /> Refresh
      </button>
    </div>
  );
}

/* ------------------------------- Full-width Carousel ------------------------------- */
function FullWidthCarousel({ items, renderItem, ariaLabel }) {
  const scrollerRef = useRef(null);
  const [index, setIndex] = useState(0);

  const clamp = useCallback(
    (i) => Math.max(0, Math.min(i, (items?.length || 1) - 1)),
    [items?.length]
  );

  // Pure horizontal scroll
  const scrollToIndex = useCallback(
    (i) => {
      const el = scrollerRef.current;
      if (!el) return;
      const target = clamp(i);
      const left = target * el.clientWidth;
      el.scrollTo({ left, behavior: 'smooth' });
    },
    [clamp]
  );

  const onScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const next = Math.round(el.scrollLeft / el.clientWidth);
    if (next !== index) setIndex(next);
  }, [index]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [onScroll]);

  // keyboard
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') scrollToIndex(index + 1);
      if (e.key === 'ArrowLeft') scrollToIndex(index - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, scrollToIndex]);

  if (!items?.length) return null;

  return (
    <div className="relative">
      {/* edge fades now from app bg */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-[#0f1b33]" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-[#0f1b33]" />

      {/* scroller */}
      <div
        ref={scrollerRef}
        className="
          w-full
          snap-x snap-mandatory
          overflow-x-auto overflow-y-visible
          scroll-smooth
          overscroll-x-contain
          [touch-action:pan-x pan-y]
          [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden
        "
        aria-roledescription="carousel"
        aria-label={ariaLabel}
      >
        <div className="flex">
          {items.map((item, i) => (
            <div
              key={item.key || i}
              className="snap-start snap-always basis-full shrink-0"
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${items.length}`}
            >
              <div className="px-3 sm:px-4">
                <div
                  className="mx-auto w-full max-w-[min(92vw,820px)] carousel-card competition-card select-none"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  {renderItem(item, i)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prev / Next */}
      <div className="absolute inset-y-0 left-1 sm:left-2 flex items-center z-20">
        <button
          type="button"
          onClick={() => scrollToIndex(index - 1)}
          disabled={index === 0}
          className={`h-11 w-11 sm:h-12 sm:w-12 rounded-full p-2 border bg-white/10 backdrop-blur border-white/20 hover:bg-white/15 active:scale-95 transition
            ${index === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-label="Previous"
        >
          <ChevronLeft />
        </button>
      </div>
      <div className="absolute inset-y-0 right-1 sm:right-2 flex items-center z-20">
        <button
          type="button"
          onClick={() => scrollToIndex(index + 1)}
          disabled={index === items.length - 1}
          className={`h-11 w-11 sm:h-12 sm:w-12 rounded-full p-2 border bg-white/10 backdrop-blur border-white/20 hover:bg-white/15 active:scale-95 transition
            ${items?.length ? (index === items.length - 1 ? 'opacity-50 cursor-not-allowed' : '') : ''}`}
          aria-label="Next"
        >
          <ChevronRight />
        </button>
      </div>

      {/* dots */}
      <div className="mt-4 flex items-center justify-center gap-2">
        {items.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => scrollToIndex(i)}
            className={`h-2.5 rounded-full transition-all ${i === index ? 'w-6 bg-cyan-400' : 'w-2.5 bg-white/40'}`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Reduced motion */}
      <style jsx global>{`
        @media (prefers-reduced-motion: reduce) {
          * {
            scroll-behavior: auto !important;
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
}

/* ------------------------------ Helpers ------------------------------ */
function renderCompetitionCardByTheme(item) {
  const comp = item.comp ?? item;
  const props = {
    key: comp?.slug || comp?._id || item.title,
    comp,
    title: item.title,
    prize: item.prize,
    fee: typeof comp?.entryFee === 'number' ? `${comp.entryFee.toFixed(2)} π` : '0.00 π',
    imageUrl: item.imageUrl,
    endsAt: comp?.endsAt,
    href: item.href,
  };

  switch ((item.theme || comp?.theme || 'other').toLowerCase()) {
    case 'launch':
      return <LaunchCompetitionCard {...props} />;
    case 'pi':
      return <PiCompetitionCard {...props} />;
    case 'daily':
      return <DailyCompetitionCard {...props} />;
    case 'crypto':
      return <CryptoGiveawayCard {...props} />;
    case 'free':
      return <FreeCompetitionCard {...props} />;
    default:
      return <CompetitionCard {...props} />;
  }
}

/* ---------------------------------- Page ---------------------------------- */
export default function AllCompetitionsPage() {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/competitions/all', {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'cache-control': 'no-cache',
          },
        });

        if (!response.ok) throw new Error(`Failed to fetch competitions (${response.status})`);
        const result = await response.json();
        if (!result?.success || !Array.isArray(result?.data)) {
          throw new Error(result?.error || 'Bad response shape');
        }
        if (alive) setCompetitions(result.data);
      } catch (err) {
        console.error('❌ Error fetching competitions:', err);
        if (alive) {
          setCompetitions([]);
          setError('Failed to load competitions. Please check your connection and try again.');
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  /* ---------- Tabs order ---------- */
  const desiredOrder = ['All', 'Launch', 'Daily', 'Pi', 'Tech', 'Free'];
  const desiredOrderLower = desiredOrder.filter(f => f !== 'All').map(f => f.toLowerCase());

  const availableFilters = useMemo(() => {
    const themes = new Set(
      competitions.map((c) => (c.theme || c?.comp?.theme)?.toLowerCase()).filter(Boolean)
    );
    const formatted = Array.from(themes).map((t) => t.charAt(0).toUpperCase() + t.slice(1));
    const ordered = desiredOrder.filter((f) => formatted.includes(f) || f === 'All');
    const extras = formatted.filter((f) => !desiredOrder.includes(f));
    return [...ordered, ...extras];
  }, [competitions]);

  const filtered = useMemo(() => {
    if (activeFilter === 'All') return competitions;
    return competitions.filter(
      (c) => (c.theme || c?.comp?.theme)?.toLowerCase() === activeFilter.toLowerCase()
    );
  }, [competitions, activeFilter]);

  // Normalize slides for stats/hero when a single set is shown
  const slides = useMemo(() => {
    return (filtered || []).map((item) => {
      const comp = item.comp ?? item;
      return {
        key: comp?.slug || comp?._id || item.title,
        comp,
        title: item.title,
        prize: item.prize,
        fee: typeof comp?.entryFee === 'number' ? `${comp.entryFee.toFixed(2)} π` : '0.00 π',
        imageUrl: item.imageUrl,
        endsAt: comp?.endsAt,
        href: item.href,
        theme: (item.theme || comp?.theme || 'other').toLowerCase(),
      };
    });
  }, [filtered]);

  const liveCount = slides.length;
  const minFee = useMemo(() => {
    const fees = slides.map((s) => Number(s.comp?.entryFee ?? 0)).filter(Number.isFinite);
    return fees.length ? Math.min(...fees) : 0;
  }, [slides]);

  const soonestStr = useMemo(() => {
    const soonest =
      slides
        .map((s) => new Date(s.endsAt))
        .filter((d) => Number.isFinite(d.getTime()))
        .sort((a, b) => a - b)[0] || null;
    return soonest
      ? new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(soonest)
      : 'TBA';
  }, [slides]);

  /* ---------- Grouping for "All" view, rendered in desired order ---------- */
  const grouped = useMemo(() => {
    return competitions.reduce((acc, item) => {
      const theme = (item.theme || item?.comp?.theme || 'other').toLowerCase();
      (acc[theme] ||= []).push(item);
      return acc;
    }, /** @type {Record<string, any[]>} */ ({}));
  }, [competitions]);

  const orderedGrouped = useMemo(() => {
    const entries = Object.entries(grouped);
    const ordered = desiredOrderLower
      .filter((t) => grouped[t])
      .map((t) => [t, grouped[t]]);
    const extras = entries.filter(([t]) => !desiredOrderLower.includes(t));
    return [...ordered, ...extras];
  }, [grouped, desiredOrderLower]);

  const themeLabel = (t) => t.charAt(0).toUpperCase() + t.slice(1);
  const ticketsToday = useLiveCounter(420); // purely visual

  if (loading) {
    return (
      <main className="app-background min-h-[100svh] text-white bg-[#0f1b33] pt-[calc(10px+env(safe-area-inset-top))] md:pt-[calc(80px+env(safe-area-inset-top))] relative">
        <BackgroundFX />
        <div className="max-w-screen-lg mx-auto px-4 sm:px-0">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-400 mx-auto" />
            <p className="mt-4 text-cyan-300">Loading competitions…</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <Head>
        <title>Live Competitions | OhMyCompetitions</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>

      <main className="app-background min-h-[100svh] text-white bg-[#0f1b33] pt-[calc(10px+env(safe-area-inset-top))] md:pt-[calc(80px+env(safe-area-inset-top))] relative">
        <BackgroundFX />

        <div className="max-w-screen-lg mx-auto px-4 sm:px-0">
          {/* Hero */}
          <h1
            className="
              text-2xl font-bold text-center mb-1
              bg-gradient-to-r from-[#00ffd5] to-[#0077ff]
              bg-clip-text text-transparent
            "
          >
            Explore Live Competitions
          </h1>

          <div className="text-center max-w-md mx-auto mb-6 mt-3">
            {error ? (
              <p className="text-red-300">{error}</p>
            ) : (
              <>
                <p className="text-white/90">
                  Dive into Pi-powered competitions win tech, Pi, and more.
                </p>

                {/* Rotating short tagline */}
                <TaglineRotator />

                {/* Live counter */}
                <p className="text-center text-white/80 text-xs sm:text-sm mt-2">
                  <span className="text-cyan-300 font-semibold">{ticketsToday.toLocaleString()}</span> tickets sold today ·{' '}
                  <span className="text-cyan-300 font-semibold">{liveCount}</span> live competitions
                </p>

                {/* Hint line smaller */}
                <p className="text-white/70 text-xs sm:text-sm">
                  Use arrows or swipe to browse.&nbsp;
                </p>
 <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                  <span className="text-[11px] sm:text-xs px-2 py-1 rounded-lg bg-white/10 border border-white/10 text-white/80">
                    ⏳ Soonest draw: <b className="text-white">{soonestStr}</b>
                  </span>
                  <span className="text-[11px] sm:text-xs px-2 py-1 rounded-lg bg-white/10 border border-white/10 text-white/80">
                    🎟 Easy entry
                  </span>
                  <span className="text-[11px] sm:text-xs px-2 py-1 rounded-lg bg-white/10 border border-white/10 text-white/80">
                    ⚡ New drops weekly
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Filters */}
          {availableFilters.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              {availableFilters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 rounded-md border text-sm font-bold transition
                    ${activeFilter === filter
                      ? 'bg-cyan-400 text-black shadow-lg'
                      : 'border-cyan-400 text-cyan-300 hover:bg-white/10'}`}
                >
                  {filter}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <section className="pb-14">
          {error ? (
            <EmptyState onRefresh={() => location.reload()} label="competitions" />
          ) : activeFilter === 'All' ? (
            // One carousel per theme section in desired order
            <div className="max-w-screen-lg mx-auto px-0 sm:px-0">
              {orderedGrouped.length === 0 ? (
                <EmptyState onRefresh={() => location.reload()} label="competitions" />
              ) : (
                orderedGrouped.map(([theme, comps]) => {
                  // Normalize per theme
                  const themeSlides = comps.map((item) => {
                    const comp = item.comp ?? item;
                    return {
                      key: comp?.slug || comp?._id || item.title,
                      comp,
                      title: item.title,
                      prize: item.prize,
                      fee: typeof comp?.entryFee === 'number' ? `${comp.entryFee.toFixed(2)} π` : '0.00 π',
                      imageUrl: item.imageUrl,
                      endsAt: comp?.endsAt,
                      href: item.href,
                      theme: (item.theme || comp?.theme || theme).toLowerCase(),
                    };
                  });

                  return (
                    <div key={theme} className="max-w-screen-lg mx-auto mt-10">
                      <h2 className="text-xl font-bold text-cyan-300 mb-3 text-center capitalize">
                        {themeLabel(theme)} Competitions
                      </h2>

                      {themeSlides.length === 0 ? (
                        <EmptyState onRefresh={() => {}} label={`${theme} competitions`} />
                      ) : (
                        <FullWidthCarousel
                          items={themeSlides}
                          ariaLabel={`${themeLabel(theme)} competitions`}
                          renderItem={(s) => renderCompetitionCardByTheme(s)}
                        />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            // Single carousel for selected theme
            <div className="max-w-screen-lg mx-auto px-0 sm:px-0">
              {slides.length === 0 ? (
                <EmptyState onRefresh={() => location.reload()} label={`${activeFilter.toLowerCase()} competitions`} />
              ) : (
                <FullWidthCarousel
                  items={slides}
                  ariaLabel={`${activeFilter} competitions`}
                  renderItem={(s) => renderCompetitionCardByTheme(s)}
                />
              )}
            </div>
          )}
        </section>
      </main>

      {/* Global hover glow + no-scale + background animations */}
      <style jsx global>{`
        /* Hover glow/tilt (applies to wrapper we added) */
        .competition-card {
          transition: transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease;
          border-radius: 1rem;
        }
        .competition-card:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 0 18px rgba(0, 255, 213, 0.25), 0 0 28px rgba(0, 119, 255, 0.18);
        }

        /* Stop click/tap scaling inside carousel */
        .carousel-card,
        .carousel-card a,
        .carousel-card button {
          -webkit-tap-highlight-color: transparent;
        }
        .carousel-card *:focus-visible {
          outline: 2px solid #22d3ee !important;
          outline-offset: 2px;
        }
        .carousel-card *,
        .carousel-card:hover,
        .carousel-card:active {
          transform: none !important;
          transition-property: transform !important;
          transition-duration: 0s !important;
        }

        /* Background float animations */
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

function themeLabel(t) {
  return t.charAt(0).toUpperCase() + t.slice(1);
}
