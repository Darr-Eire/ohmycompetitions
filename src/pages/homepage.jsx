'use client';
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useSafeTranslation } from '../hooks/useSafeTranslation';

import DailyCompetitionCard from '@components/DailyCompetitionCard';
import FreeCompetitionCard from '@components/FreeCompetitionCard';
import PiCompetitionCard from '@components/PiCompetitionCard';
import CompetitionCard from '@components/CompetitionCard';
import MiniPrizeCarousel from '@components/MiniPrizeCarousel';
import LaunchCompetitionCard from '@components/LaunchCompetitionCard';
import FunnelStagesRow from '@components/FunnelStagesRow';
import { useFunnelStages } from 'hooks/useFunnelStages';
import Layout from '@components/Layout';

/* ------------------------- helpers ------------------------- */
const toNumber = (v, fallback = 0) => {
  if (v == null || v === '') return fallback;
  const n = typeof v === 'string' ? parseFloat(v) : Number(v);
  return Number.isFinite(n) ? n : fallback;
};

/* ------------------ page background wrapper ---------------- */
const PageWrapper = ({ children }) => (
  <div className="min-h-screen w-full bg-gradient-to-b from-[#0b1227] via-[#0f1b33] to-[#0a1024] text-white">
    {children}
  </div>
);

/**
 * HorizontalCarousel
 * - Controls actual card width via:
 *   - itemMinWidthCSS: the scroller item width (e.g. "min(440px, 100vw - 2rem)")
 *   - cardMaxWidth: the inner visual clamp (pixels) to keep cards tidy
 */
