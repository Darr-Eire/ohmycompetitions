'use client';

import { useState, useEffect } from 'react';
import CompetitionCard from '@components/CompetitionCard';
import PiCompetitionCard from '@components/PiCompetitionCard';
import DailyCompetitionCard from '@components/DailyCompetitionCard';
import FreeCompetitionCard from '@components/FreeCompetitionCard';
import CryptoGiveawayCard from '@components/CryptoGiveawayCard';

export default function AllCompetitionsPage() {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');

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
        setCompetitions([]);
        setError('Failed to load competitions. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCompetitions();
  }, []);

  // Filter competitions by theme
  const getFilteredCompetitions = () => {
    if (activeFilter === 'All') return competitions;
    return competitions.filter(comp => comp.theme?.toLowerCase() === activeFilter.toLowerCase());
  };

  // Get unique themes for filter buttons
  const getAvailableFilters = () => {
    const themes = new Set(competitions.map(comp => comp.theme).filter(Boolean));
    return ['All', ...Array.from(themes).map(theme => 
      theme.charAt(0).toUpperCase() + theme.slice(1)
    )];
  };

  const renderCompetitionCard = (item) => {
    const props = {
      key: item.comp?.slug || item.title,
      comp: item.comp,
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

  const filteredCompetitions = getFilteredCompetitions();
  const availableFilters = getAvailableFilters();

  return (
    <main className="app-background min-h-screen px-4 py-2 text-white font-orbitron">
      {/* Hero banner */}
      <div className="text-center mb-6 mt-0">
        <h1 className="text-xl sm:text-xl font-bold text-cyan-300 mb-2">
          Explore Live Competitions
        </h1>
        <p className="text-white/80 max-w-md mx-auto text-xs sm:text-sm leading-snug">
          Enter exclusive competitions powered by Pi. Win tech, crypto, lifestyle experiences and more — new draws every week.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500 rounded-lg text-yellow-200 text-sm text-center">
          {error}
        </div>
      )}

      {/* Filter bar */}
      {availableFilters.length > 1 && (
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          {availableFilters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-md border text-sm font-bold transition ${
                activeFilter === filter
                  ? 'bg-cyan-400 text-black shadow-lg'
                  : 'border-cyan-400 text-cyan-300 hover:bg-cyan-800/20'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      )}

      {/* Grid display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompetitions.map(item => renderCompetitionCard(item))}
      </div>

      {filteredCompetitions.length === 0 && !loading && (
        <div className="text-center text-gray-400 mt-12">
          <p>No competitions available at the moment.</p>
          <p className="text-sm mt-2">Check back soon for new competitions!</p>
        </div>
      )}
    </main>
  );
}
