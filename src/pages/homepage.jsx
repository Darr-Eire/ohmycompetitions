'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import DailyCompetitionCard from '@components/DailyCompetitionCard';
import FreeCompetitionCard from '@components/FreeCompetitionCard';
import PiCompetitionCard from '@components/PiCompetitionCard';
import CryptoGiveawayCard from '@components/CryptoGiveawayCard';
import CompetitionCard from '@components/CompetitionCard';
import PiCashHeroBanner from '@components/PiCashHeroBanner';
import MiniPrizeCarousel from '@components/MiniPrizeCarousel';

export default function HomePage() {
  const [liveCompetitions, setLiveCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch live competition data from API
  useEffect(() => {
    const fetchLiveData = async () => {
      try {
        setLoading(true);
        console.log('🔄 Fetching live competition data...');
        
        const response = await fetch('/api/competitions/all');
        if (!response.ok) {
          throw new Error(`Failed to fetch competitions: ${response.status}`);
        }
        
        const result = await response.json();
        const liveData = result.data || [];
        
        console.log('✅ Fetched live competition data:', {
          count: liveData.length,
          sample: liveData.slice(0, 2).map(c => ({
            slug: c.comp?.slug,
            ticketsSold: c.comp?.ticketsSold,
            totalTickets: c.comp?.totalTickets
          }))
        });

        // Process live database data
        const activeCompetitions = processLiveData(liveData);
        setLiveCompetitions(activeCompetitions);
        
      } catch (err) {
        console.error('❌ Failed to fetch live competition data:', err);
        setError(err.message);
        
        // Don't fall back to static data - just show empty state
        setLiveCompetitions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLiveData();
  }, []);

  // Process live database data
  const processLiveData = (liveData) => {
    // Filter out competitions that are not active
    const activeCompetitions = liveData.filter(comp => 
      comp.comp?.status === 'active' && 
      !comp.comp?.comingSoon
    );

    console.log('✅ Processed live competition data:', {
      total: liveData.length,
      active: activeCompetitions.length,
      sample: activeCompetitions.slice(0, 2).map(c => ({
        slug: c.comp?.slug,
        title: c.title,
        theme: c.theme,
        ticketsSold: c.comp?.ticketsSold,
        totalTickets: c.comp?.totalTickets
      }))
    });

    return activeCompetitions;
  };

  // Group competitions by category - ONLY from database
  const getCompetitionsByCategory = (category) => {
    const categoryComps = liveCompetitions.filter(item => {
      const theme = item.theme || 'tech'; // Default to tech if no theme
      
      if (category === 'tech') return theme === 'tech';
      if (category === 'premium') return theme === 'premium';
      if (category === 'pi') return theme === 'pi';
      if (category === 'daily') return theme === 'daily';
      if (category === 'free') return theme === 'free';
      if (category === 'crypto') return theme === 'crypto';
      
      return false;
    });

    console.log(`📊 Found ${categoryComps.length} database competitions for ${category}:`, 
      categoryComps.map(c => c.title || c.comp?.title));
    
    return categoryComps;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading live competition data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.warn('⚠️ Using static data due to API error:', error);
  }

  return (
    <>
      <MiniPrizeCarousel items={liveCompetitions} />

      {/* Hero Banner */}
      <div className="mt-2 mb-4 flex justify-center">
        <PiCashHeroBanner />
      </div>

      <main className="space-y-10">
        {/* Only show sections that have competitions */}
        {(() => {
          const techComps = getCompetitionsByCategory('tech');
          const premiumComps = getCompetitionsByCategory('premium');
          const piComps = getCompetitionsByCategory('pi');
          const cryptoComps = getCompetitionsByCategory('crypto');
          const dailyComps = getCompetitionsByCategory('daily');
          const freeComps = getCompetitionsByCategory('free');

          const totalCompetitions = techComps.length + premiumComps.length + piComps.length + cryptoComps.length + dailyComps.length + freeComps.length;

          if (totalCompetitions === 0) {
            return (
              <div className="text-center py-12">
                <div className="bg-[#0f172a] border border-cyan-400 rounded-lg p-8 max-w-2xl mx-auto">
                  <h2 className="text-2xl font-bold text-cyan-300 mb-4">🏆 No Competitions Available</h2>
                  <p className="text-gray-300 mb-6">
                    There are currently no active competitions. Create some exciting competitions to get started!
                  </p>
                  <Link
                    href="/admin/competitions/create"
                    className="inline-block bg-cyan-500 hover:bg-cyan-600 text-black px-6 py-3 rounded-lg font-bold transition"
                  >
                    ➕ Create Your First Competition
                  </Link>
                </div>
              </div>
            );
          }

          return (
            <>
              {techComps.length > 0 && (
                <Section title="Featured Competitions" items={techComps} viewMoreHref="/competitions/featured" />
              )}
              {premiumComps.length > 0 && (
                <Section title="Travel & Lifestyle" items={premiumComps} viewMoreHref="/competitions/travel" />
              )}
              {piComps.length > 0 && (
                <Section title="Pi Giveaways" items={piComps} viewMoreHref="/competitions/pi" extraClass="mt-12" />
              )}
              {cryptoComps.length > 0 && (
                <Section title="Crypto Giveaways" items={cryptoComps} viewMoreHref="/competitions/crypto-giveaways" />
              )}
              {dailyComps.length > 0 && (
                <Section title="Daily Competitions" items={dailyComps} viewMoreHref="/competitions/daily" extraClass="mt-12" />
              )}
              {freeComps.length > 0 && (
                <Section title="Free Competitions" items={freeComps} viewMoreHref="/competitions/free" extraClass="mt-12" />
              )}
            </>
          );
        })()}

        <section className="w-full bg-white/5 backdrop-blur-lg px-4 sm:px-6 py-8 my-4 border border-cyan-400 rounded-3xl shadow-[0_0_60px_#00ffd577] neon-outline">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-center text-cyan-300 mb-6 font-orbitron">
              ✨ Featured Free Competition ✨
            </h2>

            <FreeCompetitionCard
              comp={{ endsAt: '2025-05-10T23:59:59Z', ticketsSold: 0, totalTickets: 10000, slug: 'pi-to-the-moon' }}
              title="Pi To The Moon"
              prize="10,000 π"
            />
          </div>
        </section>

        <TopWinnersCarousel />

        <div className="flex justify-center mt-8">
          <div className="grid grid-cols-2 gap-4 w-full max-w-md px-4 py-6 bg-gradient-to-r from-cyan-300 to-blue-500 rounded-xl shadow-lg text-black text-center text-sm sm:text-base">
            <Stat label="Winners" value="44,000+" />
            <Stat label="Total Pi Won" value="106,400 π" />
            <Stat label="Donated to Charity" value="15,000 π" />
            <Stat label="User Rated" value="5★" />
          </div>
        </div>
      </main>
    </>
  );
}

function Section({ title, items = [], viewMoreHref, viewMoreText = 'View More', extraClass = '' }) {
  const lower = title.toLowerCase();
  const isDaily = lower.includes('daily');
  const isFree = lower.includes('free');
  const isPi = lower.includes('pi');
  const isCrypto = lower.includes('crypto');

  // Only show 3 items per category
  const displayItems = items.slice(0, 3);

  return (
    <section className={`mb-12 ${extraClass}`}>
      <div className="text-center mb-12">
        <h2 className="w-full text-base font-bold text-center text-cyan-300 px-4 py-3 rounded-xl font-orbitron shadow-[0_0_30px_#00fff055] bg-gradient-to-r from-[#0f172a]/70 via-[#1e293b]/70 to-[#0f172a]/70 backdrop-blur-md border border-cyan-400">
          {title}
        </h2>
      </div>

      <div className="centered-carousel lg:hidden">
        {displayItems.map((item, i) => renderCard(item, i, { isDaily, isFree, isPi, isCrypto }))}
      </div>

      <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {displayItems.map((item, i) => renderCard(item, i, { isDaily, isFree, isPi, isCrypto }))}
      </div>

      <div className="text-center mt-4">
        <Link
          href={viewMoreHref}
          className="inline-block text-base font-bold px-3 py-1.5 rounded-md font-medium text-black bg-gradient-to-r from-[#00ffd5] to-[#0077ff] shadow hover:opacity-90 transition"
        >
          {viewMoreText}
        </Link>
      </div>
    </section>
  );
}

function renderCard(item, i, { isDaily, isFree, isPi, isCrypto }) {
  const key = item?.comp?.slug || `item-${i}`;
  if (!item?.comp) return null;

  if (isDaily) return <DailyCompetitionCard key={key} {...item} />;
  if (isFree) return <FreeCompetitionCard key={key} {...item} />;
  if (isPi) return <PiCompetitionCard key={key} {...item} />;
  if (isCrypto) return <CryptoGiveawayCard key={key} {...item} />;

  return (
    <CompetitionCard
      key={key}
      comp={{ ...item.comp, comingSoon: item.comp.comingSoon ?? false }}
      title={item.title}
      prize={item.prize}
      fee={`${(item.comp.entryFee ?? 0).toFixed(2)} π`}
      imageUrl={item.imageUrl}
      endsAt={item.comp.endsAt}
      disableGift={true}
    />
  );
}

function TopWinnersCarousel() {
  const winners = [
    { name: 'Jack Jim', prize: 'Matchday Tickets', date: 'March 26th', image: '/images/winner2.png' },
    { name: 'Shanahan', prize: 'Playstation 5', date: 'February 14th', image: '/images/winner2.png' },
    { name: 'Emily Rose', prize: 'Luxury Car', date: 'January 30th', image: '/images/winner2.png' },
    { name: 'John Doe', prize: '€10,000 Pi', date: 'December 15th', image: '/images/winner2.png' },
  ];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % winners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [winners.length]);

  const current = winners[index];

  return (
    <div className="max-w-md mx-auto mt-12 bg-white/10 backdrop-blur-lg rounded-xl shadow-lg p-6 text-white text-center">
      <h2 className="text-2xl font-bold mb-4">Top Winners</h2>
      <div className="flex justify-center items-center mb-4">
        <Image src={current.image} alt={current.name} width={120} height={120} className="rounded-full border-4 border-blue-500" />
      </div>
      <h3 className="text-xl font-semibold">{current.name}</h3>
      <p className="text-blue-300">{current.prize}</p>
      <p className="text-sm text-white/70">{current.date}</p>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <div className="text-xl font-bold">{value}</div>
      <div>{label}</div>
    </div>
  );
}