function HorizontalCarousel({
  items = [],
  renderItem,
  ariaLabel = 'carousel',
  className = '',
  itemMinWidthCSS = 'min(440px, calc(100vw - 2rem))',
  cardMaxWidth = 460,
  gapPx = 16,
  centerFirstSlide = true, // NEW
}) {
  const listRef = React.useRef(null);
  const cardRef = React.useRef(null);
  const [canLeft, setCanLeft] = React.useState(false);
  const [canRight, setCanRight] = React.useState(false);

  const recalc = () => {
    const el = listRef.current;
    if (!el) return;
    const EPS = 2;
    setCanLeft(el.scrollLeft > EPS);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - EPS);
  };

  const scrollByDir = (dir = 1) => {
    const el = listRef.current;
    if (!el) return;
    const step = (cardRef.current?.clientWidth || 360) + gapPx;
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  };

  // NEW: center the first slide initially (and on resize) so it sits perfectly in view
  const centerFirst = React.useCallback(() => {
    if (!centerFirstSlide) return;
    const el = listRef.current;
    const card = cardRef.current;
    if (!el || !card) return;

    const cardW = card.clientWidth;
    const viewW = el.clientWidth;

    // amount needed so the first card’s center matches the viewport center
    const target = Math.max(0, Math.round(cardW / 2 - viewW / 2));

    // Only push if we’re still near the left (don’t override user scroll)
    if (el.scrollLeft <= 4 && Math.abs(el.scrollLeft - target) > 2) {
      el.scrollLeft = target;
    }
  }, [centerFirstSlide]);

  React.useEffect(() => {
    const el = listRef.current;
    if (!el) return;

    // initial layout
    centerFirst();
    recalc();

    const onScroll = () => recalc();
    const onResize = () => {
      recalc();
      centerFirst();
    };

    const ro = new ResizeObserver(onResize);
    el.addEventListener('scroll', onScroll, { passive: true });
    ro.observe(el);
    window.addEventListener('resize', onResize);

    return () => {
      el.removeEventListener('scroll', onScroll);
      ro.disconnect();
      window.removeEventListener('resize', onResize);
    };
  }, [centerFirst, items.length]);

  return (
    <div className={`relative ${className}`}>
      <div
        ref={listRef}
        role="region"
        aria-label={ariaLabel}
        style={{ scrollPaddingLeft: '1rem', scrollPaddingRight: '1rem' }}
        className="
          relative flex gap-4 overflow-x-auto pb-2
          snap-x snap-mandatory
          scrollbar-thin scrollbar-thumb-cyan-500/40
          [scrollbar-width:thin]
          -mx-4 px-4
        "
      >
        {/* edge fades */}
        <div className="pointer-events-none absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-[#0b1227] to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-[#0b1227] to-transparent" />

        {items.map((item, idx) => (
          <div
            key={item?.comp?.slug || idx}
            data-card
            ref={idx === 0 ? cardRef : undefined}
            className="snap-center shrink-0"
            style={{ minWidth: itemMinWidthCSS }}
          >
            <div className="w-full mx-auto" style={{ maxWidth: cardMaxWidth }}>
              {renderItem(item, idx)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


/* ----------- Marquee with consistent speed (px/s) ----------- */
function Marquee({ text, speed = 60, className = '' }) {
  const trackRef = React.useRef(null);
  const contentRef = React.useRef(null);
  const [duration, setDuration] = React.useState(30);

  React.useEffect(() => {
    const update = () => {
      if (!contentRef.current) return;
      const contentWidth = contentRef.current.offsetWidth;
      const pxPerSec = Math.max(10, Number(speed) || 60);
      const dur = contentWidth / pxPerSec;
      setDuration(dur);
    };
    update();
    const ro = new ResizeObserver(update);
    if (contentRef.current) ro.observe(contentRef.current);
    window.addEventListener('resize', update);
    document.fonts?.ready?.then(update).catch(() => {});
    return () => {
      window.removeEventListener('resize', update);
      ro.disconnect();
    };
  }, [speed, text]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div
        ref={trackRef}
        className="flex whitespace-nowrap will-change-transform select-none [animation-name:marquee]"
        style={{
          animationDuration: `${duration}s`,
          animationTimingFunction: 'linear',
          animationIterationCount: 'infinite',
        }}
      >
        <span ref={contentRef} className="pr-12 text-cyan-300 font-medium font-orbitron">
          {text}
        </span>
        <span aria-hidden="true" className="pr-12 text-cyan-300 font-medium font-orbitron">
          {text}
        </span>
      </div>

      <div className="pointer-events-none absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-[#0b1227] to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-[#0b1227] to-transparent" />

      <style jsx global>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          [animation-name="marquee"] { animation-play-state: paused !important; }
        }
      `}</style>
    </div>
  );
}

function HomePage() {
  const { t } = useSafeTranslation();

  /* ================= Funnel (live) ================= */
  const { stages, prizePoolPi } = useFunnelStages();

  const handleEnterStage1 = () => {
    const s1 = Array.isArray(stages) ? stages.find(s => Number(s?.stage) === 1) : null;
    const slug = s1?.slug || s1?.comp?.slug;
    if (slug) window.location.href = `/ticket-purchase/${slug}`;
    else alert(t('stage_unavailable', 'Stage 1 is not available yet.'));
  };

  /* ================ Competitions (live) ================ */
  const [liveCompetitions, setLiveCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const normalizeAndFilter = (liveData) => {
    const now = Date.now();
    const cleaned = (Array.isArray(liveData) ? liveData : [])
      .map((item) => {
        const comp = item?.comp ?? {};
        return {
          ...item,
          imageUrl: item?.thumbnail || item?.imageUrl || '/pi.jpeg',
          theme: item?.theme || 'tech',
          comp: {
            ...comp,
            ticketsSold: toNumber(comp?.ticketsSold, 0),
            totalTickets: toNumber(comp?.totalTickets, 0),
            entryFee: toNumber(comp?.entryFee, comp?.entryFee ?? 0),
            comingSoon: Boolean(comp?.comingSoon),
          },
        };
      })
      .filter((item) => {
        const comp = item.comp || {};
        if (comp.status && comp.status !== 'active') return false;
        if (!comp.endsAt) return true;
        return new Date(comp.endsAt).getTime() > now;
      });

    const sorted = cleaned.sort((a, b) => {
      const aS = a?.comp?.startsAt ? new Date(a.comp.startsAt).getTime() : 0;
      const aE = a?.comp?.endsAt ? new Date(a.comp.endsAt).getTime() : Number.POSITIVE_INFINITY;
      const bS = b?.comp?.startsAt ? new Date(b.comp.startsAt).getTime() : 0;
      const bE = b?.comp?.endsAt ? new Date(b.comp.endsAt).getTime() : Number.POSITIVE_INFINITY;
      const aLive = aS <= now && now < aE;
      const bLive = bS <= now && now < bE;
      if (aLive !== bLive) return aLive ? -1 : 1;
      return aE - bE;
    });

    return sorted;
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/competitions/all');
        if (!res.ok) throw new Error(`Failed to fetch competitions: ${res.status}`);
        const json = await res.json();
        const prepared = normalizeAndFilter(json?.data || []);
        if (mounted) setLiveCompetitions(prepared);
      } catch (e) {
        console.error('❌ Failed to fetch live competition data:', e);
        if (mounted) setError(String(e?.message || e));
        if (mounted) setLiveCompetitions([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const getCompetitionsByCategory = (category) =>
    liveCompetitions.filter((item) => (item.theme || 'tech') === category);

  /* ------------------------ Loading UI ------------------------ */
  if (loading) {
    return (
      <PageWrapper>
        <section
          className="w-full py-16 flex flex-col items-center px-4"
          role="status"
          aria-live="polite"
          aria-label="Loading OhMyCompetitions live competitions"
        >
          <div className="relative mb-6">
            <div className="absolute -inset-6 blur-xl rounded-full bg-cyan-500/15" />
            <div className="relative grid place-items-center h-24 w-24 rounded-full">
              <div className="absolute inset-0 rounded-full border border-white/10" />
              <div className="absolute inset-0 rounded-full p-[2px] bg-gradient-to-r from-cyan-400/60 via-blue-500/60 to-cyan-400/60">
                <div className="h-full w-full rounded-full bg-[#0f172a]" />
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-cyan-300/30 border-t-cyan-300 motion-safe:animate-spin" />
              <div className="relative font-orbitron text-cyan-200 text-xl tracking-wide select-none">OMC</div>
            </div>
          </div>

          <div className="text-center">
            <h2 className="omc-title">Preparing Live Competitions</h2>
            <p className="omc-subtitle mt-1">Verifying pools, prizes and tickets in real time…</p>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-5xl">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                <div className="h-24 rounded-lg bg-gradient-to-r from-white/5 via-white/10 to-white/5 animate-pulse" />
                <div className="mt-3 h-4 w-3/4 rounded bg-white/10 animate-pulse" />
                <div className="mt-2 h-3 w-1/2 rounded bg-white/10 animate-pulse" />
                <div className="mt-4 flex items-center gap-2">
                  <div className="h-8 w-20 rounded bg-cyan-400/30 animate-pulse" />
                  <div className="h-8 w-16 rounded bg-white/10 animate-pulse" />
                </div>
              </div>
            ))}
          </div>

          <p className="mt-6 text-sm text-cyan-200/90">
            {t('loading_live_competitions', 'Loading live competition data...')}
          </p>
        </section>
      </PageWrapper>
    );
  }

  /* ------------------------ Error UI ------------------------ */
  if (error) {
    return (
      <PageWrapper>
        <section
          role="alert"
          aria-live="assertive"
          aria-label="OhMyCompetitions error loading live competitions"
          className="w-full max-w-3xl mx-auto px-4 py-12"
        >
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur p-6 shadow-[0_0_22px_rgba(34,211,238,0.12)]">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/15 border border-cyan-400/30">
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-cyan-300" aria-hidden="true">
                  <path fill="currentColor" d="M11 7h2v7h-2V7zm1 12a1.5 1.5 0 1 1 .001-3.001A1.5 1.5 0 0 1 12 19zM1 21h22L12 2 1 21z" />
                </svg>
              </div>

              <div className="flex-1">
                <h2 className="font-orbitron text-2xl font-extrabold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-blue-500 to-cyan-300">
                  {t('omc_error_title', 'We couldn’t load live competitions')}
                </h2>
                <p className="mt-1 text-sm text-cyan-200/90">
                  {t('omc_error_sub', 'This might be a network hiccup or our API catching its breath.')}
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => typeof window !== 'undefined' && window.location.reload()}
                className="inline-flex items-center justify-center rounded-xl px-5 py-2 text-sm font-semibold
                           bg-cyan-400 text-[#0a1024] shadow transition-colors hover:bg-cyan-300"
              >
                {t('retry', 'Retry')}
              </button>

              <a
                href="/status"
                className="inline-flex items-center justify-center rounded-xl px-5 py-2 text-sm font-semibold
                           border border-cyan-400/50 text-cyan-100 hover:bg-white/5 transition-colors"
              >
                {t('omc_view_status', 'View status')}
              </a>

              <details className="ml-auto text-xs text-cyan-200/80">
                <summary className="cursor-pointer select-none">{t('omc_error_details', 'Details')}</summary>
                <pre className="mt-2 max-h-32 overflow-auto rounded bg-black/30 p-2 text-[11px] leading-snug">
                  {String(error?.message || error)}
                </pre>
              </details>
            </div>
          </div>

          <p className="mt-4 text-center text-xs text-cyan-300/80">
            {t('omc_error_footer', 'Tip: Check your connection or try again in a few seconds.')}
          </p>
        </section>
      </PageWrapper>
    );
  }

  /* ------------------------ Render ------------------------ */
  return (
    <PageWrapper>
      <div
        className="
          px-4 py-8 space-y-12
          sm:mx-auto sm:max-w-2xl
          md:max-w-3xl
          lg:max-w-5xl
          xl:max-w-7xl
        "
      >
        {/* Marquee */}
        <Marquee
          text={t(
            'marquee_text',
            'Oh My Competitions is all about building with Pi Network for the Pi community. Our OMC launch competitions are zero profit designed to create trust, celebrate early winners and give back to Pioneers. All prizes go directly to you. Add us on all Socials and our Pi Profile darreire2020. More competitions are coming soon across a wide range of exciting categories. Join, win and help shape the future of Pi together.'
          )}
          speed={300}
          className="py-1"
        />

        {/* Mini carousel */}
        <MiniPrizeCarousel />

        {/* Pi Cash Code — centered highlight card */}
        <div className="w-full max-w-lg mx-auto">
          <div className="p-[1px] rounded-2xl bg-gradient-to-r from-cyan-500/50 via-blue-500/40 to-cyan-500/50">
            <Link
              href="/pi-cash-code"
              className="block rounded-2xl px-8 py-6 text-center
                         bg-[#0f172a]/90 backdrop-blur border border-white/5
                         shadow-[0_0_18px_rgba(34,211,238,0.15)]
                         hover:shadow-[0_0_26px_rgba(34,211,238,0.28)]
                         transition-shadow"
              aria-label="Pi Cash Code — Enter Here"
            >
              <h1 className="text-3xl font-bold font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-500 to-cyan-300">
                {t('pi_cash_code', 'Pi Cash Code')}
              </h1>
              <p className="mt-2 text-cyan-300/90 text-sm italic">
                {t('if_you_can_dream', 'If you can dream you can win')}
              </p>
              <p className="mt-2 text-cyan-100 text-sm font-semibold underline underline-offset-4">
                {t('enter_here', 'Enter Here')}
              </p>
            </Link>
          </div>
        </div>

        {/* ====================== Sections ====================== */}
        <main className="space-y-14 sm:space-y-16 lg:space-y-20">
          <Section
            title={t('daily_weekly', 'Daily/Weekly')}
            items={getCompetitionsByCategory('daily')}
            viewMoreHref="/competitions/daily"
            cardSize="md"
            cardMaxWidth={440}
            itemMinWidthCSS="min(400px, calc(100vw - 2rem))"
          />

          <Section
            title={t('tech_gadgets', 'Tech/Gadgets')}
            items={getCompetitionsByCategory('tech')}
            viewMoreHref="/competitions/tech&gadgets"
            cardSize="md"
            cardMaxWidth={460}
            itemMinWidthCSS="min(420px, calc(100vw - 2rem))"
          />

          <Section
            title={t('omc_launch_week', 'OMC Launch Week')}
            items={getCompetitionsByCategory('launch')}
            viewMoreHref="/competitions/launch-week"
            cardSize="lg"
            cardMaxWidth={480}
            itemMinWidthCSS="min(440px, calc(100vw - 2rem))"
          />

          <Section
            title={t('pi_giveaways', 'Pi Giveaways')}
            items={getCompetitionsByCategory('pi')}
            viewMoreHref="/competitions/pi"
            cardSize="lg"
            cardMaxWidth={480}
            itemMinWidthCSS="min(440px, calc(100vw - 2rem))"
          />

          {/* ----------------------- OMC Stages ----------------------- */}
          <section className="space-y-5 sm:space-y-6">
            <div className="text-center space-y-3 px-3">
              <h2 className="w-full text-lg sm:text-xl font-extrabold text-cyan-300 px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl font-orbitron shadow-[0_0_30px_#00fff055] bg-gradient-to-r from-[#0f172a]/70 via-[#1e293b]/70 to-[#0f172a]/70 backdrop-blur-md border border-cyan-400">
                {t('omc_pi_stages_competitions', 'OMC Pi Stages Competitions')}
              </h2>

              <div className="text-[0.85rem] sm:text-sm text-cyan-300/90 italic flex items-start justify-center gap-x-6 gap-y-2 flex-wrap leading-relaxed mt-2 sm:mt-3">
                <span className="text-center">
                  {t('qualify', 'Qualify')}{' '}
                  <span className="text-white font-semibold">({t('stage_1', 'Stage 1')})</span>
                  <span className="block mt-1 text-[0.75rem] not-italic text-cyan-200/85">
                    {t('s1_desc', '25 enter, 5 come out with an Advance Ticket. Will you be one?')}
                  </span>
                </span>

                <span className="text-center">
                  {t('advance', 'Advance')}{' '}
                  <span className="text-white font-semibold">({t('stages_2_4', 'Stages 2–4')})</span>
                  <span className="block mt-1 text-[0.75rem] not-italic text-cyan-200/85">
                    {t('s2_4_desc', 'Each room: 25 enter, top 5 move on using their Advance Ticket.')}
                  </span>
                </span>

                <span className="text-center">
                  {t('win', 'Win')}{' '}
                  <span className="text-white font-semibold">({t('stage_5', 'Stage 5')})</span>
                </span>

                <span className="text-cyan-300 font-semibold text-center">
                  {t('stage_5_prize_pool', 'Stage 5 Prize Pool')}: <span className="text-white">2200π</span>
                </span>
              </div>
            </div>

            <div className="max-w-6xl mx-auto px-2 sm:px-0">
              {/* Mobile: horizontal scroll + snap */}
              <div className="sm:hidden">
                <HorizontalCarousel
                  items={[{ stages, prizePoolPi }]}
                  ariaLabel="OMC stages"
                  renderItem={() => (
                    <FunnelStagesRow
                      stages={stages}
                      prizePoolPi={prizePoolPi}
                      onEnterStage1={handleEnterStage1}
                      className="shadow-[0_0_25px_rgba(0,255,255,0.15)]"
                      layout="stacked"
                      comingSoon
                      ctaLabel={t('coming_soon', 'Coming Soon')}
                    />
                  )}
                  itemMinWidthCSS="min(520px, calc(100vw - 2rem))"
                  cardMaxWidth={520}
                />
              </div>

              {/* Tablet+ grid */}
              <div className="hidden sm:block">
                <FunnelStagesRow
                  stages={stages}
                  prizePoolPi={prizePoolPi}
                  onEnterStage1={handleEnterStage1}
                  className="shadow-[0_0_25px_rgba(0,255,255,0.15)]"
                  layout="grid"
                  comingSoon
                  ctaLabel={t('coming_soon', 'Coming Soon')}
                />
              </div>
            </div>
          </section>

          {/* -------------------- Free Competitions (centered, no carousel) ------------------- */}
          <FreeSection t={t} items={getCompetitionsByCategory('free')} />

          {/* ---------------------- Winners (placeholder) ------------- */}
          <TopWinnersCarousel t={t} />
          <VisionBlock t={t} />
        </main>
      </div>
    </PageWrapper>
  );
}

/* ---------------- utilities used by Section ---------------- */
function wordIncludes(text = '', words = []) {
  const s = String(text).toLowerCase();
  return words.some((w) => new RegExp(`\\b${w}\\b`, 'i').test(s));
}

/**
 * Section
 * - Chooses sensible defaults for width per category
 * - Passes CompetitionCard size (md/lg) and carousel width clamps
 */
function Section({
  title,
  subtitle,
  items = [],
  viewMoreHref,
  viewMoreText = 'View More',
  extraClass = '',
  category,
  cardSize,
  cardMaxWidth,
  itemMinWidthCSS,
}) {
  const { t } = useSafeTranslation();
  const lowerTitle = typeof title === 'string' ? title.toLowerCase() : '';
  const lowerCat = typeof category === 'string' ? category.toLowerCase() : '';

  const TECH_KEYWORDS = [
    'tech','technology','gadget','gadgets','electronics','electronic',
    'device','devices','hardware','computer','pc','laptop','notebook',
    'desktop','phone','smartphone','tablet','console','gaming','headset',
    'earbuds','drone','camera','wearable','smartwatch','router','gpu','cpu'
  ];

  const isFree  = lowerCat === 'free'  || wordIncludes(lowerTitle, ['free','gratis']);
  const isPi    = lowerCat === 'pi'    || wordIncludes(lowerTitle, ['pi','π']);
  const isTech  = lowerCat === 'tech'  || wordIncludes(lowerTitle, TECH_KEYWORDS);
  const isDaily = lowerCat === 'daily' || wordIncludes(lowerTitle, ['daily','weekly']);

  const resolvedCardSize = cardSize || ((isDaily || isTech) ? 'md' : 'lg');
  const resolvedItemMinWidth = itemMinWidthCSS ||
    ((isDaily || isTech)
      ? 'min(400px, calc(100vw - 2rem))'
      : 'min(440px, calc(100vw - 2rem))');
  const resolvedCardMaxWidth = cardMaxWidth ?? ((isDaily || isTech) ? 460 : 480);

  return (
    <section className={`space-y-5 ${extraClass}`}>
      <div className="text-center space-y-2">
        <h2 className="w-full text-sm font-bold text-cyan-300 px-4 py-2 rounded-lg font-orbitron shadow-[0_0_15px_#00fff055] bg-gradient-to-r from-[#0f172a]/70 via-[#1e293b]/70 to-[#0f172a]/70 backdrop-blur-md border border-cyan-400">
          {title}
        </h2>
        {subtitle && <p className="text-xs text-cyan-200 italic">{subtitle}</p>}
      </div>

      <HorizontalCarousel
        items={items}
        ariaLabel={`${title} carousel`}
        itemMinWidthCSS={resolvedItemMinWidth}
        cardMaxWidth={resolvedCardMaxWidth}
        renderItem={(item, i) => renderCard(item, i, { isFree, isPi, cardSize: resolvedCardSize })}
      />

      {viewMoreHref && (
        <div className="text-center mt-6">
          <Link
            href={viewMoreHref}
            className="inline-block text-sm font-bold px-3 py-1.5 rounded-md text-black bg-gradient-to-r from-[#00ffd5] to-[#0077ff] shadow hover:opacity-90 transition"
          >
            {t('view_more', viewMoreText)}
          </Link>
        </div>
      )}
    </section>
  );
}

/* ---------------- card resolver ---------------- */
function renderCard(item, i, { isFree, isPi, cardSize = 'md' }) {
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
        size={cardSize}
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

  return (
    <CompetitionCard
      key={key}
      size={cardSize}
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

/* ---------------- misc sections ---------------- */
function VisionBlock({ t }) {
  return (
    <section className="space-y-6">
      <div className="bg-[#0a1024]/90 border border-cyan-700 rounded-xl px-4 py-6 sm:px-6 sm:py-8 shadow-[0_0_20px_#00fff055] text-center">
        <h2 className="text-base sm:text-lg font-bold text-cyan-300 font-orbitron">
          {t('our_vision_2026', 'Our Vision for 2026: Impact Through Innovation')}
        </h2>

        <p className="mt-3 text-xs sm:text-sm text-white/80 leading-relaxed">
          {t(
            'vision_description',
            'By the end of 2026, OhMyCompetitions aims to reach these community-first milestones, powered by the Pi Network and supported by Pioneers like you.'
          )}
        </p>

        <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-cyan-200 font-medium">
          <li className="text-xs sm:text-sm">
            🌍 {t('over_winners', 'Over')}{' '}
            <strong>10,000+ {t('winners', 'winners')}</strong> {t('across_globe', 'across the globe')}
          </li>
          <li className="text-xs sm:text-sm">
            💰 <strong>500,000 π</strong> {t('in_distributed_pi_prizes', 'in distributed Pi prizes')}
          </li>
          <li className="text-xs sm:text-sm">
            🎗 <strong>20,000 π</strong> {t('donated_to_pi_causes', 'donated to Pi causes & communities')}
          </li>
          <li className="text-xs sm:text-sm">
            ⭐ {t('maintained_5_star', 'Maintained')} <strong>5★</strong> {t('user_rated_experience', 'user-rated experience')}
          </li>
        </ul>
      </div>
    </section>
  );
}

function ComingSoonColumn({ title, items = [], t }) {
  return (
    <div className="space-y-3">
      <h4 className="w-full text-sm font-bold text-center text-cyan-300 px-3 py-1.5 rounded-lg font-orbitron shadow-[0_0_15px_#00fff055] bg-gradient-to-r from-[#0f172a]/70 via-[#1e293b]/70 to-[#0f172a]/70 backdrop-blur-md border border-cyan-400">
        {title} <span className="text-white/50 text-xs">({t('coming_soon', 'Coming Soon')})</span>
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {(items || []).map((item, idx) => (
          <div key={item?.comp?.slug || idx} className="rounded-lg border border-white/10 bg-white/5 p-2 space-y-2">
            <div className="relative h-24 w-full overflow-hidden rounded-md">
              <Image
                src={item.imageUrl || item.thumbnail || '/images/placeholder.jpg'}
                alt={item.title || item?.comp?.title || t('coming_soon', 'Coming soon')}
                fill
                className="object-cover"
              />
            </div>

            <div className="space-y-0.5">
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
  const winners = []; // populate when you have real winners
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
          {t(
            'be_first_to_make_history',
            'Be the first to make history no winners yet, but your name could be the one they remember'
          )}
        </p>
      </div>
    );
  }

  const current = winners[index];

  return (
    <div className="max-w-md mx-auto bg-[#0a1024]/90 border border-cyan-500 backdrop-blur-lg rounded-xl shadow-[0_0_40px_#00fff055] p-6 text-white text-center font-orbitron space-y-4">
      <h2 className="text-2xl font-bold text-cyan-300">{t('top_winners', 'Top Winners')}</h2>

      <div className="flex justify-center">
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

/* ---------- FREE SECTION: centered card, NO carousel ---------- */
function FreeSection({ t, items = [], viewMoreHref = '/competitions/free' }) {
  const fallback = {
    comp: {
      slug: 'pi-to-the-moon',
      startsAt: '',
      endsAt: '',
      ticketsSold: 0,
      totalTickets: 5000,
      comingSoon: true,
      status: 'active',
    },
    title: 'Pi To The Moon',
    prize: '7,500 π',
  };

  // Choose the first provided item or fallback
  const cardData = Array.isArray(items) && items.length ? items[0] : fallback;

  return (
    <section className="space-y-6">
      <div className="text-center">
        <h2 className="w-full text-base font-bold text-center text-cyan-300 px-4 py-3 rounded-xl font-orbitron shadow-[0_0_30px_#00fff055] bg-gradient-to-r from-[#0f172a]/70 via-[#1e293b]/70 to-[#0f172a]/70 backdrop-blur-md border border-cyan-400">
          {t('omc_free_competitions', 'OMC Free Competitions')}
        </h2>
      </div>

      <div className="w-full bg-white/5 backdrop-blur-lg px-4 sm:px-6 py-8 border border-cyan-300 rounded-3xl shadow-[0_0_60px_#00ffd577] neon-outline">
        <div className="max-w-[520px] mx-auto">
          <FreeCompetitionCard
            comp={cardData.comp}
            title={cardData.title}
            prize={cardData.prize}
            hideEntryButton={false}
            buttonLabel={t('enter_now', 'Enter Now')}
          />
        </div>

        <div className="mt-6 text-center">
          <Link
            href={viewMoreHref}
            className="inline-block mx-auto text-sm font-bold px-3 py-1.5 rounded-md text-black bg-gradient-to-r from-[#00ffd5] to-[#0077ff] shadow hover:opacity-90 transition"
          >
            {t('view_more', 'View More')}
          </Link>
        </div>
      </div>
    </section>
  );
}

/* -------- Disable SSR for this page to avoid hydration issues -------- */
const HomePageNoSSR = dynamic(() => Promise.resolve(HomePage), { ssr: false });
/* ---- Make this page use full-width layout (no side gutters in Layout) ---- */
HomePageNoSSR.getLayout = (page) => <Layout fullWidth>{page}</Layout>;
export default HomePageNoSSR;
