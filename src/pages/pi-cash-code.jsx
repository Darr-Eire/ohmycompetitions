'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LockKeyhole,
  Ticket,
  ShieldCheck,
  Timer,
  Trophy,
  Rocket,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { usePiAuth } from '../context/PiAuthContext';
import LiveActivityFeed from '../components/LiveActivityFeed';
import CodeHistory from '../components/CodeHistory';

/* -------------------------------------------------------------------------- */
/*                              Utility Functions                             */
/* -------------------------------------------------------------------------- */
const clamp = (n, min, max) => Math.min(Math.max(n, min), max);
const pad2 = (n) => String(n).padStart(2, '0');
const ts = (v) => (v ? new Date(v).getTime() : null);

function useServerTimeOffset() {
  const [offsetMs, setOffsetMs] = useState(0);
  const setFromFetch = async (res, bodyServerNow) => {
    try {
      const clientNow = Date.now();
      const headerDate = res.headers?.get('date');
      const serverNow = bodyServerNow
        ? new Date(bodyServerNow).getTime()
        : headerDate
        ? new Date(headerDate).getTime()
        : NaN;
      setOffsetMs(Number.isFinite(serverNow) ? serverNow - clientNow : 0);
    } catch {
      setOffsetMs(0);
    }
  };
  return { offsetMs, setFromFetch };
}

function useTick(ms = 1000) {
  const [, setT] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setT((t) => t + 1), ms);
    return () => clearInterval(id);
  }, [ms]);
}

function useIsPiBrowser() {
  const [isPi, setIsPi] = useState(false);
  useEffect(() => {
    const ua = navigator?.userAgent || '';
    setIsPi(/PiBrowser/i.test(ua));
  }, []);
  return isPi;
}

/* ----------------------------- Tiny UI Helpers ----------------------------- */
function NeonBadge({ icon: Icon, children }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-cyan-400/60 bg-white/5 px-3 py-1 text-xs font-semibold text-cyan-200 shadow-[0_0_20px_#22d3ee33]">
      {Icon ? <Icon size={14} className="shrink-0" /> : null}
      <span>{children}</span>
    </div>
  );
}

function Stat({ label, value, sub }) {
  return (
    <div className="rounded-xl border border-cyan-500/60 bg-gradient-to-b from-white/5 to-transparent p-4 text-center shadow-[0_0_40px_#22d3ee22]">
      <div className="text-cyan-300/90 text-xs tracking-widest uppercase">
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold text-white">{value}</div>
      {sub ? <div className="mt-1 text-xs text-white/60">{sub}</div> : null}
    </div>
  );
}

