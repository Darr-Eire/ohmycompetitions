'use client';
import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { postJSON } from '../../lib/api';
import { useFunnelStage } from '../../hooks/useFunnel';
import { usePiAuth } from '../../context/PiAuthContext';
import { formatPi } from '../../lib/funnelMath';
import XPBar from '../../components/XPBar';

/* ----------------------------- Config ------------------------------------ */
const ENTRY_FEE_PI = 0.15;
const STAGE1_CAPACITY = 25;
const ADVANCING_PER_ROOM = 5;

/* ---------------- Helpers ---------------- */
function inFuture(minutes = 2, jitter = 60_000) {
  const t = Date.now() + minutes * 60_000 + Math.floor(Math.random() * jitter);
  return new Date(t).toISOString();
}

/* ---------------- Mock helpers ---------------- */
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
      advancedLastHour: Math.floor(Math.random() * 10),
      nextStartAt: inFuture(2 + i),
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

/* ---------------- Countdown Circle ---------------- */
function CountdownCircle({ targetISO, size = 64, stroke = 6, label = 'Next Stage' }) {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    setMounted(true);
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  const target = new Date(targetISO).getTime();
  const remaining = Math.max(0, target - now);

  const estTotal = 2 * 60 * 1000;
  const progress = 1 - (remaining / estTotal);
  const r = (size - stroke) / 2;
  const C = 2 * Math.PI * r;
  const dash = Math.min(C, Math.max(0, progress * C));

  const total = Math.max(0, Math.floor(remaining / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  const display = total === 0 ? 'Live' : `${m}:${String(s).padStart(2, '0')}`;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle cx={size/2} cy={size/2} r={r} stroke="rgba(255,255,255,0.15)" strokeWidth={stroke} fill="none" />
          <circle
            cx={size/2}
            cy={size/2}
            r={r}
            stroke="rgb(34,211,238)"
            strokeWidth={stroke}
            strokeDasharray={`${dash} ${C-dash}`}
            strokeLinecap="round"
            fill="none"
            className="drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]"
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center text-xs font-bold text-white">
          <span suppressHydrationWarning>{mounted ? display : '—:—'}</span>
        </div>
        <div className="absolute -inset-1 rounded-full animate-[ping_1.5s_ease-out_infinite] bg-cyan-400/10" />
      </div>
      <div className="mt-1 text-[11px] text-white/60">{label}</div>
    </div>
  );
}

/* ---------------- Reusable KPI ---------------- */
function KPI({ icon, label, value, sub }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur p-4 text-left">
      <div className="flex items-center gap-2 text-white/70 text-xs">
        <span className="text-base">{icon}</span>
        <span>{label}</span>
      </div>
      <div className="mt-2 text-2xl font-extrabold text-cyan-300">{value}</div>
      {sub ? <div className="text-[11px] text-white/50 mt-1">{sub}</div> : null}
    </div>
  );
}

/* ---------------- Stage Rules (shared) ---------------- */
function getStageRules(stage) {
  switch (stage) {
    case 1:
      return [
        'Entry cost required for qualifiers.',
        'Top 5 in each room advance to Stage 2.',
        'Ties are broken by fastest completion time.',
        'No multi-accounting; anti-cheat enforced.',
      ];
    case 2:
      return [
        'Only players with a Stage 2 ticket may enter.',
        'Top 5 advance to Stage 3.',
        'Round timer applies; slowest players are eliminated.',
        'Ties broken by previous round rank.',
      ];
    case 3:
      return [
        'Higher difficulty; fewer checkpoints.',
        'Top 5 advance to Stage 4.',
        'Repeated AFK events lead to disqualification.',
      ];
    case 4:
      return [
        'Final qualifier round before Finals.',
        'Top 5 advance to the Finals.',
        'Strict fair-play checks; suspicious activity is reviewed.',
      ];
    case 5:
      return [
        'Final ticket required to enter.',
        'Winners share the prize pool.',
        'Anti-cheat & manual review for top placements.',
      ];
    default:
      return ['General rules apply.'];
  }
}

function StageRulesModal({ stage, onClose }) {
  if (!stage) return null;
  const rules = getStageRules(stage);
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute inset-x-4 sm:inset-x-auto sm:right-6 top-10 sm:top-16 z-10 max-w-md rounded-2xl border border-white/10 bg-[#0b1220] p-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="text-white font-semibold">Stage {stage} Rules</div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white text-sm px-2 py-1 rounded-md hover:bg-white/10"
          >
            Close
          </button>
        </div>
        <ul className="mt-3 text-sm text-white/70 space-y-2 list-disc pl-5">
          {rules.map((r, i) => <li key={i}>{r}</li>)}
        </ul>
        <div className="mt-4 text-[11px] text-white/50">
          Note: Rule enforcement includes automated and manual review.
        </div>
      </div>
    </div>
  );
}

