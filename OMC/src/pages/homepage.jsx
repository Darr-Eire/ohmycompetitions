'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useSafeTranslation } from '../hooks/useSafeTranslation';

import DailyCompetitionCard from '@components/DailyCompetitionCard';
import FreeCompetitionCard from '@components/FreeCompetitionCard';
import PiCompetitionCard from '@components/PiCompetitionCard';
import CryptoGiveawayCard from '@components/CryptoGiveawayCard';
import CompetitionCard from '@components/CompetitionCard';
import MiniPrizeCarousel from '@components/MiniPrizeCarousel';
import LaunchCompetitionCard from '@components/LaunchCompetitionCard';
import FunnelStagesRow from '../components/FunnelStagesRow';

import {
  dailyItems,
  techItems,
  premiumItems,
  piItems,
  freeItems,
  cryptoGiveawaysItems,
} from '@data/competitions';

/* ---------- helpers ---------- */
const toNumber = (v, fallback = 0) => {
  if (v == null || v === '') return fallback;
  const n = typeof v === 'string' ? parseFloat(v) : Number(v);
  return Number.isFinite(n) ? n : fallback;
};

/* ---------- stable, hoisted fake stages (no randomness) ---------- */
const FAKE_STAGES = [
  { entrants: 11, capacity: 25, advancing: 5, status: 'live', slug: 'stage-1', pricePi: 0.15, hasTicket: false },
  { entrants: 12, capacity: 25, advancing: 5, status: 'live', slug: 'stage-2', pricePi: 0, hasTicket: true },
  { entrants: 13, capacity: 25, advancing: 5, status: 'live', slug: 'stage-3', pricePi: 0, hasTicket: true },
  { entrants: 14, capacity: 25, advancing: 5, status: 'live', slug: 'stage-4', pricePi: 0, hasTicket: true },
  { entrants: 15, capacity: 25, advancing: 1, status: 'live', slug: 'stage-5', pricePi: 0, hasTicket: true },
];

function HomePage() {
  const { t } = useSafeTranslation();
  const [showWelcome, setShowWelcome] = useState(false);
  const loginBtnRef = useRef(null);

  const [liveCompetitions, setLiveCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ---------- fetch + merge ---------- */
  const staticItems = useMemo(
    () => [...techItems, ...premiumItems, ...piItems, ...dailyItems, ...freeItems, ...cryptoGiveawaysItems],
    []
  );
  const staticSlugs = useMemo(
    () => new Set(staticItems.map((i) => i?.comp?.slug).filter(Boolean)),
    [staticItems]
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('welcome') === '1') {
      setShowWelcome(true);
      const url = new URL(window.location.href);
      url.searchParams.delete('welcome');
      window.history.replaceState({}, '', url);
    }
  }, []);

  useEffect(() => {
    if (!showWelcome) return;
    loginBtnRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && setShowWelcome(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [showWelcome]);

  const mergeCompetitionData = (liveData) => {
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

    const adminOnly = (liveData || []).filter((x) => x?.comp?.slug && !staticSlugs.has(x.comp.slug));

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
  };

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
  }, [staticItems, staticSlugs]); // deps OK: both are memoized

