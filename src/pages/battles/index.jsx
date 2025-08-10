// file: src/pages/funnel/index.jsx
'use client';
import React, { useMemo, useState, useCallback } from 'react';
import { postJSON } from '../../lib/api';
import { useFunnelStage } from '../../hooks/useFunnel';
import { usePiAuth } from '../../context/PiAuthContext';
import { computeFunnelEconomics, formatPi } from '../../lib/funnelMath';

/* ----------------------------- Config ------------------------------------ */
const ENTRY_FEE_PI = 0.15;
const STAGE1_CAPACITY = 25;
const ADVANCING_PER_ROOM = 5;

/* ---------------- Mock helpers so UI is visible immediately ---------------- */
// Replace your current mockItems with this deterministic version
function mockItems(count, { stage, live = false } = {}) {
  const arr = [];
  for (let i = 0; i < count; i++) {
    // deterministic pseudo-random based on index+stage
    const deterministic = ((i * 17 + stage * 23) % STAGE1_CAPACITY);
    const entrants = live ? STAGE1_CAPACITY : deterministic;

    arr.push({
      slug: `mock-stage${stage}-${String(i + 1).padStart(3, '0')}`,
      entrantsCount: entrants,
      capacity: STAGE1_CAPACITY,
      advancing: stage < 5 ? ADVANCING_PER_ROOM : 1,
      imageUrl: '/pi.jpeg',
      // avoid time-based values on SSR; keep stable
      startsAt: live ? '2025-01-01T00:00:00.000Z' : null,
      stage,
    });
  }
  return arr;
}