/* ---------------- Finals meta / header ---------------- */
function computeFinalsMeta(list = []) {
  const rooms = list.length;
  const entrants = list.reduce((s, r) => s + (r.entrantsCount || 0), 0);
  const capacity = list.reduce((s, r) => s + (r.capacity || 0), 0);
  const nextStartTs = list
    .map(r => r.nextStartAt ? new Date(r.nextStartAt).getTime() : Infinity)
    .reduce((min, t) => Math.min(min, t), Infinity);
  const nextStartISO = Number.isFinite(nextStartTs) ? new Date(nextStartTs).toISOString() : null;

  // You can still compute/estimate a dynamic pool if you want, but we
  // now display a fixed breakdown card as requested.
  const prizePoolPi = Math.max(100, Math.round(entrants * 0.5));

  return { rooms, entrants, capacity, nextStartISO, prizePoolPi };
}

function FinalsHeader({ list }) {
  const meta = useMemo(() => computeFinalsMeta(list), [list]);
  return (
    <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
      <KPI icon="👥" label="Finalists" value={String(meta.entrants)} sub={`${meta.rooms} room${meta.rooms===1?'':'s'}`} />
      <KPI icon="🪪" label="Capacity" value={String(meta.capacity)} sub="total slots" />
      <KPI icon="🏆" label="Prize Pool" value={`${meta.prizePoolPi.toLocaleString()} π`} sub="est. (live)" />
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex items-center justify-center">
        <CountdownCircle targetISO={meta.nextStartISO || inFuture(2)} size={56} stroke={5} label="Next Final" />
      </div>
    </div>
  );
}

/* ---------------- Finals Prize Breakdown (fixed) ---------------- */
function FinalsPrizeCard() {
  const breakdown = [
    { place: '1st Place', prize: '750 π' },
    { place: '2nd Place', prize: '500 π' },
    { place: '3rd Place', prize: '250 π' },
    { place: '4th Place', prize: '100 π' },
    { place: '5th Place', prize: '100 π' },
    { place: '6th – 20th', prize: '25 π each' },
  ];
  return (
  <div className="rounded-2xl border border-cyan-400/40 bg-gradient-to-br from-[#0d1729] to-[#0a1020] p-4 shadow-lg shadow-cyan-400/10">
  <div className="text-sm font-bold text-cyan-300 mb-3 flex items-center gap-2 drop-shadow-[0_0_6px_rgba(34,211,238,0.6)]">
    Finals Prize Breakdown
  </div>
  <ul className="space-y-2 text-sm text-white/80">
    {breakdown.map((b, i) => (
      <li
        key={i}
        className="flex justify-between border-b border-white/5 pb-2 last:border-0 last:pb-0"
      >
        <span>{b.place}</span>
        <span className="font-semibold text-cyan-200 drop-shadow-[0_0_4px_rgba(34,211,238,0.7)]">
          {b.prize}
        </span>
      </li>
    ))}
  </ul>
</div>

  );
}

/* ---------------- Finals Rules Card ---------------- */
function FinalsRulesCard() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-white font-semibold">Finals Rules</div>
      <ul className="mt-2 text-xs text-white/70 space-y-1 list-disc pl-5">
        <li>One final ticket required to enter.</li>
        <li>Winners share the prize pool (see breakdown).</li>
        <li>Anti-cheat & fairness checks apply.</li>
      </ul>
    </div>
  );
}