function CountdownRing({
  size = 120,
  stroke = 8,
  pct = 0,
  label = 'UNTIL DROP',
  time = '00:00:00',
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = c * (1 - pct);
  return (
    <svg
      width={size}
      height={size}
      className="drop-shadow-[0_0_30px_#22d3ee55]"
    >
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00ffd5" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke="#0c2a33"
        strokeWidth={stroke}
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke="url(#grad)"
        strokeWidth={stroke}
        fill="none"
        strokeDasharray={`${c} ${c}`}
        strokeDashoffset={dash}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <foreignObject
        x={stroke}
        y={stroke}
        width={size - stroke * 2}
        height={size - stroke * 2}
      >
        <div className="flex h-full w-full flex-col items-center justify-center">
          <div className="text-[10px] tracking-widest text-cyan-300/80">
            {label}
          </div>
          <div className="text-lg font-bold text-white">{time}</div>
        </div>
      </foreignObject>
    </svg>
  );
}

function Toast({ show, kind = 'info', children }) {
  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          className={`fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full border px-4 py-2 text-sm shadow-lg backdrop-blur-md ${
            kind === 'error'
              ? 'border-rose-400/60 bg-rose-500/10 text-rose-200'
              : kind === 'success'
              ? 'border-emerald-400/60 bg-emerald-500/10 text-emerald-200'
              : 'border-cyan-400/60 bg-cyan-500/10 text-cyan-100'
          }`}
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/* -------------------------------------------------------------------------- */
/*                                Main Component                              */
/* -------------------------------------------------------------------------- */
export default function PiCashCodePage() {
  const { user, login } = usePiAuth();

  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);

  const [qty, setQty] = useState(1);
  const [showSkill, setShowSkill] = useState(false);
  const [answer, setAnswer] = useState('');
  const [answerOk, setAnswerOk] = useState(null);
  const [toast, setToast] = useState({ show: false, kind: 'info', text: '' });

  const ticketPrice = 1.25;
  const totalPrice = useMemo(
    () => (ticketPrice * qty).toFixed(2),
    [ticketPrice, qty]
  );

  const isPiBrowser = useIsPiBrowser();
  const { offsetMs, setFromFetch } = useServerTimeOffset();
  useTick(1000);

  /* ---------------------------- Data fetching ---------------------------- */
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch('/api/pi-cash-code', { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to load Pi Cash Code data');
        const j = await res.json();
        if (!cancelled) {
          setData(j);
          setErr(null);
          await setFromFetch(res, j?.serverNow);
        }
      } catch (e) {
        if (!cancelled) {
          setErr(e.message || 'Error loading data');
          setToast({
            show: true,
            kind: 'error',
            text: e.message || 'Error loading data',
          });
          setTimeout(() => setToast({ show: false }), 2500);
        }
      }
    };

    load();
    const id = setInterval(() => load(), 15000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [setFromFetch]);

  /* ------------------------------ Pi SDK ------------------------------- */
  const [sdkReady, setSdkReady] = useState(false);
  useEffect(() => {
    const has =
      typeof window !== 'undefined' && window.Pi && window.Pi?.createPayment;
    if (has) {
      try {
        window.Pi.init({
          version: '2.0',
          sandbox: process.env.NEXT_PUBLIC_PI_SANDBOX === 'true',
        });
      } catch {}
      setSdkReady(true);
      return;
    }
    const s = document.createElement('script');
    s.src = 'https://sdk.minepi.com/pi-sdk.js';
    s.async = true;
    s.onload = () => {
      try {
        window.Pi.init({
          version: '2.0',
          sandbox: process.env.NEXT_PUBLIC_PI_SANDBOX === 'true',
        });
      } catch {}
      setSdkReady(true);
    };
    document.head.appendChild(s);
  }, []);

  /* --------------------------- Skill Question -------------------------- */
  const skill = useMemo(() => {
    const pool = [
      { q: 'What is 7 + 5?', a: '12' },
      { q: 'Type the word "PIONEER" exactly.', a: 'PIONEER' },
      { q: 'What is 3 × 4?', a: '12' },
      { q: 'Type the phrase "Pi Cash Code"', a: 'Pi Cash Code' },
    ];
    return pool[(Date.now() >> 10) % pool.length];
  }, []);

  const validateAnswer = () => {
    const ok = (answer || '').trim() === skill.a;
    setAnswerOk(ok);
    return ok;
  };

  /* ---------------------- Time + unlock progress ---------------------- */
  const now = Date.now() + offsetMs;
  const dropAt = ts(data?.dropAt);
  const expiresAt = ts(data?.expiresAt);

  const beforeDrop = !!dropAt && now < dropAt;
  const afterExpiry = !!expiresAt && now >= expiresAt;
  const showCode = !!dropAt && now >= dropAt && !afterExpiry;

  const target = beforeDrop ? dropAt : expiresAt;
  const remaining = Math.max(0, target ? target - now : 0);

  const timeLeft = useMemo(() => {
    let ms = remaining;
    const days = Math.floor(ms / 86_400_000);
    ms -= days * 86_400_000;
    const hours = Math.floor(ms / 3_600_000);
    ms -= hours * 3_600_000;
    const minutes = Math.floor(ms / 60_000);
    ms -= minutes * 60_000;
    const seconds = Math.floor(ms / 1000);
    return { days, hours, minutes, seconds };
  }, [remaining]);

  const unlockPct = useMemo(() => {
    if (!dropAt || !expiresAt) return 0;
    const total = expiresAt - dropAt;
    const elapsed = clamp(now - dropAt, 0, total);
    return Math.floor((elapsed / total) * 100);
  }, [dropAt, expiresAt, now]);

  /* ------------------------------- Payment ----------------------------- */
  const { user: authUser } = usePiAuth();

  const buy = async () => {
    if (!authUser) {
      setToast({ show: true, kind: 'info', text: 'Please login with Pi first.' });
      setTimeout(() => setToast({ show: false }), 1600);
      return;
    }
    if (!sdkReady || !window?.Pi?.createPayment) {
      setToast({
        show: true,
        kind: 'error',
        text: 'Pi SDK not ready. Please open in Pi Browser.',
      });
      setTimeout(() => setToast({ show: false }), 2200);
      return;
    }
    if (!validateAnswer()) return;

    try {
      const amount = parseFloat(totalPrice);
      const memo = `Pi Cash Code Entry Week ${data?.weekStart || ''}`;
      await window.Pi.createPayment(
        {
          amount,
          memo,
          metadata: {
            type: 'pi-cash-ticket',
            weekStart: data?.weekStart,
            quantity: qty,
            userId: authUser?.uid,
            username: authUser?.username,
          },
        },
        {
          onReadyForServerApproval: async (paymentId) => {
            await fetch('/api/pi-cash-code/approve', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId }),
            });
          },
          onReadyForServerCompletion: async (paymentId, txid) => {
            await fetch('/api/pi-cash-code/complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                paymentId,
                txid,
                weekStart: data?.weekStart,
                quantity: qty,
                userId: authUser?.uid,
                username: authUser?.username,
              }),
            });
            fetch('/api/pi-cash-code/log-activity', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                username: authUser?.username,
                quantity: qty,
              }),
            }).catch(() => {});
            const res = await fetch('/api/pi-cash-code', { cache: 'no-store' });
            const j = await res.json();
            setData(j);
            await setFromFetch(res, j?.serverNow);
            setShowSkill(false);
            setAnswer('');
            setAnswerOk(null);
            setToast({
              show: true,
              kind: 'success',
              text: 'Tickets secured! Good luck 🍀',
            });
            setTimeout(() => setToast({ show: false }), 2200);
          },
          onCancel: () => {
            setToast({ show: true, kind: 'info', text: 'Payment cancelled.' });
            setTimeout(() => setToast({ show: false }), 1600);
          },
          onError: () => {
            setToast({ show: true, kind: 'error', text: 'Payment error.' });
            setTimeout(() => setToast({ show: false }), 2000);
          },
        }
      );
    } catch {
      setToast({ show: true, kind: 'error', text: 'Something went wrong.' });
      setTimeout(() => setToast({ show: false }), 2000);
    }
  };

  /* ------------------------------- Layout ------------------------------ */
  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden bg-[#070c1a] text-white">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,255,213,.08),transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(0,119,255,.14),transparent_40%,rgba(0,255,213,.10))]" />
        <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(#22d3ee_1px,transparent_1px)] [background-size:18px_18px]" />
      </div>

      {/* Top badges */}
      <div className="mx-auto w-full max-w-5xl px-4 pt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <NeonBadge icon={ShieldCheck}>
              Fair • Transparent • Pi SDK
            </NeonBadge>
            <NeonBadge icon={Rocket}>Open Network</NeonBadge>
          </div>
          <div className="flex items-center gap-2">
            <NeonBadge icon={Ticket}>{ticketPrice} π per ticket</NeonBadge>
            <NeonBadge icon={Timer}>
              {isPiBrowser ? 'Pi Browser' : 'Open in Pi Browser'}
            </NeonBadge>
          </div>
        </div>
      </div>

      {/* Hero section */}
      <section className="mx-auto mt-6 w-full max-w-5xl px-4">
        <div className="relative overflow-hidden rounded-3xl border border-cyan-500/50 bg-white/5 p-6 shadow-[0_0_60px_#22d3ee33] sm:p-10">
          {/* Refresh button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => window.location.reload()}
            className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/60 bg-black/40 px-3 py-1 text-xs text-cyan-100 hover:bg-cyan-400/20 active:bg-cyan-400/30 transition"
          >
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Refresh
          </motion.button>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            {/* Left */}
           <div className="flex flex-col items-center justify-center text-center">
  <motion.h1
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className="text-balance text-3xl font-extrabold tracking-tight text-cyan-200 sm:text-5xl animate-pulse"
  >
    Pi Cash Code
  </motion.h1>

  <p className="mt-3 max-w-md text-white/80">
    Keep the code safe, watch the drop and be the Pioneer who’s lucky enough
  </p>

  <div className="mt-6">
                <div className="inline-block rounded-2xl border border-cyan-500/70 bg-gradient-to-r from-[#081425] via-[#0e1b33] to-[#081425] p-[2px] shadow-[0_0_40px_#22d3ee44]">
<div className="flex justify-center mt-6">
  <div className="flex items-center gap-3 rounded-[14px] bg-black/40 px-6 py-5 font-mono text-2xl sm:text-4xl tracking-[0.25em] text-cyan-100 whitespace-nowrap shadow-[0_0_35px_#22d3eeaa] animate-[pulse_1.5s_ease-in-out_infinite]">
    <LockKeyhole className="text-cyan-300 shrink-0" />
    <span className="select-all">
      {showCode ? data?.code || '0000-0000' : 'XXXX-XXXX'}
    </span>
  </div>
</div>



                </div>
                {data?.dropAt && (
                  <p className="mt-2 text-xs text-cyan-300/80">
                    Drop time: {new Date(data.dropAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            {/* Right */}
            <div className="flex flex-col items-center justify-center gap-5">
              <CountdownRing
                size={160}
                stroke={10}
                pct={
                  data?.dropAt && data?.expiresAt
                    ? clamp((now - dropAt) / (expiresAt - dropAt), 0, 1)
                    : 0
                }
                label={showCode ? 'ENDS IN' : 'UNTIL DROP'}
                time={(() => {
                  const d = timeLeft;
                  const h = pad2((d?.days || 0) * 24 + (d?.hours || 0));
                  return `${h}:${pad2(d?.minutes || 0)}:${pad2(
                    d?.seconds || 0
                  )}`;
                })()}
              />
              <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
  <Stat
    label="Prize Pool"
    value={`${data?.prizePool?.toLocaleString?.() ?? '—'} π`}
  />
  <Stat label="Tickets Sold" value={data?.ticketsSold ?? '—'} />
  <Stat
    label="Progress"
    value={`${unlockPct}%`}
    sub={showCode ? 'To expiry' : 'To drop'}
  />
</div>

            </div>
          </div>

          {/* CTA */}
          <div className="mt-8 flex flex-col items-stretch gap-3">
            {!user ? (
              <button
                onClick={login}
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00ffd5] to-[#0077ff] px-5 py-3 font-bold text-black shadow-[0_10px_30px_#22d3ee55] hover:brightness-110"
              >
                <Ticket className="transition-transform group-hover:scale-110" />
                Login with Pi to enter
              </button>
            ) : (
              <>
                {/* Quantity selector */}
                <div className="flex items-center justify-between gap-3 rounded-xl border border-cyan-500/60 bg-black/30 px-3 py-2">
                  <span className="text-sm text-cyan-200">Tickets</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      className="h-9 w-9 rounded-lg bg-cyan-300/90 text-black font-extrabold"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      className="h-9 w-16 rounded-lg bg-white/10 text-center font-bold outline-none [appearance:textfield]"
                      value={qty}
                      min={1}
                      onChange={(e) =>
                        setQty(Math.max(1, parseInt(e.target.value || '1', 10)))
                      }
                    />
                    <button
                      onClick={() => setQty((q) => q + 1)}
                      className="h-9 w-9 rounded-lg bg-cyan-300/90 text-black font-extrabold"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Purchase button */}
                <button
                  onClick={() => setShowSkill(true)}
                  className="group inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00ffd5] to-[#0077ff] px-5 py-3 font-extrabold text-black shadow-[0_10px_30px_#22d3ee55] hover:brightness-110"
                >
                  <Sparkles className="transition-transform group-hover:scale-110" />
                  Purchase {qty} ticket{qty > 1 ? 's' : ''} · {totalPrice} π
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Info blocks */}
      <section className="mx-auto w-full max-w-5xl px-4 py-8 sm:py-10">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-cyan-500/40 bg-white/5 p-5">
            <h3 className="flex items-center gap-2 text-lg font-bold text-cyan-200">
              <ShieldCheck size={18} /> Proven Fairness
            </h3>
            <p className="mt-1 text-sm text-white/70">
              Blockchain-backed, Pi SDK payments, server-side approvals, and
              auditable history.
            </p>
          </div>
          <div className="rounded-2xl border border-cyan-500/40 bg-white/5 p-5">
            <h3 className="flex items-center gap-2 text-lg font-bold text-cyan-200">
              <Timer size={18} /> Real-Time Thrill
            </h3>
            <p className="mt-1 text-sm text-white/70">
              Watch the countdown, track progress, and be ready. When the code
              drops, speed matters.
            </p>
          </div>
          <div className="rounded-2xl border border-cyan-500/40 bg-white/5 p-5">
            <h3 className="flex items-center gap-2 text-lg font-bold text-cyan-200">
              <Trophy size={18} /> Big Prize Energy
            </h3>
            <p className="mt-1 text-sm text-white/70">
              Prize pool grows with every ticket. More players, bigger rewards.
              Simple.
            </p>
          </div>
        </div>
      </section>

      {/* Live widgets */}
      <section className="mx-auto w-full max-w-5xl px-4 pb-16">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-cyan-500/50 bg-white/5 p-4">
            <h4 className="mb-3 text-center text-sm font-bold tracking-widest text-cyan-300">
              LIVE ACTIVITY
            </h4>
            <LiveActivityFeed />
          </div>
          <div className="rounded-2xl border border-cyan-500/50 bg-white/5 p-4">
            <h4 className="mb-3 text-center text-sm font-bold tracking-widest text-cyan-300">
              CODE HISTORY
            </h4>
            <CodeHistory />
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-cyan-300/70">
          By entering you agree to our rules.{' '}
          <a
            className="underline"
            href="/terms-conditions"
            target="_blank"
            rel="noopener noreferrer"
          >
            View Terms &amp; Conditions
          </a>
        </p>
      </section>

      {/* Skill modal */}
      <AnimatePresence>
        {showSkill && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          >
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              className="w-full max-w-sm rounded-2xl border border-cyan-500/60 bg-white/95 p-5 text-black shadow-2xl"
            >
              <div className="mb-2 text-xs font-semibold text-cyan-700">
                SKILL CHECK
              </div>
              <div className="text-sm text-black/80">{skill.q}</div>
              <input
                autoFocus
                className="mt-3 w-full rounded-lg border border-cyan-500/50 bg-white px-3 py-2 font-semibold outline-none focus:ring-2 focus:ring-cyan-400"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && buy()}
              />
              {answerOk === false && (
                <div className="mt-2 text-xs font-semibold text-rose-600">
                  Incorrect — try again!
                </div>
              )}
              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  onClick={() => setShowSkill(false)}
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-cyan-800 hover:bg-cyan-50"
                >
                  Cancel
                </button>
                <button
                  onClick={buy}
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#00ffd5] to-[#0077ff] px-4 py-2 text-sm font-extrabold text-black shadow-[0_10px_30px_#22d3ee55] hover:brightness-110"
                >
                  <Ticket size={16} /> Pay {totalPrice} π
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Toast show={toast.show} kind={toast.kind}>
        {toast.text}
      </Toast>
    </main>
  );
}