/* --------------------------------- Page ----------------------------------- */
export default function FunnelIndexPage() {
  const { user } = usePiAuth();

  // Real data via SWR
  const s1 = useFunnelStage(1);
  const s2 = useFunnelStage(2);
  const s3 = useFunnelStage(3);
  const s4 = useFunnelStage(4);
  const s5 = useFunnelStage(5);

  // Stable mock data (created once)
  const [mock] = useState(() => ({
    s1Filling: mockItems(3, { stage: 1 }),
    // removed s1Live (we no longer render "Stage 1 · Live Now")
    s2Live:    mockItems(2, { stage: 2, live: true }),
    s3Live:    mockItems(2, { stage: 3, live: true }),
    s4Live:    mockItems(1, { stage: 4, live: true }),
    s5Live:    mockItems(1, { stage: 5, live: true }),
  }));

  // Fake fallbacks (use real data if present)
  const s1Filling = s1.filling?.length ? s1.filling : mock.s1Filling;
  const s2Live    = s2.live?.length    ? s2.live    : mock.s2Live;
  const s3Live    = s3.live?.length    ? s3.live    : mock.s3Live;
  const s4Live    = s4.live?.length    ? s4.live    : mock.s4Live;
  const s5Live    = s5.live?.length    ? s5.live    : mock.s5Live;

  // UI state
  const [tab, setTab] = useState('all'); // all | stage1 | stages2to5 | my
  const { pushToast, Toasts } = useToasts();

  // ---- Join handler: Stage 1 requires payment; later stages are free/qualified only
  const handleJoin = useCallback(
    async ({ slug, stage }) => {
      if (!user?.id && !user?.piUserId) {
        pushToast('Please log in with Pi to enter.', 'warn');
        return;
      }
      const userId = user?.id || user?.piUserId;

      try {
        if (stage === 1) {
          const assignedSlug = null; // backend auto-assigns a room
          const Pi = typeof window !== 'undefined' ? window.Pi : undefined;

          if (Pi?.createPayment) {
            await Pi.createPayment({
              amount: ENTRY_FEE_PI,
              memo: `OMC Funnel Stage 1`,
              metadata: { slug: assignedSlug, stage, type: 'funnel-entry' },
              onReadyForServerApproval: async (paymentId) => {
                const resp = await postJSON('/api/funnel/join', { slug: assignedSlug, userId, stage, paymentId });
                if (resp?.slug) pushToast(`Placed in ${resp.slug} • ETA ~${resp.etaSec ?? 0}s`, 'success');
              },
              onReadyForServerCompletion: async (paymentId, txId) => {
                await postJSON('/api/funnel/confirm', { slug: assignedSlug, userId, stage, paymentId, txId });
              },
              onCancel: () => pushToast('Payment canceled.', 'warn'),
              onError: (err) => pushToast(err?.message || 'Payment failed.', 'error'),
            });
            s1.mutate();
          } else {
            const resp = await postJSON('/api/funnel/join', { slug: assignedSlug, userId, stage, amount: ENTRY_FEE_PI });
            pushToast(`Entered • ${resp?.slug ? `Room ${resp.slug} • ETA ~${resp.etaSec ?? 0}s` : ''}`, 'success');
            s1.mutate();
          }
        } else {
          // Stages 2–5 are free (qualified only); backend enforces eligibility
          const resp = await postJSON('/api/funnel/join', { slug, userId, stage });
          pushToast(resp?.message || 'Entered with your ticket ✅', 'success');
        }
      } catch (e) {
        pushToast(e?.message || 'Could not enter', 'error');
      }
    },
    [user, pushToast, s1]
  );
// Put this near your other components
function PrizeCard3D({ place = '1st', amount = 1000, label = 'Champion', accent = 'gold' }) {
  const styles = {
    gold: {
      grad: 'from-amber-300/30 via-amber-200/10 to-transparent',
      text: 'text-amber-200',
      ring: 'shadow-[0_8px_18px_rgba(251,191,36,0.18)]',
      chip: 'bg-amber-300/15 border-amber-300/30 text-amber-200',
    },
    silver: {
      grad: 'from-slate-200/30 via-slate-100/10 to-transparent',
      text: 'text-slate-100',
      ring: 'shadow-[0_8px_18px_rgba(203,213,225,0.18)]',
      chip: 'bg-white/10 border-white/20 text-slate-100',
    },
    bronze: {
      grad: 'from-orange-300/30 via-amber-200/10 to-transparent',
      text: 'text-orange-200',
      ring: 'shadow-[0_8px_18px_rgba(251,146,60,0.18)]',
      chip: 'bg-orange-300/10 border-orange-300/30 text-orange-200',
    },
    cyan: {
      grad: 'from-cyan-400/30 via-cyan-300/10 to-transparent',
      text: 'text-cyan-200',
      ring: 'shadow-[0_8px_18px_rgba(34,211,238,0.22)]',
      chip: 'bg-cyan-400/15 border-cyan-300/30 text-cyan-200',
    },
  }[accent];

  return (
    <div className="group perspective-[1200px]">
      {/* base “shadow plate” to sell depth */}
      <div className={`h-2 -mb-2 mx-2 rounded-b-xl bg-gradient-to-b from-black/20 to-transparent blur-[2px] ${styles.ring}`} />

      {/* card */}
      <div
        className={`
          relative rounded-xl p-[1px]
          bg-gradient-to-br ${styles.grad}
          transition-transform duration-300 ease-out
          group-hover:-translate-y-[2px] group-hover:rotate-x-[2deg] group-hover:rotate-y-[-2deg]
          will-change-transform
        `}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* inner “glass” with bevel */}
        <div className="relative rounded-xl bg-white/5 backdrop-blur border border-white/10 p-3 h-full">
          {/* inner highlight edge for bevel */}
          <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-white/5">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-[0.06]" />
          </div>

          {/* header */}
          <div className="text-center">
            <div className={`font-bold text-[12px] ${styles.text}`}>{label}</div>
            <div className="mt-0.5 text-[11px] text-white/60">{place} Place</div>
          </div>

          {/* amount */}
          <div className="mt-2 text-center">
            <div className="inline-block px-3 py-1 rounded-lg bg-white/5 border border-white/10">
              <span className="text-cyan-300 font-extrabold tracking-tight text-xl drop-shadow-[0_0_8px_rgba(34,211,238,0.45)]">
                {formatPi(amount)}
              </span>
            </div>
          </div>

          {/* bottom accent chip */}
          <div className="mt-2 flex justify-center">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${styles.chip}`}>
              {place}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}



  // Derived counts for the stats bar (kept for quick at-a-glance on mobile; horizontally scrollable)
  const stats = useMemo(() => {
    const counts = (arr) => ({
      filling: (arr?.filling || []).length,
      live:    (arr?.live    || []).length,
    });
    return {
      s1: counts(s1),
      s2: { filling: 0, live: s2Live.length },
      s3: { filling: 0, live: s3Live.length },
      s4: { filling: 0, live: s4Live.length },
      s5: { filling: 0, live: s5Live.length },
    };
  }, [s1, s2Live, s3Live, s4Live, s5Live]);

  // Filtered sections by tab
  const showStage1     = tab === 'all' || tab === 'stage1';
  const showStages2to5 = tab === 'all' || tab === 'stages2to5';
  const showMy         = tab === 'my';

  return (
    <main className="min-h-screen bg-[#070d19] pb-[calc(env(safe-area-inset-bottom,0)+5rem)]">
<div className="max-w-6xl mx-auto px-3 sm:px-4">
  {/* Regular Header */}
  <header className="bg-[#070d19]/95 backdrop-blur supports-[backdrop-filter]:backdrop-blur">
    {/* Top bar: title + entry chip */}
    <div className="px-3 sm:px-4 py-3 sm:py-4">
     <div className="flex justify-center">
  <h1 className="text-[clamp(18px,2.8vw,22px)] text-cyan-300 font-semibold tracking-tight text-center">
    Pi Battles
  </h1>



        {/* entry fee chip (shown on sm+) */}
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-[12px] text-white/60">Entry</span>
          <span className="px-2.5 py-1 rounded-full text-[12px] font-bold bg-cyan-400 text-black shadow-[0_0_12px_rgba(34,211,238,0.35)]">
            {formatPi(ENTRY_FEE_PI)}
          </span>
        </div>
      </div>

      {/* subtitle */}
    <p className="text-white mt-1 text-[13px] sm:text-sm">
  Have you got what it takes to get through{" "}
  <span className="text-cyan-300 font-semibold">Stages 1–5</span> and
  claim your place in the{" "}
  <span className="text-white ">final prize pool</span>
</p>

    </div>
  </header>


{/* ───────────── Final Stage Prize Pool (matches your prize plan) ───────────── */}
<div id="final-prizes" className="bg-white/5 rounded-lg p-6 text-sm space-y-4 mt-4 text-center">
  <h3 className="text-lg font-semibold text-cyan-300">Final Stage Prize Pool</h3>
  <p className="text-white text-xs">
    Reach Stage 5 and place on the leaderboard to win the prizes below.
  </p>
{/* How It Works */}
<div className="bg-white/5 rounded-lg p-6 text-sm space-y-4 mt-6 text-center">
  <h3 className="text-lg font-semibold text-cyan-300">How It Works</h3>
  <div className="flex flex-col sm:flex-row justify-center gap-4">
    {[
      "Enter Stage 1 by buying your ticket with Pi",
      "Battle it out — only the top players advance each stage",
      "Climb through Stages 2, 3, and 4 by winning your matchups",
      "Reach Stage 5 for your shot at the massive Pi prize pool",
    ].map((text, i) => (
      <div key={i} className="flex-1 flex items-start space-x-3">
        <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-cyan-300 text-black font-bold rounded-full">
          {i + 1}
        </div>
        <p>{text}</p>
      </div>
    ))}
  </div>
</div>





  {(() => {
    // Prize plan + totals
    const tiers = [
      { label: '1st',   count: 1,  amount: 1000 },
      { label: '2nd',   count: 1,  amount: 500  },
      { label: '3rd',   count: 1,  amount: 250  },
      { label: '4th',   count: 1,  amount: 100  },
      { label: '5th',   count: 1,  amount: 50   },
      { label: '6th–10th',  count: 5,  amount: 20  },
      { label: '11th–25th', count: 15, amount: 10  },
    ];

    const OVERLAP_TENTH = false; // set true if #10 also gets the 10π tier
    const baseTotal = tiers.reduce((sum, t) => sum + t.count * t.amount, 0);
    const totalPayout = OVERLAP_TENTH ? baseTotal + 10 : baseTotal;

    const finalPool =
      STAGE1_CAPACITY * ENTRY_FEE_PI * Math.pow(ADVANCING_PER_ROOM, 4); // 2343.75 with current config
    const profit = finalPool - totalPayout;

    // Helper for ordinal superscripts
    const Ord = ({ n }) => {
      const j = n % 10, k = n % 100;
      const suf = j === 1 && k !== 11 ? 'st' : j === 2 && k !== 12 ? 'nd' : j === 3 && k !== 13 ? 'rd' : 'th';
      return <>{n}<sup>{suf}</sup></>;
    };

    return (
      <>
        {/* Top 3 highlight cards */}
<div className="grid grid-cols-3 gap-2">
  <PrizeCard3D place="1st" amount={1000} label="Champion"  accent="cyan"   />
  <PrizeCard3D place="2nd" amount={500}  label="Runner-up" accent="silver" />
  <PrizeCard3D place="3rd" amount={250}  label="Podium"    accent="bronze" />
</div>

        {/* Remaining tiers */}
        <div className="bg-white/1 rounded-lg p-3">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-700/60">
                <th className="pb-2">Place</th>
                <th className="pb-2">Prize</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/60">
              <tr>
                <td className="py-2"><Ord n={4} /> Place</td>
                <td className="py-2">{formatPi(100)}</td>
              </tr>
              <tr>
                <td className="py-2"><Ord n={5} /> Place</td>
                <td className="py-2">{formatPi(50)}</td>
              </tr>
              <tr>
                <td className="py-2">6<sup>th</sup>–10<sup>th</sup></td>
                <td className="py-2">{formatPi(20)} each</td>
              </tr>
              <tr>
                <td className="py-2">11<sup>th</sup>–25<sup>th</sup></td>
                <td className="py-2">{formatPi(10)} each</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
  <div className="flex items-center justify-between sm:block">
    <span className="text-white">Final Pool</span>
    <div className="font-bold">{formatPi(finalPool)}</div>
  </div>


  <div className="flex items-center justify-between sm:block">
    <span className="text-white">Winners</span>
    <div className="font-bold">25</div>
  </div>
</div>

      </>
    );
  })()}
</div>


        {/* Content */}
        <div className="mt-5 sm:mt-6 space-y-7 sm:space-y-9">
          {/* Stage 1 — Filling (kept, but all Live UI removed) */}
          {showStage1 && (
            <Section title="Stage 1 · Open Qualifiers">
              <Cards
                list={s1Filling}
                stage={1}
                onJoin={handleJoin}
                entryFee={ENTRY_FEE_PI}
              />
            </Section>
          )}

          {/* Stages 2–5 — lists (live badges removed; still uses live data feed for rooms) */}
          {showStages2to5 && (
            <>
              <StageBlock stage={2} title="Stage 2 · Quarter-Finals"       list={s2Live} onJoin={handleJoin} />
              <StageBlock stage={3} title="Stage 3 · Semi-Quarter-Finals"  list={s3Live} onJoin={handleJoin} />
              <StageBlock stage={4} title="Stage 4 · Semi-Finals"          list={s4Live} onJoin={handleJoin} />
              <StageBlock stage={5} title="Stage 5 · Main Stage Finals"    list={s5Live} onJoin={handleJoin} />
            </>
          )}

          {/* My Tickets */}
          {showMy && (
            <Section title="My Tickets">
              <EmptyNote text="Connect your Pi account to see your Stage 2–5 tickets here." />
            </Section>
          )}
        </div>
      </div>

      {/* Toasts */}
      <Toasts />

      {/* Hide scrollbars on mobile without needing a plugin */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @media (max-width: 640px) {
          .sticky { top: env(safe-area-inset-top, 0); }
        }
      `}</style>
    </main>
  );
}

