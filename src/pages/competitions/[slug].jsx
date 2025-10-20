// src/pages/competitions/[slug].js
'use client';

import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

import { postJSON } from '../../lib/api';
import { usePiAuth } from '../../context/PiAuthContext';

import FunnelCompetitionCard from '../../components/FunnelCompetitionCard';
import FreeCompetitionCard from '../../components/FreeCompetitionCard';
import LaunchCompetitionDetailCard from '../../components/LaunchCompetitionDetailCard';
import GiftTicketModal from '../../components/GiftTicketModal';
import PageWrapper from '@/components/PageWrapper'; // adjust if your alias differs

// tiny fallback translator (swap for your real i18n)
const t = (_k, fallback) => fallback;

export default function CompetitionDetailPage() {
  const router = useRouter();
  const { slug } = router.query || {};

  // Pi auth (safe-guarded: card can handle unauthenticated state)
  let user = null, login = null;
  try {
    const ctx = usePiAuth?.();
    user = ctx?.user || null;
    login = ctx?.login || null;
  } catch {}

  const [type, setType] = useState('none'); // 'funnel' | 'competition' | 'none'
  const [comp, setComp] = useState(null);   // raw server data
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // Extras for the card UX
  const [sharedBonus, setSharedBonus] = useState(false);
  const [liveTicketsSold, setLiveTicketsSold] = useState(0);

  useEffect(() => {
    if (!slug || typeof slug !== 'string') return;
    let cancelled = false;

    async function run() {
      setLoading(true);
      setErr(null);
      setType('none');
      setComp(null);

      try {
        /* ───────────── 1) Try funnel (validate before using) ───────────── */
        let r = await fetch(`/api/funnel/${slug}`);

        if (r.ok) {
          const data = await r.json().catch(() => null);

          // Minimal shape required to accept as a valid funnel
          const validFunnel =
            data &&
            typeof data.slug === 'string' &&
            data.slug === slug &&
            Number.isFinite(Number(data.stage)) &&
            Number.isFinite(Number(data.capacity)) &&
            Number(data.capacity) > 0;

          if (validFunnel) {
            if (!cancelled) {
              setType('funnel');
              setComp(data);
              setLoading(false);
            }
            return;
          }
          // If not valid → fall through to competitions
        } else if (r.status !== 404) {
          const msg = await r.text().catch(() => 'Funnel fetch failed');
          throw new Error(msg || `Funnel endpoint error (${r.status})`);
        }

        /* ───────────── 2) Try admin competitions (validate) ───────────── */
        r = await fetch(`/api/competitions/${slug}`);

        if (r.ok) {
          const data = await r.json().catch(() => null);

          const dataSlug = data?.slug || data?.comp?.slug;
          const validComp = Boolean(dataSlug);

          if (validComp) {
            if (!cancelled) {
              setType('competition');
              setComp(data);
              setLiveTicketsSold(
                Number(
                  data?.ticketsSold ??
                  data?.comp?.ticketsSold ??
                  data?.entrantsCount ??
                  0
                )
              );
              setLoading(false);
            }
            return;
          }
          // If not valid, treat as not found
        } else if (r.status !== 404) {
          const msg2 = await r.text().catch(() => 'Competition fetch failed');
          throw new Error(msg2 || `Competition endpoint error (${r.status})`);
        }

        // Neither funnel nor competition found → show not found
        if (!cancelled) {
          setType('none');
          setComp(null);
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setErr(e);
          setLoading(false);
        }
      }
    }

    run();
    return () => { cancelled = true; };
  }, [slug]);

  // Share-bonus local storage
  useEffect(() => {
    if (!slug) return;
    setSharedBonus(localStorage.getItem(`${slug}-shared`) === 'true');
  }, [slug]);

  // ===== Loading UI (fancy) =====
  if (!slug || loading) {
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

  // ===== Error UI (fancy) =====
  if (err || !comp || type === 'none') {
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
                  {String(err?.message || err || `We couldn’t find “${slug}”.`)}
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

  /* ───────────── If FUNNEL, render funnel UI ───────────── */
  if (type === 'funnel') {
    const canJoin =
      Number(comp.stage) === 1 &&
      comp.status === 'filling' &&
      Number(comp.entrantsCount) < Number(comp.capacity);

    async function onJoin() {
      if (!user?.id && !user?.piUserId) return alert('Login required.');
      try {
        await postJSON('/api/funnel/join', { slug, userId: user?.id || user?.piUserId });
        alert('Joined! 🍀');
      } catch (e) {
        alert(e?.message || 'Join failed');
      }
    }

    return (
      <PageWrapper>
        <div className="max-w-3xl mx-auto w-full p-6">
          <FunnelCompetitionCard
            title={`Funnel — Stage ${Number.isFinite(Number(comp.stage)) ? comp.stage : 'N/A'}`}
            stage={comp.stage}
            compId={comp.slug}
            entrants={comp.entrantsCount}
            capacity={comp.capacity}
            advancing={comp.advancing}
            status={comp.status}
            imageUrl={comp.imageUrl || '/pi.jpeg'}
            hasTicket={false}
            onClickJoin={canJoin ? onJoin : undefined}
            tags={[String(comp.status || '').toUpperCase()]}
          />
        </div>
      </PageWrapper>
    );
  }

  /* ───────────── Admin-created competition UI ───────────── */
  // Normalize the competition for the card
  const adminComp = {
    slug: comp.slug || comp?.comp?.slug,
    startsAt: comp.startsAt || comp?.comp?.startsAt || '',
    endsAt: comp.endsAt || comp?.comp?.endsAt || '',
    ticketsSold: Number(comp.ticketsSold ?? comp?.comp?.ticketsSold ?? comp.entrantsCount ?? 0),
    totalTickets: Number(comp.totalTickets ?? comp?.comp?.totalTickets ?? comp.capacity ?? 0),
    status: comp.status || comp?.comp?.status || 'active',
    title: comp.title || comp?.comp?.title || 'Competition',
    prizeLabel: comp.prizeLabel || comp.prize || comp?.comp?.prizeLabel || comp?.comp?.prize || '',
    imageUrl: comp.imageUrl || comp?.comp?.imageUrl || '/pi.jpeg',
    entryFee: Number(comp.entryFee ?? comp?.comp?.entryFee ?? 0),
    theme: comp.theme || comp?.comp?.theme || '',
    winners: comp.winners || comp?.comp?.winners || 'Multiple',
    maxTicketsPerUser: comp.maxTicketsPerUser || comp?.comp?.maxTicketsPerUser || 'N/A',
    prizeBreakdown: buildPrizeBreakdownFromComp(comp),
  };

  const theme = String(adminComp.theme || '').toLowerCase();

  // Derived status (upcoming / ended)
  const derivedStatus = useMemo(() => {
    const now = Date.now();
    const sTs = adminComp.startsAt ? new Date(adminComp.startsAt).getTime() : null;
    const eTs = adminComp.endsAt ? new Date(adminComp.endsAt).getTime() : null;
    if (sTs && now < sTs) return 'upcoming';
    if (eTs && now > eTs) return 'ended';
    return adminComp.status || 'active';
  }, [adminComp.startsAt, adminComp.endsAt, adminComp.status]);

  // Payment success → refresh counters
  const handlePaymentSuccess = async (result) => {
    try {
      if (result?.ticketQuantity) {
        setLiveTicketsSold((prev) => prev + Number(result.ticketQuantity || 0));
      }
      // Re-fetch to keep server numbers in sync
      const r = await fetch(`/api/competitions/${adminComp.slug}`);
      if (r.ok) {
        const data = await r.json();
        setComp(data);
        setLiveTicketsSold(
          Number(
            data?.ticketsSold ??
            data?.comp?.ticketsSold ??
            data?.entrantsCount ??
            liveTicketsSold
          )
        );
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

  // Free ticket / share bonus helpers
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

  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-6">
        {theme === 'launch' ? (
          <LaunchCompetitionDetailCard
            comp={adminComp}
            title={adminComp.title}
            prize={adminComp.prizeLabel}
            fee={adminComp.entryFee}
            imageUrl={adminComp.imageUrl}
            startsAt={adminComp.startsAt}
            endsAt={adminComp.endsAt}
            ticketsSold={liveTicketsSold || adminComp.ticketsSold}
            totalTickets={adminComp.totalTickets}
            status={derivedStatus}
            prizeBreakdown={adminComp.prizeBreakdown}
            // payment & bonus flows
            handlePaymentSuccess={handlePaymentSuccess}
            claimFreeTicket={claimFreeTicket}
            handleShare={handleShare}
            sharedBonus={sharedBonus}
            // auth
            user={user}
            login={login}
            // terms modal handled inside the component
            GiftTicketModal={GiftTicketModal}
          />
        ) : (
          <FreeCompetitionCard
            comp={adminComp}
            title={adminComp.title}
            prize={adminComp.prizeLabel}
            buttonLabel="Enter"
          />
        )}
      </div>
    </PageWrapper>
  );
}

/* Optional: keep SSR so the page isn't pre-rendered statically */
export async function getServerSideProps() {
  return { props: {} };
}

/* ───────────── Prize helpers ───────────── */
function normalizePrizeBreakdown(raw) {
  if (!raw) return {};
  if (typeof raw === 'object' && !Array.isArray(raw)) {
    const out = {};
    const map = {
      '1st': '1st', 'first': '1st', 'first prize': '1st', 'grand': '1st', 'grand prize': '1st',
      '2nd': '2nd', 'second': '2nd', 'second prize': '2nd',
      '3rd': '3rd', 'third': '3rd', 'third prize': '3rd',
    };
    for (const [k, v] of Object.entries(raw)) {
      const m = map[String(k).toLowerCase()];
      if (m && out[m] == null) out[m] = v;
    }
    if (out['1st'] || out['2nd'] || out['3rd']) return out;

    const sorted = Object.values(raw)
      .map(v => ({ v, n: Number(String(v).replace(/[^\d.-]/g, '')) }))
      .sort((a, b) => (b.n || -Infinity) - (a.n || -Infinity))
      .slice(0, 3);
    const ord = ['1st', '2nd', '3rd'];
    sorted.forEach((e, i) => { if (e?.v != null) out[ord[i]] = e.v; });
    return out;
  }
  if (Array.isArray(raw)) {
    const ord = ['1st', '2nd', '3rd'];
    const out = {};
    raw.slice(0, 3).forEach((v, i) => { out[ord[i]] = v; });
    return out;
  }
  return {};
}

function buildPrizeBreakdownFromComp(input) {
  const c = input?.comp ?? input ?? {};
  const explicit = {
    '1st': c.firstPrize ?? c.prize1,
    '2nd': c.secondPrize ?? c.prize2,
    '3rd': c.thirdPrize ?? c.prize3,
  };
  if (explicit['1st'] || explicit['2nd'] || explicit['3rd']) return explicit;
  if (c.prizeBreakdown) return normalizePrizeBreakdown(c.prizeBreakdown);
  if (Array.isArray(c.prizes) && c.prizes.length) return normalizePrizeBreakdown(c.prizes);
  return {};
}
