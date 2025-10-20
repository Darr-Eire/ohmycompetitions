// src/pages/competitions/all.js
'use client';

import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import Head from 'next/head';
import { ChevronRight, RefreshCw, Sparkles, Trophy } from 'lucide-react'; // Added Trophy icon
import CompetitionCard from '@components/CompetitionCard'; // Assuming these can accept style overrides
import PiCompetitionCard from '@components/PiCompetitionCard';
import DaulyCompetitionCard from '@components/DailyCompetitionCard';

function TaglineRotator() {
  const taglines = useMemo(() => [
    'Pi-powered prizes. Tech, Pi & more.',
    'Compete. Win. Repeat. 🔥',
    'Epic rewards — all powered by Pi.',
    'Join the action ⚡ Entry from 0.00 π',
  ], []);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % taglines.length), 3500);
    return () => clearInterval(id);
  }, [taglines]);

  return (
    <p className="text-center text-white/70 text-sm mt-2 font-medium transition-opacity duration-500 ease-in-out">
      {taglines[index]}
    </p>
  );
}

/* ------------------------------ Subtle Background Motion (Updated for Web3 vibe) ------------------------------ */
function BackgroundFX() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* Dynamic, more abstract blobs/gradients */}
      <div className="absolute -top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full blur-3xl opacity-15 bg-gradient-to-br from-purple-600 to-pink-500 animate-float-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] rounded-full blur-3xl opacity-10 bg-gradient-to-tl from-cyan-400 to-blue-500 animate-float-slower" />
      {/* Particle grid subtle, maybe slightly larger dots */}
      <div className="absolute inset-0 [background-image:radial-gradient(rgba(255,255,255,0.08)_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-10" />
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
function SkeletonCard({ className = '' }) {
  return (
    <div className={`mx-auto w-full max-w-[min(92vw,820px)] animate-pulse rounded-xl bg-white/5 border border-white/10 overflow-hidden ${className}`}>
      <div className="h-36 sm:h-48 bg-white/10" />
      <div className="p-4 space-y-3">
        <div className="h-5 w-3/4 bg-white/10 rounded" />
        <div className="h-3 w-1/2 bg-white/10 rounded" />
        <div className="h-8 w-full bg-white/10 rounded" />
      </div>
    </div>
  );
}

function EmptyState({ onRefresh, label = 'competitions' }) {
  return (
    <div className="text-center py-12 rounded-xl border border-white/10 bg-white/5 mx-4 my-8">
      <Sparkles className="mx-auto mb-4 text-cyan-400" size={32} />
      <h3 className="text-xl font-semibold">No {label} right now</h3>
      <p className="text-white/70 mt-2">New challenges are on the horizon. Stay tuned!</p>
      <button
        onClick={onRefresh}
        type="button"
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold px-4 py-2 hover:brightness-110 active:translate-y-px transition-all duration-200"
      >
        <RefreshCw size={16} /> Refresh Feeds
      </button>
    </div>
  );
}

