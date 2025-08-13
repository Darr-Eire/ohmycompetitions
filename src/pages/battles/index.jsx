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

/* ---------------- Mock helpers ---------------- */
// In mockItems, add advancedLastHour for demo
function mockItems(count, { stage, live = false } = {}) {
  const arr = [];
  for (let i = 0; i < count; i++) {
    const deterministic = ((i * 17 + stage * 23) % STAGE1_CAPACITY);
    const entrants = live ? STAGE1_CAPACITY : deterministic;

    arr.push({
      slug: `mock-stage${stage}-${String(i + 1).padStart(3, '0')}`,
      entrantsCount: entrants,
      capacity: STAGE1_CAPACITY,
      advancing: stage < 5 ? ADVANCING_PER_ROOM : 1,
      imageUrl: '/pi.jpeg',
      startsAt: live ? '2025-01-01T00:00:00.000Z' : null,
      stage,
      advancedLastHour: Math.floor(Math.random() * 10), // mock stat
    });
  }
  return arr;
}


/* ---------------- Toast Hook ---------------- */
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
    <div className="fixed bottom-[calc(env(safe-area-inset-bottom,0)+1rem)] left-1/2 -translate-x-1/2 z-50 space-y-2 px-4 w-[calc(100%-1rem)] sm:w-auto">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`rounded-xl px-5 py-3 text-sm sm:text-base font-semibold shadow-lg text-center ${
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

/* ---------------- Prize Card ---------------- */
function PrizeCard3D({ place = '1st', amount = 1000, label = 'Champion', accent = 'gold' }) {
  const styles = {
    gold:   { grad: 'from-amber-300/30 via-amber-200/10 to-transparent', text: 'text-amber-200', footer: 'bg-amber-400/20 text-amber-200 border-amber-300/40' },
    silver: { grad: 'from-slate-200/30 via-slate-100/10 to-transparent', text: 'text-slate-100', footer: 'bg-white/10 text-slate-100 border-white/30' },
    bronze: { grad: 'from-orange-300/30 via-amber-200/10 to-transparent', text: 'text-orange-200', footer: 'bg-orange-400/15 text-orange-200 border-orange-300/40' },
    cyan:   { grad: 'from-cyan-400/30 via-cyan-300/10 to-transparent', text: 'text-cyan-200', footer: 'bg-cyan-400/15 text-cyan-200 border-cyan-300/40' },
  }[accent];

  return (
    <div className="group perspective-[1200px]">
      {/* Glow shadow */}
      <div className={`h-2 -mb-2 mx-4 rounded-b-xl bg-gradient-to-b from-black/30 to-transparent blur-[3px]`} />

      {/* Card */}
      <div
        className={`relative rounded-xl p-[1px] bg-gradient-to-br ${styles.grad} transition-transform duration-300 ease-out
          group-hover:-translate-y-[4px] group-hover:rotate-x-[3deg] group-hover:rotate-y-[-2deg]`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div className="relative rounded-xl bg-white/5 backdrop-blur border border-white/10 flex flex-col overflow-hidden">

          {/* Amount */}
          <div className="flex-1 flex flex-col items-center justify-center py-6 px-4">
            <span className="text-3xl sm:text-4xl font-extrabold text-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,0.55)]">
              {formatPi(amount)}
            </span>
            <span className="mt-2 px-3 py-1 text-xs font-semibold bg-white/10 text-white/90 rounded-full border border-white/20">
              {place} Prize
            </span>
          </div>

          {/* Footer Title */}
          <div className={`text-center py-2 text-sm sm:text-base font-bold border-t ${styles.footer}`}>
            {label}
          </div>

        </div>
      </div>
    </div>
  );
}





/* ---------------- Stage Block ---------------- */
function StageBlock({ stage, title, list, onJoin }) {
  if (!list?.length) return null;

  const advancing = list[0]?.advancing ?? (stage === 1 ? 5 : 1);
  const advancedLastHour = list.reduce((sum, room) => sum + (room.advancedLastHour || 0), 0);
  const entrantsLastHour = list.reduce((sum, room) => sum + (room.entrantsLastHour || 0), 0);
  const winRate = entrantsLastHour > 0 ? Math.round((advancedLastHour / entrantsLastHour) * 100) : 0;
  const roomsCompleted = list.reduce((sum, room) => sum + (room.roomsCompletedLastHour || 0), 0);
  const peakOnline = list.reduce((max, room) => Math.max(max, room.peakOnline || 0), 0);
  const prizeRemaining = stage === 5 ? 1520 : null; // example
  const nextMatchETA = list[0]?.nextMatchETA || '2m 15s'; // mock
  const stageProgress = 42; // mock %

  return (
    <StageSection title={title}>
 {/* Stats row */}
<div className="flex flex-wrap gap-3 text-xs sm:text-sm text-white">
  {stage === 5
    ? <StatCard icon="🏆" label="25 Winners" />
    : <StatCard icon="🏆" label={`Top ${advancing} Advance`} />}
  
  <StatCard icon="📈" label="Win Rate" value={`${winRate}%`} />
  <StatCard icon="🏟" label="Rooms" value={roomsCompleted} />
  <StatCard icon="👥" label="Peak" value={peakOnline} />
  {prizeRemaining !== null && (
    <StatCard icon="💰" label="Remaining" value={`${formatPi(prizeRemaining)}`} />
  )}
  <StatCard icon="⏳" label="Next" value={nextMatchETA} />
</div>

      {/* Stage Progress Bar */}
      <div className="mt-3 w-full bg-white/10 rounded-full h-2">
        <div className="bg-cyan-400 h-2 rounded-full" style={{ width: `${stageProgress}%` }} />
      </div>

      {/* Stage Cards */}
      <Cards list={list} stage={stage} onJoin={onJoin} />
    </StageSection>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
      <span>{icon}</span>
      <span className="font-semibold">{label}</span>
      {value && <span className="text-cyan-300 font-bold">{value}</span>}
    </div>
  );
}



/* ---------------- Cards & MiniCard ---------------- */
function Cards({ list, stage, onJoin, entryFee }) {
  if (!list?.length) return <div className="text-white/70">Nothing to show.</div>;
  return (
    <div className="grid gap-5 sm:gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {list.map(c => (
        <MiniCard key={c.slug} data={c} stage={stage} onJoin={onJoin} entryFee={entryFee} />
      ))}
    </div>
  );
}

function MiniCard({ data, stage, onJoin, entryFee }) {
  const spotsLeft = Math.max(0, (data.capacity || STAGE1_CAPACITY) - (data.entrantsCount || 0));
  const pct = Math.max(0, Math.min(100, Math.floor((data.entrantsCount / (data.capacity || STAGE1_CAPACITY)) * 100)));
  const canJoinStage1 = stage === 1 && spotsLeft > 0;
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0b1220] p-5 sm:p-6">
      <div className="flex justify-between items-center">
        <div className="text-white font-semibold text-sm sm:text-base">
          {stage === 1 ? 'Qualifier' : `Stage ${stage}`}
        </div>
        <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-cyan-400 text-black">
          {stage === 1 ? 'FILLING' : 'TICKETS'}
        </span>
      </div>
      <div className="mt-3 text-xs sm:text-sm text-white">
        Players {data.entrantsCount}/{data.capacity} • Advance Top {data.advancing}
      </div>
      <div className="mt-3 h-2 rounded-full bg-white/10">
        <div className="h-full rounded-full bg-cyan-400" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-4">
        {stage === 1 ? (
          canJoinStage1 ? (
            <button onClick={() => onJoin?.({ slug: null, stage })} className="w-full rounded-lg bg-cyan-400 text-black py-2 sm:py-2.5 text-sm sm:text-base font-bold">
              Pay & Enter {formatPi(entryFee)}
            </button>
          ) : (
            <div className="w-full text-center rounded-lg bg-white/10 py-2 text-sm text-white/70">Full</div>
          )
        ) : (
          <button onClick={() => onJoin?.({ slug: data.slug, stage })} className="w-full rounded-lg bg-emerald-400 text-black py-2 sm:py-2.5 text-sm sm:text-base font-bold">
            Enter with Ticket
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------------- Stage Section ---------------- */
function StageSection({ title, children }) {
  return (
    <section className="space-y-5">
      <h2 className="text-lg sm:text-xl font-bold text-white">{title}</h2>
      {children}
    </section>
  );
}

function PrizeTable() {
  return (
    <div className="bg-[#0b1220]/80 backdrop-blur rounded-xl border border-white/10 p-4 sm:p-6 text-xs sm:text-sm text-white/80">
      <table className="w-full">
        <thead>
          <tr className="text-white/60 border-b border-white/10">
            <th className="pb-2 text-left">Place</th>
            <th className="pb-2 text-right">Prize</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
         <tr>
  <td className="py-2">4th–10th</td>
  <td className="py-2 text-right text-cyan-300 font-semibold">{formatPi(50)}</td>
</tr>

          <tr>
            <td className="py-2">11th–25th</td>
            <td className="py-2 text-right text-cyan-300 font-semibold">{formatPi(10)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}


/* ---------------- Main Page ---------------- */
export default function FunnelIndexPage() {
  const { user } = usePiAuth();
  const s1 = useFunnelStage(1);
  const s2 = useFunnelStage(2);
  const s3 = useFunnelStage(3);
  const s4 = useFunnelStage(4);
  const s5 = useFunnelStage(5);
  const [mock] = useState(() => ({
    s1Filling: mockItems(3, { stage: 1 }),
    s2Live: mockItems(2, { stage: 2, live: true }),
    s3Live: mockItems(2, { stage: 3, live: true }),
    s4Live: mockItems(1, { stage: 4, live: true }),
    s5Live: mockItems(1, { stage: 5, live: true }),
  }));
  const s1Filling = s1.filling?.length ? s1.filling : mock.s1Filling;
  const s2Live = s2.live?.length ? s2.live : mock.s2Live;
  const s3Live = s3.live?.length ? s3.live : mock.s3Live;
  const s4Live = s4.live?.length ? s4.live : mock.s4Live;
  const s5Live = s5.live?.length ? s5.live : mock.s5Live;
  const { pushToast, Toasts } = useToasts();

  const handleJoin = useCallback(async ({ slug, stage }) => {
    if (!user?.id && !user?.piUserId) {
      pushToast('Please log in with Pi to enter.', 'warn');
      return;
    }
    const userId = user?.id || user?.piUserId;
    try {
      if (stage === 1) {
        const assignedSlug = null;
        const Pi = typeof window !== 'undefined' ? window.Pi : undefined;
        if (Pi?.createPayment) {
          await Pi.createPayment({
            amount: ENTRY_FEE_PI,
            memo: `OMC Funnel Stage 1`,
            metadata: { slug: assignedSlug, stage, type: 'funnel-entry' },
            onReadyForServerApproval: async (paymentId) => {
              const resp = await postJSON('/api/funnel/join', { slug: assignedSlug, userId, stage, paymentId });
              if (resp?.slug) pushToast(`Placed in ${resp.slug}`, 'success');
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
          pushToast(`Entered • ${resp?.slug ? `Room ${resp.slug}` : ''}`, 'success');
          s1.mutate();
        }
      } else {
        const resp = await postJSON('/api/funnel/join', { slug, userId, stage });
        pushToast(resp?.message || 'Entered with your ticket ✅', 'success');
      }
    } catch (e) {
      pushToast(e?.message || 'Could not enter', 'error');
    }
  }, [user, pushToast, s1]);

  return (
    <main className="min-h-screen bg-[#070d19] pb-20">
  <div className="max-w-6xl mx-auto px-0 sm:px-6 lg:px-8 space-y-10 sm:space-y-12 lg:space-y-16">
    
    {/* Hero */}
    <header className="relative py-6 sm:py-8 bg-gradient-to-br from-[#08121f] via-[#0b1a2a] to-[#061019] text-center overflow-hidden">
  {/* Decorative glow */}
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.15),transparent_70%)] pointer-events-none" />

  {/* Title at top */}
  <h1 className="text-[22px] sm:text-lg font-bold tracking-wide bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent drop-shadow mb-1">
    OMC Stages
  </h1>

      {/* Message below title */}
      <p className="text-[13.5px] sm:text-xs text-white/70 max-w-lg mx-auto mb-4">
        Start your journey in <span className="text-cyan-300 font-semibold">Stage 1 for 0.15 π </span>, 
        battle your way through the stages, and reach Stage 5 to claim your share of the <span className="text-cyan-300 font-semibold">Pi prize pool</span>!
      </p>

      {/* Live Tournament Stats */}
      <div className="mt-6 bg-[#0b1220]/70 backdrop-blur rounded-xl border border-white/10 overflow-hidden shadow-lg">
        
        {/* Header Row */}
        <div className="bg-gradient-to-r from-cyan-400/20 via-emerald-400/20 to-transparent px-4 py-2 flex items-center justify-between border-b border-white/10">
          <h3 className="text-cyan-300 font-bold text-sm sm:text-base tracking-wide">Live Tournament Stats</h3>
          <span className="text-[10px] sm:text-xs text-white/60">Updated 2s ago</span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-x divide-white/5">
          
          {/* Players Played */}
          <div className="p-3 sm:p-4 text-center">
            <div className="text-cyan-300 text-lg sm:text-xl font-extrabold">👥 246</div>
            <div className="text-[10px] sm:text-xs text-white/60">Players Played</div>
          </div>

          {/* Stages Today */}
          <div className="p-3 sm:p-4 text-center">
            <div className="text-emerald-300 text-lg sm:text-xl font-extrabold">🏁 7</div>
            <div className="text-[10px] sm:text-xs text-white/60">Stages Today</div>
          </div>

          {/* π Awarded */}
          <div className="p-3 sm:p-4 text-center">
            <div className="text-cyan-300 text-lg sm:text-xl font-extrabold">💰 5000 π</div>
            <div className="text-[10px] sm:text-xs text-white/60">π Awarded</div>
          </div>

          {/* Winners Stage 5 */}
          <div className="p-3 sm:p-4 text-center">
            <div className="text-purple-300 text-lg sm:text-xl font-extrabold">🏆 25</div>
            <div className="text-[10px] sm:text-xs text-white/60">Winners in Stage 5</div>
          </div>

          {/* Prize Pool */}
          <div className="p-3 sm:p-4 text-center">
            <div className="text-cyan-300 text-lg sm:text-xl font-extrabold">🎯 2,250 π</div>
            <div className="text-[10px] sm:text-xs text-white/60">Prize Pool</div>
          </div>

          {/* Next Stage */}
          <div className="p-3 sm:p-4 text-center">
            <div className="text-emerald-300 text-lg sm:text-xl font-extrabold">⏳ 2</div>
            <div className="text-[10px] sm:text-xs text-white/60">Next Stage</div>
            <div className="text-[9px] text-white/50">Starts in 2m 15s</div>
          </div>

          {/* Prizes Breakdown (Compact) */}
          <div className="p-3 sm:p-4 text-center col-span-2 sm:col-span-3 lg:col-span-6 border-t border-white/10 mt-2">
            <div className="text-[14px] sm:text-base font-extrabold tracking-wide bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent drop-shadow">
              Stage 5 • Prize Pool
            </div>
            <div className="flex flex-wrap justify-center gap-5 text-[13px] sm:text-sm text-white/70 mt-2">
              <span className="flex items-center gap-1">🥇 <span className="font-semibold text-cyan-300">1st: 1000 π</span></span>
              <span className="flex items-center gap-1">🥈 <span className="font-semibold text-cyan-300">2nd: 500 π</span></span>
              <span className="flex items-center gap-1">🥉 <span className="font-semibold text-cyan-300">3rd: 250 π</span></span>
              <span className="flex items-center gap-1">
                4th–10th: <span className="font-semibold text-cyan-300">50 π</span>
                <span className="text-white/50 px-1">|</span>
                11th–25th: <span className="font-semibold text-cyan-300">10 π</span>
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Stage Progression */}
      <div className="mt-10 flex justify-center gap-4 flex-wrap text-xs sm:text-sm text-white/70">
        {["Stage 1", "Stage 2", "Stage 3", "Stage 4", "Stage 5"].map((stage, i) => {
          let subText = "";
          if (i === 0) subText = "Enter";
          else if (i > 0 && i < 4) subText = "Advance";
          else if (i === 4) subText = "Prize Pool";
          return (
            <div key={stage} className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-emerald-400 text-black flex items-center justify-center font-bold shadow-md">
                {i + 1}
              </div>
              <span className="mt-1 font-semibold">{stage}</span>
              <span className="text-[10px] sm:text-xs text-white/50">{subText}</span>
            </div>
          );
        })}
      </div>

    </header>







        {/* Stages */}
        {s1Filling.length > 0 && (
          <StageSection title="Stage 1 · Open Qualifiers">
            <Cards list={s1Filling} stage={1} onJoin={handleJoin} entryFee={ENTRY_FEE_PI} />
          </StageSection>
        )}
        {[{ stage: 2, title: "Stage 2 ", list: s2Live },
          { stage: 3, title: "Stage 3 ", list: s3Live },
          { stage: 4, title: "Stage 4 ", list: s4Live },
          { stage: 5, title: "Stage 5 ", list: s5Live }]
          .map(({ stage, title, list }) => (
            list.length > 0 && <StageBlock key={stage} stage={stage} title={title} list={list} onJoin={handleJoin} />
          ))
        }
      </div>
      <Toasts />
    </main>
  );
}
