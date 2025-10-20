// src/pages/ticket-purchase/[slug].js
'use client';

import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

import GiftTicketModal from '@components/GiftTicketModal';
import LaunchCompetitionDetailCard from '@components/LaunchCompetitionDetailCard';
import PageWrapper from '@/components/PageWrapper'; // adjust path if needed
import { usePiAuth } from '../../context/PiAuthContext';

// tiny fallback translator (replace with your i18n t() if available)
const t = (_k, fallback) => fallback;

export default function TicketPurchasePage() {
  const router = useRouter();

  // Build slug from catch-all ([...slug]) or single ([slug])
  const slugArr = router.query.slug;
  const slug = Array.isArray(slugArr) ? slugArr[slugArr.length - 1] : slugArr || '';

  // Pi auth (optional; guard if context not ready)
  let user = null, login = null;
  try {
    const ctx = usePiAuth?.();
    user = ctx?.user || null;
    login = ctx?.login || null;
  } catch {
    // Non-blocking; card can handle unauthenticated state
  }

  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [comp, setComp]       = useState(null);
  const [desc, setDesc]       = useState('');
  const [liveTicketsSold, setLiveTicketsSold] = useState(0);
  const [sharedBonus, setSharedBonus] = useState(false);

  // Fetch competition from API
  const fetchCompetition = async (slugParam) => {
    if (!slugParam) return;
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/competitions/${encodeURIComponent(slugParam)}`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      });

      if (!res.ok) throw new Error(`API ${res.status} ${res.statusText}`);

      const json = await res.json();
      const norm = normalizeFromApi(json);
      setComp(norm);
      setLiveTicketsSold(norm.ticketsSold ?? 0);
      setDesc((norm.description || '').trim() || autoDescribeCompetition(norm));
    } catch (e) {
      console.error('❌ Competition fetch failed:', e);
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!router.isReady || !slug) return;
    fetchCompetition(slug);
  }, [router.isReady, slug]);

  // Derived status
  const status = useMemo(() => {
    if (!comp) return 'active';
    const now = Date.now();
    const sTs = comp?.startsAt ? new Date(comp.startsAt).getTime() : null;
    const eTs = comp?.endsAt ? new Date(comp.endsAt).getTime() : null;
    if (sTs && now < sTs) return 'upcoming';
    if (eTs && now > eTs) return 'ended';
    return 'active';
  }, [comp]);

  // Payment success → refresh
  const handlePaymentSuccess = async (result) => {
    try {
      if (result?.ticketQuantity) {
        setLiveTicketsSold((prev) => prev + Number(result.ticketQuantity || 0));
      }
      await fetchCompetition(slug);
      const txt =
        result?.competitionStatus === 'completed'
          ? '🎉 Success! Your tickets are confirmed. This competition is now SOLD OUT!'
          : '🎉 Success! Your tickets are confirmed.';
      alert(txt);
    } catch (e) {
      console.error('Refresh after payment failed:', e);
    }
  };

  // Free ticket / share bonus
  useEffect(() => {
    if (!slug) return;
    setSharedBonus(localStorage.getItem(`${slug}-shared`) === 'true');
  }, [slug]);

  const claimFreeTicket = () => {
    if (!slug) return;
    const key = `${slug}-claimed`;
    const current = parseInt(localStorage.getItem(key) || '0', 10);
    localStorage.setItem(key, String(current + 1));
    alert('✅ Free ticket claimed!');
  };

  const handleShare = () => {
    if (!slug) return;
    if (sharedBonus) {
      alert('You already received your bonus ticket.');
      return;
    }
    localStorage.setItem(`${slug}-shared`, 'true');
    setSharedBonus(true);
    alert('✅ Thanks for sharing! Bonus ticket unlocked.');
  };

  /* ------------------------ Loading UI ------------------------ */
  if (!router.isReady || loading) {
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
  if (error || !comp) {
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
                  {String(error?.message || error || `We couldn’t find “${slug}”.`)}
                </pre>
              </details>
            </div>
          </div>

          <p className="mt-4 text-center text-xs text-cyan-300/80">
            {t('omc_error_footer', 'Tip: Check your connection or try again in a few seconds.')}
          </p>

          <div className="mt-4 text-center">
            <Link href="/" className="inline-block text-cyan-300 underline font-semibold text-sm sm:text-base">
              Back to Home
            </Link>
          </div>
        </section>
      </PageWrapper>
    );
  }

  /* ------------------------ Happy path ------------------------ */
  return (
    <>
      <Head>
        <title>{comp.title} | Oh My Competitions</title>
        <meta name="description" content={(desc || '').slice(0, 155)} />
        <meta property="og:title" content={comp.title} />
        <meta property="og:description" content={(desc || '').slice(0, 200)} />
        {comp.imageUrl ? <meta property="og:image" content={comp.imageUrl} /> : null}
      </Head>

      <main className="min-h-screen w-full p-0 text-white bg-[#070d19] font-orbitron">
        <div className="px-4 sm:px-6 py-4 sm:py-6">
          <LaunchCompetitionDetailCard
            comp={comp}
            title={comp?.title}
            prize={comp?.firstPrize ?? comp?.prize}
            imageUrl={comp?.imageUrl || comp?.thumbnail}
            endsAt={comp?.endsAt}
            startsAt={comp?.startsAt}
            ticketsSold={liveTicketsSold ?? comp?.ticketsSold ?? 0}
            totalTickets={comp?.totalTickets ?? 0}
            status={status}
            fee={comp?.entryFee}
            GiftTicketModal={GiftTicketModal}
            description={desc}
            handlePaymentSuccess={handlePaymentSuccess}
            claimFreeTicket={claimFreeTicket}
            handleShare={handleShare}
            sharedBonus={sharedBonus}
            user={user}
            login={login}
          />
        </div>
      </main>
    </>
  );
}

/* --------------------------------- Helpers --------------------------------- */

function autoDescribeCompetition(c) {
  const parts = [
    c?.title,
    c?.firstPrize ? `1st prize: ${c.firstPrize}` : '',
    isFiniteNum(c?.entryFee) ? `Entry fee: ${c.entryFee} π` : '',
    isFiniteNum(c?.totalTickets) ? `Tickets: ${c.totalTickets}` : '',
  ].filter(Boolean);
  return parts.join(' • ');
}

function normalizeFromApi(data) {
  const c = data?.comp ?? {};
  return {
    slug: firstDefined(data?.slug, c?.slug, ''),
    title: firstDefined(data?.title, c?.title, ''),

    startsAt: firstDefined(data?.startsAt, c?.startsAt, null),
    endsAt: firstDefined(data?.endsAt, c?.endsAt, null),

    totalTickets: toInt(firstDefined(data?.totalTickets, c?.totalTickets, 0), 0),
    ticketsSold: toInt(firstDefined(data?.ticketsSold, c?.ticketsSold, 0), 0),
    maxTicketsPerUser: firstDefined(data?.maxTicketsPerUser, c?.maxPerUser, null),

    entryFee: toNum(firstDefined(data?.entryFee, c?.entryFee, 0)),

    winners: firstDefined(data?.winners, c?.winners, 'Multiple'),
    firstPrize: firstDefined(
      data?.prizeBreakdown?.first,
      data?.firstPrize,
      data?.prize,
      c?.prizeBreakdown?.first,
      c?.firstPrize,
      c?.prize
    ),
    prizeBreakdown: firstDefined(data?.prizeBreakdown, c?.prizeBreakdown, null),

    imageUrl: firstDefined(
      data?.imageUrl,
      c?.imageUrl,
      c?.thumbnail,
      data?.thumbnail,
      '/images/placeholder.jpg'
    ),
    thumbnail: firstDefined(
      data?.thumbnail,
      c?.thumbnail,
      data?.imageUrl,
      c?.imageUrl,
      '/images/placeholder.jpg'
    ),
    description: firstDefined(data?.description, c?.description, ''),
    theme: firstDefined(data?.theme, c?.theme, null),
  };
}

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
function isFiniteNum(v) {
  return typeof v === 'number' && Number.isFinite(v);
}
