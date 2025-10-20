// src/pages/ticket-purchase/pi/[slug].js
'use client';

import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import LaunchCompetitionDetailCard from '@/components/LaunchCompetitionDetailCard';
import GiftTicketModal from '@components/GiftTicketModal';
import { usePiAuth } from '@/context/PiAuthContext';

export default function PiTicketPage() {
  const router = useRouter();
  const { slug } = router.query;

  // Pi auth (guard if context isn't ready)
  let user = null, login = null;
  try {
    const ctx = usePiAuth?.();
    user = ctx?.user || null;
    login = ctx?.login || null;
  } catch {}

  const [loading, setLoading] = useState(true);
  const [comp, setComp] = useState(null);
  const [desc, setDesc] = useState('');
  const [sharedBonus, setSharedBonus] = useState(false);
  const [liveTicketsSold, setLiveTicketsSold] = useState(0);

  useEffect(() => {
    if (!slug) return;

    async function load() {
      setLoading(true);

      // 1) Try local cache (fast path)
      const local =
        (typeof window !== 'undefined' && window.__OMC_CACHE__?.bySlug?.[slug]) ||
        null;

      if (local) {
        const merged = normalizeFromPiItem(local);
        setComp(merged);
        setDesc(merged.description || merged.title);
        setLiveTicketsSold(merged.ticketsSold ?? 0);
        setLoading(false);
        return;
      }

      // 2) Fallback to API
      try {
        const res = await fetch(`/api/competitions/${slug}`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Competition not found');
        const data = await res.json();
        const merged = normalizeFromApi(data);
        setComp(merged);
        setDesc(merged.description || merged.title);
        setLiveTicketsSold(merged.ticketsSold ?? 0);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [slug]);

  // Track share bonus like the other page
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

  // After successful payment, refresh displayed counts to mirror other page behavior
  const handlePaymentSuccess = async (result) => {
    try {
      if (result?.ticketQuantity) {
        setLiveTicketsSold((prev) => prev + Number(result.ticketQuantity || 0));
      }
      // re-fetch to get latest state
      if (slug) {
        const res = await fetch(`/api/competitions/${slug}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          const merged = normalizeFromApi(data);
          setComp(merged);
          setDesc(merged.description || merged.title);
          setLiveTicketsSold(merged.ticketsSold ?? 0);
        }
      }
      const txt =
        result?.competitionStatus === 'completed'
          ? '🎉 Success! Your tickets are confirmed. This competition is now SOLD OUT!'
          : '🎉 Success! Your tickets are confirmed.';
      alert(txt);
    } catch (e) {
      console.error('Refresh after payment failed:', e);
    }
  };

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
      ticketsSold: liveTicketsSold || comp?.ticketsSold || 0,
      totalTickets: comp?.totalTickets ?? 0,
    };
  }, [comp, liveTicketsSold]);

  if (loading || !comp) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#070d19] text-white">
        Loading...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#070d19] text-white px-0 py-0">
      {/* Full-bleed content wrapper */}
      <div className="w-full backdrop-blur-md bg-white/5 border border-cyan-500 rounded-none shadow-lg p-4 sm:p-8">
        <LaunchCompetitionDetailCard
          comp={comp}
          title={comp?.title}
          prize={comp?.firstPrize ?? comp?.prize}
          fee={comp?.entryFee}
          imageUrl={comp?.imageUrl || comp?.thumbnail}   // component shows PrizeBanner if falsy
          endsAt={comp?.endsAt}
          startsAt={comp?.startsAt}
          ticketsSold={ticketsSold}
          totalTickets={totalTickets}
          status={status}
          GiftTicketModal={GiftTicketModal}
          description={desc}
          handlePaymentSuccess={handlePaymentSuccess}
          // 🔽 these props align behavior w/ the other page so the sticky bar works the same
          user={user}
          login={login}
          claimFreeTicket={claimFreeTicket}
          handleShare={handleShare}
          sharedBonus={sharedBonus}
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