// show items purely by theme; don't exclude static seeds
const getCompetitionsByCategory = (category) => {
  return liveCompetitions.filter((item) => (item.theme || 'tech') === category);
};


  /* ---------- loading ---------- */
  if (loading) {
    return (
      <div className="w-full py-8 flex flex-col items-center justify-start bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-24 w-32 border-t-2 border-b-2 border-cyan-300 mx-auto mb-4"></div>
          <p className="text-white text-lg">{t('loading_live_competitions', 'Loading live competition data...')}</p>
        </div>
      </div>
    );
  }
  if (error) console.warn('⚠️ Using static data due to API error:', error);

  return (
    <>
      {/* Welcome Popup */}
      {showWelcome && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="welcome-title"
          aria-describedby="welcome-desc-1"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowWelcome(false);
          }}
        >
          <div
            className="relative bg-[#0f1b33] border border-cyan-400 rounded-2xl p-8 max-w-md w-full shadow-[0_0_30px_#00f0ff88] text-center animate-[fadeIn_.18s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="welcome-title" className="text-2xl font-bold text-cyan-300 font-orbitron mb-2">
              ☘️ {t('welcome_title', 'Céad Míle Fáilte')} ☘️
            </h2>
            <p id="welcome-desc-1" className="text-white/90 mb-0 text-sm">
              {t('welcome_to_omc', 'Welcome To OMC')}
            </p>
            <p id="welcome-desc-2" className="text-white/90 mb-6 text-sm">
              {t('let_competitions_begin', 'Let The Competitions Begin')}
            </p>

            <div className="flex flex-col gap-3">
              <Link
                href="/login"
                ref={loginBtnRef}
                className="flex justify-center items-center gap-2 bg-transparent border border-cyan-400 text-cyan-300 font-semibold py-2 px-6 rounded-lg hover:bg-cyan-400/10 transition focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                <span>{t('login', 'Login')}</span>
                <span className="text-xs font-normal text-cyan-200">({t('previous_users', 'Previous Users')})</span>
              </Link>

              <Link
                href="/signup"
                className="flex justify-center items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-300 text-black font-semibold py-2 px-6 rounded-lg shadow-md hover:opacity-90 transition focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                <span>{t('sign_up', 'Sign Up')}</span>
                <span className="text-xs font-normal text-black/70">({t('new_users', 'New Users')})</span>
              </Link>

              <button
                onClick={() => setShowWelcome(false)}
                className="bg-transparent border border-cyan-400 text-cyan-300 font-semibold py-2 rounded-lg hover:bg-cyan-400/10 transition focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                {t('explore_app', 'Explore App')}
              </button>
            </div>

            <button
              onClick={() => setShowWelcome(false)}
              aria-label={t('close', 'Close')}
              className="absolute top-3 right-3 text-cyan-300/80 hover:text-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded-md px-2 py-1"
            >
              ✕
            </button>

            <style jsx>{`
              @keyframes fadeIn {
                from { transform: translateY(4px) scale(.98); opacity: 0; }
                to   { transform: translateY(0)    scale(1);   opacity: 1; }
              }
            `}</style>
          </div>
        </div>
      )}

      {/* Marquee */}
      <div className="overflow-hidden bg-transparent mt-4">
        <div className="marquee-content text-cyan-300 text-md sm:text-base font-medium font-orbitron">
          {t('marquee_text', 'Oh My Competitions is all about building with Pi Network for the Pi community. Our OMC launch competitions are zero profit designed to create trust, celebrate early winners and give back to Pioneers. All prizes go directly to you. Add us on all Socials and our Pi Profile darreire2020. More competitions are coming soon across a wide range of exciting categories. Join, win and help shape the future of Pi together.')}
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

      {/* ===== Main sections ===== */}
      <main className="space-y-10">
        <Section
          title={t('omc_launch_week', 'OMC Launch Week')}
          items={getCompetitionsByCategory('launch')}
          viewMoreHref="/competitions/launch-week"
        />

        {/* FIXED: comment moved outside props */}
        <Section
          title={t('tech_gadgets', 'Tech/Gadgets')}
          items={getCompetitionsByCategory('tech')}
          viewMoreHref="/competitions/tech-gadgets"
        />
        {/* /FIXED */}

        <Section
          title={t('daily_weekly', 'Daily/Weekly')}
          items={getCompetitionsByCategory('daily')}
          viewMoreHref="/competitions/daily"
          extraClass="mt-12"
        />

        <Section
          title={t('pi_giveaways', 'Pi Giveaways')}
          items={getCompetitionsByCategory('pi')}
          viewMoreHref="/competitions/pi"
          extraClass="mt-12"
        />

        {/* OMC Stages */}
        <section className="mb-16 mt-16">
          <div className="text-center mb-6">
            <h2 className="w-full text-base font-bold text-center text-cyan-300 px-4 py-3 rounded-xl font-orbitron shadow-[0_0_30px_#00fff055] bg-gradient-to-r from-[#0f172a]/70 via-[#1e293b]/70 to-[#0f172a]/70 backdrop-blur-md border border-cyan-400">
              {t('omc_pi_stages_competitions', 'OMC Pi Stages Competitions')}
            </h2>

            <p className="text-sm text-cyan-300 mt-3 italic flex items-center justify-center gap-6 flex-wrap">
              <span className="inline-block">
                {t('qualify', 'Qualify')} <span className="text-white font-semibold">({t('stage_1', 'Stage 1')})</span>
              </span>
              <span className="inline-block">
                {t('advance', 'Advance')} <span className="text-white font-semibold">({t('stages_2_4', 'Stages 2–4')})</span>
              </span>
              <span className="inline-block">
                {t('win', 'Win')} <span className="text-white font-semibold">({t('stage_5', 'Stage 5')})</span>
              </span>
              <span className="inline-block text-cyan-300 font-semibold">
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
              onEnterStage1={() => {
                alert(t('entered_stage_1', '✅ You have entered Stage 1!'));
              }}
              className="shadow-[0_0_25px_rgba(0,255,255,0.15)]"
            />
          </div>
        </section>

        {/* Free Competitions Title */}
        <div className="text-center my-8">
          <h2 className="w-full text-base font-bold text-center text-cyan-300 px-4 py-3 rounded-xl font-orbitron shadow-[0_0_30px_#00fff055] bg-gradient-to-r from-[#0f172a]/70 via-[#1e293b]/70 to-[#0f172a]/70 backdrop-blur-md border border-cyan-400">
            {t('omc_free_competitions', 'OMC Free Competitions')}
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

        <TopWinnersCarousel t={t} />

        {/* Vision block */}
        <div className="mt-6 px-4">
          <div className="bg-[#0a1024]/90 border border-cyan-700 rounded-xl px-4 py-6 shadow-[0_0_20px_#00fff055] text-center text-sm">
            <h2 className="text-lg font-bold text-cyan-300 mb-2">
              {t('our_vision_2026', 'Our Vision for 2026: Impact Through Innovation')}
            </h2>
            <p className="text-white/80 mb-3 leading-relaxed">
              {t('vision_description', 'By the end of 2026, OhMyCompetitions aims to reach these community-first milestones, powered by the Pi Network and supported by Pioneers like you.')}
            </p>
            <ul className="text-cyan-200 space-y-1 font-medium">
              <li>🌍 {t('over_winners', 'Over')} <strong>10,000+ {t('winners', 'winners')}</strong> {t('across_globe', 'across the globe')}</li>
              <li>💰 <strong>500,000 π</strong> {t('in_distributed_pi_prizes', 'in distributed Pi prizes')}</li>
              <li>🎗 <strong>20,000 π</strong> {t('donated_to_pi_causes', 'donated to Pi causes & communities')}</li>
              <li>⭐ {t('maintained_5_star', 'Maintained')} <strong>5★</strong> {t('user_rated_experience', 'user-rated experience')}</li>
            </ul>
          </div>
        </div>
      </main>
    </>
  );
}