function MiniCard({ data, stage, onJoin, entryFee }) {
  const spotsLeft = Math.max(0, (data.capacity || STAGE1_CAPACITY) - (data.entrantsCount || 0));
  const pct = Math.max(
    0,
    Math.min(100, Math.floor((data.entrantsCount / (data.capacity || STAGE1_CAPACITY)) * 100))
  );
  const canJoinStage1 = stage === 1 && spotsLeft > 0;

  const entrants = data.entrantsCount || 0;
  const adv = data.advancing || (stage === 1 ? ADVANCING_PER_ROOM : 1);
  const winChance = entrants > 0 ? Math.round((adv / entrants) * 100) : null;

  const isFinals = stage === 5;

  return (
    <div
      dir={isFinals ? 'rtl' : 'ltr'} // 👈 flips everything for Stage 5
      className={`min-w-[260px] sm:min-w-[300px] rounded-2xl border 
        ${isFinals ? 'border-cyan-400 text-right' : 'border-white/10 text-left'} 
        bg-[#0b1220] p-5`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-white font-semibold">
          {stage === 1 ? 'Qualifier' : `Stage ${stage}`}
        </div>
        <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-cyan-400 text-black">
          {stage === 1 ? 'FILLING' : 'TICKETS'}
        </span>
      </div>

      {/* Players / Advance line */}
      <div className="mt-3 text-xs sm:text-sm text-white/80">
        Players {data.entrantsCount}/{data.capacity} • Advance Top {adv}
      </div>

      {/* Progress bar (always LTR so the bar fills correctly) */}
      <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden" dir="ltr">
        <div className="h-full bg-cyan-400" style={{ width: `${pct}%` }} />
      </div>

      {/* Info lines */}
      <div className="mt-2 text-[11px] text-white/60 space-y-1">
        <div>+5 XP when you join this stage</div>
        <div>Top {adv} advance for a share of the pool</div>
        {winChance !== null && <div>Win chance: {winChance}%</div>}
      </div>

      {/* Countdown + CTA */}
      <div className="mt-4 flex items-center justify-between gap-3">
        <CountdownCircle
          targetISO={data.nextStartAt || inFuture(2)}
          size={44}
          stroke={5}
          label="Starts"
        />
        {stage === 1 ? (
          canJoinStage1 ? (
            <button
              onClick={() => onJoin?.({ slug: null, stage })}
              className="flex-1 rounded-lg bg-cyan-400 text-black py-2 font-bold"
            >
              Enter {formatPi(entryFee)}
            </button>
          ) : (
            <div className="flex-1 text-center rounded-lg bg-white/10 py-2 text-sm text-white/70">
              Full
            </div>
          )
        ) : (
          <button
            onClick={() => onJoin?.({ slug: data.slug, stage })}
            className="flex-1 rounded-lg bg-emerald-400 text-black py-2 font-bold"
          >
            {isFinals ? 'Use Final Ticket' : 'Use Ticket'}
          </button>
        )}
      </div>
    </div>
  );
}




function HScrollCards({ list, stage, onJoin, entryFee }) {
  if (!list?.length) return null;
  return (
    <div className="overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex gap-4 pr-2">
        {list.map((c) => (
          <MiniCard key={c.slug} data={c} stage={stage} onJoin={onJoin} entryFee={entryFee} />
        ))}
      </div>
    </div>
  );
}

/* ---------------- Stage Block ---------------- */
function StageBlock({ stage, title, list, onJoin, entryFee, onShowRules }) {
  if (!list?.length) return null;

  const advancing = list[0]?.advancing ?? (stage === 1 ? 5 : 1);
  const advancedLastHour = list.reduce((sum, room) => sum + (room.advancedLastHour || 0), 0);
  const entrantsLastHour = list.reduce((sum, room) => sum + (room.entrantsLastHour || 0), 0);
  const winRate = entrantsLastHour > 0 ? Math.round((advancedLastHour / entrantsLastHour) * 100) : 0;

  const nextISO = list
    .map(r => r.nextStartAt ? new Date(r.nextStartAt).getTime() : Infinity)
    .reduce((min, t) => Math.min(min, t), Infinity);

  return (
    <section className="space-y-4" id={`stage-${stage}`}>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-white">{title}</h3>
          <p className="text-xs text-white/60 mt-1">
            {stage < 5 ? `Top ${advancing} advance • Last hour win rate: ` : `Finals • Last hour win rate: `}
            <span className="text-cyan-300 font-semibold">{winRate}%</span>
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => onShowRules?.(stage)}
            className="text-xs px-3 py-1 rounded-full border border-white/15 text-white/80 hover:bg-white/5"
            aria-label={`Stage ${stage} rules`}
          >
            Rules
          </button>

          {Number.isFinite(nextISO) && (
            <div className="hidden sm:flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2 py-1">
              <CountdownCircle targetISO={new Date(nextISO).toISOString()} size={40} stroke={4} label="Next" />
            </div>
          )}
          {stage === 1 && (
            <div className="hidden sm:flex items-center gap-2 text-xs text-white/70">
              <span className="rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 px-2 py-1">
                Entry {formatPi(ENTRY_FEE_PI)}
              </span>
            </div>
          )}
        </div>
      </div>

      <HScrollCards list={list} stage={stage} onJoin={onJoin} entryFee={entryFee} />
    </section>
  );
}

