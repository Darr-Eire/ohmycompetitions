'use client';

import { useRouter } from 'next/router';
import { useEffect, useState, useMemo } from 'react';
import { postJSON } from '../../lib/api';
import { usePiAuth } from '../../context/PiAuthContext';
import FunnelCompetitionCard from '../../components/FunnelCompetitionCard';
import FreeCompetitionCard from '../../components/FreeCompetitionCard';
import LaunchCompetitionDetailCard from '../../components/LaunchCompetitionDetailCard';

export default function CompetitionDetailPage() {
  const router = useRouter();
  const { slug } = router.query;
  const { user } = usePiAuth();

  const [type, setType] = useState('none');     // 'funnel' | 'competition' | 'none'
  const [comp, setComp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  /* -------------------------- fetcher -------------------------- */
  useEffect(() => {
    if (!slug || typeof slug !== 'string') return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setErr(null);
      setType('none');
      setComp(null);

      try {
        // 1) Try funnel doc
        let r = await fetch(`/api/funnel/${slug}`);
        if (r.ok) {
          const data = await r.json();
          if (!cancelled) {
            setType('funnel');
            setComp(data?.data ?? data); // tolerate {data:{...}} and {...}
            setLoading(false);
          }
          return;
        }
        if (r.status !== 404) throw new Error((await r.text().catch(()=>'')) || `Funnel endpoint error (${r.status})`);

        // 2) Try admin competition
        r = await fetch(`/api/competitions/${slug}`);
        if (r.ok) {
          const data = await r.json();
          if (!cancelled) {
            setType('competition');
            setComp(data?.data ?? data?.comp ?? data); // tolerate various shapes
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
        throw new Error((await r.text().catch(()=>'')) || `Competition endpoint error (${r.status})`);
      } catch (e) {
        if (!cancelled) {
          setErr(e);
          setLoading(false);
        }
      }
    })();

    return () => { cancelled = true; };
  }, [slug]);

  if (!slug || loading) return <PageWrap><Loader /></PageWrap>;
  if (err || !comp || type === 'none') return <PageWrap><ErrorBox /></PageWrap>;

  /* ========================= FUNNEL VIEW ========================= */
  if (type === 'funnel') {
    // ---- Normalize all funnel fields (prevents "Stage undefined")
    const f = comp?.funnel ?? comp ?? {};
    // accept both stage/currentStage keys, 1-indexed or 0-indexed
    const rawStage = Number.isFinite(+f.stage) ? +f.stage
                   : Number.isFinite(+f.currentStage) ? +f.currentStage
                   : 1;
    const stage = rawStage >= 1 ? rawStage : (rawStage + 1); // if API is 0-index, make it human
    const entrants = toNum(f.entrantsCount ?? f.entrants ?? 0, 0);
    const capacity  = toNum(f.capacity ?? f.totalTickets ?? 25, 25);
    const advancing = toNum(f.advancing ?? Math.ceil(capacity/5), Math.ceil(capacity/5));
    const pricePi   = toNum(f.pricePi ?? f.entryFee ?? 0, 0);
    const status    = (f.status || 'filling').toLowerCase();
    const imageUrl  = comp?.imageUrl || f.imageUrl || '/pi.jpeg';
    const idSlug    = comp?.slug || f.slug || String(slug);
    const spotsLeft = Math.max(0, capacity - entrants);
    const canJoin   = stage === 1 && status === 'filling' && spotsLeft > 0;

    async function onJoin() {
      if (!user?.id && !user?.piUserId) return alert('Login required.');
      try {
        await postJSON('/api/funnel/join', { slug: idSlug, userId: user?.id || user?.piUserId });
        alert('Joined! 🍀');
      } catch (e) {
        alert(e?.message || 'Join failed');
      }
    }

    return (
      <PageWrap>
        <FunnelCompetitionCard
          title={`Funnel — Stage ${stage}`}
          stage={stage}
          compId={idSlug}
          entrants={entrants}
          capacity={capacity}
          advancing={advancing}
          status={status}
          imageUrl={imageUrl}
          hasTicket={Boolean(f.hasTicket)}
          onClickJoin={canJoin ? onJoin : undefined}
          // ✅ Send a real, interpolated CTA label so no "{spotsLeft}" prints
          ctaLabel={`Enter — ${spotsLeft} left`}
        />
      </PageWrap>
    );
  }

  /* ===================== ADMIN COMPETITION VIEW ===================== */
  const adminComp = useMemo(() => {
    const c = comp?.comp ?? comp ?? {};
    return {
      slug: c.slug || String(slug),
      startsAt: c.startsAt || '',
      endsAt: c.endsAt || '',
      ticketsSold: firstNum(c.ticketsSold, c.entrantsCount, 0),
      totalTickets: firstNum(c.totalTickets, c.capacity, 0),
      comingSoon: Boolean(c.comingSoon),
      status: c.status || 'active',
      title: c.title || 'Competition',
      prizeLabel: c.prizeLabel || c.prize || '',
      imageUrl: c.imageUrl || '/pi.jpeg',
      entryFee: toNum(c.entryFee, 0),
      theme: (c.theme || '').toLowerCase(),
      winners: c.winners || 'Multiple',
      maxTicketsPerUser: c.maxTicketsPerUser || 'N/A',
      prizeBreakdown: buildPrizeBreakdownFromComp(c),
    };
  }, [comp, slug]);

  return (
    <PageWrap>
      <div className="max-w-3xl mx-auto w-full">
        {adminComp.theme === 'launch' ? (
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

/* ============================ helpers ============================ */
export async function getServerSideProps() {
  return { props: {} };
}

function PageWrap({ children }) {
  return <div className="min-h-screen bg-[#070d19] p-6 text-white">{children}</div>;
}
function Loader() { return <div className="h-56 rounded-2xl bg-white/5 animate-pulse" />; }
function ErrorBox() {
  return <div className="rounded-xl border border-rose-500/30 bg-white/5 text-white/80 p-6">Competition not found.</div>;
}

function toNum(v, fb=0){ const n=Number(v); return Number.isFinite(n)?n:fb; }
function firstNum(...vals){ for (const v of vals) { const n = Number(v); if (Number.isFinite(n)) return n; } return 0; }

/* ───────────── Prize helpers (unchanged, kept local to page) ───────────── */
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
    const out = {}; const ord = ['1st','2nd','3rd'];
    raw.slice(0, 3).forEach((v, i) => { out[ord[i]] = v; });
    return out;
  }
  return {};
}
function buildPrizeBreakdownFromComp(input) {
  const c = input?.comp ?? input ?? {};
  const explicit = { '1st': c.firstPrize ?? c.prize1, '2nd': c.secondPrize ?? c.prize2, '3rd': c.thirdPrize ?? c.prize3 };
  if (explicit['1st'] || explicit['2nd'] || explicit['3rd']) return explicit;
  if (c.prizeBreakdown) return normalizePrizeBreakdown(c.prizeBreakdown);
  if (Array.isArray(c.prizes) && c.prizes.length) return normalizePrizeBreakdown(c.prizes);
  return {};
}
