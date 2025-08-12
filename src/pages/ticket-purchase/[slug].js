// pages/ticket-purchase/[...slug].jsx  (or adjust path to your file)
// 'use client' is required for router + UI
'use client';

import TradingViewWidget from '@components/TradingViewWidget';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { usePiAuth } from '../../context/PiAuthContext';
import descriptions from '../../data/descriptions';
import GiftTicketModal from '@components/GiftTicketModal';

// Shared visual component we want to match
import LaunchCompetitionDetailCard from 'components/LaunchCompetitionDetailCard';

import {
  techItems,
  premiumItems,
  piItems,
  dailyItems,
  freeItems,
  cryptoGiveawaysItems,
} from '../../data/competitions';

/* -------------------------- Static flatten (fallback) -------------------------- */
const flattenCompetitions = [
  ...techItems,
  ...premiumItems,
  ...piItems,
  ...dailyItems,
  ...freeItems,
  ...cryptoGiveawaysItems,
];

/* ------------------------------ Page Component ------------------------------ */
export default function TicketPurchasePage() {
  const router = useRouter();
  const slugArr = router.query.slug || [];
  const slug = Array.isArray(slugArr) ? slugArr[slugArr.length - 1] : slugArr;

  const { user, login } = usePiAuth?.() || {};

  const [loading, setLoading] = useState(false);
  const [comp, setComp] = useState(null);             // normalized competition object
  const [desc, setDesc] = useState('');               // description text
  const [liveTicketsSold, setLiveTicketsSold] = useState(0);
  const [error, setError] = useState(null);

  // Free ticket / share bonus flags (used when fee <= 0)
  const [sharedBonus, setSharedBonus] = useState(false);

  /* -------------------------- Fetch competition (API → static) -------------------------- */
  const fetchCompetition = async (slugParam) => {
    if (!slugParam) return;
    try {
      setLoading(true);
      setError(null);

      // 1) Live API first
      try {
        const res = await fetch(`/api/competitions/${slugParam}`);
        if (res.ok) {
          const data = await res.json();
          const norm = normalizeFromApi(data);
          setComp(norm);
          setLiveTicketsSold(norm.ticketsSold ?? 0);
          setDesc(pickDescription(descriptions, norm.slug, norm.description));
          setLoading(false);
          return;
        }
      } catch (apiErr) {
        // fall through to static
        console.warn('API fetch failed, falling back to static:', apiErr);
      }

      // 2) Fallback to static lists
      const staticRaw = flattenCompetitions.find((c) => c?.comp?.slug === slugParam);
      if (!staticRaw) {
        setError('Competition not found');
        setLoading(false);
        return;
      }

      const norm = normalizeFromPiItem(staticRaw);
      setComp(norm);
      setLiveTicketsSold(norm.ticketsSold ?? 0);
      setDesc(pickDescription(descriptions, norm.slug, norm.description));
    } catch (e) {
      console.error('Failed to load competition:', e);
      setError('Failed to load competition');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!router.isReady || !slug) return;
    fetchCompetition(slug);
  }, [router.isReady, slug]);

  /* ------------------------------ Derived values ------------------------------ */
  const status = useMemo(() => {
    if (!comp) return 'active';
    const now = Date.now();
    const sTs = comp?.startsAt ? new Date(comp.startsAt).getTime() : null;
    const eTs = comp?.endsAt ? new Date(comp.endsAt).getTime() : null;

    if (sTs && now < sTs) return 'upcoming';
    if (eTs && now > eTs) return 'ended';
    return 'active';
  }, [comp]);

  const isCryptoCompetition =
    comp?.theme === 'crypto' || comp?.slug?.startsWith?.('crypto');

  /* ---------------------- Payment success handler (refresh) ---------------------- */
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

  /* ------------------------ Free ticket / share bonus hooks ------------------------ */
  useEffect(() => {
    if (!slug) return;
    setSharedBonus(localStorage.getItem(`${slug}-shared`) === 'true');
  }, [slug]);

  const claimFreeTicket = () => {
    // Implement your free ticket claim here (server or local).
    // Keep behavior unchanged; the visual card will call this.
    // Example: increment a counter in localStorage for this slug.
    const key = `${slug}-claimed`;
    const current = parseInt(localStorage.getItem(key) || '0', 10);
    const max = sharedBonus ? 2 : 1;
    if (current >= max) {
      alert('You have claimed the maximum free tickets.');
      return;
    }
    localStorage.setItem(key, String(current + 1));
    alert('✅ Free ticket claimed!');
  };

  const handleShare = () => {
    if (sharedBonus) {
      alert('You already received your bonus ticket.');
      return;
    }
    localStorage.setItem(`${slug}-shared`, 'true');
    setSharedBonus(true);
    alert('✅ Thanks for sharing! Bonus ticket unlocked.');
  };

  /* ---------------------------------- Loading / Error ---------------------------------- */
  if (!router.isReady || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-300" />
      </div>
    );
  }

  if (error || !comp) {
    return (
      <div className="p-6 text-center text-white bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] min-h-screen">
        <h1 className="text-2xl font-bold text-red-500">Competition Not Found</h1>
        <p className="mt-4">We couldn't find “{slug}”.</p>
        <Link href="/" className="mt-6 inline-block text-blue-400 underline font-semibold">
          Back to Home
        </Link>
      </div>
    );
  }

  /* --------------------------------------- Render --------------------------------------- */
  return (
    <>
      <Head>
        <title>{comp.title} | Oh My Competitions</title>
        <meta name="description" content={(desc || '').slice(0, 155)} />
        <meta property="og:title" content={comp.title} />
        <meta property="og:description" content={(desc || '').slice(0, 200)} />
        {comp.imageUrl ? <meta property="og:image" content={comp.imageUrl} /> : null}
      </Head>

      <main className="min-h-screen px-4 py-6 text-white bg-[#070d19] font-orbitron">
        {/* Optional: show a TradingView chart for crypto competitions above the card */}
        {isCryptoCompetition && (
          <div className="w-full max-w-xl mx-auto h-[380px] mb-6">
            <TradingViewWidget />
          </div>
        )}

        {/* The visual parity card */}
        <LaunchCompetitionDetailCard
          /* core comp object (used by Gift modal, payments, etc.) */
          comp={comp}

          /* headline + media */
          title={comp?.title}
          prize={comp?.firstPrize ?? comp?.prize}
          imageUrl={comp?.imageUrl || comp?.thumbnail}

          /* timing + counts */
          endsAt={comp?.endsAt}
          startsAt={comp?.startsAt}
          ticketsSold={liveTicketsSold ?? comp?.ticketsSold ?? 0}
          totalTickets={comp?.totalTickets ?? 0}
          status={status}

          /* pricing */
          fee={comp?.entryFee}

          /* purchase flow */
          GiftTicketModal={GiftTicketModal}
          description={desc}
          handlePaymentSuccess={handlePaymentSuccess}

          /* free-ticket UX (only used when fee <= 0 inside the card) */
          claimFreeTicket={claimFreeTicket}
          handleShare={handleShare}
          sharedBonus={sharedBonus}

          /* auth (card will use context if not provided, these are optional) */
          // user={user}
          // login={login}
        />

   
      </main>
    </>
  );
}

