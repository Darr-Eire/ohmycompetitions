'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import DailyCompetitionCard from '@components/DailyCompetitionCard';
import FreeCompetitionCard from '@components/FreeCompetitionCard';
import PiCompetitionCard from '@components/PiCompetitionCard';
import CryptoGiveawayCard from '@components/CryptoGiveawayCard';
import CompetitionCard from '@components/CompetitionCard';
import MiniPrizeCarousel from '@components/MiniPrizeCarousel';
import { miniGames } from '@data/minigames';

import {
  dailyItems,
  techItems,
  premiumItems,
  piItems,
  freeItems,
  cryptoGiveawaysItems,
} from '@data/competitions';
;


export default function HomePage() {
  const [liveCompetitions, setLiveCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLiveData = async () => {
      try {
        setLoading(true);
        console.log('🔄 Fetching live competition data...');

        const response = await fetch('/api/competitions/all');
        if (!response.ok) throw new Error(`Failed to fetch competitions: ${response.status}`);

        const result = await response.json();
        const liveData = result.data || [];

        console.log('✅ Fetched live competition data:', {
          count: liveData.length,
          sample: liveData.slice(0, 2).map(c => ({
            slug: c.comp?.slug,
            ticketsSold: c.comp?.ticketsSold,
            totalTickets: c.comp?.totalTickets,
          })),
        });

        const mergedCompetitions = mergeCompetitionData(liveData);
        setLiveCompetitions(mergedCompetitions);
      } catch (err) {
        console.error('❌ Failed to fetch live competition data:', err);
        setError(err.message);

        const staticCompetitions = [
          ...techItems,
          ...premiumItems,
          ...piItems,
          ...dailyItems,
          ...freeItems,
          ...cryptoGiveawaysItems,
        ].filter(item => {
          if (item.theme === 'crypto') return true;
          if (item.theme === 'tech') return true;
          return item.comp?.status === 'active' && !item.comp?.hasEnded;
        });

        setLiveCompetitions(staticCompetitions);
      } finally {
        setLoading(false);
      }
    };

    fetchLiveData();
  }, []);

  const mergeCompetitionData = (liveData) => {
    const staticItems = [
      ...techItems,
      ...premiumItems,
      ...piItems,
      ...dailyItems,
      ...freeItems,
      ...cryptoGiveawaysItems,
    ];

    const liveDataMap = {};
    liveData.forEach(liveComp => {
      if (liveComp.comp?.slug) {
        liveDataMap[liveComp.comp.slug] = liveComp;
      }
    });

    const now = new Date();

    const mergedItems = staticItems
      .map(staticItem => {
        const slug = staticItem.comp?.slug;
        const liveComp = liveDataMap[slug];

        const merged = liveComp
          ? {
              ...staticItem,
              imageUrl: liveComp.thumbnail || liveComp.imageUrl || staticItem.imageUrl,
              thumbnail: liveComp.thumbnail,
              comp: {
                ...staticItem.comp,
                ...liveComp.comp,
                ticketsSold: liveComp.comp.ticketsSold || 0,
                totalTickets: liveComp.comp.totalTickets || staticItem.comp.totalTickets,
                entryFee: liveComp.comp.entryFee || staticItem.comp.entryFee,
                comingSoon: liveComp.comp.comingSoon ?? staticItem.comp.comingSoon ?? false,
              },
            }
          : staticItem;

        return merged;
      })
      .filter(item => {
        const { endsAt, status, comingSoon } = item.comp || {};
        const hasEnded = endsAt && new Date(endsAt) < now;
        return status === 'active' && !hasEnded;
      });

    const staticSlugs = new Set(staticItems.map(item => item.comp?.slug).filter(Boolean));
    const adminOnlyCompetitions = liveData.filter(
      liveComp => liveComp.comp?.slug && !staticSlugs.has(liveComp.comp.slug)
    );

    let allMerged = [...mergedItems, ...adminOnlyCompetitions];

    // 💥 Move admin competitions first
    allMerged.sort((a, b) => {
      const aAdmin = !staticSlugs.has(a.comp?.slug);
      const bAdmin = !staticSlugs.has(b.comp?.slug);

      if (aAdmin && !bAdmin) return -1;
      if (!aAdmin && bAdmin) return 1;

      return 0;
    });

    return allMerged;
  };

 const getCompetitionsByCategory = (category) => {
  return liveCompetitions.filter(item => {
    const theme = item.theme || 'tech';

    // Only filter out non-admin for 'daily'
    if (category === 'daily') {
      const isFromStatic =
        [...techItems, ...premiumItems, ...piItems, ...dailyItems, ...freeItems, ...cryptoGiveawaysItems]
          .some(staticItem => staticItem.comp?.slug === item.comp?.slug);

      return theme === category && !isFromStatic;
    }

    // Allow all others (static + admin)
    return theme === category;
  });
};

  if (loading) {
    return (
      <div className="w-full py-8 flex flex-col items-center justify-start bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-24 w-32 border-t-2 border-b-2 border-cyan-300 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading live competition data...</p>
        </div>
      </div>
    );
  }

  if (error) console.warn('⚠️ Using static data due to API error:', error);

  return (
    <>
<div className="w-full space-y-1"> {/* shared wrapper with tight spacing */}
  {/* Welcome message */}
  <div className="text-center text-cyan-300 text-1xl sm:text-base font-medium font-orbitron">
   ☘️ Céad Míle Fáilte Pioneers let the competitions begin ☘️
  </div>

  {/* Marquee */}
  <div className="overflow-hidden bg-transparent">
  <div className="marquee-content text-cyan-300 text-md sm:text-base font-medium font-orbitron">
      Oh My Competitions is all about building with Pi Network for the Pi community. Our launch month competitions are zero profit designed to create trust, celebrate early winners and give back to Pioneers. All prizes go directly to you. Add us on Pi Profile (darreire2020 & Lyndz2020) More competitions are coming soon across a wide range of exciting categories. Join, win and help shape the future of Pi together
    </div>
  </div>
</div>
  {/* Mini carousel */}
  <MiniPrizeCarousel />

      <div className="mt-6 mb-8 flex justify-center">
        <Link
          href="/pi-cash-code"
          className="group relative bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] border border-cyan-500 rounded-xl px-8 py-6 shadow-md hover:shadow-cyan-500/30 transition-all duration-300 text-center w-full max-w-md"
        >
          <h1 className="text-2xl sm:text-3xl font-bold relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-500 to-cyan-300 animate-text-shimmer font-orbitron">
            Pi Cash Code
          </h1>
          <p className="mt-2 text-cyan-400 text-sm italic group-hover:text-cyan-200 transition-all duration-300">
            If you can dream you can win
          </p>
          <p className="mt-2 text-cyan-400 text-sm font-semibold underline group-hover:text-cyan-200 transition-all duration-300">
            Enter Here
          </p>
        </Link>
      </div>

      <main className="space-y-10">
        <Section title="Daily Competitions" items={getCompetitionsByCategory('daily')} viewMoreHref="/competitions/daily" extraClass="mt-12" />
        <Section title="Featured Competitions" items={getCompetitionsByCategory('tech')} viewMoreHref="/competitions/featured" />
        <Section title="Travel & Lifestyle" items={getCompetitionsByCategory('premium')} viewMoreHref="/competitions/travel" />
        <Section title="Pi Giveaways" items={getCompetitionsByCategory('pi')} viewMoreHref="/competitions/pi" extraClass="mt-12" />
        <Section title="Crypto Giveaways" items={getCompetitionsByCategory('crypto')} viewMoreHref="/competitions/crypto-giveaways" />

        <section className="w-full bg-white/5 backdrop-blur-lg px-4 sm:px-6 py-8 my-4 border border-cyan-300 rounded-3xl shadow-[0_0_60px_#00ffd577] neon-outline">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-center text-cyan-300 mb-6 font-orbitron">✨ Free Competition ✨</h2>
            <FreeCompetitionCard
              comp={{
                slug: 'pi-to-the-moon',
                endsAt: '2025-12-01T23:59:59Z',
                ticketsSold: 0,
                totalTickets: 10000,
                comingSoon: true,
                status: 'active',
              }}
              title="Pi To The Moon"
              prize="10,000 π"
              hideEntryButton
              buttonLabel="View Details"
            />
          </div>
        </section>

        <TopWinnersCarousel />
<div className="mt-6 px-4">
  <div className="bg-[#0a1024]/90 border border-cyan-700 rounded-xl px-4 py-6 shadow-[0_0_20px_#00fff055] text-center text-sm">
    <h2 className="text-lg font-bold text-cyan-300 mb-2">Our Vision for 2026: Impact Through Innovation</h2>
    <p className="text-white/80 mb-3 leading-relaxed">
      By the end of 2026, OhMyCompetitions aims to reach these community-first milestones,
      powered by the Pi Network and supported by Pioneers like you.
    </p>
    <ul className="text-cyan-200 space-y-1 font-medium">
      <li>🌍 Over <strong>100,000+ winners</strong> across the globe</li>
      <li>💰 <strong>500,000 π</strong> in distributed Pi prizes</li>
      <li>🎗 <strong>25,000 π</strong> donated to Pi causes & communities</li>
      <li>⭐ Maintained <strong>5★</strong> user-rated experience</li>
    </ul>
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

  return (
    <section className={`mb-12 ${extraClass}`}>
      <div className="text-center mb-12">
        <h2 className="w-full text-base font-bold text-center text-cyan-300 px-4 py-3 rounded-xl font-orbitron shadow-[0_0_30px_#00fff055] bg-gradient-to-r from-[#0f172a]/70 via-[#1e293b]/70 to-[#0f172a]/70 backdrop-blur-md border border-cyan-400">
          {title}
        </h2>
      </div>

      <div className="centered-carousel lg:hidden">
        {items.map((item, i) => renderCard(item, i, { isDaily, isFree, isPi, isCrypto }))}
      </div>

      <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {items.map((item, i) => renderCard(item, i, { isDaily, isFree, isPi, isCrypto }))}
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
      disableGift
    />
  );
}

function TopWinnersCarousel() {
  const winners = [
    { name: 'Jack Jim', prize: 'Matchday Tickets', date: 'March 26th', image: '/images/winner2.png' },
    { name: 'Shanahan', prize: 'Playstation 5', date: 'February 14th', image: '/images/winner2.png' },
    { name: 'Emily Rose', prize: 'Luxury Car', date: 'January 30th', image: '/images/winner2.png' },
    { name: 'John Doe', prize: '10,000 Pi', date: 'December 15th', image: '/images/winner2.png' },
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
  
    <div className="max-w-md mx-auto mt-12 bg-[#0a1024]/90 border border-cyan-500 backdrop-blur-lg rounded-xl shadow-[0_0_40px_#00fff055] p-6 text-white text-center">
      <h2 className="text-2xl font-bold text-cyan-300 mb-4 font-orbitron">Top Winners</h2>
      <div className="flex justify-center items-center mb-4">
        <Image src={current.image} alt={current.name} width={120} height={120} className="rounded-full border-4 border-cyan-400 shadow-lg" />
      </div>
      <h3 className="text-xl font-semibold">{current.name}</h3>
      <p className="text-cyan-200">{current.prize}</p>
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