/* ------------------------------- Full-width Carousel (Removed from main flow for simplicity/mobile focus) ------------------------------- */
// This carousel component is kept here for potential future use or for other sections,
// but it's no longer directly used in the main AllCompetitionsPage layout for the primary list.
function FullWidthCarousel({ items, renderItem, ariaLabel, className = '' }) {
  const scrollerRef = useRef(null);
  const [index, setIndex] = useState(0);

  const clamp = useCallback(
    (i) => Math.max(0, Math.min(i, (items?.length || 1) - 1)),
    [items?.length]
  );

  const scrollToIndex = useCallback(
    (i) => {
      const el = scrollerRef.current;
      if (!el) return;
      const target = clamp(i);
      const slideElement = el.children[0]?.children[target];
      if (slideElement) {
        const left = slideElement.offsetLeft;
        el.scrollTo({ left, behavior: 'smooth' });
      }
    },
    [clamp]
  );

  const onScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    let closestIndex = 0;
    let minDiff = Infinity;

    for (let i = 0; i < el.children[0].children.length; i++) {
      const slideElement = el.children[0].children[i];
      if (slideElement) {
        const diff = Math.abs(el.scrollLeft - slideElement.offsetLeft);
        if (diff < minDiff) {
          minDiff = diff;
          closestIndex = i;
        }
      }
    }
    if (closestIndex !== index) setIndex(closestIndex);
  }, [index]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [onScroll]);

  if (!items?.length) return null;

  return (
    <div className={`relative ${className}`}>
      {/* Scroller container */}
      <div
        ref={scrollerRef}
        className="
          w-full
          snap-x snap-mandatory
          overflow-x-auto overflow-y-hidden
          scroll-smooth
          overscroll-x-contain
          [touch-action:pan-x pan-y]
          [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden
        "
        aria-roledescription="carousel"
        aria-label={ariaLabel}
      >
        <div className="flex px-4 sm:px-0">
          {items.map((item, i) => (
            <div
              key={item.key || i}
              className="snap-start snap-always basis-[90%] md:basis-2/3 lg:basis-1/2 xl:basis-1/3 shrink-0 pr-4"
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${items.length}`}
            >
              <div
                className="w-full h-full carousel-card competition-card select-none"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                  {renderItem(item, i)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots (visible on all screen sizes) */}
      <div className="mt-4 flex items-center justify-center gap-2">
        {items.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => scrollToIndex(i)}
            className={`h-2.5 rounded-full transition-all duration-300 ${i === index ? 'w-6 bg-cyan-400' : 'w-2.5 bg-white/40'}`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------ Helpers ------------------------------ */
// Enhanced renderCompetitionCardByTheme to apply web3-ish styling
function renderCompetitionCardByTheme(item) {
  const comp = item.comp ?? item;
  const commonProps = {
    key: comp?.slug || comp?._id || item.title,
    comp,
    title: item.title,
    prize: item.prize,
    fee: typeof comp?.entryFee === 'number' ? `${comp.entryFee.toFixed(2)} π` : '0.00 π',
    imageUrl: item.imageUrl,
    endsAt: comp?.endsAt,
    href: item.href,
    className: "web3-card" // Custom class for styling
  };

  switch ((item.theme || comp?.theme || 'default').toLowerCase()) {
    case 'pi':
      return <PiCompetitionCard {...commonProps} type="pi" />; // Pi cards might have special styling
    default:
      // Use generic CompetitionCard for all other themes, passing the type for internal rendering if needed
      return <CompetitionCard {...commonProps} type={item.theme || comp?.theme || 'default'} />;
  }
}

/* ---------------------------------- Page ---------------------------------- */
export default function AllCompetitionsPage() {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');

  const filtersRef = useRef(null);

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
  const desiredOrder = useMemo(() => ['All', 'Featured', 'Launch', 'Daily', 'Pi', 'Tech', 'Free'], []);

  const availableFilters = useMemo(() => {
    const themes = new Set(
      competitions.map((c) => (c.theme || c?.comp?.theme)?.toLowerCase()).filter(Boolean)
    );
    const formattedThemes = Array.from(themes).map((t) => t.charAt(0).toUpperCase() + t.slice(1));

    // Ensure 'All' and 'Featured' are always present if comps exist
    let currentFilters = ['All'];
    if (competitions.length > 0) {
      currentFilters.push('Featured');
    }

    // Add desired themes if they exist in fetched data
    for (const d of desiredOrder) {
      if (d !== 'All' && d !== 'Featured' && formattedThemes.includes(d) && !currentFilters.includes(d)) {
        currentFilters.push(d);
      }
    }

    // Add any other themes not in desiredOrder
    for (const f of formattedThemes) {
      if (!currentFilters.includes(f)) {
        currentFilters.push(f);
      }
    }

    return currentFilters;
  }, [competitions, desiredOrder]);

  useEffect(() => {
    if (filtersRef.current && activeFilter) {
      const activeElement = filtersRef.current.querySelector(`[data-filter="${activeFilter}"]`);
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest',
        });
      }
    }
  }, [activeFilter]);

  const allNormalizedSlides = useMemo(() => {
    return (competitions || []).map((item) => {
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
        theme: (item.theme || comp?.theme || 'default').toLowerCase(), // Ensure default theme
      };
    });
  }, [competitions]);

  const filteredSlides = useMemo(() => {
    if (activeFilter === 'All') return allNormalizedSlides;
    if (activeFilter === 'Featured') {
      // Example 'Featured' logic: Prioritize 'launch', then 'pi', then simply top 5
      const featuredCandidates = allNormalizedSlides.filter(s => s.theme === 'launch' || s.theme === 'pi' || s.comp?.isFeatured);
      if (featuredCandidates.length > 0) return featuredCandidates.slice(0, 5);
      return allNormalizedSlides.slice(0, 5); // Fallback to top 5 general
    }
    return allNormalizedSlides.filter(
      (s) => s.theme === activeFilter.toLowerCase()
    );
  }, [allNormalizedSlides, activeFilter]);

  const liveCount = competitions.length;
  const ticketsToday = useLiveCounter(420);

  const totalPrizePool = useMemo(() => {
    // Summing prize values, assuming 'prizeValue' exists or default to 1000 for demo
    return competitions.reduce((sum, comp) => sum + (comp.prizeValue || 1000), 0);
  }, [competitions]);


  if (loading) {
    return (
      <main className="app-background min-h-[100svh] text-white bg-[#0f1b33] relative">
        <BackgroundFX />
        <div className="max-w-screen-lg mx-auto px-4 pt-[calc(100px+env(safe-area-inset-top))]">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-400 mx-auto" />
            <p className="mt-4 text-cyan-300 font-medium text-lg">Initializing Pi Network data...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <Head>
        <title>Pi Competitions | OhMyCompetitions</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>

      <main className="app-background min-h-[100svh] text-white bg-[#0f1b33] relative">
        <BackgroundFX />

        {/* Web3-style Hero Section */}
        <header className="relative z-10 pt-[calc(30px+env(safe-area-inset-top))] pb-8 sm:pb-12 text-center overflow-hidden">
          <div className="max-w-xl mx-auto px-4">
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-3 leading-tight tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ffd5] to-[#0077ff] inline-block animate-pulse-light">
                Pi Competitions
              </span>
            </h1>
            <p className="text-white/80 text-base sm:text-lg max-w-sm mx-auto mb-6">
              Dive into community-powered challenges. Secure your wins.
            </p>

            {error ? (
              <p className="text-red-300 mt-4">{error}</p>
            ) : (
              <>
                <TaglineRotator />

                {/* Web3 Stats Grid */}
                <div className="grid grid-cols-2 gap-3 mt-8 max-w-md mx-auto">
                  <div className="web3-stat-card">
                    <Trophy size={20} className="text-yellow-300" />
                    <span className="text-xs text-white/70 font-medium">Total Prize Pool</span>
                    <span className="text-lg font-bold text-cyan-300 mt-1">
                      {totalPrizePool.toLocaleString()} <span className="text-base text-white/70">π</span>
                    </span>
                  </div>
                  <div className="web3-stat-card">
                    <Sparkles size={20} className="text-purple-300" />
                    <span className="text-xs text-white/70 font-medium">Live Competitions</span>
                    <span className="text-lg font-bold text-blue-400 mt-1">{liveCount}</span>
                  </div>
                  <div className="web3-stat-card col-span-2">
                    <RefreshCw size={20} className="text-orange-300" />
                    <span className="text-xs text-white/70 font-medium">Tickets Sold Today</span>
                    <span className="text-lg font-bold text-pink-400 mt-1">{ticketsToday.toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-8">
                    <a
                      href="#competitions-list" // Smooth scroll to the content
                      className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-green-400 to-cyan-500 text-black font-extrabold px-8 py-3 text-lg hover:from-green-500 hover:to-cyan-600 active:scale-98 transition-all duration-200 shadow-lg glow-button"
                    >
                      Explore Challenges
                      <ChevronRight size={20} />
                    </a>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Filters - integrated seamlessly below the hero and made sticky */}
        {availableFilters.length > 0 && (
          <div className="sticky top-[calc(10px+env(safe-area-inset-top))] sm:top-0 z-20 bg-[#0f1b33] bg-opacity-90 backdrop-blur-sm pt-4 pb-3 border-b border-white/10">
            <div className="max-w-screen-lg mx-auto px-4">
              <div
                ref={filtersRef}
                className="flex gap-2 sm:gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {availableFilters.map((filter) => (
                  <button
                    key={filter}
                    data-filter={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`snap-center shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition whitespace-nowrap
                      ${activeFilter === filter
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                        : 'text-white/70 hover:text-white hover:bg-white/10 border border-white/20'
                      }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area - Dynamic Grid/List */}
        <section id="competitions-list" className="pb-14 pt-8">
          <div className="max-w-screen-lg mx-auto px-4">
            {error ? (
              <EmptyState onRefresh={() => location.reload()} label="competitions" />
            ) : filteredSlides.length === 0 ? (
              <EmptyState onRefresh={() => location.reload()} label={`${activeFilter.toLowerCase()} competitions`} />
            ) : (
              // Use a responsive grid for content, 1 column on mobile, 2 on small-mid, 3 on large
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSlides.map((s) => (
                  <div key={s.key}>
                    {renderCompetitionCardByTheme(s)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Global Web3 Styles */}
      <style jsx global>{`
        /* --- Base Background & Scrollbar for a sleek look --- */
        body {
          background-color: #0f1b33; /* Matches main app background */
          color: white;
        }
        /* Custom scrollbar for webkit browsers */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px; /* For horizontal scrollbars */
        }
        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(0, 255, 213, 0.3); /* Cyan tint */
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 255, 213, 0.5);
        }

        /* --- Web3-inspired Card Styling --- */
        .web3-card {
          background: linear-gradient(145deg, rgba(15, 27, 51, 0.8) 0%, rgba(30, 40, 70, 0.8) 100%);
          backdrop-filter: blur(10px);
          border: 1px solid transparent;
          border-image: linear-gradient(145deg, rgba(0, 255, 213, 0.3), rgba(0, 119, 255, 0.3)) 1;
          border-radius: 1rem;
          overflow: hidden;
          transition: all 0.3s ease-out;
        }
        .web3-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 255, 213, 0.15), 0 5px 15px rgba(0, 119, 255, 0.1);
          border-image: linear-gradient(145deg, rgba(0, 255, 213, 0.6), rgba(0, 119, 255, 0.6)) 1;
        }

        /* --- Web3-inspired Stat Card Styling --- */
        .web3-stat-card {
          background: rgba(255,255,255,0.08); /* Frosted glass effect */
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 0.75rem;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          box-shadow: 0 2px 10px rgba(0,0,0,0.2);
          transition: all 0.2s ease-out;
        }
        .web3-stat-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 4px 15px rgba(0,255,213,0.1), 0 2px 8px rgba(0,119,255,0.08);
        }
        .web3-stat-card svg { /* Icon styling inside stat card */
            margin-bottom: 0.5rem;
        }

        /* --- Custom Animations (More Subtle) --- */
        @keyframes pulse-light {
          0%, 100% { opacity: 1; text-shadow: 0 0 5px rgba(0, 255, 213, 0.4); }
          50% { opacity: 0.9; text-shadow: 0 0 15px rgba(0, 119, 255, 0.6); }
        }
        .animate-pulse-light {
          animation: pulse-light 4s ease-in-out infinite;
        }

        @keyframes glow-subtle {
          0% { box-shadow: 0 0 5px rgba(0, 255, 213, 0.3); }
          50% { box-shadow: 0 0 15px rgba(0, 119, 255, 0.5), 0 0 5px rgba(0, 255, 213, 0.3); }
          100% { box-shadow: 0 0 5px rgba(0, 255, 213, 0.3); }
        }
        .glow-button {
            animation: glow-subtle 3s infinite ease-in-out;
        }

        /* --- Background float animations (updated values for Web3 vibe) --- */
        @keyframes float-slow {
          0% { transform: translateY(0) translateX(0) scale(1); }
          50% { transform: translateY(25px) translateX(10px) scale(1.05); }
          100% { transform: translateY(0) translateX(0) scale(1); }
        }
        @keyframes float-slower {
          0% { transform: translateY(0) translateX(0) scale(1); }
          50% { transform: translateY(-20px) translateX(-12px) scale(0.95); }
          100% { transform: translateY(0) translateX(0) scale(1); }
        }
        .animate-float-slow { animation: float-slow 18s ease-in-out infinite; }
        .animate-float-slower { animation: float-slower 22s ease-in-out infinite; }

        @media (prefers-reduced-motion: reduce) {
          * { scroll-behavior: auto !important; animation: none !important; transition: none !important; }
        }
      `}</style>
    </>
  );
}
