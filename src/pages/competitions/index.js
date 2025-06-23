'use client';

<<<<<<< HEAD
import { useState, useEffect } from 'react';
import { allComps } from '@data/competitions'; // Keep as fallback
=======
import { useState } from 'react';
import {
  techItems,
  premiumItems,
  piItems,
  freeItems,
  cryptoGiveawaysItems,
  dailyItems,
} from '@data/competitions';

>>>>>>> dbf9e22647ccedf5f145c8c79c6ca5f2d1252e89
import CompetitionCard from '@components/CompetitionCard';
import PiCompetitionCard from '@components/PiCompetitionCard';
import DailyCompetitionCard from '@components/DailyCompetitionCard';
import FreeCompetitionCard from '@components/FreeCompetitionCard';
import CryptoGiveawayCard from '@components/CryptoGiveawayCard';

// Ensure theme is attached to each item
const themed = (items, theme) => items.map((item) => ({ ...item, theme }));

const FILTERS = {
  All: [
    ...themed(techItems, 'tech'),
    ...themed(premiumItems, 'premium'),
    ...themed(piItems, 'pi'),
    ...themed(freeItems, 'free'),
    ...themed(cryptoGiveawaysItems, 'crypto'),
    ...themed(dailyItems, 'daily'),
  ],
  Pi: themed(piItems, 'pi'),
  Crypto: themed(cryptoGiveawaysItems, 'crypto'),
  Free: themed(freeItems, 'free'),
  Daily: themed(dailyItems, 'daily'),
  Tech: themed(techItems, 'tech'),
  Premium: themed(premiumItems, 'premium'),
};

export default function AllCompetitionsPage() {
<<<<<<< HEAD
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch competitions from database
  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/competitions/all', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch competitions');
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch competitions');
        }

        console.log('✅ Competitions loaded from database:', result.data.length);
        setCompetitions(result.data);
      } catch (err) {
        console.error('❌ Error fetching competitions:', err);
        console.log('🔄 Falling back to static data');
        setCompetitions(allComps); // Fallback to static data
        setError('Using cached data - some information may be outdated');
      } finally {
        setLoading(false);
      }
    };

    fetchCompetitions();
  }, []);

  const renderCompetitionCard = (item) => {
    const props = {
      key: item.comp?.slug || item.title,
      comp: item,
=======
  const [active, setActive] = useState('All');

  const renderCard = (item, i) => {
    const key = item.comp?.slug || `item-${i}`;
    const props = {
      key,
      comp: item.comp,
>>>>>>> dbf9e22647ccedf5f145c8c79c6ca5f2d1252e89
      title: item.title,
      prize: item.prize,
      fee: `${(item.comp?.entryFee ?? 0).toFixed(2)} π`,
      imageUrl: item.imageUrl,
      endsAt: item.comp?.endsAt,
    };

    switch (item.theme) {
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
  };

  if (loading) {
    return (
      <main className="app-background min-h-screen p-4 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-cyan-400 mx-auto"></div>
          <p className="mt-4 text-cyan-300">Loading competitions...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="app-background min-h-screen px-4 py-2 text-white font-orbitron">
    {/* Hero banner */}
<div className="text-center mb-0 mt-0">
  <h1 className="text-xl sm:text-xl font-bold text-cyan-300 mb-2">
    Explore Live Competitions
  </h1>
  <p className="text-white/80 max-w-md mx-auto text-xs sm:text-sm leading-snug">
    Enter exclusive competitions powered by Pi. Win tech, crypto, lifestyle experiences and more — new draws every week.
  </p>
</div>

<<<<<<< HEAD
      {error && (
        <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500 rounded-lg text-yellow-200 text-sm text-center">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {competitions.map(item => renderCompetitionCard(item))}
=======

      {/* Filter bar */}
      <div className="flex flex-wrap justify-center gap-3 mb-10">
        {Object.keys(FILTERS).map((key) => (
          <button
            key={key}
            onClick={() => setActive(key)}
            className={`px-4 py-2 rounded-md border text-sm font-bold transition ${
              active === key
                ? 'bg-cyan-400 text-black shadow-lg'
                : 'border-cyan-400 text-cyan-300 hover:bg-cyan-800/20'
            }`}
          >
            {key}
          </button>
        ))}
      </div>

      {/* Grid display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {FILTERS[active].map((item, i) => renderCard(item, i))}
>>>>>>> dbf9e22647ccedf5f145c8c79c6ca5f2d1252e89
      </div>

      {competitions.length === 0 && !loading && (
        <div className="text-center text-gray-400 mt-12">
          <p>No competitions available at the moment.</p>
        </div>
      )}
    </main>
  );
}