/* ---------------- Finals Leaderboard (mock simple list) ---------------- */
function FinalsLeaderboard({ items = [] }) {
  const data = items.slice(0, 5).map((r, i) => ({
    place: i + 1,
    slug: r.slug,
    entrants: r.entrantsCount || 0,
  }));
  if (data.length === 0) return null;
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
      <div className="px-4 py-3 text-white font-semibold">Live Finals Rooms</div>
      <div className="divide-y divide-white/10">
        {data.map(row => (
          <div key={row.slug} className="px-4 py-3 flex items-center justify-between text-sm">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 grid place-items-center rounded-full bg-cyan-400 text-black font-bold text-xs">
                {row.place}
              </span>
              <span className="text-white/90 font-medium">{row.slug}</span>
            </div>
            <div className="text-white/70">Players {row.entrants}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Finals Tab Content ---------------- */
function FinalsTab({ list, onJoin, entryFee, onShowRules }) {
  const meta = useMemo(() => computeFinalsMeta(list), [list]);

  return (
    <>
      <div className="flex items-center justify-between">
  

        <button
          onClick={() => onShowRules?.(5)}
          className="text-xs px-3 py-1 rounded-full border border-white/15 text-white/80 hover:bg-white/5"
          aria-label="Finals rules"
        >
          Rules
        </button>
      </div>

      {/* KPI header with countdown etc. */}
      <FinalsHeader list={list} />

      <div className="mt-6 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {list?.length ? (
            <div className="overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex gap-4 pr-2" id="stage-5">
                {list.map((c) => (
                  <MiniCard
                    key={c.slug}
                    data={c}
                    stage={5}
                    onJoin={onJoin}
                    entryFee={entryFee}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-white/70">No finals room available right now.</div>
          )}

          <FinalsLeaderboard items={list} />
        </div>

        <aside className="space-y-6">
          <FinalsPrizeCard />
          <FinalsRulesCard />
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-semibold text-white">Enter Finals</div>
            <div className="text-[11px] text-white/60 mt-1">Requires a Final Ticket</div>
            <button
              onClick={() => {
                const el = document.getElementById('stage-5');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="mt-3 w-full rounded-lg bg-emerald-400 text-black py-2 font-bold"
            >
              Choose a Finals Room
            </button>
          </div>
        </aside>
      </div>
    </>
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
    s1Filling: mockItems(4, { stage: 1 }),
    s2Live: mockItems(3, { stage: 2, live: true }),
    s3Live: mockItems(2, { stage: 3, live: true }),
    s4Live: mockItems(2, { stage: 4, live: true }),
    s5Live: mockItems(1, { stage: 5, live: true }),
  }));

  const s1Filling = s1.filling?.length ? s1.filling : mock.s1Filling;
  const s2Live = s2.live?.length ? s2.live : mock.s2Live;
  const s3Live = s3.live?.length ? s3.live : mock.s3Live;
  const s4Live = s4.live?.length ? s4.live : mock.s4Live;
  const s5Live = s5.live?.length ? s5.live : mock.s5Live;

  const { pushToast, Toasts } = useToasts();

  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  useEffect(() => {
    const nextLevelXP = 100 + (level - 1) * 50;
    if (xp >= nextLevelXP) setLevel(prev => prev + 1);
  }, [xp, level]);

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
      setXp(x => x + 20);
    } catch (e) {
      pushToast(e?.message || 'Could not enter', 'error');
    }
  }, [user, pushToast, s1]);

  const allLists = [s2Live, s3Live, s4Live, s5Live].flat();
  const heroNextISO = useMemo(() => {
    const ts = allLists
      .map(r => r?.nextStartAt ? new Date(r.nextStartAt).getTime() : Infinity)
      .reduce((min, t) => Math.min(min, t), Infinity);
    return Number.isFinite(ts) ? new Date(ts).toISOString() : inFuture(2);
  }, [allLists]);

  /* Tabs (no "All") */
  const stageTabs = useMemo(() => ([
    { key: '1', label: 'Stage 1', n: 1, list: s1Filling },
    { key: '2', label: 'Stage 2', n: 2, list: s2Live },
    { key: '3', label: 'Stage 3', n: 3, list: s3Live },
    { key: '4', label: 'Stage 4', n: 4, list: s4Live },
    { key: '5', label: 'Finals',  n: 5, list: s5Live },
  ]), [s1Filling, s2Live, s3Live, s4Live, s5Live]);

  const [activeTab, setActiveTab] = useState('1');

  const handleTab = (key) => {
    setActiveTab(key);
    const n = Number(key);
    const el = document.getElementById(`stage-${n}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  /* Stage Rules modal control */
  const [rulesStage, setRulesStage] = useState(null);
  const openRules = useCallback((stage) => setRulesStage(stage), []);
  const closeRules = useCallback(() => setRulesStage(null), []);

  return (
    <main className="min-h-screen bg-[#070d19] pb-24">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#08121f] via-[#0b1a2a] to-[#061019]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.12),transparent_70%)]" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left: Title + KPIs + XP */}
            <div className="flex-1">
              <h1 className="text-[26px] sm:text-3xl font-extrabold bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent drop-shadow">
                OMC Stages
              </h1>
              <p className="mt-2 text-white/70 text-sm max-w-xl">
                Start in <span className="text-cyan-300 font-semibold">Stage 1</span>, battle through each round, and reach the finals to share the prize pool.
              </p>

              <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <KPI icon="👥" label="Players" value="246" sub="today" />
                <KPI icon="🏁" label="Stages" value="7" sub="completed" />
                <KPI icon="💰" label="π Awarded" value="5,000 π" sub="lifetime" />
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex items-center justify-center">
                  <CountdownCircle targetISO={heroNextISO} size={56} stroke={5} label="Next Stage" />
                </div>
              </div>

              <div className="mt-4">
                <XPBar xp={xp} level={level} />
              </div>
            </div>

            {/* Right: quick join */}
            <aside className="lg:w-[320px] lg:shrink-0">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <div className="text-sm font-semibold text-white">Jump In</div>
                <div className="mt-2 text-xs text-white/60">Stage 1 entry</div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <div className="text-[12px] text-white/70">Cost {formatPi(ENTRY_FEE_PI)}</div>
                  <button
                    onClick={() => handleJoin({ slug: null, stage: 1 })}
                    className="rounded-lg bg-cyan-400 text-black px-4 py-2 font-bold"
                  >
                    Enter
                  </button>
                </div>
                <div className="mt-4 text-[11px] text-white/50">
                  Earn XP every time you play and advance.
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 lg:py-10">
          {/* Tabs */}
          <div className="mb-6 flex flex-wrap gap-2">
            {stageTabs.map(t => {
              const active = activeTab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => handleTab(t.key)}
                  className={`px-3 py-1 rounded-full text-xs border transition
                    ${active ? 'bg-cyan-400 text-black border-cyan-400'
                             : 'border-white/15 text-white/80 hover:bg-white/5'}`}
                  aria-pressed={active}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Tab-aware rendering */}
          {activeTab === '5' ? (
            <>
              {/* Anchor for smooth scroll */}
              <div id="stage-5" className="h-0" />
              <FinalsTab list={s5Live} onJoin={handleJoin} entryFee={ENTRY_FEE_PI} onShowRules={openRules} />
            </>
          ) : (
            (() => {
              const tab = stageTabs.find(t => t.key === activeTab);
              if (!tab) return null;
              const title = tab.n === 1 ? 'Stage 1 · Open Qualifiers' : `Stage ${tab.n}`;
              if (!tab.list || tab.list.length === 0) {
                return <div className="text-white/60 text-sm">No rooms available.</div>;
              }
              return (
                <>
                  {/* Anchor for smooth scroll */}
                  <div id={`stage-${tab.n}`} className="h-0" />
                  <StageBlock
                    stage={tab.n}
                    title={title}
                    list={tab.list}
                    onJoin={handleJoin}
                    entryFee={ENTRY_FEE_PI}
                    onShowRules={openRules}
                  />
                </>
              );
            })()
          )}
        </div>
      </section>

      {/* Mobile floating action bar */}
      <div className="lg:hidden fixed bottom-3 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-1.5rem)]">
        <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur px-4 py-3 flex items-center justify-between">
          <div className="text-sm">
            <div className="text-white font-semibold">Join Stage 1</div>
            <div className="text-[11px] text-white/70">Entry {formatPi(ENTRY_FEE_PI)}</div>
          </div>
          <button
            onClick={() => handleJoin({ slug: null, stage: 1 })}
            className="rounded-lg bg-cyan-400 text-black px-4 py-2 font-bold"
          >
            Enter
          </button>
        </div>
      </div>

      {/* Rules Modal */}
      <StageRulesModal stage={rulesStage} onClose={closeRules} />

      <Toasts />
    </main>
  );
}
