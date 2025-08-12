// /ticket-purchase/pi/[slug].js
'use client';

import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';

import LaunchCompetitionDetailCard from 'components/LaunchCompetitionDetailCard';
import GiftTicketModal from '@components/GiftTicketModal';
import { piItems } from '../../../data/competitions';
import descriptions from '../../../data/descriptions';

export default function PiTicketPage() {
  const router = useRouter();
  const { slug } = router.query;

  const [loading, setLoading] = useState(true);
  const [comp, setComp] = useState(null); // normalized competition object
  const [desc, setDesc] = useState('');

  useEffect(() => {
    if (!slug) return;

    async function load() {
      setLoading(true);

      // 1) Try local data (fast path)
      const local = Array.isArray(piItems)
        ? piItems.find((c) => c?.comp?.slug === slug)
        : null;

      if (local) {
        const merged = normalizeFromPiItem(local);
        setComp(merged);
        setDesc(descriptions?.[slug] || merged.description || '');
        setLoading(false);
        return;
      }

      // 2) Fallback to API
      try {
        const res = await fetch(`/api/competitions/${slug}`);
        if (!res.ok) throw new Error('Competition not found');
        const data = await res.json();
        const merged = normalizeFromApi(data);
        setComp(merged);
        setDesc(merged.description || '');
      } catch (e) {
        console.error(e);
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

  if (loading || !comp) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#070d19] text-white">
        Loading...
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-10 bg-[#070d19] text-white">
      <LaunchCompetitionDetailCard
        /* visual parity with LaunchCompetitionDetailCard */
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
          // Optional: refresh state here after a payment if needed.
        }}
      />
    </main>
  );
}

/* ---------------------------- Normalizers ---------------------------- */

function normalizeFromPiItem(item) {
  // item shape: { title, prize, imageUrl, thumbnail, comp: {...} }
  const c = item?.comp ?? {};
  return {
    // identity
    slug: c.slug,
    title: item.title || c.title || '',

    // timing
    startsAt: c.startsAt || null,
    endsAt: c.endsAt || null,

    // tickets
    totalTickets: toInt(c.totalTickets, 0),
    ticketsSold: toInt(c.ticketsSold, 0),
    maxTicketsPerUser: firstDefined(c.maxPerUser, c.maxTicketsPerUser, null),

    // pricing
    entryFee: toNum(firstDefined(c.entryFee, item.piAmount, 0)),

    // winners/prizes
    winners: c.winners ?? 'Multiple',
    firstPrize: firstDefined(
      c.prizeBreakdown?.first,
      c.firstPrize,
      item.prize
    ),
    prizeBreakdown: c.prizeBreakdown ?? null,

    // media/desc
    imageUrl: item.imageUrl || null,
    thumbnail: item.thumbnail || null,
    description: c.description || item.description || '',
  };
}

function normalizeFromApi(data) {
  // API may return either flattened or nested comp
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
