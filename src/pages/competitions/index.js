'use client';

import { useState, useEffect } from 'react';
import { allComps } from '@data/competitions'; // Keep as fallback
import CompetitionCard from '@components/CompetitionCard';
import PiCompetitionCard from '@components/PiCompetitionCard';
import DailyCompetitionCard from '@components/DailyCompetitionCard';
import FreeCompetitionCard from '@components/FreeCompetitionCard';
import CryptoGiveawayCard from '@components/CryptoGiveawayCard';

export default function AllCompetitionsPage() {
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
      title: item.title,
      prize: item.prize,
      fee: item.fee,
      theme: item.theme,
      imageUrl: item.imageUrl,
      endsAt: item.comp?.endsAt,
    };

    switch (item.theme) {
      case 'free':
        return <FreeCompetitionCard {...props} />;
      case 'daily':
        return <DailyCompetitionCard {...props} />;
      case 'crypto':
        return <CryptoGiveawayCard {...props} />;
      case 'pi':
        return <PiCompetitionCard {...props} />;
      case 'tech':
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
    <main className="app-background min-h-screen p-4 text-white">
      <h2 className="w-full text-base font-bold text-center text-cyan-300 px-4 py-3 rounded-xl font-orbitron shadow-[0_0_30px_#00fff055] bg-gradient-to-r from-[#0f172a]/70 via-[#1e293b]/70 to-[#0f172a]/70 backdrop-blur-md border border-cyan-400 mb-6">
        All Competitions
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500 rounded-lg text-yellow-200 text-sm text-center">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {competitions.map(item => renderCompetitionCard(item))}
      </div>

      {competitions.length === 0 && !loading && (
        <div className="text-center text-gray-400 mt-12">
          <p>No competitions available at the moment.</p>
        </div>
      )}
    </main>
  );
}
