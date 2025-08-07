// src/pages/competitions/launch-week.js
'use client';

import React, { useState, useEffect } from 'react';
import CompetitionCard from '@components/CompetitionCard';
import PiCompetitionCard from '@components/PiCompetitionCard';
import DailyCompetitionCard from '@components/DailyCompetitionCard';
import FreeCompetitionCard from '@components/FreeCompetitionCard';
import CryptoGiveawayCard from '@components/CryptoGiveawayCard';
import LaunchCompetitionCard from '@components/LaunchCompetitionCard';

export default function LaunchWeekCompetitionsPage() {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);

  useEffect(() => {
    async function fetchCompetitions() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch('/api/competitions/all');
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`HTTP ${res.status} – ${text}`);
        }
        const payload = await res.json();

        // normalize into array
        let arr = [];
        if (Array.isArray(payload)) {
          arr = payload;
        } else if (Array.isArray(payload.data)) {
          arr = payload.data;
        } else if (Array.isArray(payload.competitions)) {
          arr = payload.competitions;
        }

        // filter for launch theme
        const launchOnly = arr.filter(
          c => (c.theme || '').toLowerCase() === 'launch'
        );
        setCompetitions(launchOnly);
      } catch (err) {
        console.error('❌ fetch error:', err);
        setError(`Failed to load competitions: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }

    fetchCompetitions();
  }, []);

  // Just render the right card component
  const renderCard = item => {
    const comp = item.comp ?? item;
    const props = {
      key:      comp.slug || comp._id || item.title,
      comp,
      title:    item.title || comp.title,
      prize:    item.prize  || comp.prize,
      fee:      `${(comp.entryFee ?? 0).toFixed(2)} π`,
      imageUrl: item.imageUrl,
      endsAt:   comp.endsAt,
    };

    switch ((item.theme || '').toLowerCase()) {
      case 'launch': return <LaunchCompetitionCard {...props} />;
      case 'pi':     return <PiCompetitionCard    {...props} />;
      case 'daily':  return <DailyCompetitionCard {...props} />;
      case 'crypto': return <CryptoGiveawayCard   {...props} />;
      case 'free':   return <FreeCompetitionCard  {...props} />;
      default:       return <CompetitionCard      {...props} />;
    }
  };

  if (loading) {
    return (
      <main className="app-background min-h-screen flex items-center justify-center text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-cyan-400 mx-auto" />
          <p className="mt-4 text-white">
            Loading launch-week competitions…
          </p>
          <p className="mt-1 text-sm text-white">
            Join competitions from as little as 0.25 π!
          </p>
          <p className="mt-1 text-sm text-white font-bold">
            Good luck may the odds be ever in your favor!
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="app-background min-h-screen text-white px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-[#00ffd5] to-[#0077ff] bg-clip-text text-transparent">
        Launch Week Competitions
      </h1>
      <p className="text-center text-base text-white mb-4">
        Join competitions from as little as 0.25 π
      </p>
      <p className="text-center text-base text-white mb-4">
        Good luck may the odds be ever in your favor!
      </p>

      {error && (
        <div className="mb-6 p-4 bg-red-600/20 border border-red-600 rounded text-red-200 text-center">
          {error}
        </div>
      )}

      {competitions.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {competitions.map(renderCard)}
        </div>
      ) : (
        <p className="text-center text-gray-400 mt-12">
          No launch-week competitions are live right now. Check back soon!
        </p>
      )}
    </main>
  );
}
