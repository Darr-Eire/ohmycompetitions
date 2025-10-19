// file: src/pages/funnel/index.js
'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useSWR from 'swr';
import { usePiAuth } from '../../context/PiAuthContext';

/** ----------------------
 * Config & Helpers
 * ---------------------- */
const ENTRY_FEE_PI = 0.15; // Stage 1 entry
const fetcher = (url) => fetch(url).then((r) => r.json());

function formatPi(v) {
  if (typeof v !== 'number') return v ?? '—';
  return `${v.toFixed(2)} π`;
}

async function postJSON(url, body) {
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

function inFuture(hours = 2) {
  return new Date(Date.now() + hours * 3600_000).toISOString();
}

/** ----------------------
 * Live stages hook (with safe fallback)
 * API expected at /api/funnel/stages:
 *   { success: true, prizePoolPi: number, stages: [{ stage, rooms: [...] }] }
 * If API not present, auto-mock.
 * ---------------------- */
function useFunnelStages() {
  const { data, error, isLoading, mutate } = useSWR('/api/funnel/stages', fetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 10_000,
  });

  // Fallback mock (keeps UX alive if API missing)
  const fallback = useMemo(() => {
    const now = Date.now();
    const mkRoom = (i, n) => ({
      slug: `room-${n}-${i + 1}`,
      stage: n,
      title: `Room ${i + 1}`,
      nextStartAt: new Date(now + (i + 1) * 60 * 60 * 1000).toISOString(),
      imageUrl: '/pi.jpeg',
    });
    return {
      success: true,
      prizePoolPi: 2150, // 1st–5th + 6th–25th @ 25π each (your finals plan)
      stages: [1, 2, 3, 4, 5].map((n) => ({
        stage: n,
        rooms:
          n === 1
            ? Array.from({ length: 4 }, (_, i) => mkRoom(i, n))
            : Array.from({ length: Math.max(1, 6 - n) }, (_, i) => mkRoom(i, n)),
      })),
    };
  }, []);

  const ok = data?.success && Array.isArray(data?.stages);
  const stages = ok ? data.stages : fallback.stages;
  const prizePoolPi = ok ? data.prizePoolPi ?? 0 : fallback.prizePoolPi;

  const s1Filling = stages.find((s) => s.stage === 1)?.rooms ?? [];
  const s2Live = stages.find((s) => s.stage === 2)?.rooms ?? [];
  const s3Live = stages.find((s) => s.stage === 3)?.rooms ?? [];
  const s4Live = stages.find((s) => s.stage === 4)?.rooms ?? [];
  const s5Live = stages.find((s) => s.stage === 5)?.rooms ?? [];

  return {
    isLoading: isLoading && !ok,
    isError: !!error && !ok,
    stages,
    prizePoolPi,
    s1Filling,
    s2Live,
    s3Live,
    s4Live,
    s5Live,
    mutate,
  };
}

/** ----------------------
 * Toasts (minimal)
 * ---------------------- */
function useToasts() {
  const [items, setItems] = useState([]);
  const pushToast = (text, kind = 'info', ttl = 3000) => {
    const id = Math.random().toString(36).slice(2);
    setItems((arr) => [...arr, { id, text, kind }]);
    setTimeout(() => setItems((arr) => arr.filter((t) => t.id !== id)), ttl);
  };
  const Toasts = () => (
    <div className="fixed z-50 bottom-4 left-1/2 -translate-x-1/2 space-y-2 w-[calc(100%-2rem)] max-w-md">
      {items.map((t) => (
        <div
          key={t.id}
          className={`rounded-lg px-3 py-2 text-sm backdrop-blur border ${
            t.kind === 'error'
              ? 'bg-red-500/20 border-red-400 text-red-100'
              : t.kind === 'warn'
              ? 'bg-yellow-500/20 border-yellow-400 text-yellow-100'
              : 'bg-cyan-500/20 border-cyan-400 text-cyan-100'
          }`}
        >
          {t.text}
        </div>
      ))}
    </div>
  );
  return { pushToast, Toasts };
}

