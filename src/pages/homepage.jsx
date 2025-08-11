'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import PrizeCard3D from '@components/PrizeCard3D';
import DailyCompetitionCard from '@components/DailyCompetitionCard';
import FreeCompetitionCard from '@components/FreeCompetitionCard';
import PiCompetitionCard from '@components/PiCompetitionCard';
import CryptoGiveawayCard from '@components/CryptoGiveawayCard';
import CompetitionCard from '@components/CompetitionCard';
import MiniPrizeCarousel from '@components/MiniPrizeCarousel';
import { miniGames } from '@data/minigames';
import TutorialOverlay from '@components/TutorialOverlay';
import LaunchCompetitionCard from '@components/LaunchCompetitionCard';
import FunnelStagesRow from '../components/FunnelStagesRow';

// at the top of src/components/FunnelStagesRow.jsx

import {
  dailyItems,
  techItems,
  premiumItems,
  piItems,
  freeItems,
  cryptoGiveawaysItems,
} from '@data/competitions';
;

// ⬇️ bring your data & components from wherever you store them


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

        // graceful fallback to static sets
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

    // merge live props into static where slugs match
    const mergedItems = staticItems
      .map(staticItem => {
        const slug = staticItem.comp?.slug;
        const liveComp = slug ? liveDataMap[slug] : null;

        return liveComp
          ? {
              ...staticItem,
              imageUrl: liveComp.thumbnail || liveComp.imageUrl || staticItem.imageUrl,
              thumbnail: liveComp.thumbnail,
              comp: {
                ...staticItem.comp,
                ...liveComp.comp,
                ticketsSold: liveComp.comp?.ticketsSold ?? 0,
                totalTickets: liveComp.comp?.totalTickets ?? staticItem.comp?.totalTickets,
                entryFee: liveComp.comp?.entryFee ?? staticItem.comp?.entryFee,
                comingSoon: liveComp.comp?.comingSoon ?? staticItem.comp?.comingSoon ?? false,
              },
            }
          : staticItem;
      })
      .filter(item => {
        const { endsAt, status } = item.comp || {};
        const hasEnded = endsAt && new Date(endsAt) < now;
        return status === 'active' && !hasEnded;
      });

    // include live comps that aren’t in static sets (admin-only)
    const staticSlugs = new Set(staticItems.map(item => item.comp?.slug).filter(Boolean));
    const adminOnlyCompetitions = liveData.filter(
      liveComp => liveComp.comp?.slug && !staticSlugs.has(liveComp.comp.slug)
    );

    let allMerged = [...mergedItems, ...adminOnlyCompetitions];

    // sort: live first, then admin extras
    allMerged.sort((a, b) => {
      const nowMs = Date.now();

      const aStarts = a?.comp?.startsAt ? new Date(a.comp.startsAt).getTime() : 0;
      const aEnds   = a?.comp?.endsAt ? new Date(a.comp.endsAt).getTime() : 0;
      const bStarts = b?.comp?.startsAt ? new Date(b.comp.startsAt).getTime() : 0;
      const bEnds   = b?.comp?.endsAt ? new Date(b.comp.endsAt).getTime() : 0;

      const aLive = aStarts <= nowMs && nowMs < aEnds;
      const bLive = bStarts <= nowMs && nowMs < bEnds;
      if (aLive !== bLive) return aLive ? -1 : 1;

      const aAdmin = !staticSlugs.has(a?.comp?.slug);
      const bAdmin = !staticSlugs.has(b?.comp?.slug);
      if (aAdmin !== bAdmin) return aAdmin ? -1 : 1;

      return 0;
    });


    return allMerged;
  };
  const { s1Filling, s2Live, s3Live, s4Live } = React.useMemo(() => {
    const byStage = (n) =>
      liveCompetitions.filter((item) => {
        const stage =
          item?.comp?.funnelStage ??
          item?.comp?.stage ??
          item?.stage;
        const theme = item?.theme;
        const slug  = item?.comp?.slug || '';
        return (
          stage === n ||
          theme === `stage${n}` ||
          slug.includes(`stage${n}`)
        );
      });

    return {
      s1Filling: byStage(1),
      s2Live: byStage(2),
      s3Live: byStage(3),
      s4Live: byStage(4),
    };
  }, [liveCompetitions]);

  // --- Safe guards so JSX never crashes ---
  const safeS1 = Array.isArray(s1Filling) ? s1Filling : [];
  const safeS2 = Array.isArray(s2Live)    ? s2Live    : [];
  const safeS3 = Array.isArray(s3Live)    ? s3Live    : [];
  const safeS4 = Array.isArray(s4Live)    ? s4Live    : [];

  // --- Hoisted helper so it's defined before JSX uses it ---
  function getCompetitionsByCategory(category) {
    const staticSlugs = new Set(
      [...techItems, ...premiumItems, ...piItems, ...dailyItems, ...freeItems, ...cryptoGiveawaysItems]
        .map(item => item.comp?.slug)
        .filter(Boolean)
    );

    return liveCompetitions.filter(item => {
      const theme = item.theme || 'tech';
      const isStatic = staticSlugs.has(item.comp?.slug);

      // Only show dynamic (non-static) for these buckets
      if (['daily', 'pi'].includes(category)) {
        return theme === category && !isStatic;
      }
      // Default: include both static + dynamic if theme matches
      return theme === category;
    });
  }

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
{/* ===== Welcome ===== */}
<div className="w-full space-y-8 mt-5">
  <div className="text-center text-cyan-300 font-medium font-orbitron leading-snug">
    <div className="text-lg sm:text-base">☘️ Céad Míle Fáilte ☘️</div>
   
    <div className="text-sm sm:text-base">Let The Competitions Begin</div>
  </div>

  {/* Marquee */}
  <div className="overflow-hidden bg-transparent">
    <div className="marquee-content text-cyan-300 text-md sm:text-base font-medium font-orbitron">
      Oh My Competitions is all about building with Pi Network for the Pi community. Our OMC launch competitions are zero profit designed to create trust, celebrate early winners and give back to Pioneers. All prizes go directly to you. Add us on all Socials and our Pi Profile darreire2020. More competitions are coming soon across a wide range of exciting categories. Join, win and help shape the future of Pi together.
    </div>
  </div>
