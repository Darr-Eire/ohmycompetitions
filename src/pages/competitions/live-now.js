// src/pages/competitions/all.js
'use client';

import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import Head from 'next/head';
import { Sparkles, Trophy, Settings2, X, Star } from 'lucide-react'; // Changed icons for theme
import CompetitionCard from '@components/CompetitionCard';
import PiCompetitionCard from '@components/PiCompetitionCard';

/* ------------------------------ Tagline Rotator (Adapted for Nebula) ------------------------------ */
function TaglineRotator() {
  const taglines = useMemo(() => [
    'Unravel the cosmos of challenges.',
    'Forge your legend among the stars. ✨',
    'Epic rewards from beyond the horizon.',
    'Galactic quests await your prowess.',
  ], []);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % taglines.length), 4000); // Slightly slower for elegance
    return () => clearInterval(id);
  }, [taglines]);

  return (
    <p className="text-center text-gray-400 text-base mt-3 font-light italic transition-opacity duration-700 ease-in-out">
      {taglines[index]}
    </p>
  );
}

/* ------------------------------ Subtle Background Motion (Nebula FX) ------------------------------ */
function BackgroundFX() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* Dynamic, more abstract blobs/gradients - now mimicking nebulas */}
      <div className="absolute -top-[10%] left-[5%] w-[1000px] h-[1000px] rounded-full blur-3xl opacity-10 bg-gradient-to-br from-purple-800 to-indigo-900 animate-float-slow" />
      <div className="absolute bottom-[20%] right-[10%] w-[800px] h-[800px] rounded-full blur-3xl opacity-8 bg-gradient-to-tl from-teal-700 to-blue-800 animate-float-slower" />
      <div className="absolute top-[40%] left-[25%] w-[600px] h-[600px] rounded-full blur-3xl opacity-7 bg-gradient-to-tr from-pink-800 to-fuchsia-900 animate-float-slowest" />

      {/* Subtle stardust/star field effect */}
      <div className="absolute inset-0 [background-image:radial-gradient(circle_at_center,rgba(255,255,255,0.05)_1px,transparent_2px)] [background-size:15px_15px] opacity-20" />
    </div>
  );
}

/* ------------------------------ Live Counter (frontend trickle - kept for potential future use) ------------------------------ */
function useLiveCounter(initial = 420) {
  const [count, setCount] = useState(initial);
  useEffect(() => {
    const tick = () => setCount((c) => c + Math.floor(1 + Math.random() * 5));
    const id = setInterval(tick, 2000 + Math.random() * 2000);
    return () => clearInterval(id);
  }, []);
  return count;
}

/* ------------------------------ Skeleton / Empty (Adapted for Nebula) ------------------------------ */
function SkeletonCard({ className = '' }) {
  return (
    <div className={`mx-auto w-full max-w-[min(92vw,820px)] animate-pulse rounded-xl bg-gray-800/50 border border-gray-700/50 overflow-hidden ${className}`}>
      <div className="h-36 sm:h-48 bg-gray-700/50" />
      <div className="p-4 space-y-3">
        <div className="h-5 w-3/4 bg-gray-700/50 rounded" />
        <div className="h-3 w-1/2 bg-gray-700/50 rounded" />
        <div className="h-8 w-full bg-gray-700/50 rounded" />
      </div>
    </div>
  );
}

function EmptyState({ onRefresh, label = 'competitions' }) {
  return (
    <div className="text-center py-16 rounded-xl border border-gray-700 bg-gray-900/50 mx-4 my-8">
      <Star className="mx-auto mb-4 text-amber-300" size={36} />
      <h3 className="text-2xl font-semibold text-white">No {label} in this quadrant.</h3>
      <p className="text-gray-400 mt-3">The cosmic currents are shifting. Check back soon for new discoveries!</p>
      <button
        onClick={onRefresh}
        type="button"
        className="mt-8 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-700 text-white font-semibold px-6 py-3 hover:from-blue-700 hover:to-purple-800 active:scale-98 transition-all duration-300 transform-gpu nebula-button-glow"
      >
        <Sparkles size={18} /> Rescan Galaxies
      </button>
    </div>
  );
}