/* ------------------------------ Components ------------------------------- */

function Section({ title, children }) {
  return (
    <section>
      <h2 className="text-[clamp(14px,2.6vw,18px)] font-semibold text-black mb-2.5 sm:mb-3">{title}</h2>
      {children}
    </section>
  );
}

// Compact-only cards, mobile-first spacing; buttons go full-width on small screens
function Cards({ list, stage, onJoin, entryFee }) {
  if (!list?.length) return <EmptyNote text="Nothing to show (yet) — check back soon." />;

  const handleJoinClick = (slugOrNull) => onJoin?.({ slug: slugOrNull, stage });

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {list.map((c) => (
        <MiniCard
          key={c.slug}
          data={c}
          stage={stage}
          onJoin={handleJoinClick}
          entryFee={entryFee}
        />
      ))}
    </div>
  );
}

function MiniCard({ data, stage, onJoin, entryFee }) {
  const spotsLeft = Math.max(0, (data.capacity || STAGE1_CAPACITY) - (data.entrantsCount || 0));
  const pct = Math.max(0, Math.min(100, Math.floor((data.entrantsCount / (data.capacity || STAGE1_CAPACITY)) * 100)));
  const canJoinStage1 = stage === 1 && spotsLeft > 0;
  const canEnterWithTicket = stage >= 2;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0b1220] p-3.5 sm:p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
      
          <div className="text-white font-semibold text-[13px] sm:text-sm leading-snug">
            {stage === 1 ? 'Qualifier' : `Stage ${stage}`}
          </div>
        </div>

        {/* tag chip */}
        <span
          className="text-[10px] sm:text-[11px] font-bold px-2 py-1 rounded-full bg-cyan-400 text-black shrink-0"
          aria-label="status"
        >
          {stage === 1 ? 'FILLING' : 'TICKETS'}
        </span>
      </div>

      <div className="mt-2 text-[12px] sm:text-xs text-white">
        Players {data.entrantsCount}/{data.capacity} • Advance Top {data.advancing}
      </div>

      <div className="mt-2 h-2 w-full rounded-full bg-white overflow-hidden" aria-hidden>
        <div className="h-full rounded-full bg-cyan-400" style={{ width: `${pct}%` }} />
      </div>

      <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 justify-between">
        <div className="text-[12px] sm:text-xs text-white">
          {stage === 1 ? `${spotsLeft} spots left` : 'Ticket Only • Free'}
        </div>

        {stage === 1 ? (
          canJoinStage1 ? (
            <button
              onClick={() => onJoin?.(null)} // server auto-assigns a room
              className="w-full sm:w-auto rounded-lg px-3.5 py-2 text-[12px] sm:text-xs font-semibold bg-cyan-400 text-black hover:brightness-110 active:scale-[0.99]"
            >
              Pay & Enter {formatPi(entryFee)}
            </button>
          ) : (
            <span className="w-full sm:w-auto rounded-lg px-3.5 py-2 text-[12px] sm:text-xs font-semibold bg-white/10 text-white/70 text-center">
              Full
            </span>
          )
        ) : (
          <button
            onClick={() => onJoin?.(data.slug)} // Stages 2–5: enter with ticket
            className="w-full sm:w-auto rounded-lg px-3.5 py-2 text-[12px] sm:text-xs font-semibold bg-emerald-400 text-black hover:brightness-110 active:scale-[0.99]"
          >
            Enter with Ticket
          </button>
        )}
      </div>
    </div>
  );
}