/** ----------------------
 * Small UI bits
 * ---------------------- */
function KPI({ icon, label, value, sub }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="text-xl">{icon}</div>
      <div className="text-sm text-white/60 mt-1">{label}</div>
      <div className="text-lg font-bold text-white mt-1">{value}</div>
      {sub ? <div className="text-xs text-white/50">{sub}</div> : null}
    </div>
  );
}

function CountdownCircle({ targetISO, size = 56, stroke = 5, label = 'Next' }) {
  const [left, setLeft] = useState('');
  useEffect(() => {
    const i = setInterval(() => {
      const t = new Date(targetISO).getTime() - Date.now();
      if (t <= 0) return setLeft('Now');
      const h = Math.floor(t / 3_600_000);
      const m = Math.floor((t % 3_600_000) / 60_000);
      setLeft(`${h}h ${m}m`);
    }, 1000);
    return () => clearInterval(i);
  }, [targetISO]);
  return (
    <div className="flex flex-col items-center justify-center">
      <div
        className="rounded-full border border-cyan-400/60 text-cyan-200 flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <span className="text-xs font-bold">{left}</span>
      </div>
      <div className="text-[11px] text-white/60 mt-1">{label}</div>
    </div>
  );
}

function XPBar({ xp, level }) {
  const next = 100 + (level - 1) * 50;
  const pct = Math.min(100, Math.round((xp / next) * 100));
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-white/70 mb-1">
        <span>Level {level}</span>
        <span>
          {xp}/{next} XP
        </span>
      </div>
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/** ----------------------
 * Cards & Blocks
 * ---------------------- */
function RoomCard({ room, onJoin, entryFee }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col gap-2">
      <div className="text-white font-semibold">{room.title}</div>
      <div className="text-xs text-white/60">
        Starts:{' '}
        <span className="text-cyan-300">
          {new Date(room.nextStartAt).toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
      <div className="flex items-center justify-between mt-1">
        <div className="text-xs text-white/60">Entry {formatPi(entryFee)}</div>
        <button
          onClick={() => onJoin({ slug: room.slug, stage: room.stage })}
          className="rounded-md bg-cyan-400 text-black px-3 py-1 text-sm font-bold"
        >
          Join
        </button>
      </div>
    </div>
  );
}

function StageBlock({ stage, title, list, onJoin, entryFee, onShowRules }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-bold">{title}</h3>
        <button onClick={() => onShowRules(stage)} className="text-xs underline text-cyan-300 hover:text-cyan-200">
          Rules
        </button>
      </div>

      {/* Mobile: horizontal scroll */}
      <div className="sm:hidden -mx-2 px-2">
        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2">
          {list.map((r) => (
            <div key={r.slug} className="min-w-[85%] snap-center">
              <RoomCard room={r} onJoin={onJoin} entryFee={entryFee} />
            </div>
          ))}
        </div>
      </div>

      {/* Desktop grid */}
      <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {list.map((r) => (
          <RoomCard key={r.slug} room={r} onJoin={onJoin} entryFee={entryFee} />
        ))}
      </div>
    </section>
  );
}

function FinalsTab({ list, onJoin, entryFee, onShowRules }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-bold">Finals</h3>
        <button onClick={() => onShowRules(5)} className="text-xs underline text-cyan-300 hover:text-cyan-200">
          Rules
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {list.map((r) => (
          <RoomCard key={r.slug} room={r} onJoin={onJoin} entryFee={entryFee} />
        ))}
      </div>
    </section>
  );
}