</div>

{/* Mini carousel */}
<MiniPrizeCarousel />

{/* Pi Cash Code CTA */}
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

{/* ===== Main sections ===== */}
<main className="space-y-10">
  <Section
    title="OMC Launch Week"
    items={getCompetitionsByCategory('launch')}
    viewMoreHref="/competitions/launch-week"
  />

  <Section
    title="Featured Competitions"
    items={getCompetitionsByCategory('tech')}
    viewMoreHref="/competitions/featured"
  />

  <Section
    title="Daily Competitions"
    items={getCompetitionsByCategory('daily')}
    viewMoreHref="/competitions/daily"
    extraClass="mt-12"
  />

  <Section
    title="Pi Giveaways"
    items={getCompetitionsByCategory('pi')}
    viewMoreHref="/competitions/pi"
    extraClass="mt-12"
  />

{/* OMC Step Competitions + Funnel in one block */}
<section className="mb-16 mt-16">
  {/* Header */}
  <div className="text-center mb-6">
    <h2 className="w-full text-base font-bold text-center text-cyan-300 px-4 py-3 rounded-xl font-orbitron shadow-[0_0_30px_#00fff055] bg-gradient-to-r from-[#0f172a]/70 via-[#1e293b]/70 to-[#0f172a]/70 backdrop-blur-md border border-cyan-400">
      OMC Pi Stages Competitions
    </h2>

    <p className="text-sm text-cyan-200 mt-3 italic flex items-center justify-center gap-6 flex-wrap">
      <span className="inline-block">
        Qualify <span className="text-white font-semibold">(Stage&nbsp;1)</span>
      </span>
      <span className="inline-block">
        Advance <span className="text-white font-semibold">(Stages&nbsp;2–4)</span>
      </span>
      <span className="inline-block">
        Win <span className="text-white font-semibold">(Stage&nbsp;5)</span>
      </span>
    </p>
  </div>

  {/* Fake "always live" data */}
  {(() => {
    const fakeStage = (stageNum) => ({
      entrants: Math.floor(Math.random() * 25),
      capacity: 25,
      advancing: stageNum < 5 ? 5 : 1,
      status: 'live', // Always live
      slug: `stage-${stageNum}-slug`,
      pricePi: stageNum === 1 ? 0.15 : 'Free',
      hasTicket: stageNum !== 1 // Pretend player has ticket for stages 2–5
    });

    // Always running data
    const fakeS1 = fakeStage(1);
    const fakeS2 = fakeStage(2);
    const fakeS3 = fakeStage(3);
    const fakeS4 = fakeStage(4);
    const fakeS5 = fakeStage(5);

    return (
      <div className="max-w-6xl mx-auto">
        <FunnelStagesRow
          s1={fakeS1}
          s2={fakeS2}
          s3={fakeS3}
          s4={fakeS4}
          s5={fakeS5}
          prizePoolPi={2150}
          onEnterStage1={() => {
            alert('✅ You have entered Stage 1!');
          }}
          className="shadow-[0_0_25px_rgba(0,255,255,0.15)]"
        />
      </div>
    );
  })()}