/* ---------- helpers (Section + renderCard + ComingSoon + Winners) ---------- */
function Section({ title, subtitle, items = [], viewMoreHref, viewMoreText = 'View More', extraClass = '' }) {
  const { t } = useSafeTranslation();
  const lower = typeof title === 'string' ? title.toLowerCase() : '';

  const isFree = lower.includes('free');
  const isPi = lower.includes('pi');
  const isCrypto = lower.includes('crypto');

  return (
    <section className={`mb-6 ${extraClass}`}>
      <div className="text-center mb-4">
        <h2 className="w-full text-sm font-bold text-center text-cyan-300 px-3 py-1.5 rounded-lg font-orbitron shadow-[0_0_15px_#00fff055] bg-gradient-to-r from-[#0f172a]/70 via-[#1e293b]/70 to-[#0f172a]/70 backdrop-blur-md border border-cyan-400">
          {title}
        </h2>
        {subtitle && <p className="text-xs text-cyan-200 mt-0.5 italic">{subtitle}</p>}
      </div>

      <div className="centered-carousel lg:hidden">
        {items.map((item, i) => renderCard(item, i, { isFree, isPi, isCrypto }))}
      </div>

      <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {items.map((item, i) => renderCard(item, i, { isFree, isPi, isCrypto }))}
      </div>

      {viewMoreHref && (
        <div className="text-center mt-2">
          <Link
            href={viewMoreHref}
            className="inline-block text-sm font-bold px-2.5 py-1 rounded-md text-black bg-gradient-to-r from-[#00ffd5] to-[#0077ff] shadow hover:opacity-90 transition"
          >
            {t('view_more', viewMoreText)}
          </Link>
        </div>
      )}
    </section>
  );
}

