'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useSafeTranslation } from '../hooks/useSafeTranslation';

// Components
import DailyCompetitionCard from '@components/DailyCompetitionCard';
import FreeCompetitionCard from '@components/FreeCompetitionCard';
import PiCompetitionCard from '@components/PiCompetitionCard';
import CryptoGiveawayCard from '@components/CryptoGiveawayCard';
import CompetitionCard from '@components/CompetitionCard';
import MiniPrizeCarousel from '@components/MiniPrizeCarousel';
import LaunchCompetitionCard from '@components/LaunchCompetitionCard';
import FunnelStagesRow from '../components/FunnelStagesRow';
import Layout from '../components/Layout';
import { Tab } from '@headlessui/react';

// Data
import {
  dailyItems,
  techItems,
  premiumItems,
  piItems,
  freeItems,
  cryptoGiveawaysItems,
} from '@data/competitions';

/* ------------------------- helpers ------------------------- */
const toNumber = (v, fallback = 0) => {
  if (v == null || v === '') return fallback;
  const n = typeof v === 'string' ? parseFloat(v) : Number(v);
  return Number.isFinite(n) ? n : fallback;
};

/* -------- stable, hoisted fake stages (no randomness) ------ */
const FAKE_STAGES = [
  { entrants: 11, capacity: 25, advancing: 5, status: 'live', slug: 'stage-1', pricePi: 0.15, hasTicket: false },
  { entrants: 12, capacity: 25, advancing: 5, status: 'live', slug: 'stage-2', pricePi: 0, hasTicket: true },
  { entrants: 13, capacity: 25, advancing: 5, status: 'live', slug: 'stage-3', pricePi: 0, hasTicket: true },
  { entrants: 14, capacity: 25, advancing: 5, status: 'live', slug: 'stage-4', pricePi: 0, hasTicket: true },
  { entrants: 15, capacity: 25, advancing: 1, status: 'live', slug: 'stage-5', pricePi: 0, hasTicket: true },
];