</section>


  {/* ================== Free Competitions Title ================== */}
  <div className="text-center my-8">
    <h2 className="w-full text-base font-bold text-center text-cyan-300 px-4 py-3 rounded-xl font-orbitron shadow-[0_0_30px_#00fff055] bg-gradient-to-r from-[#0f172a]/70 via-[#1e293b]/70 to-[#0f172a]/70 backdrop-blur-md border border-cyan-400">
      OMC Free Competitions
    </h2>
  </div>

  {/* Free competition highlight */}
  <section className="w-full bg-white/5 backdrop-blur-lg px-4 sm:px-6 py-8 my-4 border border-cyan-300 rounded-3xl shadow-[0_0_60px_#00ffd577] neon-outline">
    <div className="max-w-7xl mx-auto">
      <FreeCompetitionCard
        comp={{
          slug: 'pi-to-the-moon',
          startsAt: '',
          endsAt: '',
          ticketsSold: 0,
          totalTickets: 5000,
          comingSoon: true,
          status: 'active',
        }}
        title="Pi To The Moon"
        prize="7,500 π"
        hideEntryButton
        buttonLabel="View Detail"
      />
    </div>
  </section>

  {/* Coming Soon Categories */}
  <section className="mt-8">
    <div className="mt-4 grid grid-cols-1 gap-8 md:grid-cols-3">
      {/* Travel & Lifestyle */}
      <div>
        <h4 className="w-full text-sm font-bold text-center text-cyan-300 px-3 py-1.5 rounded-lg font-orbitron shadow-[0_0_15px_#00fff055] bg-gradient-to-r from-[#0f172a]/70 via-[#1e293b]/70 to-[#0f172a]/70 backdrop-blur-md border border-cyan-400">
          Travel & Lifestyle <span className="text-white/50 text-xs">(Coming Soon)</span>
        </h4>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(getCompetitionsByCategory('premium').length
            ? getCompetitionsByCategory('premium').slice(0, 3)
            : []
          ).map((item, idx) => (
            <div key={item?.comp?.slug || idx} className="rounded-lg border border-white/10 bg-white/5 p-2">
              <div className="relative h-24 w-full overflow-hidden rounded-md">
                <Image
                  src={item.imageUrl || item.thumbnail || '/images/placeholder.jpg'}
                  alt={item.title || item?.comp?.title || 'Coming soon'}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="mt-2">
                <div className="text-white text-sm font-medium truncate">
                  {item.title || item?.comp?.title || 'Coming soon'}
                </div>
                <div className="text-white/60 text-xs truncate">
                  {item.prize || item?.comp?.prizeLabel || 'Stay tuned'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Special Events */}
      <div>
        <h4 className="w-full text-sm font-bold text-center text-cyan-300 px-3 py-1.5 rounded-lg font-orbitron shadow-[0_0_15px_#00fff055] bg-gradient-to-r from-[#0f172a]/70 via-[#1e293b]/70 to-[#0f172a]/70 backdrop-blur-md border border-cyan-400">
          Special Events <span className="text-white/50 text-xs">(Coming Soon)</span>
        </h4>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(getCompetitionsByCategory('event').length
            ? getCompetitionsByCategory('event').slice(0, 3)
            : []
          ).map((item, idx) => (
            <div key={item?.comp?.slug || idx} className="rounded-lg border border-white/10 bg-white/5 p-2">
              <div className="relative h-24 w-full overflow-hidden rounded-md">
                <Image
                  src={item.imageUrl || item.thumbnail || '/images/placeholder.jpg'}
                  alt={item.title || item?.comp?.title || 'Coming soon'}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="mt-2">
                <div className="text-white text-sm font-medium truncate">
                  {item.title || item?.comp?.title || 'Coming soon'}
                </div>
                <div className="text-white/60 text-xs truncate">
                  {item.prize || item?.comp?.prizeLabel || 'Stay tuned'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Regional Giveaways */}
      <div>
        <h4 className="w-full text-sm font-bold text-center text-cyan-300 px-3 py-1.5 rounded-lg font-orbitron shadow-[0_0_15px_#00fff055] bg-gradient-to-r from-[#0f172a]/70 via-[#1e293b]/70 to-[#0f172a]/70 backdrop-blur-md border border-cyan-400">
          Regional Giveaways <span className="text-white/50 text-xs">(Coming Soon)</span>
        </h4>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(getCompetitionsByCategory('regional').length
            ? getCompetitionsByCategory('regional').slice(0, 3)
            : []
          ).map((item, idx) => (
            <div key={item?.comp?.slug || idx} className="rounded-lg border border-white/10 bg-white/5 p-2">
              <div className="relative h-24 w-full overflow-hidden rounded-md">
                <Image
                  src={item.imageUrl || item.thumbnail || '/images/placeholder.jpg'}
                  alt={item.title || item?.comp?.title || 'Coming soon'}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="mt-2">
                <div className="text-white text-sm font-medium truncate">
                  {item.title || item?.comp?.title || 'Coming soon'}
                </div>
                <div className="text-white/60 text-xs truncate">
                  {item.prize || item?.comp?.prizeLabel || 'Stay tuned'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>

  <TopWinnersCarousel />

  {/* Vision block */}
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

function Section({ title, subtitle, items = [], viewMoreHref, viewMoreText = 'View More', extraClass = '' }) {
  const lower = title.toLowerCase();
  const isDaily = lower.includes('daily');
  const isFree = lower.includes('free');
  const isPi = lower.includes('pi');
  const isCrypto = lower.includes('crypto');

  return (
    <section className={`mb-6 ${extraClass}`}> {/* less bottom margin */}
      <div className="text-center mb-4"> {/* smaller spacing */}
        <h2 className="w-full text-sm font-bold text-center text-cyan-300 px-3 py-1.5 rounded-lg font-orbitron shadow-[0_0_15px_#00fff055] bg-gradient-to-r from-[#0f172a]/70 via-[#1e293b]/70 to-[#0f172a]/70 backdrop-blur-md border border-cyan-400">
          {title}
        </h2>
        {subtitle && <p className="text-xs text-cyan-200 mt-0.5 italic">{subtitle}</p>}
      </div>

      <div className="centered-carousel lg:hidden">
        {items.map((item, i) => renderCard(item, i, { isDaily, isFree, isPi, isCrypto }))}
      </div>

      <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {items.map((item, i) => renderCard(item, i, { isDaily, isFree, isPi, isCrypto }))}
      </div>

      {viewMoreHref && (
        <div className="text-center mt-2">
          <Link
            href={viewMoreHref}
            className="inline-block text-sm font-bold px-2.5 py-1 rounded-md text-black bg-gradient-to-r from-[#00ffd5] to-[#0077ff] shadow hover:opacity-90 transition"
          >
            {viewMoreText}
          </Link>
        </div>
      )}
    </section>
  );
}




function renderCard(item, i, { isDaily, isFree, isPi, isCrypto }) {
  const key = item?.comp?.slug || `item-${i}`;
  if (!item?.comp) return null;

  const useDailyCardThemes = ['daily', 'regional', 'launch'];
  const useCompetitionCardThemes = ['event'];

  const theme = item.theme || 'tech';

  // Explicit override for themes
if (theme === 'launch') return <LaunchCompetitionCard key={key} {...item} />;

if (useDailyCardThemes.includes(theme)) return <DailyCompetitionCard key={key} {...item} />;

  if (useCompetitionCardThemes.includes(theme)) {
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

  // Other special types
  if (isFree) return <FreeCompetitionCard key={key} {...item} />;
  if (isPi) return <PiCompetitionCard key={key} {...item} />;
  if (isCrypto) return <CryptoGiveawayCard key={key} {...item} />;

  // Default fallback
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
 
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (winners.length === 0) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % winners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [winners.length]);

  if (winners.length === 0) {
    return (
      <div className="max-w-md mx-auto mt-12 bg-[#0a1024]/90 border border-cyan-500 backdrop-blur-lg rounded-xl shadow-[0_0_40px_#00fff055] p-6 text-white text-center font-orbitron">
        <h2 className="text-2xl font-bold text-cyan-300 mb-4">Top Winners</h2>
     <p className="text-white/80 italic">
  Be the first to make history no winners yet, but your name could be the one they remember
</p>

      </div>
    );
  }

  const current = winners[index];

  return (
    <div className="max-w-md mx-auto mt-12 bg-[#0a1024]/90 border border-cyan-500 backdrop-blur-lg rounded-xl shadow-[0_0_40px_#00fff055] p-6 text-white text-center font-orbitron">
      <h2 className="text-2xl font-bold text-cyan-300 mb-4">Top Winners</h2>

      <div className="flex justify-center items-center mb-4">
        <Image
          src={current.image || '/images/default-avatar.png'}
          alt={current.name || 'Winner'}
          width={120}
          height={120}
          className="rounded-full border-4 border-cyan-400 shadow-lg"
        />
      </div>

      <h3 className="text-xl font-semibold">{current.name || 'Anonymous'}</h3>
      <p className="text-cyan-200">{current.prize || 'Surprise Prize'}</p>
      <p className="text-sm text-white/70">{current.date || 'TBA'}</p>
    </div>
  );
}