function renderCard(item, i, { isFree, isPi, isCrypto }) {
  const key = item?.comp?.slug || `item-${i}`;
  if (!item?.comp) return null;

  const theme = item.theme || 'tech';
  const feeNum = toNumber(item?.comp?.entryFee, 0);
  const feeLabel = `${feeNum.toFixed(2)} π`;

  const useDailyCardThemes = ['daily', 'regional', 'launch'];
  const useCompetitionCardThemes = ['event'];

  if (theme === 'launch') return <LaunchCompetitionCard key={key} {...item} />;
  if (useDailyCardThemes.includes(theme)) return <DailyCompetitionCard key={key} {...item} />;

  if (useCompetitionCardThemes.includes(theme)) {
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
      />
    );
  }

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
    />
  );
}

function ComingSoonColumn({ title, items = [], t }) {
  return (
    <div>
      <h4 className="w-full text-sm font-bold text-center text-cyan-300 px-3 py-1.5 rounded-lg font-orbitron shadow-[0_0_15px_#00fff055] bg-gradient-to-r from-[#0f172a]/70 via-[#1e293b]/70 to-[#0f172a]/70 backdrop-blur-md border border-cyan-400">
        {title} <span className="text-white/50 text-xs">({t('coming_soon', 'Coming Soon')})</span>
      </h4>
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {(items || []).map((item, idx) => (
          <div key={item?.comp?.slug || idx} className="rounded-lg border border-white/10 bg-white/5 p-2">
            <div className="relative h-24 w-full overflow-hidden rounded-md">
              <Image
                src={item.imageUrl || item.thumbnail || '/images/placeholder.jpg'}
                alt={item.title || item?.comp?.title || t('coming_soon', 'Coming soon')}
                fill
                className="object-cover"
              />
            </div>
            <div className="mt-2">
              <div className="text-white text-sm font-medium truncate">
                {item.title || item?.comp?.title || t('coming_soon', 'Coming soon')}
              </div>
              <div className="text-white/60 text-xs truncate">
                {item.prize || item?.comp?.prizeLabel || t('stay_tuned', 'Stay tuned')}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TopWinnersCarousel({ t }) {
  const winners = []; // keep empty until you have real winners
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (winners.length === 0) return;
    const id = setInterval(() => setIndex((p) => (p + 1) % winners.length), 5000);
    return () => clearInterval(id);
  }, [winners.length]);

  if (winners.length === 0) {
    return (
      <div className="max-w-md mx-auto mt-12 bg-[#0a1024]/90 border border-cyan-500 backdrop-blur-lg rounded-xl shadow-[0_0_40px_#00fff055] p-6 text-white text-center font-orbitron">
        <h2 className="text-2xl font-bold text-cyan-300 mb-4">{t('top_winners', 'Top Winners')}</h2>
        <p className="text-white/80 italic">
          {t('be_first_to_make_history', 'Be the first to make history no winners yet, but your name could be the one they remember')}
        </p>
      </div>
    );
  }

  const current = winners[index];
  return (
    <div className="max-w-md mx-auto mt-12 bg-[#0a1024]/90 border border-cyan-500 backdrop-blur-lg rounded-xl shadow-[0_0_40px_#00fff055] p-6 text-white text-center font-orbitron">
      <h2 className="text-2xl font-bold text-cyan-300 mb-4">{t('top_winners', 'Top Winners')}</h2>
      <div className="flex justify-center items-center mb-4">
        <Image
          src={current.image || '/images/default-avatar.png'}
          alt={current.name || t('winner', 'Winner')}
          width={120}
          height={120}
          className="rounded-full border-4 border-cyan-400 shadow-lg"
        />
      </div>
      <h3 className="text-xl font-semibold">{current.name || t('anonymous', 'Anonymous')}</h3>
      <p className="text-cyan-200">{current.prize || t('surprise_prize', 'Surprise Prize')}</p>
      <p className="text-sm text-white/70">{current.date || t('tba', 'TBA')}</p>
    </div>
  );
}

/* Disable SSR for this page to avoid hydration issues on pages router */
export default dynamic(() => Promise.resolve(HomePage), { ssr: false });
