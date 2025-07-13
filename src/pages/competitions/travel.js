'use client';

import Head from 'next/head';
import { useEffect, useState } from 'react';
import CompetitionCard from '@components/CompetitionCard';

export default function TravelPage() {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch competitions from database
  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/competitions/all');
        if (!response.ok) {
          throw new Error(`Failed to fetch competitions: ${response.status}`);
        }
        
        const result = await response.json();
        const liveData = result.data || [];
        
        // Filter for premium theme competitions only
        const premiumCompetitions = liveData.filter(comp => 
          comp.theme === 'premium' && 
          comp.comp?.status === 'active' && 
          !comp.comp?.comingSoon
        );

        console.log(`📊 Found ${premiumCompetitions.length} premium competitions for travel page`);
        setCompetitions(premiumCompetitions);
        
      } catch (err) {
        console.error('❌ Failed to fetch competitions:', err);
        setError(err.message);
        setCompetitions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCompetitions();
  }, []);

  // Find lowest entry fee among competitions for subtitle
  const lowestEntryFee = competitions.reduce((min, item) => {
    const fee = item.comp?.entryFee ?? Infinity;
    return fee < min ? fee : min;
  }, Infinity);

  if (loading) {
    return (
      <main className="app-background min-h-screen px-4 py-8 text-white">
        <div className="max-w-screen-lg mx-auto text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading travel competitions...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="app-background min-h-screen px-4 py-8 text-white">
        <div className="max-w-screen-lg mx-auto text-center">
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-6">
            <p className="text-red-400">Error loading competitions: {error}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <Head>
        <title>Travel Competitions | OhMyCompetitions</title>
      </Head>

      <main className="app-background min-h-screen px-4 py-8 text-white">
        <div className="max-w-screen-lg mx-auto px-4 sm:px-0">
          <h1
            className="
              text-3xl font-bold text-center mb-4
              bg-gradient-to-r from-[#00ffd5] to-[#0077ff]
              bg-clip-text text-transparent
            "
          >
            Travel & Lifestyle Giveaways
          </h1>

          {lowestEntryFee !== Infinity && (
            <p className="text-center text-white text-base sm:text-lg max-w-md mx-auto mb-8">
              Explore exclusive travel & lifestyle giveaways starting from just{' '}
              <span className="font-semibold">{lowestEntryFee.toFixed(2)} π</span> per entry!
            </p>
          )}

          {competitions.length === 0 ? (
            <div className="text-center">
              <div className="bg-[#0f172a] border border-cyan-400 rounded-lg p-8">
                <h2 className="text-2xl font-bold text-cyan-300 mb-4">✈️ No Travel Competitions</h2>
                <p className="text-gray-300">
                  There are currently no active travel & lifestyle competitions. Check back soon for exciting travel giveaways!
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {competitions.map((item, index) => (
                <CompetitionCard
                  key={item.comp?.slug || index}
                  {...item}
                  comingSoon={item.comingSoon || item.comp?.comingSoon || false}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
