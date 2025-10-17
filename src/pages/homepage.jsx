'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Tab } from '@headlessui/react';
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

// Data
import {
  dailyItems,
  techItems,
  premiumItems,
  piItems,
  freeItems,
  cryptoGiveawaysItems,
} from '@data/competitions';

const toNumber = (v, fallback = 0) => {
  const n = typeof v === 'string' ? parseFloat(v) : Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const FAKE_STAGES = [
  { entrants: 11, capacity: 25, advancing: 5, status: 'live', slug: 'stage-1', pricePi: 0.15, hasTicket: false },
  { entrants: 12, capacity: 25, advancing: 5, status: 'live', slug: 'stage-2', pricePi: 0, hasTicket: true },
  { entrants: 13, capacity: 25, advancing: 5, status: 'live', slug: 'stage-3', pricePi: 0, hasTicket: true },
  { entrants: 14, capacity: 25, advancing: 5, status: 'live', slug: 'stage-4', pricePi: 0, hasTicket: true },
  { entrants: 15, capacity: 25, advancing: 1, status: 'live', slug: 'stage-5', pricePi: 0, hasTicket: true },
];

export default function HomePage() {
  const { t } = useSafeTranslation();
  const [liveCompetitions, setLiveCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const staticItems = useMemo(
    () => [...techItems, ...premiumItems, ...piItems, ...dailyItems, ...freeItems, ...cryptoGiveawaysItems],
    []
  );
  const staticSlugs = useMemo(() => new Set(staticItems.map((i) => i?.comp?.slug).filter(Boolean)), [staticItems]);

  const mergeCompetitionData = useCallback((liveData) => {
    const liveMap = {};
    for (const item of liveData) {
      const slug = item?.comp?.slug;
      if (slug) liveMap[slug] = item;
    }
    const now = new Date();
    const merged = staticItems.map((it) => {
      const slug = it?.comp?.slug;
      const live = liveMap[slug];
      if (!slug) return it;
      return live
        ? {
            ...it,
            imageUrl: live.thumbnail || live.imageUrl || it.imageUrl,
            comp: {
              ...it.comp,
              ...live.comp,
              ticketsSold: toNumber(live.comp?.ticketsSold),
              totalTickets: toNumber(live.comp?.totalTickets, it.comp?.totalTickets),
              entryFee: toNumber(live.comp?.entryFee, it.comp?.entryFee),
              comingSoon: live.comp?.comingSoon ?? it.comp?.comingSoon ?? false,
            },
          }
        : it;
    }).filter(({ comp }) => comp?.status === 'active' && (!comp.endsAt || new Date(comp.endsAt) > now));

    const adminOnly = (liveData || []).filter((x) => x?.comp?.slug && !staticSlugs.has(x.comp.slug));
    return [...merged, ...adminOnly];
  }, [staticItems, staticSlugs]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/competitions/all');
        const json = await res.json();
        const merged = mergeCompetitionData(json?.data || []);
        if (mounted) setLiveCompetitions(merged);
      } catch (e) {
        setError(true);
        if (mounted) {
          const fallback = staticItems.filter(i => i?.comp?.status === 'active');
          setLiveCompetitions(fallback);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [mergeCompetitionData, staticItems]);

  const getCompetitionsByCategory = (category) =>
    liveCompetitions.filter((item) => (item.theme || 'tech') === category);

  const competitionCategories = useMemo(() => ([
    { name: t('daily_weekly'), slug: 'daily', items: getCompetitionsByCategory('daily') },
    { name: t('tech_gadgets'), slug: 'tech', items: getCompetitionsByCategory('tech') },
    { name: t('omc_launch_week'), slug: 'launch', items: getCompetitionsByCategory('launch') },
    { name: t('pi_giveaways'), slug: 'pi', items: getCompetitionsByCategory('pi') },
    { name: t('omc_free'), slug: 'free', items: getCompetitionsByCategory('free') },
    { name: t('crypto_giveaways'), slug: 'crypto', items: getCompetitionsByCategory('crypto') },
  ]), [liveCompetitions, t]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#0a1024] text-white">
        <div className="text-center space-y-4">
          <div className="animate-spin h-16 w-16 border-4 border-cyan-300 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-xl font-medium">{t('loading_live_competitions')}</p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="space-y-16 py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#0b1227] via-[#0f1b33] to-[#0a1024] text-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <MiniPrizeCarousel />
          <Link href="/pi-cash-code" className="glass glow p-6 rounded-xl text-center">
            <h2 className="text-4xl font-bold text-cyan-300">{t('pi_cash_code')}</h2>
            <p className="text-cyan-400 mt-2 italic">{t('if_you_can_dream')}</p>
            <p className="text-cyan-200 font-semibold underline mt-1">{t('enter_here')}</p>
          </Link>
        </div>

        <div>
          <h2 className="text-center text-3xl font-bold text-cyan-300 font-orbitron mb-6">
            {t('featured_competitions')}
          </h2>
          <Tab.Group>
            <Tab.List className="flex flex-wrap justify-center gap-2">
              {competitionCategories.map((cat) => (
                <Tab
                  key={cat.slug}
                  className={({ selected }) =>
                    `px-4 py-2 rounded-md text-sm font-medium transition ${
                      selected ? 'bg-blue-600 text-white' : 'bg-blue-900 text-cyan-300'
                    }`
                  }
                >
                  {cat.name}
                </Tab>
              ))}
            </Tab.List>
            <Tab.Panels className="mt-8">
              {competitionCategories.map((cat) => (
                <Tab.Panel key={cat.slug}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cat.items.map((item, i) => {
                      const props = {
                        key: item?.comp?.slug || i,
                        comp: item.comp,
                        title: item.title,
                        prize: item.prize,
                        fee: `${toNumber(item?.comp?.entryFee, 0).toFixed(2)} π`,
                        imageUrl: item.imageUrl,
                        endsAt: item.comp.endsAt,
                      };
                      if (cat.slug === 'launch') return <LaunchCompetitionCard {...props} />;
                      if (cat.slug === 'daily') return <DailyCompetitionCard {...props} />;
                      if (cat.slug === 'free') return <FreeCompetitionCard {...props} />;
                      if (cat.slug === 'pi') return <PiCompetitionCard {...props} />;
                      if (cat.slug === 'crypto') return <CryptoGiveawayCard {...props} />;
                      return <CompetitionCard {...props} />;
                    })}
                  </div>
                </Tab.Panel>
              ))}
            </Tab.Panels>
          </Tab.Group>
        </div>

        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl font-bold text-center text-cyan-300 mb-4">
            {t('omc_pi_stages_competitions')}
          </h2>
          <FunnelStagesRow
            s1={FAKE_STAGES[0]}
            s2={FAKE_STAGES[1]}
            s3={FAKE_STAGES[2]}
            s4={FAKE_STAGES[3]}
            s5={FAKE_STAGES[4]}
            prizePoolPi={2250}
            hideEnter
            disableEnter
          />
        </div>
      </div>
    </Layout>
  );
}
