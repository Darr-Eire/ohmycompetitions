// file: src/components/FreeShowcaseSection.jsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import FreeCompetitionCard from '@components/FreeCompetitionCard';
import { useSafeTranslation } from '../hooks/useSafeTranslation';

const toNumber = (v, d = 0) => {
  const n = typeof v === 'string' ? parseFloat(v) : Number(v);
  return Number.isFinite(n) ? n : d;
};

export default function FreeShowcaseSection({ items }) {
  const { t } = useSafeTranslation();
  const [freeItems, setFreeItems] = useState([]);
  const [loading, setLoading] = useState(!Array.isArray(items));
  const [error, setError] = useState(null);

  // fallback content if no free comps yet
  const fallback = useMemo(() => ({
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
  }), []);

  useEffect(() => {
    if (Array.isArray(items)) {
      setFreeItems(items);
      setLoading(false);
      return;
    }
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/competitions/all');
        if (!res.ok) throw new Error(`Failed: ${res.status}`);
        const json = await res.json();
        const arr = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];
        const free = arr
          .filter((it) => (it?.theme || it?.comp?.theme || '').toLowerCase() === 'free')
          .map((it) => {
            const c = it?.comp ?? {};
            return {
              ...it,
              comp: {
                ...c,
                ticketsSold: toNumber(c?.ticketsSold, 0),
                totalTickets: toNumber(c?.totalTickets, 0),
              },
            };
          });
        if (mounted) setFreeItems(free);
      } catch (e) {
        if (mounted) setError(String(e?.message || e));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [items]);

  const cardData = useMemo(() => {
    if (Array.isArray(freeItems) && freeItems.length) return freeItems[0];
    return fallback;
  }, [freeItems, fallback]);

  return (
    <section className="space-y-6">
      <div className="text-center">
        <h2 className="w-full text-base font-bold text-center text-cyan-300 px-4 py-3 rounded-xl font-orbitron shadow-[0_0_30px_#00fff055] bg-gradient-to-r from-[#0f172a]/70 via-[#1e293b]/70 to-[#0f172a]/70 backdrop-blur-md border border-cyan-400">
          {t('omc_free_competitions', 'OMC Free Competitions')}
        </h2>
      </div>

      <div className="w-full bg-white/5 backdrop-blur-lg px-4 sm:px-6 py-8 border border-cyan-300 rounded-3xl shadow-[0_0_60px_#00ffd577] neon-outline">
        <div className="max-w-[520px] mx-auto">
          {loading ? (
            <div className="rounded-xl border border-white/10 bg-white/[0.06] p-4">
              <div className="h-24 rounded-lg bg-gradient-to-r from-white/5 via-white/10 to-white/5 animate-pulse" />
              <div className="mt-3 h-4 w-3/4 rounded bg-white/10 animate-pulse" />
              <div className="mt-2 h-3 w-1/2 rounded bg-white/10 animate-pulse" />
            </div>
          ) : error ? (
            <div className="text-center text-sm text-cyan-200/90">
              {t('error_loading_free', 'Couldn’t load free competitions right now.')}
            </div>
          ) : (
            <FreeCompetitionCard
              comp={cardData.comp}
              title={cardData.title}
              prize={cardData.prize}
              hideEntryButton={false}
              buttonLabel={t('enter_now', 'More Details')}
            />
          )}
        </div>
      </div>

      <div className="text-center">
        <Link
          href="/competitions/free"
          className="inline-block text-sm font-bold px-3 py-1.5 rounded-md text-black bg-gradient-to-r from-[#00ffd5] to-[#0077ff] shadow hover:opacity-90 transition"
        >
          {t('view_all_free', 'View All Free')}
        </Link>
      </div>
    </section>
  );
}
