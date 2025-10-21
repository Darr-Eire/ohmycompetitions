// file: src/pages/competitions/free.js
'use client';

import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import FreeCompetitionCard from '@components/FreeCompetitionCard';

const toNumber = (v, d = 0) => {
  const n = typeof v === 'string' ? parseFloat(v) : Number(v);
  return Number.isFinite(n) ? n : d;
};

export default function FreeCompetitionsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
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
        if (mounted) setItems(free);
      } catch (e) {
        if (mounted) setErr(String(e?.message || e));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <>
      <Head>
        <title>Free Competitions | OhMyCompetitions</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>

      <main className="relative min-h-[100svh] text-white bg-[#0f1b33]">
        {/* page header */}
        <header className="relative z-10 pt-[calc(14px+env(safe-area-inset-top))] pb-4">
          <div className="mx-auto w-full max-w-[min(94vw,1200px)] px-4">
            <h1 className="text-center text-[24px] sm:text-[28px] font-extrabold tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ffd5] to-[#0077ff]">
                OMC Free Competitions
              </span>
            </h1>
            <p className="text-center text-white/70 mt-1 text-sm">
              Enter for free. Win real π prizes.
            </p>
          </div>
        </header>

        {/* content */}
        <section className="py-6 sm:py-8">
          <div className="mx-auto w-full max-w-[min(94vw,1200px)] px-4">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="rounded-xl border border-white/10 bg-white/[0.06] p-4">
                    <div className="h-24 rounded-lg bg-gradient-to-r from-white/5 via-white/10 to-white/5 animate-pulse" />
                    <div className="mt-3 h-4 w-3/4 rounded bg-white/10 animate-pulse" />
                    <div className="mt-2 h-3 w-1/2 rounded bg-white/10 animate-pulse" />
                  </div>
                ))}
              </div>
            ) : err ? (
              <div className="text-center text-cyan-200/90">
                {String(err)}
              </div>
            ) : items.length === 0 ? (
              <div className="text-center text-cyan-200/90">
                No free competitions yet check back soon!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {items.map((it) => (
                  <div key={it?.comp?.slug || it.title} className="w-full">
                    <FreeCompetitionCard
                      comp={it.comp}
                      title={it.title}
                      prize={it.prize}
                      hideEntryButton={false}
                      buttonLabel="More Details"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
