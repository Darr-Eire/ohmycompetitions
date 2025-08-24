// pages/competition/[slug].jsx  (keep your actual path/route name)
// or: pages/competitions/[slug].jsx  — adjust to your routing scheme
'use client';

import { useRouter } from 'next/router';
import { useEffect, useState, useMemo } from 'react';
import { postJSON } from '../../lib/api';
import { usePiAuth } from '../../context/PiAuthContext';

import FunnelCompetitionCard from '../../components/FunnelCompetitionCard';
import FreeCompetitionCard from '../../components/FreeCompetitionCard';
import LaunchCompetitionDetailCard from '../../components/LaunchCompetitionDetailCard';

// If you centralize stage-1 pricing, import it here:
import { STAGE1_ENTRY_FEE_PI } from '../../shared/stagePricing';

const ENTRY_FEE_PI = Number(STAGE1_ENTRY_FEE_PI ?? 0.15);
const SAFE_ENTRY_FEE = Number(ENTRY_FEE_PI.toFixed(8)); // avoid float artifacts

export default function CompetitionDetailPage() {
  const router = useRouter();
  const { slug } = router.query || {};
  const { user } = usePiAuth();

  const [type, setType] = useState('none'); // 'funnel' | 'competition' | 'none'
  const [comp, setComp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (!slug || typeof slug !== 'string') return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setErr(null);
      setType('none');
      setComp(null);

      try {
        // 1) Try funnel endpoint
        let r = await fetch(`/api/funnel/${slug}`);
        if (r.ok) {
          const data = await r.json();
          if (!cancelled) {
            setType('funnel');
            setComp(data);
            setLoading(false);
          }
          return;
        }
        if (r.status !== 404) {
          const msg = await r.text().catch(() => 'Funnel fetch failed');
          throw new Error(msg || `Funnel endpoint error (${r.status})`);
        }

        // 2) Try admin competitions endpoint
        r = await fetch(`/api/competitions/${slug}`);
        if (r.ok) {
          const data = await r.json();
          if (!cancelled) {
            setType('competition');
            setComp(data);
            setLoading(false);
          }
          return;
        }

        if (r.status === 404) {
          if (!cancelled) {
            setType('none');
            setComp(null);
            setLoading(false);
          }
          return;
        }
        const msg2 = await r.text().catch(() => 'Competition fetch failed');
        throw new Error(msg2 || `Competition endpoint error (${r.status})`);
      } catch (e) {
        if (!cancelled) {
          setErr(e);
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  // -------------------- RENDER STATES --------------------
  if (!slug || loading) {
    return (
      <PageWrap>
        <Loader />
      </PageWrap>
    );
  }

  if (err || !comp || type === 'none') {
    return (
      <PageWrap>
        <ErrorBox />
      </PageWrap>
    );
  }

  // -------------------- FUNNEL UI --------------------
  if (type === 'funnel') {
    const canJoin =
      comp.stage === 1 &&
      comp.status === 'filling' &&
      Number(comp.entrantsCount || 0) < Number(comp.capacity || 0);

    const onJoin = async () => {
      if (!user?.id && !user?.piUserId) {
        alert('Login required.');
        return;
      }

      const stage = 1; // only Stage 1 is purchase-based
      const assignedSlug = null; // server assigns room
      const userId = user?.id || user?.piUserId;
      const username =
        user?.username || user?.piUsername || user?.handle || null;

      try {
        const Pi = typeof window !== 'undefined' ? window.Pi : undefined;

        if (Pi?.createPayment) {
          await Pi.createPayment(
            {
              amount: SAFE_ENTRY_FEE,
              memo: 'OMC Funnel Stage 1',
              metadata: { slug: assignedSlug, stage, type: 'funnel-entry' },
            },
            {
              onReadyForServerApproval: async (paymentId) => {
                try {
                  await postJSON('/api/funnel/join', {
                    slug: assignedSlug,
                    userId,
                    username,
                    stage,
                    paymentId,
                    amount: SAFE_ENTRY_FEE,
                    currency: 'pi',
                  });
                } catch (e) {
                  const dbg = e?.payload?.debug
                    ? ` (amt=${e.payload.debug.amt}, expected=${e.payload.debug.expected})`
                    : '';
                  alert(`Join failed: ${e?.message || 'Server error'}${dbg}`);
                  try {
                    window.Pi?.cancelPayment?.(paymentId);
                  } catch {}
                  throw e;
                }
              },
              onReadyForServerCompletion: async (paymentId, txid) => {
                try {
                  await postJSON('/api/funnel/confirm', {
                    slug: assignedSlug,
                    userId,
                    username,
                    stage,
                    paymentId,
                    txid, // IMPORTANT: field name must be txid
                    amount: SAFE_ENTRY_FEE,
                    currency: 'pi',
                  });
                  alert('🎉 You have been placed into a Stage 1 room!');
                  // Optionally refresh funnel data for this slug
                  try {
                    const r = await fetch(`/api/funnel/${slug}`);
                    if (r.ok) {
                      const data = await r.json();
                      setComp(data);
                    }
                  } catch {}
                } catch (e) {
                  const dbg = e?.payload?.debug
                    ? ` (${JSON.stringify(e.payload.debug)})`
                    : '';
                  alert(`Confirm failed: ${e?.message || 'Server error'}${dbg}`);
                  throw e;
                }
              },
              onCancel: () => alert('Payment canceled.'),
              onError: (err) => alert(err?.message || 'Payment failed.'),
            }
          );
        } else {
          // Dev fallback (no Pi SDK)
          const resp = await postJSON('/api/funnel/join', {
            slug: assignedSlug,
            userId,
            username,
            stage,
            amount: SAFE_ENTRY_FEE,
            currency: 'pi',
          });
          alert(
            `Entered • ${resp?.slug ? `Room ${resp.slug}` : 'room assigned'}`
          );
          // Refresh
          try {
            const r = await fetch(`/api/funnel/${slug}`);
            if (r.ok) {
              const data = await r.json();
              setComp(data);
            }
          } catch {}
        }
      } catch (e) {
        console.error('Join error:', e);
        alert(e?.message || 'Could not enter');
      }
    };

    return (
      <PageWrap>
        <FunnelCompetitionCard
          title={`Funnel — Stage ${comp.stage}`}
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
      </PageWrap>
    );
  }

  // -------------------- ADMIN COMPETITION UI --------------------
  const adminComp = useMemo(() => {
    const c = comp?.comp ?? comp ?? {};
    return {
      slug: c.slug,
      startsAt: c.startsAt || '',
      endsAt: c.endsAt || '',
      ticketsSold: c.ticketsSold ?? c.entrantsCount ?? 0,
      totalTickets: c.totalTickets ?? c.capacity ?? 0,
      comingSoon: Boolean(c.comingSoon),
      status: c.status || 'active',
      title: c.title || 'Competition',
      prizeLabel: c.prizeLabel || c.prize || '',
      imageUrl: c.imageUrl || '/pi.jpeg',
      entryFee: Number(c.entryFee ?? 0) || 0,
      theme: (c.theme || '').toString(),
      winners: c.winners || 'Multiple',
      maxTicketsPerUser: c.maxTicketsPerUser || 'N/A',
      prizeBreakdown: buildPrizeBreakdownFromComp(c),
    };
  }, [comp]);

  const isLaunch = (adminComp.theme || '').toLowerCase() === 'launch';

  return (
    <PageWrap>
      <div className="max-w-3xl mx-auto w-full">
        {isLaunch ? (
          <LaunchCompetitionDetailCard
            comp={adminComp}
            title={adminComp.title}
            prize={adminComp.prizeLabel}
            fee={`${adminComp.entryFee.toFixed(2)} π`}
            imageUrl={adminComp.imageUrl}
            startsAt={adminComp.startsAt}
            endsAt={adminComp.endsAt}
            ticketsSold={adminComp.ticketsSold}
            totalTickets={adminComp.totalTickets}
            status={adminComp.status}
            prizeBreakdown={adminComp.prizeBreakdown}
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
    </PageWrap>
  );
}

export async function getServerSideProps() {
  return { props: {} };
}

function PageWrap({ children }) {
  return <div className="min-h-screen bg-[#070d19] p-6 text-white">{children}</div>;
}
function Loader() {
  return <div className="h-56 rounded-2xl bg-white/5 animate-pulse" />;
}
function ErrorBox() {
  return (
    <div className="rounded-xl border border-rose-500/30 bg-white/5 text-white/80 p-6">
      Competition not found.
    </div>
  );
}

/* ─────────────── Prize helpers ─────────────── */
function normalizePrizeBreakdown(raw) {
  if (!raw) return {};
  if (typeof raw === 'object' && !Array.isArray(raw)) {
    const out = {};
    const map = {
      '1st':'1st','first':'1st','first prize':'1st','grand':'1st','grand prize':'1st',
      '2nd':'2nd','second':'2nd','second prize':'2nd',
      '3rd':'3rd','third':'3rd','third prize':'3rd',
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
    const ord = ['1st','2nd','3rd'];
    sorted.forEach((e, i) => { if (e?.v != null) out[ord[i]] = e.v; });
    return out;
  }
  if (Array.isArray(raw)) {
    const ord = ['1st','2nd','3rd'];
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