function StageRulesModal({ stage, onClose }) {
  if (!stage) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-xl border border-cyan-400 bg-[#0f172a] text-white p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-cyan-300 font-bold">Stage {stage} Rules</h4>
          <button onClick={onClose} className="text-cyan-200 hover:text-white text-sm">
            Close
          </button>
        </div>
        <ul className="text-sm space-y-2 text-white/80">
          <li>• Standard competition rules apply.</li>
          <li>• Anti-bot checks enabled.</li>
          <li>• Prizes distributed on-chain after verification.</li>
        </ul>
        <div className="mt-3 text-right">
          <button onClick={onClose} className="rounded-md bg-cyan-400 text-black px-4 py-2 font-bold">
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

/** ----------------------
 * MAIN PAGE
 * ---------------------- */
export default function FunnelIndexPage() {
  const { user } = usePiAuth();

  const { stages, prizePoolPi, s1Filling, s2Live, s3Live, s4Live, s5Live, isLoading, isError, mutate } =
    useFunnelStages();

  const { pushToast, Toasts } = useToasts();

  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    const nextLevelXP = 100 + (level - 1) * 50;
    if (xp >= nextLevelXP) setLevel((prev) => prev + 1);
  }, [xp, level]);

  const handleJoin = useCallback(
    async ({ slug, stage }) => {
      if (joining) return;
      if (!user?.id && !user?.piUserId) {
        pushToast('Please log in with Pi to enter.', 'warn');
        return;
      }
      setJoining(true);
      const userId = user?.id || user?.piUserId;

      try {
        if (stage === 1) {
          const assignedSlug = slug ?? null; // server can place user if null
          const Pi = typeof window !== 'undefined' ? window.Pi : undefined;

          if (Pi?.createPayment) {
            await Pi.createPayment(
              {
                amount: ENTRY_FEE_PI,
                memo: 'OMC Funnel Stage 1',
                metadata: { slug: assignedSlug, stage, type: 'funnel-entry' },
              },
              {
                onReadyForServerApproval: async (paymentId) => {
                  const resp = await postJSON('/api/funnel/join', {
                    slug: assignedSlug,
                    userId,
                    stage,
                    paymentId,
                    amount: ENTRY_FEE_PI,
                    currency: 'pi',
                  });
                  if (resp?.slug) pushToast(`Placed in ${resp.slug}`, 'success');
                },
                onReadyForServerCompletion: async (paymentId, txId) => {
                  await postJSON('/api/funnel/confirm', {
                    slug: assignedSlug,
                    userId,
                    stage,
                    paymentId,
                    txId,
                    amount: ENTRY_FEE_PI,
                    currency: 'pi',
                  });
                  mutate();
                },
                onCancel: () => pushToast('Payment canceled.', 'warn'),
                onError: (err) => pushToast(err?.message || 'Payment failed.', 'error'),
              }
            );
          } else {
            // Dev fallback (no payment id path)
            const resp = await postJSON('/api/funnel/join', {
              slug: assignedSlug,
              userId,
              stage,
              amount: ENTRY_FEE_PI,
              currency: 'pi',
            });
            pushToast(`Entered • ${resp?.slug ? `Room ${resp.slug}` : ''}`, 'success');
            mutate();
          }
        } else {
          pushToast('Ticket entry coming soon.', 'warn');
        }

        setXp((x) => x + 20);
      } catch (e) {
        pushToast(e?.message || 'Could not enter', 'error');
      } finally {
        setJoining(false);
      }
    },
    [user, pushToast, joining, mutate]
  );

  // Hero next countdown: earliest start across live stages
  const allLists = useMemo(() => [s2Live, s3Live, s4Live, s5Live].flat(), [s2Live, s3Live, s4Live, s5Live]);
  const heroNextISO = useMemo(() => {
    const ts = allLists
      .map((r) => (r?.nextStartAt ? new Date(r.nextStartAt).getTime() : Infinity))
      .reduce((min, t) => Math.min(min, t), Infinity);
    return Number.isFinite(ts) ? new Date(ts).toISOString() : inFuture(2);
  }, [allLists]);

  // Tabs
  const stageTabs = useMemo(
    () => [
      { key: '1', label: 'Stage 1', n: 1, list: s1Filling },
      { key: '2', label: 'Stage 2', n: 2, list: s2Live },
      { key: '3', label: 'Stage 3', n: 3, list: s3Live },
      { key: '4', label: 'Stage 4', n: 4, list: s4Live },
      { key: '5', label: 'Finals', n: 5, list: s5Live },
    ],
    [s1Filling, s2Live, s3Live, s4Live, s5Live]
  );
  const [activeTab, setActiveTab] = useState('1');

  // deferred smooth scroll to stage
  const pendingScrollRef = useRef(null);
  useEffect(() => {
    if (!pendingScrollRef.current) return;
    const key = pendingScrollRef.current;
    const n = Number(key);
    requestAnimationFrame(() => {
      const el = document.getElementById(`stage-${n}`);
      if (!el) return;
      const SCROLL_OFFSET = 72;
      const top = el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
      window.scrollTo({ top, behavior: 'smooth' });
      pendingScrollRef.current = null;
    });
  }, [activeTab]);

  const handleTab = (key) => {
    pendingScrollRef.current = key;
    setActiveTab(key);
  };

  // rules modal
  const [rulesStage, setRulesStage] = useState(null);
  const openRules = useCallback((stage) => setRulesStage(stage), []);
  const closeRules = useCallback(() => setRulesStage(null), []);

  /** Loading / Error */
  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#0f1b33] p-6 text-white/80">
        <div className="animate-pulse h-10 rounded-xl bg-cyan-900/20 mb-3" />
        <div className="animate-pulse h-24 rounded-xl bg-cyan-900/20 mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-cyan-900/10 border border-cyan-700/30" />
          ))}
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="min-h-screen bg-[#0f1b33] p-6 text-white/80">
        <div className="text-red-400">Error loading stages.</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0f1b33] pb-24">
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
                Start in <span className="text-cyan-300 font-semibold">Stage 1</span>, progress through each stage and
                reach the finals to claim your share of the prize pool.
              </p>

              <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <KPI icon="👥" label="Active Players" value="246" sub="currently online" />
                <KPI icon="🏁" label="Stages" value={[s2Live, s3Live, s4Live].filter((x) => x.length).length + 1} sub="open now" />
                <KPI icon="💰" label="Stage 5 Prize Pool" value={`${prizePoolPi.toLocaleString()} π`} sub="fixed" />
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
                <div className="mt-4 text-[11px] text-white/50">Earn XP every time you play and advance.</div>
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
            {stageTabs.map((t) => {
              const active = activeTab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => handleTab(t.key)}
                  className={`px-3 py-1 rounded-full text-xs border transition ${
                    active ? 'bg-cyan-400 text-black border-cyan-400' : 'border-white/15 text-white/80 hover:bg-white/5'
                  }`}
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
              <div id="stage-5" className="h-0" />
              <FinalsTab list={s5Live} onJoin={handleJoin} entryFee={ENTRY_FEE_PI} onShowRules={setRulesStage} />
            </>
          ) : (
            (() => {
              const tab = stageTabs.find((t) => t.key === activeTab);
              if (!tab) return null;
              const title = tab.n === 1 ? 'Stage 1 · Open Qualifiers' : `Stage ${tab.n}`;
              if (!tab.list || tab.list.length === 0) {
                return <div className="text-white/60 text-sm">No rooms available.</div>;
              }
              return (
                <>
                  <div id={`stage-${tab.n}`} className="h-0" />
                  <StageBlock
                    stage={tab.n}
                    title={title}
                    list={tab.list}
                    onJoin={handleJoin}
                    entryFee={ENTRY_FEE_PI}
                    onShowRules={setRulesStage}
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
      <StageRulesModal stage={rulesStage} onClose={() => setRulesStage(null)} />

      <Toasts />
    </main>
  );
}