function EmptyNote({ text }) {
  return (
    <div className="rounded-xl border border-cyan-500/30 bg-white/5 text-white/80 p-4 sm:p-5 text-[13px] sm:text-sm text-center">
      {text}
    </div>
  );
}

function StatPill({ label, filling = 0, live = 0 }) {
  return (
    <div className="rounded-full bg-white/5 border border-white/10 px-3 py-2">
      <div className="text-white text-[12px] font-semibold truncate">{label}</div>
      <div className="text-[11px] text-white/70">
        {filling ? <span>Fill: {filling} • </span> : null}
        Live: {live}
      </div>
    </div>
  );
}

/* --------------------------- toast system ---------------------------- */
function useToasts() {
  const [toasts, setToasts] = useState([]);
  const pushToast = useCallback((msg, type = 'info', ttl = 2800) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => {
      setToasts(t => t.filter(x => x.id !== id));
    }, ttl);
  }, []);
  const Toasts = useCallback(() => (
    <div
      className="fixed bottom-[calc(env(safe-area-inset-bottom,0)+1rem)] left-1/2 -translate-x-1/2 z-50 space-y-2 px-2 w-[calc(100%-1rem)] sm:w-auto"
      role="status"
      aria-live="polite"
    >
      {toasts.map(t => (
        <div
          key={t.id}
          className={`rounded-xl px-4 py-2 text-sm font-semibold shadow-lg text-center ${
            t.type === 'success' ? 'bg-emerald-400 text-black' :
            t.type === 'warn'    ? 'bg-amber-400 text-black'  :
            t.type === 'error'   ? 'bg-rose-500 text-white'   :
                                   'bg-cyan-400 text-black'
          }`}
        >
          {t.msg}
        </div>
      ))}
    </div>
  ), [toasts]);
  return { pushToast, Toasts };
}

