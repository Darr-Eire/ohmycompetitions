'use client';

import { useState, useEffect } from 'react';
import CompetitionCard from '@components/CompetitionCard';
import PiCompetitionCard from '@components/PiCompetitionCard';
import DailyCompetitionCard from '@components/DailyCompetitionCard';
import FreeCompetitionCard from '@components/FreeCompetitionCard';
import CryptoGiveawayCard from '@components/CryptoGiveawayCard';
import LaunchCompetitionCard from '@components/LaunchCompetitionCard';

export default function AllCompetitionsPage() {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/competitions/all', {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) throw new Error('Failed to fetch competitions');

        const result = await response.json();
        if (!result.success) throw new Error(result.error || 'Failed to fetch competitions');

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

  const getFilteredCompetitions = () => {
    if (activeFilter === 'All') return competitions;
    return competitions.filter(comp => comp.theme?.toLowerCase() === activeFilter.toLowerCase());
  };

  const getAvailableFilters = () => {
    const themes = new Set(competitions.map(comp => comp.theme).filter(Boolean));
    const formattedThemes = Array.from(themes).map(
      theme => theme.charAt(0).toUpperCase() + theme.slice(1)
    );
    return ['All', ...formattedThemes];
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

    switch (item.theme?.toLowerCase()) {
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
  };

  const renderGroupedCompetitions = () => {
    const grouped = competitions.reduce((acc, comp) => {
      const theme = comp.theme || 'Other';
      if (!acc[theme]) acc[theme] = [];
      acc[theme].push(comp);
      return acc;
    }, {});

    return Object.entries(grouped).map(([theme, comps]) => (
      <div key={theme} className="mb-12">
        <h2 className="text-2xl font-bold text-cyan-300 mb-4 capitalize text-center">
          {theme} Competitions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
          {comps.map((item) => renderCompetitionCard(item))}
        </div>
      </div>
    ));
  };

  const filteredCompetitions = getFilteredCompetitions();
  const availableFilters = getAvailableFilters();

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
    <main className="app-background min-h-screen px-0 py-0 text-white">
      <div className="text-center mb-6 mt-0">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-[#00ffd5] to-[#0077ff] bg-clip-text text-transparent mb-4">
          Explore Live Competitions
        </h1>
        <p className="text-center text-white text-base sm:text-lg max-w-md mx-auto mb-8">
          Enter exclusive Pi powered competitions to win tech, crypto, lifestyle prizes and more.
          New draws weekly – don’t miss your chance to join the fun and become our next big winner!
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500 rounded-lg text-yellow-200 text-sm text-center">
          {error}
        </div>
      )}

      {availableFilters.length > 0 && (
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

      {activeFilter === 'All' ? (
        <div className="mt-8">{renderGroupedCompetitions()}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16 mt-8">
          {filteredCompetitions.map((item) => renderCompetitionCard(item))}
        </div>
      )}

      {filteredCompetitions.length === 0 && !loading && (
        <div className="text-center text-gray-400 mt-12">
          <p>No competitions available at the moment.</p>
          <p className="text-sm mt-2">Check back soon for new competitions!</p>
        </div>
      )}
    </main>
  );
}