/* --------------------------------- Helpers --------------------------------- */

function pickDescription(descriptionsMap, slug, fallback = '') {
  if (!slug) return fallback || '—';
  const d = descriptionsMap?.[slug];
  if (typeof d === 'string') return d;
  if (d?.description) return d.description;
  return fallback || '—';
}

function normalizeFromPiItem(item) {
  const c = item?.comp ?? {};
  return {
    slug: c.slug,
    title: item.title || c.title || '',
    startsAt: c.startsAt || null,
    endsAt: c.endsAt || null,
    totalTickets: Number.parseInt(c.totalTickets ?? 0, 10) || 0,
    ticketsSold: Number.parseInt(c.ticketsSold ?? 0, 10) || 0,
    maxTicketsPerUser: c.maxPerUser ?? c.maxTicketsPerUser ?? null,
    entryFee: Number(c.entryFee ?? item.piAmount ?? 0) || 0,
    winners: c.winners ?? 'Multiple',
    firstPrize: c.prizeBreakdown?.first ?? c.firstPrize ?? item.prize,
    prizeBreakdown: c.prizeBreakdown ?? null,

    // ⭐ Robust image fallbacks
    imageUrl:
      item.imageUrl
      || c.imageUrl
      || c.thumbnail
      || item.thumbnail
      || '/images/placeholder.jpg',
    thumbnail:
      item.thumbnail
      || c.thumbnail
      || item.imageUrl
      || c.imageUrl
      || '/images/placeholder.jpg',

    description: c.description || item.description || '',
    theme: item.theme || c.theme || null,
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
    theme: firstDefined(data.theme, c.theme, null),
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
