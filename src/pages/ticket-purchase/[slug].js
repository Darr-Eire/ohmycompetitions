// src/pages/ticket-purchase/[slug].js
'use client';

import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

import GiftTicketModal from '@components/GiftTicketModal';
import LaunchCompetitionDetailCard from '@components/LaunchCompetitionDetailCard';
import { usePiAuth } from '../../context/PiAuthContext';

/* ----------------------- helpers for prize & banner ----------------------- */
const toNum = (v, d = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};

function parseNumericLike(v) {
  if (v == null) return NaN;
  if (typeof v === 'number') return Number.isFinite(v) ? v : NaN;
  if (typeof v === 'string') {
    const stripped = v.replace(/[^\d.,-]/g, '').replace(',', '.').trim();
    const n = Number(stripped);
    return Number.isFinite(n) ? n : NaN;
  }
  return NaN;
}

function themeOf(c) {
  return (c?.theme || '').toLowerCase();
}

/** Prize for banner: pull a real π number, never the entry fee. */
function prizePiDisplay(c) {
  if (!c) return '— π';
  const entryFee = parseNumericLike(c.entryFee);

  // prizeBreakdown: prefer first > sum
  if (c.prizeBreakdown && typeof c.prizeBreakdown === 'object') {
    const first = parseNumericLike(c.prizeBreakdown.first);
    if (Number.isFinite(first) && first > 0 && first !== entryFee) {
      return `${first.toLocaleString()} π`;
    }
    let sum = 0;
    for (const k of Object.keys(c.prizeBreakdown)) {
      const n = parseNumericLike(c.prizeBreakdown[k]);
      if (Number.isFinite(n)) sum += n;
    }
    if (sum > 0 && sum !== entryFee) return `${sum.toLocaleString()} π`;
  }

  // prizes[] array: use first numeric amount
  if (Array.isArray(c.prizes)) {
    for (const p of c.prizes) {
      const n = parseNumericLike(p?.amount);
      if (Number.isFinite(n) && n > 0 && n !== entryFee) {
        return `${n.toLocaleString()} π`;
      }
    }
  }

  // explicit π fields
  for (const key of ['prizeValuePi', 'prizePi', 'topPrizePi']) {
    const n = parseNumericLike(c[key]);
    if (Number.isFinite(n) && n > 0 && n !== entryFee) return `${n.toLocaleString()} π`;
  }

  // generic prizeValue (assume π)
  const val = parseNumericLike(c.prizeValue);
  if (Number.isFinite(val) && val > 0 && val !== entryFee) return `${val.toLocaleString()} π`;

  // textual firstPrize/prize
  for (const s of [c.firstPrize, c.prize, c.prizeText, c.prizeLabel]) {
    if (typeof s === 'string') {
      const n = parseNumericLike(s);
      if (Number.isFinite(n) && n > 0) return `${n.toLocaleString()} π`;
    }
  }

  return '— π';
}

function feePi(c) {
  const fee = c?.entryFee;
  if (typeof fee === 'number') return `${fee.toFixed(2)} π`;
  return '0.00 π';
}

/** The banner that replaces the image on this page. */


/* ---------------------------------- page ---------------------------------- */
export default function TicketPurchasePage() {
  const router = useRouter();

  // Build slug from catch-all route ([...slug]) or single ([slug])
  const slugArr = router.query.slug;
  const slug = Array.isArray(slugArr) ? slugArr[slugArr.length - 1] : slugArr || '';

  // Pi auth (optional)
  let user = null, login = null;
  try {
    const ctx = usePiAuth?.();
    user = ctx?.user || null;
    login = ctx?.login || null;
  } catch {
    // ignore
  }

  const [loading, setLoading] = useState(false);
  const [comp, setComp] = useState(null);
  const [desc, setDesc] = useState('');
  const [liveTicketsSold, setLiveTicketsSold] = useState(0);
  const [sharedBonus, setSharedBonus] = useState(false);
  const [error, setError] = useState(null);

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
      setError('Unable to load this competition right now.');
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

  const isCryptoCompetition =
    comp?.theme === 'crypto' || comp?.slug?.startsWith?.('crypto');

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

  // Loading / Error states
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
        <h1 className="text-xl font-bold text-red-500 sm:text-2xl">Competition Not Found</h1>
        <p className="mt-4 text-sm sm:text-base">We couldn’t find “{slug}”.</p>
        <Link href="/" className="mt-6 inline-block text-blue-400 underline font-semibold text-sm sm:text-base">
          Back to Home
        </Link>
      </div>
    );
  }

  // IMPORTANT: we do NOT pass an image to the detail card — the banner above replaces it.
  const imageForCard = undefined;

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
        <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-4">
         
          {/* Detail card WITHOUT image */}
          <LaunchCompetitionDetailCard
            comp={comp}
            title={comp?.title}
            prize={prizePiDisplay(comp)}
            imageUrl={imageForCard}       // <- no image rendered by the card
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
    `Prize: ${prizePiDisplay(c)}`,
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

    // keep available for OG/social, but we don't render in-page
    imageUrl: firstDefined(data?.imageUrl, c?.imageUrl, c?.thumbnail, data?.thumbnail, null),
    thumbnail: firstDefined(data?.thumbnail, c?.thumbnail, data?.imageUrl, c?.imageUrl, null),

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
function isFiniteNum(v) {
  return typeof v === 'number' && Number.isFinite(v);
}