/* ----------------------- Stage block (no Live UI) -------------------------- */
function StageBlock({ stage, title, list, onJoin }) {
  if (!list?.length) return null;

  // advancement per stage (uniform per list)
  const advancing = list[0]?.advancing ?? (stage === 1 ? 5 : 1);

  // Final payout tiers
  const payoutTiers = [
    { min: 1,  max: 1,  amount: 1000 },
    { min: 2,  max: 2,  amount: 500  },
    { min: 3,  max: 3,  amount: 250  },
    { min: 4,  max: 4,  amount: 100  },
    { min: 5,  max: 5,  amount: 50   },
    { min: 6,  max: 10, amount: 20   },
    { min: 10, max: 25, amount: 10   },
  ];

  // Only compute/show final payouts for Stage 5
  const showFinal = stage === 5;
  const econ = showFinal
    ? computeFunnelEconomics({
        stage1Players: STAGE1_CAPACITY,
        entryFee: ENTRY_FEE_PI,
        branching: ADVANCING_PER_ROOM,
        stages: 5,
        payoutTiers,
      })
    : null;

  return (
    <Section title={title}>
      {/* Stages 2–4: mini banner with advancement only */}
      {stage < 5 && <StageMiniBanner advancing={advancing} />}

      {/* Stage 5: full payout table */}
      {showFinal && econ && (
        <div id="final-prizes" className="mb-4 p-4 rounded-xl bg-[#0b1220] border border-cyan-400/40 text-white">
          <div className="font-extrabold text-lg text-cyan-300 mb-2">🏆 Final Prize Pool</div>
          <div className="bg-white/5 rounded-lg p-3">
            <div className="grid grid-cols-2 gap-y-1 text-sm font-semibold">
              {payoutTiers.map((tier, i) => (
                <React.Fragment key={i}>
                  <span>{tier.min === tier.max ? `#${tier.min}` : `#${tier.min}–${tier.max}`}</span>
                  <span className="text-right text-black bg-cyan-400 rounded px-2 py-0.5">
                    {formatPi(tier.amount)}
                  </span>
                </React.Fragment>
              ))}
            </div>
            <div className="mt-2 pt-2 border-t border-white/10 flex justify-between text-sm font-bold">
              <span>Total</span>
              <span className="bg-cyan-400 text-black rounded px-2 py-0.5">
                {formatPi(econ.totalPayout)}
              </span>
            </div>
          </div>
         
        </div>
      )}

      <Cards list={list} stage={stage} onJoin={onJoin} />
    </Section>
  );
}


/* ----------------------- Mini banner (Stages 1–4) ------------------------ */
function StageMiniBanner({ advancing = 5 }) {
  return (
    <div className="mb-2 px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs flex items-center justify-between">
      <span>
        <span className="font-bold text-cyan-300">Top {advancing}</span> advance
      </span>
      <a
        href="#final-prizes"
        className="px-2 py-0.5 rounded bg-cyan-400 text-black font-semibold hover:brightness-110"
        style={{ fontSize: '11px' }}
      >
        Final Prize
      </a>
    </div>
  );
}
