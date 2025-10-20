// src/pages/ticket-purchase/pi/[slug].js
'use client';

import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';

// Adjust these imports to match your aliases
import LaunchCompetitionDetailCard from '@/components/LaunchCompetitionDetailCard';
import GiftTicketModal from '@components/GiftTicketModal';
import PageWrapper from '@/components/PageWrapper'; // <-- ensure this exists; adjust path if needed

// very small fallback translator; swap with your i18n t() if you have one
const t = (_key, fallback) => fallback;

export default function PiTicketPage() {
  const router = useRouter();
  const { slug } = router.query;

  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [comp, setComp]       = useState(null);
  const [desc, setDesc]       = useState('');

  useEffect(() => {
    if (!slug) return;

    async function load() {
      setLoading(true);
      setError(null);

      // 1) Try local cache (fast path)
      const local =
        (typeof window !== 'undefined' && window.__OMC_CACHE__?.bySlug?.[slug]) ||
        null;

      if (local) {
        try {
          const merged = normalizeFromPiItem(local);
          setComp(merged);
          setDesc(merged.description || merged.title);
        } catch (e) {
          setError(e);
        } finally {
          setLoading(false);
        }
        return;
      }

      // 2) Fallback to API
      try {
        const res = await fetch(`/api/competitions/${slug}`);
        if (!res.ok) throw new Error('Competition not found');
        const data = await res.json();
        const merged = normalizeFromApi(data);
        setComp(merged);
        setDesc(merged.description || merged.title);
      } catch (e) {
        console.error(e);
        setError(e);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [slug]);

  const { status, ticketsSold, totalTickets } = useMemo(() => {
    if (!comp) return { status: 'active', ticketsSold: 0, totalTickets: 0 };
    const now = Date.now();
    const startsAt = comp?.startsAt ? new Date(comp.startsAt).getTime() : null;
    const endsAt   = comp?.endsAt   ? new Date(comp.endsAt).getTime()   : null;

    let st = 'active';
    if (startsAt && now < startsAt) st = 'upcoming';
    if (endsAt && now > endsAt)     st = 'ended';

    return {
      status: st,
      ticketsSold: comp?.ticketsSold ?? 0,
      totalTickets: comp?.totalTickets ?? 0,
    };
  }, [comp]);

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

  /* ------------------------ Happy path ------------------------ */
  return (
    <main className="min-h-screen bg-[#070d19] text-white px-0 py-0">
      <div className="w-full backdrop-blur-md bg-white/5 border border-cyan-500 rounded-none shadow-lg p-4 sm:p-8">
        <LaunchCompetitionDetailCard
          comp={comp}
          title={comp?.title}
          prize={comp?.firstPrize ?? comp?.prize}
          fee={comp?.entryFee}
          imageUrl={comp?.imageUrl || comp?.thumbnail}
          endsAt={comp?.endsAt}
          startsAt={comp?.startsAt}
          ticketsSold={ticketsSold}
          totalTickets={totalTickets}
          status={status}
          GiftTicketModal={GiftTicketModal}
          description={desc}
          handlePaymentSuccess={() => {
            // Optional: refresh or navigate after successful payment
            // router.replace(router.asPath);
          }}
        />
      </div>
    </main>
  );
}

/* ---------------------------- Normalizers ---------------------------- */

function normalizeFromPiItem(item) {
  const c = item?.comp ?? {};
  return {
    slug: c.slug,
    title: item.title || c.title || '',
    startsAt: c.startsAt || null,
    endsAt: c.endsAt || null,
    totalTickets: toInt(c.totalTickets, 0),
    ticketsSold: toInt(c.ticketsSold, 0),
    maxTicketsPerUser: firstDefined(c.maxPerUser, c.maxTicketsPerUser, null),
    entryFee: toNum(firstDefined(c.entryFee, item.piAmount, 0)),
    winners: c.winners ?? 'Multiple',
    firstPrize: firstDefined(
      c.prizeBreakdown?.first,
      c.firstPrize,
      item.prize
    ),
    prizeBreakdown: c.prizeBreakdown ?? null,
    imageUrl: item.imageUrl || null,
    thumbnail: item.thumbnail || null,
    description: c.description || item.description || '',
  };
}

function normalizeFromApi(data) {
  const c = data?.comp ?? {};
  return {
    slug: data.slug || c.slug || '',
    title: data.title || c.title || '',
    startsAt: data.startsAt || c.startsAt || null,
    endsAt: data.endsAt || c.endsAt || null,
    totalTickets: toInt(firstDefined(data.totalTickets, c.totalTickets, 0), 0),
    ticketsSold: toInt(firstDefined(data.ticketsSold, c.ticketsSold, 0), 0),
    maxTicketsPerUser: firstDefined(data.maxTicketsPerUser, c.maxPerUser, null),
    entryFee: toNum(firstDefined(data.entryFee, c.entryFee, 0)),
    winners: firstDefined(data.winners, c.winners, 'Multiple'),
    firstPrize: firstDefined(
      data.prizeBreakdown?.first,
      data.firstPrize,
      data.prize,
      c.prizeBreakdown?.first,
      c.firstPrize,
      c.prize
    ),
    prizeBreakdown: firstDefined(data.prizeBreakdown, c.prizeBreakdown, null),
    imageUrl: firstDefined(data.imageUrl, c.imageUrl, null),
    thumbnail: firstDefined(data.thumbnail, c.thumbnail, null),
    description: firstDefined(data.description, c.description, ''),
  };
}

/* ----------------------------- Utils ----------------------------- */

function firstDefined(...vals) {
  for (const v of vals) if (v !== undefined && v !== null) return v;
  return undefined;
}
function toInt(v, d = 0) {
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : d;
}
function toNum(v, d = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}
