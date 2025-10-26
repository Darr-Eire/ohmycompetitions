// file: src/pages/ticket-purchase/[...slug].js
'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import LaunchCompetitionDetailCard from '@components/LaunchCompetitionDetailCard';
import { usePiAuth } from '../../context/PiAuthContext';
import PiPaymentButton from '@components/PiPaymentButton'; // ⬅️ added

/* ------------------------------ Utils ------------------------------ */
const toNum = (v, d = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};

/* --------------------------- Gift Modal ---------------------------- */
function GiftTicketModalInline({ isOpen, onClose, comp, preselectedCompetition }) {
  const c = comp ?? preselectedCompetition ?? null;
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Gift Tickets"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-cyan-400 bg-[#101426] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-3 border-b border-cyan-900/50 flex items-center justify-between">
          <h4 className="text-lg font-bold text-cyan-300">Gift Tickets</h4>
          <button onClick={onClose} className="text-cyan-200 hover:text-white text-sm" type="button">
            Close
          </button>
        </div>

        <div className="p-4 space-y-3">
          <p className="text-white/90">Gifting tickets to other users is coming very soon.</p>
          {(c?.title || c?.comp?.title) && (
            <p className="text-sm text-white/70">
              You’ll be able to gift tickets for{' '}
              <span className="font-semibold">{c?.title ?? c?.comp?.title}</span>
            </p>
          )}
        </div>

        <div className="px-4 pb-4">
          <button
            onClick={onClose}
            className="w-full py-2 rounded-md font-bold text-black bg-gradient-to-r from-[#00ffd5] to-[#0077ff] hover:brightness-110"
            type="button"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- Page ---------------------------------- */
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
  } catch {}

  const [loading, setLoading] = useState(false);
  const [comp, setComp] = useState(null);
  const [desc, setDesc] = useState('');
  const [liveTicketsSold, setLiveTicketsSold] = useState(0);
  const [sharedBonus, setSharedBonus] = useState(false);
  const [error, setError] = useState(null);

  // fetch competition
  const fetchCompetition = useCallback(async (slugParam) => {
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

      // No terms/details mapping — just use API description or fallback
      const fromApi = (norm.description || '').trim();
      setDesc(fromApi || autoDescribeCompetition(norm));
    } catch (e) {
      console.error('❌ Competition fetch failed:', e);
      setError('Unable to load this competition right now.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!router.isReady || !slug) return;
    fetchCompetition(slug);
  }, [router.isReady, slug, fetchCompetition]);

  // status
  const status = useMemo(() => {
    if (!comp) return 'active';
    const now = Date.now();
    const sTs = comp?.startsAt ? new Date(comp.startsAt).getTime() : null;
    const eTs = comp?.endsAt ? new Date(comp.endsAt).getTime() : null;
    if (sTs && now < sTs) return 'upcoming';
    if (eTs && now > eTs) return 'ended';
    return 'active';
  }, [comp]);

  // share bonus state
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

  const entryFeeNum = Number.isFinite(+comp?.entryFee) ? +comp.entryFee : null;

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
            GiftTicketModal={GiftTicketModalInline}
            description={desc}
            handlePaymentSuccess={handlePaymentSuccess}
            claimFreeTicket={claimFreeTicket}
            handleShare={handleShare}
            sharedBonus={sharedBonus}
            user={user}
            login={login}
          />

          {/* --------- Purchase box using PiPaymentButton (alerts included) --------- */}
          <div className="mt-4 rounded-xl border border-cyan-400/30 bg-[#0b1220]/70 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm">
                <div className="font-semibold text-cyan-200">Buy Ticket</div>
                <div className="text-cyan-300/80">
                  Entry:&nbsp;
                  {entryFeeNum != null
                    ? `${entryFeeNum.toFixed(2)} π`
                    : 'TBA'}
                </div>
              </div>

              <div className="w-44">
                <PiPaymentButton
                  amount={entryFeeNum ?? 0.01}               // fallback tiny amount for testing
                  slug={comp?.slug}
                  ticketQty={1}
                  memoTitle={comp?.title || 'Competition Ticket'}
                  extraMetadata={{ page: 'ticket-purchase' }}
                  onSuccess={({ paymentId, txid, slug, ticketQty }) => {
                    // optimistic bump + full refetch
                    setLiveTicketsSold(v => v + (Number(ticketQty) || 0));
                    handlePaymentSuccess({
                      paymentId, txid, slug, ticketQuantity: ticketQty, competitionStatus: null
                    });
                  }}
                />
              </div>
            </div>
          </div>
          {/* ---------------------------------------------------------------------- */}
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
function isFiniteNum(v) {
  return typeof v === 'number' && Number.isFinite(v);
}