/* ------------------------------ Filter Drawer Component ------------------------------ */
function FilterDrawer({ isOpen, onClose, filters, activeFilter, onSelectFilter }) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 z-40 transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <div
        className={`fixed top-0 right-0 w-64 md:w-80 h-full bg-gray-950 border-l border-gray-700 z-50 transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings2 size={24} className="text-purple-400" /> Filter Realms
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => { onSelectFilter(filter); onClose(); }}
              className={`w-full text-left px-4 py-2 rounded-lg text-lg font-medium transition-all duration-200
                ${activeFilter === filter
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-700 text-white shadow-lg'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}


/* ------------------------------ Helpers ------------------------------ */
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
    className: "nebula-card" // Custom class for styling
  };

  switch ((item.theme || comp?.theme || 'default').toLowerCase()) {
    case 'pi':
      return <PiCompetitionCard {...commonProps} type="pi" />;
    default:
      return <CompetitionCard {...commonProps} type={item.theme || comp?.theme || 'default'} />;
  }
}

/* ---------------------------------- Page ---------------------------------- */
export default function AllCompetitionsPage() {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [showFilterDrawer, setShowFilterDrawer] = useState(false); // New state for drawer

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

  /* ---------- Tabs order (now for Drawer) ---------- */
  const desiredOrder = useMemo(() => ['All', 'Featured', 'Launch', 'Daily', 'Pi', 'Tech', 'Free'], []);

  const availableFilters = useMemo(() => {
    const themes = new Set(
      competitions.map((c) => (c.theme || c?.comp?.theme)?.toLowerCase()).filter(Boolean)
    );
    const formattedThemes = Array.from(themes).map((t) => t.charAt(0).toUpperCase() + t.slice(1));

    let currentFilters = ['All'];
    if (competitions.length > 0) {
      currentFilters.push('Featured');
    }

    for (const d of desiredOrder) {
      if (d !== 'All' && d !== 'Featured' && formattedThemes.includes(d) && !currentFilters.includes(d)) {
        currentFilters.push(d);
      }
    }

    for (const f of formattedThemes) {
      if (!currentFilters.includes(f)) {
        currentFilters.push(f);
      }
    }

    return currentFilters;
  }, [competitions, desiredOrder]);

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
        theme: (item.theme || comp?.theme || 'default').toLowerCase(),
      };
    });
  }, [competitions]);

  const filteredSlides = useMemo(() => {
    if (activeFilter === 'All') return allNormalizedSlides;
    if (activeFilter === 'Featured') {
      const featuredCandidates = allNormalizedSlides.filter(s => s.theme === 'launch' || s.theme === 'pi' || s.comp?.isFeatured);
      if (featuredCandidates.length > 0) return featuredCandidates.slice(0, 5);
      return allNormalizedSlides.slice(0, 5);
    }
    return allNormalizedSlides.filter(
      (s) => s.theme === activeFilter.toLowerCase()
    );
  }, [allNormalizedSlides, activeFilter]);

  if (loading) {
    return (
      <main className="app-background min-h-[100svh] text-white bg-[#030712] relative">
        <BackgroundFX />
        <div className="max-w-screen-lg mx-auto px-4 pt-[calc(100px+env(safe-area-inset-top))]">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto" />
            <p className="mt-4 text-purple-300 font-medium text-lg">Charting cosmic currents...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <Head>
        <title>Cosmic Challenges | Galactic Pi</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>

      <main className="app-background min-h-[100svh] text-white bg-[#030712] relative">
        <BackgroundFX />

        {/* Nebula Hero Section */}
        <header className="relative z-10 pt-[calc(80px+env(safe-area-inset-top))] pb-20 sm:pb-32 text-center overflow-hidden flex flex-col justify-center items-center">
          <div className="max-w-2xl mx-auto px-4">
            <h1 className="text-5xl sm:text-7xl font-extrabold mb-4 leading-tight tracking-tighter nebula-title">
              Cosmic Challenges
            </h1>
            <TaglineRotator />

            {error ? (
              <p className="text-red-300 mt-8 text-lg">{error}</p>
            ) : (
                <div className="mt-12">
                    <a
                      href="#competition-galaxies"
                      className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-blue-700 to-purple-800 text-white font-extrabold px-10 py-4 text-xl hover:from-blue-800 hover:to-purple-900 active:scale-98 transition-all duration-300 transform-gpu nebula-button-glow"
                    >
                      Explore Galaxies
                      <Star size={24} className="text-amber-300" />
                    </a>
                </div>
            )}
          </div>
        </header>

        {/* Main Content Area - Masonry Grid */}
        <section id="competition-galaxies" className="pb-16 pt-8">
          <div className="max-w-screen-xl mx-auto px-4">
            {error ? (
              <EmptyState onRefresh={() => location.reload()} label="challenges" />
            ) : filteredSlides.length === 0 ? (
              <EmptyState onRefresh={() => location.reload()} label={`${activeFilter.toLowerCase()} challenges`} />
            ) : (
              <div className="masonry-grid">
                {filteredSlides.map((s) => (
                  <div key={s.key} className="masonry-item mb-6"> {/* Add margin-bottom for spacing */}
                    {renderCompetitionCardByTheme(s)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Floating Filter Button */}
        <button
          onClick={() => setShowFilterDrawer(true)}
          className="fixed bottom-6 right-6 z-30 p-4 rounded-full bg-gradient-to-br from-purple-600 to-indigo-700 text-white shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 transform-gpu nebula-button-glow-small"
          aria-label="Open filters"
        >
          <Settings2 size={28} />
        </button>

        {/* Filter Drawer */}
        <FilterDrawer
          isOpen={showFilterDrawer}
          onClose={() => setShowFilterDrawer(false)}
          filters={availableFilters}
          activeFilter={activeFilter}
          onSelectFilter={setActiveFilter}
        />
      </main>

      {/* Global Nebula Theme Styles */}
      <style jsx global>{`
        /* --- Base Background & Scrollbar --- */
        body {
          background-color: #030712; /* Very dark background */
          color: white;
          font-family: 'Space Mono', 'Inter', sans-serif; /* Example futuristic font */
        }
        /* Custom scrollbar for webkit browsers */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(120, 80, 250, 0.4); /* Purple tint */
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(120, 80, 250, 0.6);
        }

        /* --- Nebula Title Styling --- */
        .nebula-title {
          font-family: 'Orbitron', sans-serif; /* A more distinct, futuristic font */
          background: linear-gradient(120deg, #e0e7ff, #a78bfa, #818cf8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 0 10px rgba(120, 80, 250, 0.6));
          animation: nebula-text-glow 5s ease-in-out infinite alternate;
        }
        @keyframes nebula-text-glow {
          0% { filter: drop-shadow(0 0 8px rgba(120, 80, 250, 0.5)); }
          50% { filter: drop-shadow(0 0 18px rgba(160, 100, 250, 0.8)); }
          100% { filter: drop-shadow(0 0 8px rgba(120, 80, 250, 0.5)); }
        }

        /* --- Nebula Button Glow --- */
        .nebula-button-glow {
            box-shadow: 0 0 15px rgba(120, 80, 250, 0.4), 0 0 5px rgba(200, 100, 250, 0.2);
            animation: button-hologlow 4s ease-in-out infinite alternate;
        }
        .nebula-button-glow-small {
            box-shadow: 0 0 10px rgba(120, 80, 250, 0.3);
            animation: button-hologlow-small 3s ease-in-out infinite alternate;
        }
        @keyframes button-hologlow {
            0% { box-shadow: 0 0 10px rgba(120, 80, 250, 0.4); }
            50% { box-shadow: 0 0 20px rgba(160, 100, 250, 0.7), 0 0 8px rgba(255, 255, 255, 0.3); }
            100% { box-shadow: 0 0 10px rgba(120, 80, 250, 0.4); }
        }
         @keyframes button-hologlow-small {
            0% { box-shadow: 0 0 8px rgba(120, 80, 250, 0.3); }
            50% { box-shadow: 0 0 15px rgba(160, 100, 250, 0.5), 0 0 6px rgba(255, 255, 255, 0.2); }
            100% { box-shadow: 0 0 8px rgba(120, 80, 250, 0.3); }
        }


        /* --- Nebula Card Styling --- */
        .nebula-card {
          background: linear-gradient(160deg, rgba(20, 30, 60, 0.85) 0%, rgba(10, 20, 40, 0.9) 100%);
          backdrop-filter: blur(8px);
          border: 1px solid transparent;
          border-image: linear-gradient(160deg, rgba(120, 80, 250, 0.4), rgba(50, 200, 250, 0.4)) 1;
          border-radius: 1.25rem; /* More rounded */
          overflow: hidden;
          transition: all 0.4s ease-out;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3), inset 0 0 10px rgba(120, 80, 250, 0.1);
        }
        .nebula-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.5), 0 0 25px rgba(120, 80, 250, 0.5);
          border-image: linear-gradient(160deg, rgba(120, 80, 250, 0.7), rgba(50, 200, 250, 0.7)) 1;
        }
        .nebula-card .card-title {
          font-family: 'Orbitron', sans-serif;
          color: #e0e7ff; /* Lighter text for titles */
        }
        .nebula-card .card-prize {
          color: #a78bfa; /* Purple tint for prizes */
        }


        /* --- Masonry Grid Layout --- */
        .masonry-grid {
          column-count: 1; /* Default to 1 column on small screens */
          column-gap: 1.5rem; /* Gap between columns */
        }
        @media (min-width: 640px) { /* sm */
          .masonry-grid {
            column-count: 2;
          }
        }
        @media (min-width: 1024px) { /* lg */
          .masonry-grid {
            column-count: 3;
          }
        }
        @media (min-width: 1280px) { /* xl */
          .masonry-grid {
            column-count: 4;
          }
        }
        .masonry-item {
          break-inside: avoid; /* Prevents items from breaking across columns */
          page-break-inside: avoid; /* Older browsers */
          -webkit-column-break-inside: avoid; /* Safari/Chrome */
        }


        /* --- Background float animations (updated values for Nebula vibe) --- */
        @keyframes float-slow {
          0% { transform: translateY(0) translateX(0) scale(1); }
          50% { transform: translateY(30px) translateX(15px) scale(1.02); opacity: 0.12; }
          100% { transform: translateY(0) translateX(0) scale(1); }
        }
        @keyframes float-slower {
          0% { transform: translateY(0) translateX(0) scale(1); }
          50% { transform: translateY(-25px) translateX(-18px) scale(0.98); opacity: 0.07; }
          100% { transform: translateY(0) translateX(0) scale(1); }
        }
        @keyframes float-slowest {
          0% { transform: translateY(0) translateX(0) scale(1); }
          50% { transform: translateY(20px) translateX(-10px) scale(1.01); opacity: 0.06; }
          100% { transform: translateY(0) translateX(0) scale(1); }
        }
        .animate-float-slow { animation: float-slow 20s ease-in-out infinite; }
        .animate-float-slower { animation: float-slower 25s ease-in-out infinite; }
        .animate-float-slowest { animation: float-slowest 30s ease-in-out infinite; }

        @media (prefers-reduced-motion: reduce) {
          * { scroll-behavior: auto !important; animation: none !important; transition: none !important; }
        }
      `}</style>
    </>
  );
}