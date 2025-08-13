'use client';

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import DailyCompetitionCard from '@components/DailyCompetitionCard';

export default function DailyCompetitionsPage() {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading]          = useState(true);
  const [error, setError]              = useState(null);

  useEffect(() => {
    async function fetchDaily() {
      setLoading(true);
      setError(null);

      try {
        const res  = await fetch('/api/competitions/all');
        if (!res.ok) throw new Error(`API error ${res.status}`);
        const json = await res.json();
        const raw  = Array.isArray(json) ? json : json.data || [];

        const now = new Date();
        const dailyLive = raw.filter(c =>
          c.theme === 'daily' &&
          c.comp?.status === 'active' &&
          !(c.comp.endsAt && new Date(c.comp.endsAt) < now)
        );

        setCompetitions(dailyLive);
      } catch (err) {
        console.error('❌ Error fetching daily competitions:', err);
        setError('Couldn’t load daily competitions.');
      } finally {
        setLoading(false);
      }
    }

    fetchDaily();
  }, []);

  return (
    <>
      <Head>
        <title>Daily Competitions | OhMyCompetitions</title>
      </Head>

      <main className="app-background min-h-screen text-white">
        <div className="max-w-screen-lg mx-auto px-4 sm:px-0">
          <h1 className="
            text-2xl font-bold text-center mb-4
            bg-gradient-to-r from-[#00ffd5] to-[#0077ff]
            bg-clip-text text-transparent
          ">
            Daily Competitions
          </h1>

          <p className="text-center text-white text-base sm:text-lg max-w-md mx-auto mb-10">
            {loading
              ? 'Loading daily competitions…'
              : error
              ? error
              : 'Try your luck in our daily competitions starting from as little as '}
            {!loading && !error && <span className="font-semibold">0.31 π</span>}
          </p>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-500" />
            </div>
          ) : error ? null : (
            competitions.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16 mt-8">
                {competitions.map(item => {
                  const hasStarted = item.comp.startsAt
                    ? new Date(item.comp.startsAt) <= new Date()
                    : true;

                  return (
                    <DailyCompetitionCard
                      key={item.comp.slug || item._id}
                      comp={item.comp}
                      title={item.title}
                      prize={item.prize}
                      fee={
                        typeof item.comp.entryFee === 'number'
                          ? `${item.comp.entryFee.toFixed(2)} π`
                          : 'Free'
                      }
                      isLive={hasStarted}
                    />
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-gray-400 mt-12">
                No daily competitions are live right now. Check back soon!
              </p>
            )
          )}
        </div>
      </main>
    </>
  );
}
