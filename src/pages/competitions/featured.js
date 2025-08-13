'use client';

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import CompetitionCard from '@components/CompetitionCard';
import { techItems } from '@data/competitions';

export default function FeaturedCompetitionsPage() {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  useEffect(() => {
    const fetchCompetitions = async () => {
      setLoading(true);
      setError(null);

      try {
        const res  = await fetch('/api/competitions/all');
        if (!res.ok) throw new Error(`API error ${res.status}`);
        const json = await res.json();
        console.log('🏷️  /api/competitions/all →', json);

        // support both array and { data: [...] } shapes
        const raw = Array.isArray(json) ? json : json.data || [];

        // ⚠️ filter on c.theme, not c.comp.theme
        const now = new Date();
        const techLive = raw.filter(c =>
          c.theme === 'tech' &&
          c.comp?.status === 'active' &&
          !(c.comp.endsAt && new Date(c.comp.endsAt) < now)
        );

        setCompetitions(
          techLive.length > 0
            ? techLive
            : techItems         // fallback if no live tech competitions
        );
      } catch (err) {
        console.error('❌ Featured fetch error:', err);
        setError('Couldn’t load live featured competitions.');
        setCompetitions(techItems);
      } finally {
        setLoading(false);
      }
    };

    fetchCompetitions();
  }, []);

  return (
    <>
      <Head>
        <title>Featured Competitions | OhMyCompetitions</title>
      </Head>

      <main className="app-background min-h-screen text-white">
        <div className="max-w-screen-lg mx-auto px-4 sm:px-0">
          <h1 className="
            text-2xl font-bold text-center mb-4
            bg-gradient-to-r from-[#00ffd5] to-[#0077ff]
            bg-clip-text text-transparent
          ">
            Featured Competitions
          </h1>
          <p className="text-center max-w-md mx-auto mb-8">
            {loading
              ? 'Loading featured competitions…'
              : error
              ? error
              : 'Try your luck at one of our featured competitions from as little as '}
            {!loading && !error && <span className="font-semibold">0.35 π</span>}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-500" />
          </div>
        ) : (
          <div className="max-w-screen-lg mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 px-4 sm:px-0 mt-8">
            {competitions.length > 0 ? (
              competitions.map(({ comp, title, prize, href, imageUrl }) => {
                const fee =
                  typeof comp.entryFee === 'number'
                    ? `${comp.entryFee.toFixed(2)} π`
                    : '0.00 π';

                return (
                  <CompetitionCard
                    key={comp.slug}
                    comp={{ ...comp, comingSoon: comp.comingSoon ?? false }}
                    title={title}
                    prize={prize}
                    fee={fee}
                    imageUrl={imageUrl}
                    endsAt={comp.endsAt}
                    href={href}
                  />
                );
              })
            ) : (
              <p className="col-span-full text-center text-gray-400">
                No featured competitions are live right now. Check back soon!
              </p>
            )}
          </div>
        )}
      </main>
    </>
  );
}