function HomePage() {
  const { t } = useSafeTranslation();

  const [liveCompetitions, setLiveCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0); // For tabbed navigation

  /* ---------------- static data (memoized) ------------------ */
  const staticItems = useMemo(
    () => [...techItems, ...premiumItems, ...piItems, ...dailyItems, ...freeItems, ...cryptoGiveawaysItems],
    []
  );
  const staticSlugs = useMemo(() => new Set(staticItems.map((i) => i?.comp?.slug).filter(Boolean)), [staticItems]);

  /* -------------------- merge live + static ----------------- */
  const mergeCompetitionData = useCallback((liveData) => {
    const liveMap = {};
    for (const x of liveData) {
      const s = x?.comp?.slug;
      if (s) liveMap[s] = x;
    }
    const now = new Date();

    const merged = staticItems
      .map((it) => {
        const slug = it?.comp?.slug;
        const live = slug ? liveMap[slug] : null;

        return live
          ? {
              ...it,
              imageUrl: live.thumbnail || live.imageUrl || it.imageUrl,
              thumbnail: live.thumbnail,
              comp: {
                ...it.comp,
                ...live.comp,
                ticketsSold: toNumber(live.comp?.ticketsSold, 0),
                totalTickets: toNumber(live.comp?.totalTickets, it.comp?.totalTickets ?? 0),
                entryFee: toNumber(live.comp?.entryFee, it.comp?.entryFee ?? 0),
                comingSoon: live.comp?.comingSoon ?? it.comp?.comingSoon ?? false,
              },
            }
          : it;
      })
      .filter((item) => {
        const { endsAt, status } = item.comp || {};
        const hasEnded = endsAt && new Date(endsAt) < now;
        return status === 'active' && !hasEnded;
      });

    // admin-only competitions (not in static)
    const adminOnly = (liveData || []).filter((x) => x?.comp?.slug && !staticSlugs.has(x.comp.slug));

    // sort: live first, then admin-only
    const all = [...merged, ...adminOnly].sort((a, b) => {
      const nowMs = Date.now();
      const aS = a?.comp?.startsAt ? new Date(a.comp.startsAt).getTime() : 0;
      const aE = a?.comp?.endsAt ? new Date(a.comp.endsAt).getTime() : 0;
      const bS = b?.comp?.startsAt ? new Date(b.comp.startsAt).getTime() : 0;
      const bE = b?.comp?.endsAt ? new Date(b.comp.endsAt).getTime() : 0;

      const aLive = aS <= nowMs && nowMs < aE;
      const bLive = bS <= nowMs && nowMs < bE;
      if (aLive !== bLive) return aLive ? -1 : 1;

      const aAdmin = !staticSlugs.has(a?.comp?.slug);
      const bAdmin = !staticSlugs.has(b?.comp?.slug);
      if (aAdmin !== bAdmin) return aAdmin ? -1 : 1;

      return 0;
    });

    return all;
  }, [staticItems, staticSlugs]);

  /* -------------------- fetch live data --------------------- */
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/competitions/all');
        if (!res.ok) throw new Error(`Failed to fetch competitions: ${res.status}`);
        const json = await res.json();
        const liveData = json?.data || [];
        const merged = mergeCompetitionData(liveData);
        if (mounted) setLiveCompetitions(merged);
      } catch (e) {
        console.error('❌ Failed to fetch live competition data:', e);
        if (mounted) setError(String(e?.message || e));
        const fallback = staticItems.filter((i) => {
          if (i.theme === 'crypto') return true;
          if (i.theme === 'tech') return true;
          return i?.comp?.status === 'active' && !i?.comp?.hasEnded;
        });
        if (mounted) setLiveCompetitions(fallback);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [staticItems, staticSlugs, mergeCompetitionData]);

  const getCompetitionsByCategory = (category) =>
    liveCompetitions.filter((item) => (item.theme || 'tech') === category);

  const competitionCategories = useMemo(() => ([
    { name: t('daily_weekly', 'Daily/Weekly'), slug: 'daily', items: getCompetitionsByCategory('daily') },
    { name: t('tech_gadgets', 'Tech/Gadgets'), slug: 'tech', items: getCompetitionsByCategory('tech') },
    { name: t('omc_launch_week', 'OMC Launch Week'), slug: 'launch', items: getCompetitionsByCategory('launch') },
    { name: t('pi_giveaways', 'Pi Giveaways'), slug: 'pi', items: getCompetitionsByCategory('pi') },
    { name: t('omc_free', 'OMC Free'), slug: 'free', items: getCompetitionsByCategory('free') },
    { name: t('crypto_giveaways', 'Crypto Giveaways'), slug: 'crypto', items: getCompetitionsByCategory('crypto') },
  ].filter(cat => cat.items.length > 0)), [liveCompetitions, t]);

  /* ------------------ page background wrapper ---------------- */
  const PageWrapper = ({ children }) => (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#0b1227] via-[#0f1b33] to-[#0a1024] text-white">
      {children}
    </div>
  );

  /* ------------------------- loading ------------------------- */
  if (loading) {
    return (
      <PageWrapper>
        <div className="w-full py-16 flex flex-col items-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-24 w-24 border-t-2 border-b-2 border-cyan-300 mx-auto"></div>
            <p className="text-white text-lg">
              {t('loading_live_competitions', 'Loading live competition data...')}
            </p>
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (error) console.warn('⚠️ Using static data due to API error:', error);

  /* ============================= RENDER ============================= */
  return (
    <PageWrapper>
      {/* ========================= CONTENT ========================= */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-16">
        {/* Mini carousel */}
        <MiniPrizeCarousel />

        {/* Pi Cash Code CTA */}
        <div className="flex justify-center">
          <Link
            href="/pi-cash-code"
            className="group relative bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] border border-cyan-500 rounded-xl px-8 py-6 shadow-md hover:shadow-cyan-500/30 transition-all duration-300 text-center w-full max-w-lg"
          >
            <h1 className="text-3xl font-bold relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-500 to-cyan-300 animate-text-shimmer font-orbitron">
              {t('pi_cash_code', 'Pi Cash Code')}
            </h1>

            <p className="mt-2 text-cyan-400 text-sm italic group-hover:text-cyan-200 transition-all duration-300">
              {t('if_you_can_dream', 'If you can dream you can win')}
            </p>

            <p className="mt-2 text-cyan-400 text-sm font-semibold underline group-hover:text-cyan-200 transition-all duration-300">
              {t('enter_here', 'Enter Here')}
            </p>
          </Link>
        </div>

        {/* ====================== Sections ====================== */}
        <main className="space-y-16">
          {/* Tabbed Navigation for Competitions */}
          <section className="space-y-8">
            <h2 className="text-3xl font-bold text-center text-cyan-300 font-orbitron relative pb-4">
              {t('featured_competitions', 'Featured Competitions')}
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"></span>
            </h2>

            <Tab.Group selectedIndex={selectedCategoryIndex} onChange={setSelectedCategoryIndex}>
              <Tab.List className="flex flex-wrap justify-center p-1 space-x-2 rounded-xl bg-blue-900/20 backdrop-blur-md border border-blue-800 shadow-inner shadow-blue-500/10">
                {competitionCategories.map((category) => (
                  <Tab
                    key={category.slug}
                    className={({ selected }) =>
                      `w-auto px-4 py-2.5 text-sm leading-5 font-medium rounded-lg transition-all duration-200 ease-in-out
                      ${selected
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 ring-2 ring-blue-400 ring-opacity-60'
                        : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                      }`
                    }
                  >
                    {category.name}
                  </Tab>
                ))}
              </Tab.List>
         <Tab.Panels className="mt-6">
            {competitionCategories.map((category) => (
              <Tab.Panel
                key={category.slug}
                className="ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2"
              >
                <Section
                  title={category.name}
                  items={category.items}
                  viewMoreHref={`/competitions/${category.slug}`} /* This is the key change! */
                  category={category.slug}
                  hideTitleAndMore={false} /* Ensure "View More" button is visible */
                  extraClass="py-4"
                />
              </Tab.Panel>
            ))}
          </Tab.Panels>
            </Tab.Group>
          </section>

          {/* ----------------------- OMC Stages ----------------------- */}
          <section className="space-y-6">
            <div className="text-center space-y-3">
              <h2 className="w-full text-base font-bold text-center text-cyan-300 px-4 py-3 rounded-xl font-orbitron shadow-[0_0_30px_#00fff055] bg-gradient-to-r from-[#0f172a]/70 via-[#1e293b]/70 to-[#0f172a]/70 backdrop-blur-md border border-cyan-400">
                {t('omc_pi_stages_competitions', 'OMC Pi Stages Competitions')}
              </h2>

              <p className="text-sm text-cyan-300 italic flex items-center justify-center gap-6 flex-wrap">
                <span>
                  {t('qualify', 'Qualify')} <span className="text-white font-semibold">({t('stage_1', 'Stage 1')})</span>
                </span>
                <span>
                  {t('advance', 'Advance')} <span className="text-white font-semibold">({t('stages_2_4', 'Stages 2–4')})</span>
                </span>
                <span>
                  {t('win', 'Win')} <span className="text-white font-semibold">({t('stage_5', 'Stage 5')})</span>
                </span>
                <span className="text-cyan-300 font-semibold">
                  {t('stage_5_prize_pool', 'Stage 5 Prize Pool')}: <span className="text-white">2,250π</span>
                </span>
              </p>
            </div>

            <div className="max-w-6xl mx-auto">
              <FunnelStagesRow
                s1={FAKE_STAGES[0]}
                s2={FAKE_STAGES[1]}
                s3={FAKE_STAGES[2]}
                s4={FAKE_STAGES[3]}
                s5={FAKE_STAGES[4]}
                prizePoolPi={2250}
                /* 👇 Blank the Pi Stages button: no handler + empty label */
                onEnterStage1={undefined}
                ctaLabel=""
                /* if your component supports flags like these, they won't hurt: */
                hideEnter
                disableEnter
                className="shadow-[0_0_25px_rgba(0,255,255,0.15)]"
              />
            </div>
          </section>

          {/* -------------------- Coming Soon Columns ------------------- */}
          <section className="space-y-8">
            <h2 className="text-3xl font-bold text-center text-cyan-300 font-orbitron relative pb-4">
              {t('upcoming_adventures', 'Upcoming Adventures')}
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full"></span>
            </h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <ComingSoonColumn
                title={t('travel_lifestyle', 'Travel & Lifestyle')}
                items={getCompetitionsByCategory('premium').slice(0, 3)}
                t={t}
              />
              <ComingSoonColumn
                title={t('special_events', 'Special Events')}
                items={getCompetitionsByCategory('event').slice(0, 3)}
                t={t}
              />
              <ComingSoonColumn
                title={t('regional_giveaways', 'Regional Giveaways')}
                items={getCompetitionsByCategory('regional').slice(0, 3)}
                t={t}
              />
            </div>
          </section>

          {/* ---------------------- Winners ----------------------------- */}
          <TopWinnersCarousel t={t} />

          {/* ------------------------ Vision block -------------------- */}
          <div>
            <div className="bg-[#0a1024]/90 border border-cyan-700 rounded-xl px-6 py-8 shadow-[0_0_20px_#00fff055] text-center text-sm space-y-3">
              <h2 className="text-lg font-bold text-cyan-300">
                {t('our_vision_2026', 'Our Vision for 2026: Impact Through Innovation')}
              </h2>
              <p className="text-white/80 leading-relaxed">
                {t(
                  'vision_description',
                  'By the end of 2026, OhMyCompetitions aims to reach these community-first milestones, powered by the Pi Network and supported by Pioneers like you.'
                )}
              </p>
              <ul className="text-cyan-200 space-y-1 font-medium">
                <li>
                  🌍 {t('over_winners', 'Over')} <strong>10,000+ {t('winners', 'winners')}</strong> {t('across_globe', 'across the globe')}
                </li>
                <li>💰 <strong>500,000 π</strong> {t('in_distributed_pi_prizes', 'in distributed Pi prizes')}</li>
                <li>🎗 <strong>20,000 π</strong> {t('donated_to_pi_causes', 'donated to Pi causes & communities')}</li>
                <li>⭐ {t('maintained_5_star', 'Maintained')} <strong>5★</strong> {t('user_rated_experience', 'user-rated experience')}</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </PageWrapper>
  );
}

/* ----------------- helpers (Section / Cards) ----------------- */
function wordIncludes(text = '', words = []) {
  const s = String(text).toLowerCase();
  return words.some(w => new RegExp(`\\b${w}\\b`, 'i').test(s));
}

function Section({
  title,
  subtitle,
  items = [],
  viewMoreHref,
  viewMoreText = 'View More',
  extraClass = '',
  category, // optional
  hideTitleAndMore = false, // Controlled by parent for Tab.Panel use-case
}) {
  const { t } = useSafeTranslation();
  const lowerTitle = typeof title === 'string' ? title.toLowerCase() : '';
  const lowerCat = typeof category === 'string' ? category.toLowerCase() : '';

  // Determine card type based on category or keywords
  const isFree   = lowerCat === 'free'   || wordIncludes(lowerTitle, ['free', 'gratis']);
  const isPi     = lowerCat === 'pi'     || wordIncludes(lowerTitle, ['pi', 'π', 'picoin']);
  const isCrypto = lowerCat === 'crypto' || wordIncludes(lowerTitle, ['crypto', 'web3', 'blockchain']);
  const isDaily  = lowerCat === 'daily'  || wordIncludes(lowerTitle, ['daily', 'weekly']);
  const isLaunch = lowerCat === 'launch' || wordIncludes(lowerTitle, ['launch', 'omc launch']);

  const TECH_KEYWORDS = [
    'tech','technology','gadget','gadgets','electronics','electronic',
    'device','devices','hardware','computer','pc','laptop','notebook',
    'desktop','phone','smartphone','tablet','console','gaming','headset',
    'earbuds','drone','camera','wearable','smartwatch','router','gpu','cpu'
  ];
  const isTech = lowerCat === 'tech' || wordIncludes(lowerTitle, TECH_KEYWORDS);

  return (
    <section className={`space-y-6 ${extraClass}`}>
      {/* Title is hidden when used in Tab.Panel, as Tab.List already provides a title */}
      {!hideTitleAndMore && (
        <div className="text-center space-y-1">
          <h2 className="w-full text-sm font-bold text-center text-cyan-300 px-3 py-1.5 rounded-lg font-orbitron shadow-[0_0_15px_#00fff055] bg-gradient-to-r from-[#0f172a]/70 via-[#1e293b]/70 to-[#0f172a]/70 backdrop-blur-md border border-cyan-400">
            {title}
          </h2>
          {subtitle && <p className="text-xs text-cyan-200 italic">{subtitle}</p>}
        </div>
      )}

      {/* mobile: real carousel - if items.length > 0 */}
      {items.length > 0 ? (
        <div className="centered-carousel lg:hidden">
          {items.map((item, i) => renderCard(item, i, { isFree, isPi, isCrypto, isDaily, isLaunch }))}
        </div>
      ) : (
        <p className="text-center text-gray-400 italic">
          {t('no_competitions_found', 'No competitions in this category yet.')}
        </p>
      )}


      {/* desktop: grid - if items.length > 0 */}
      {items.length > 0 && (
        <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {items.map((item, i) => renderCard(item, i, { isFree, isPi, isCrypto, isDaily, isLaunch }))}
        </div>
      )}


      {/* View More button is always shown for sections within Tab.Panels now */}
      {viewMoreHref && (
        <div className="text-center mt-6"> {/* Added margin top */}
          <Link
            href={viewMoreHref}
            className="inline-block text-sm font-bold px-4 py-2 rounded-md text-black bg-gradient-to-r from-[#00ffd5] to-[#0077ff] shadow-lg hover:opacity-90 transition transform hover:scale-105 duration-300"
          >
            {t('view_all', `View All ${title}`)} {/* Dynamic text for view more */}
          </Link>
        </div>
      )}
    </section>
  );
}

function renderCard(item, i, { isFree, isPi, isCrypto, isDaily, isLaunch }) {
  const key = item?.comp?.slug || `item-${i}`;
  if (!item?.comp) return null;

  const feeNum = toNumber(item?.comp?.entryFee, 0);
  const feeLabel = `${feeNum.toFixed(2)} π`;

  if (isLaunch) return <LaunchCompetitionCard key={key} {...item} />;
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
      fee={feeLabel}
      imageUrl={item.imageUrl}
      endsAt={item.comp.endsAt}
      disableGift
      // Apply hover effects here
      className="transform transition-all duration-300 hover:scale-[1.02] hover:shadow-cyan-500/40"
    >
      {item.comp?.comingSoon && (
        <span className="absolute top-2 right-2 px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-full z-10 animate-pulse">
          Coming Soon
        </span>
      )}
    </CompetitionCard>
  );
}

function ComingSoonColumn({ title, items = [], t }) {
  return (
    <div className="space-y-4">
      <h4 className="w-full text-lg font-bold text-center text-blue-300 px-3 py-2 rounded-xl font-orbitron shadow-[0_0_20px_#00aaff55] bg-gradient-to-r from-[#1a2b4a]/70 via-[#2a3f5a]/70 to-[#1a2b4a]/70 backdrop-blur-md border border-blue-500">
        {title} <span className="text-white/60 text-sm">({t('coming_soon', 'Coming Soon')})</span>
      </h4>

      <div className="grid grid-cols-1 gap-4">
        {(items || []).map((item, idx) => (
          <div
            key={item?.comp?.slug || idx}
            className="relative rounded-lg border border-blue-700 bg-gradient-to-br from-[#0f172a] to-[#0a1024] p-3 space-y-2
                       shadow-lg hover:shadow-blue-500/30 transition-all duration-300 group overflow-hidden animate-fade-in"
          >
            <div className="absolute inset-0 bg-blue-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none z-0"></div>
            <div className="relative flex items-center space-x-3 z-10">
              <div className="flex-shrink-0 relative h-16 w-16 rounded-md overflow-hidden border border-blue-600">
                <Image
                  src={item.imageUrl || item.thumbnail || '/images/placeholder.jpg'}
                  alt={item.title || item?.comp?.title || t('coming_soon', 'Coming soon')}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute inset-0 flex items-center justify-center bg-black/60 text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {t('view_detail', 'VIEW')}
                </span>
              </div>

              <div className="flex-grow space-y-0.5">
                <div className="text-cyan-200 text-base font-semibold truncate group-hover:text-white transition-colors duration-300">
                  {item.title || item?.comp?.title || t('coming_soon_item', 'New Competition')}
                </div>
                <div className="text-white/70 text-sm italic truncate">
                  {item.prize || item?.comp?.prizeLabel || t('grand_prize', 'Grand Prize')}
                </div>
                <div className="text-blue-300 text-xs font-medium flex items-center gap-1">
                  <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l3 3a1 1 0 001.414-1.414L11 9.586V6z" clipRule="evenodd"></path></svg>
                  {t('release_soon', 'Releasing Soon')}
                </div>
              </div>
            </div>
            <div className="absolute bottom-2 right-3 text-white/40 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              #futureofpi
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}



function TopWinnersCarousel({ t }) {
  const winners = useMemo(() => ([
    // Add some placeholder winner data for demonstration if needed, e.g.:
   
  ]), []); 

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (winners.length === 0) return;
    const id = setInterval(() => setIndex((p) => (p + 1) % winners.length), 5000);
    return () => clearInterval(id);
  }, [winners.length]);

  if (winners.length === 0) {
    return (
      <div className="max-w-md mx-auto bg-[#0a1024]/90 border border-cyan-500 backdrop-blur-lg rounded-xl shadow-[0_0_40px_#00fff055] p-6 text-white text-center font-orbitron space-y-3">
        <h2 className="text-2xl font-bold text-cyan-300">{t('top_winners', 'Top Winners')}</h2>
        <p className="text-white/80 italic">
          {t('be_first_to_make_history', 'Be the first to make history! No winners yet, but your name could be the one they remember.')}
        </p>
      </div>
    );
  }

  const current = winners[index];

  return (
    <div className="max-w-md mx-auto bg-gradient-to-br from-[#0f172a] to-[#0a1024] border border-cyan-500 backdrop-blur-lg rounded-xl shadow-[0_0_60px_#00fff099] p-6 text-white text-center font-orbitron space-y-4 animate-fade-in-out">
      <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400">
        {t('top_winners', 'Top Winners')}
      </h2>

      <div className="flex justify-center my-4">
        <Image
          src={current.image || '/images/default-avatar.png'}
          alt={current.name || t('winner', 'Winner')}
          width={120}
          height={120}
          className="rounded-full border-4 border-blue-400 shadow-xl ring-2 ring-cyan-300 animate-pulse-border"
        />
      </div>

      <h3 className="text-2xl font-semibold text-white">{current.name}</h3>
      <p className="text-xl text-cyan-200">
        {t('won', 'Won')}: <span className="font-bold text-white">{current.prize}</span>
      </p>
      <p className="text-sm text-blue-300 italic">
        {t('wallet_address', 'Wallet')}: {current.wallet.substring(0, 6)}...{current.wallet.substring(current.wallet.length - 4)}
      </p>
      <p className="text-xs text-gray-400">
        {t('date', 'Date')}: {new Date(current.date).toLocaleDateString()}
      </p>

      {/* Navigation dots */}
      <div className="flex justify-center space-x-2 mt-4">
        {winners.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === i ? 'bg-cyan-400 w-5' : 'bg-gray-600 hover:bg-gray-400'
            }`}
            aria-label={`Go to winner ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
export default HomePage;
