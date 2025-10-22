// src/pages/pi-cash-code.jsx — MOBILE-FIRST MAKEOVER (OMC style)
"use client";

import React, { useEffect, useMemo, useState, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LockKeyhole,
  Ticket,
  ShieldCheck,
  Timer,
  Trophy,
  Rocket,
  Sparkles,
  Loader2,
  Info,
  ExternalLink,
  User,
} from "lucide-react";
import { usePiAuth } from "../context/PiAuthContext";
import LiveActivityFeed from "../components/LiveActivityFeed";
import CodeHistory from "../components/CodeHistory";

/* -------------------------------------------------------------------------- */
/*                              Utility Functions                             */
/* -------------------------------------------------------------------------- */
const clamp = (n, min, max) => Math.min(Math.max(n, min), max);
const pad2 = (n) => String(n).padStart(2, "0");
const ts = (v) => (v ? new Date(v).getTime() : null);

function useServerTimeOffset() {
  const [offsetMs, setOffsetMs] = useState(0);
  const setFromFetch = async (res, bodyServerNow) => {
    try {
      const clientNow = Date.now();
      const headerDate = res.headers?.get("date");
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
    const ua = typeof navigator !== "undefined" ? navigator.userAgent || "" : "";
    setIsPi(/PiBrowser/i.test(ua));
  }, []);
  return isPi;
}

/* ----------------------------- Small UI bits ------------------------------ */
function NeonBadge({ icon: Icon, children, className = "" }) {
  return (
    <div
      className={`flex items-center gap-1.5 rounded-full border border-cyan-400/60 bg-white/5 px-2.5 py-[6px] text-[11px] font-semibold text-cyan-200 shadow-[0_0_16px_#22d3ee33] sm:text-xs sm:px-3 sm:py-1.5 ${className}`}
    >
      {Icon ? <Icon size={14} className="shrink-0" /> : null}
      <span className="truncate">{children}</span>
    </div>
  );
}

function Stat({ label, value, sub }) {
  return (
    <div className="rounded-xl border border-cyan-500/60 bg-gradient-to-b from-white/5 to-transparent p-3 text-center shadow-[0_0_28px_#22d3ee22] sm:p-4">
      <div className="text-cyan-300/90 text-[10px] tracking-widest uppercase sm:text-xs">{label}</div>
      <div className="mt-0.5 text-xl font-bold text-white sm:text-2xl tabular-nums">{value}</div>
      {sub ? <div className="mt-0.5 text-[11px] text-white/60 sm:text-xs">{sub}</div> : null}
    </div>
  );
}

/* ----------------------------- Countdown Ring ----------------------------- */
function CountdownRing({
  size = 144,
  stroke = 10,
  pct = 0,
  label = "UNTIL DROP",
  time = "0 Days 00 Hours 00 Mins 00 Secs",
}) {
  const id = useId();
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  const clamped = Math.min(Math.max(pct, 0), 1);
  const dash = useMemo(() => c * (1 - clamped), [c, clamped]);

  const match = /(\d+)\s+Days\s+(\d+)\s+Hours\s+(\d+)\s+Mins\s+(\d+)\s+Secs/.exec(time || "");
  const [d, h, m, s] = match ? match.slice(1) : ["0", "00", "00", "00"];

  return (
    <svg width={size} height={size} className="drop-shadow-[0_0_24px_#22d3ee55]">
      <defs>
        <linearGradient id={`grad-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00ffd5" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
        <linearGradient id={`orbit-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(34,211,238,0)" />
          <stop offset="50%" stopColor="rgba(34,211,238,0.9)" />
          <stop offset="100%" stopColor="rgba(34,211,238,0)" />
        </linearGradient>
      </defs>

      <circle cx={size / 2} cy={size / 2} r={r} stroke="#0c2a33" strokeWidth={stroke} fill="none" />

      <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={`url(#orbit-${id})`}
          strokeWidth={Math.max(2, stroke * 0.35)}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${c / 14} ${c}`}
          className="orbit"
        />
      </g>

      <motion.g transform={`rotate(-90 ${size / 2} ${size / 2})`} initial={false}>
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={`url(#grad-${id})`}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${c} ${c}`}
          animate={{ strokeDashoffset: dash }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
          className="glow"
        />
      </motion.g>

      <foreignObject x={stroke} y={stroke} width={size - stroke * 2} height={size - stroke * 2}>
        <div className="flex h-full w-full flex-col items-center justify-center text-center leading-tight">
          <div className="text-[10px] tracking-widest text-cyan-300/80 sm:text-xs">{label}</div>
          <div className="mt-1 grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] font-bold text-white sm:text-sm">
            <div><span className="tabular-nums">{d}</span> <span className="opacity-80">Days</span></div>
            <div><span className="tabular-nums">{h}</span> <span className="opacity-80">Hours</span></div>
            <div><span className="tabular-nums">{m}</span> <span className="opacity-80">Mins</span></div>
            <div><span className="tabular-nums">{s}</span> <span className="opacity-80">Secs</span></div>
          </div>
        </div>
      </foreignObject>

      <style jsx>{`
        @keyframes orbitSpin { to { stroke-dashoffset: -${c}; } }
        .orbit { animation: orbitSpin 2.6s linear infinite; opacity: 0.9; }
        @keyframes pulseGlow { 0%,100% { filter: drop-shadow(0 0 0px #22d3ee);} 50% { filter: drop-shadow(0 0 6px #22d3ee);} }
        .glow { animation: pulseGlow 2.2s ease-in-out infinite; }
      `}</style>
    </svg>
  );
}

/* --------------------------------- Toast --------------------------------- */
function Toast({ show, kind = "info", children }) {
  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          role="status"
          aria-live="polite"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          className={`fixed bottom-4 left-1/2 z-[60] -translate-x-1/2 rounded-full border px-3.5 py-2 text-[13px] shadow-lg backdrop-blur-md ${
            kind === "error"
              ? "border-rose-400/60 bg-rose-500/10 text-rose-200"
              : kind === "success"
              ? "border-emerald-400/60 bg-emerald-500/10 text-emerald-200"
              : "border-cyan-400/60 bg-cyan-500/10 text-cyan-100"
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
  const { user: authUser, loginWithPi, sdkReady: ctxSdkReady } = usePiAuth();

  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);

  const [qty, setQty] = useState(1);
  const [showSkill, setShowSkill] = useState(false);
  const [answer, setAnswer] = useState("");
  const [answerOk, setAnswerOk] = useState(null);
  const [toast, setToast] = useState({ show: false, kind: "info", text: "" });

  const ticketPrice = 1.25;
  const totalPrice = useMemo(() => (ticketPrice * qty).toFixed(2), [ticketPrice, qty]);

  const isPiBrowser = useIsPiBrowser();
  const { offsetMs, setFromFetch } = useServerTimeOffset();
  useTick(1000);

  /* ---------------------------- Data fetching ---------------------------- */
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch("/api/pi-cash-code", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load Pi Cash Code data");
        const j = await res.json();
        if (!cancelled) {
          setData(j);
          setErr(null);
          await setFromFetch(res, j?.serverNow);
        }
      } catch (e) {
        if (!cancelled) {
          setErr(e.message || "Error loading data");
          setToast({ show: true, kind: "error", text: e.message || "Error loading data" });
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

  const ready = !!ctxSdkReady;

  /* --------------------------- Skill Question -------------------------- */
  const skill = useMemo(() => {
    const pool = [
      { q: "What is 7 + 5?", a: "12" },
      { q: 'Type the word "PIONEER" exactly.', a: "PIONEER" },
      { q: "What is 3 × 4?", a: "12" },
      { q: 'Type the phrase "Pi Cash Code"', a: "Pi Cash Code" },
    ];
    return pool[(Date.now() >> 10) % pool.length];
  }, []);

  const validateAnswer = () => {
    const ok = (answer || "").trim() === skill.a;
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
  const buy = async () => {
    if (!authUser) {
      setToast({ show: true, kind: "info", text: "Please login with Pi first." });
      setTimeout(() => setToast({ show: false }), 1600);
      return;
    }
    if (!ready) {
      setToast({ show: true, kind: "error", text: "Pi SDK not ready. Open in Pi Browser." });
      setTimeout(() => setToast({ show: false }), 2200);
      return;
    }
    if (!validateAnswer()) return;

    try {
      const amount = parseFloat(totalPrice);
      const memo = `Pi Cash Code Entry Week ${data?.weekStart || ""}`;

      const Pi = await (window && window.__readyPi?.());
      if (!Pi?.createPayment) throw new Error("Pi SDK not available");

      Pi.createPayment(
        {
          amount,
          memo,
          metadata: {
            type: "pi-cash-ticket",
            weekStart: data?.weekStart,
            quantity: qty,
            userId: authUser?.uid,
            username: authUser?.username,
          },
        },
        {
          onReadyForServerApproval: async (paymentId) => {
            await fetch("/api/pi-cash-code/approve", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ paymentId }),
            });
          },
          onReadyForServerCompletion: async (paymentId, txid) => {
            await fetch("/api/pi-cash-code/complete", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                paymentId,
                txid,
                weekStart: data?.weekStart,
                quantity: qty,
                userId: authUser?.uid,
                username: authUser?.username,
              }),
            });
            fetch("/api/pi-cash-code/log-activity", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ username: authUser?.username, quantity: qty }),
            }).catch(() => {});
            const res = await fetch("/api/pi-cash-code", { cache: "no-store" });
            const j = await res.json();
            setData(j);
            await setFromFetch(res, j?.serverNow);
            setShowSkill(false);
            setAnswer("");
            setAnswerOk(null);
            setToast({ show: true, kind: "success", text: "Tickets secured! Good luck 🍀" });
            setTimeout(() => setToast({ show: false }), 2200);
          },
          onCancel: () => {
            setToast({ show: true, kind: "info", text: "Payment cancelled." });
            setTimeout(() => setToast({ show: false }), 1600);
          },
          onError: () => {
            setToast({ show: true, kind: "error", text: "Payment error." });
            setTimeout(() => setToast({ show: false }), 2000);
          },
        }
      );
    } catch {
      setToast({ show: true, kind: "error", text: "Something went wrong." });
      setTimeout(() => setToast({ show: false }), 2000);
    }
  };

  /* ------------------------------ Layout UI ----------------------------- */
  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden bg-[#070c1a] text-white">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,255,213,.08),transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(0,119,255,.14),transparent_40%,rgba(0,255,213,.10))]" />
        <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(#22d3ee_1px,transparent_1px)] [background-size:18px_18px]" />
      </div>

      {/* App header */}
      <header className="sticky top-0 z-40 border-b border-cyan-500/20 bg-[#070c1a]/80 backdrop-blur supports-[backdrop-filter]:bg-[#070c1a]/60">
        <div className="mx-auto flex h-12 items-center justify-between px-3 sm:h-14 sm:px-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-gradient-to-br from-cyan-400 to-blue-500 shadow-[0_0_18px_#22d3ee55]" />
            <span className="font-orbitron text-sm font-extrabold tracking-wide text-cyan-200 sm:text-base">Pi Cash Code</span>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/60 bg-black/40 px-2.5 py-1.5 text-[11px] text-cyan-100 hover:bg-cyan-400/20 active:bg-cyan-400/30 transition sm:text-xs sm:px-3 sm:py-1.5"
          >
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Refresh
          </button>
        </div>
      </header>

      {/* Top badges */}
      <div className="mx-auto w-full max-w-5xl px-3 pt-2 sm:px-4 sm:pt-4">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-between sm:gap-3">
          <div className="flex items-center gap-2">
            <NeonBadge icon={ShieldCheck}>Fair • Transparent</NeonBadge>
            <NeonBadge icon={Rocket}>Open Network</NeonBadge>
          </div>
          <div className="flex items-center gap-2 mt-1.5 sm:mt-0">
            <NeonBadge icon={Ticket}>{ticketPrice} π per ticket</NeonBadge>
            <NeonBadge icon={Timer}>Live</NeonBadge>
          </div>
        </div>
      </div>

      {/* HERO */}
      <section className="mx-auto mt-3 w-full max-w-5xl px-3 sm:mt-5 sm:px-4">
        <div className="relative overflow-hidden rounded-2xl border border-cyan-500/50 bg-white/5 p-3 shadow-[0_0_40px_#22d3ee33] sm:rounded-3xl sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
            {/* LEFT: Code + copy */}
            <div className="flex flex-col items-center justify-center text-center order-2 sm:order-1">
              <motion.h1
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-balance text-xl font-extrabold tracking-tight text-cyan-200 sm:text-5xl"
              >
                Pi Cash Code
              </motion.h1>

              <p className="mt-1.5 max-w-md text-white/80 text-[13px] leading-relaxed sm:text-base sm:mt-2">
                Keep the code safe, watch the drop and be the Pioneer who’s fast enough.
              </p>

              <div className="mt-3 sm:mt-5">
                <div className="inline-block rounded-2xl border border-cyan-500/70 bg-gradient-to-r from-[#081425] via-[#0e1b33] to-[#081425] p-[2px] shadow-[0_0_32px_#22d3ee44]">
                  <div className="flex justify-center mt-3 sm:mt-5">
                    <div className="flex items-center gap-2 sm:gap-3 rounded-[12px] bg-black/40 px-3.5 py-2.5 font-mono text-lg sm:text-4xl tracking-[0.18em] sm:tracking-[0.25em] text-cyan-100 whitespace-nowrap shadow-[0_0_28px_#22d3eeaa]">
                      <LockKeyhole className="text-cyan-300 shrink-0 h-4 w-4 sm:h-auto sm:w-auto" />
                      <span className="select-all">{showCode ? data?.code || "0000-0000" : "XXXX-XXXX"}</span>
                    </div>
                  </div>
                </div>
                {data?.dropAt && (
                  <p className="mt-1.5 text-[11px] text-cyan-300/80 sm:text-xs">
                    Drop time: {new Date(data.dropAt).toLocaleString()}
                  </p>
                )}
              </div>

              {/* Info ribbon */}
              {!isPiBrowser && (
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-cyan-400/50 bg-cyan-500/10 px-2.5 py-1.5 text-[11px] text-cyan-100 sm:text-xs">
                  <Info size={14} /> Best experience in Pi Browser.
                </div>
              )}
            </div>

            {/* RIGHT: Countdown + stats */}
            <div className="flex flex-col items-center justify-center gap-3.5 sm:gap-5 order-1 sm:order-2">
              <CountdownRing
                size={132}
                stroke={8}
                pct={data?.dropAt && data?.expiresAt ? clamp((now - dropAt) / (expiresAt - dropAt), 0, 1) : 0}
                label={beforeDrop ? "UNTIL DROP" : showCode ? "ENDS IN" : "UNTIL DRAW"}
                time={`${timeLeft.days} Days ${pad2(timeLeft.hours)} Hours ${pad2(timeLeft.minutes)} Mins ${pad2(timeLeft.seconds)} Secs`}
              />
              <style jsx>{`
                @media (min-width: 640px) {
                  :global(svg[width="132"]) { width: 180px !important; height: 180px !important; }
                }
              `}</style>

              <div className="grid w-full grid-cols-3 gap-2 sm:gap-3">
                <Stat label="Prize Pool" value={`${data?.prizePool?.toLocaleString?.() ?? "—"} π`} />
                <Stat label="Tickets Sold" value={data?.ticketsSold ?? "—"} />
                <Stat label="Progress" value={`${unlockPct}%`} sub={showCode ? "To expiry" : "To drop"} />
              </div>
            </div>
          </div>

          {/* Inline CTA (desktop) */}
          <div className="mt-4 hidden sm:flex items-stretch gap-3">
            {!authUser ? (
              <button
                onClick={loginWithPi}
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00ffd5] to-[#0077ff] px-5 py-3 font-bold text-black text-base shadow-[0_8px_24px_#22d3ee55] hover:brightness-110"
              >
                <User className="h-5 w-5" /> Login with Pi to enter
              </button>
            ) : (
              <>
                {/* Quantity selector */}
                <div className="flex flex-1 items-center justify-between gap-3 rounded-xl border border-cyan-500/60 bg-black/30 px-3 py-2.5">
                  <span className="text-sm text-cyan-200">Tickets</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="h-10 w-10 rounded-lg bg-cyan-300/90 text-black font-extrabold text-xl leading-none">−</button>
                    <input
                      inputMode="numeric"
                      type="number"
                      className="h-10 w-20 rounded-lg bg-white/10 text-center font-bold outline-none [appearance:textfield]"
                      value={qty}
                      min={1}
                      onChange={(e) => setQty(Math.max(1, parseInt(e.target.value || "1", 10)))}
                    />
                    <button onClick={() => setQty((q) => q + 1)} className="h-10 w-10 rounded-lg bg-cyan-300/90 text-black font-extrabold text-xl leading-none">+</button>
                  </div>
                </div>

                {/* Purchase button */}
                <button
                  onClick={() => setShowSkill(true)}
                  className="group inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00ffd5] to-[#0077ff] px-5 py-3 font-extrabold text-black text-base shadow-[0_8px_24px_#22d3ee55] hover:brightness-110"
                >
                  <Sparkles className="h-5 w-5" /> Purchase {qty} ticket{qty > 1 ? "s" : ""} · {totalPrice} π
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Info blocks */}
      <section className="mx-auto w-full max-w-5xl px-3 py-5 sm:px-4 sm:py-8">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          <div className="rounded-2xl border border-cyan-500/40 bg-white/5 p-3 sm:p-5">
            <h3 className="flex items-center gap-2 text-sm font-bold text-cyan-200 sm:text-lg"><ShieldCheck size={18} /> Proven Fairness</h3>
            <p className="mt-1 text-[13px] text-white/70 sm:text-sm">Blockchain-backed, Pi SDK payments, server-side approvals and auditable history.</p>
          </div>
          <div className="rounded-2xl border border-cyan-500/40 bg-white/5 p-3 sm:p-5">
            <h3 className="flex items-center gap-2 text-sm font-bold text-cyan-200 sm:text-lg"><Timer size={18} /> Real-Time Thrill</h3>
            <p className="mt-1 text-[13px] text-white/70 sm:text-sm">Watch the countdown, track progress and be ready. When the code drops, speed matters.</p>
          </div>
          <div className="rounded-2xl border border-cyan-500/40 bg-white/5 p-3 sm:p-5">
            <h3 className="flex items-center gap-2 text-sm font-bold text-cyan-200 sm:text-lg"><Trophy size={18} /> Big Prize Energy</h3>
            <p className="mt-1 text-[13px] text-white/70 sm:text-sm">Prize pool grows with every ticket. More players, bigger rewards. Simple.</p>
          </div>
        </div>
      </section>

      {/* Live widgets */}
      <section className="mx-auto w-full max-w-5xl px-3 pb-24 sm:px-4 sm:pb-14">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5">
          <div className="rounded-2xl border border-cyan-500/50 bg-white/5 p-3 sm:p-4">
            <h4 className="mb-2 text-center text-[12px] font-bold tracking-widest text-cyan-300 sm:text-sm">LIVE ACTIVITY</h4>
            <LiveActivityFeed />
          </div>
          <div className="rounded-2xl border border-cyan-500/50 bg-white/5 p-3 sm:p-4">
            <h4 className="mb-2 text-center text-[12px] font-bold tracking-widest text-cyan-300 sm:text-sm">CODE HISTORY</h4>
            <CodeHistory />
          </div>
        </div>
        <p className="mt-3 text-center text-[11px] text-cyan-300/70 sm:mt-5 sm:text-xs">
          By entering you agree to our rules. {" "}
          <a className="inline-flex items-center gap-1 underline" href="/terms-conditions" target="_blank" rel="noopener noreferrer">
            View Terms &amp; Conditions <ExternalLink size={14} />
          </a>
        </p>
      </section>

      {/* Sticky mobile purchase bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-cyan-500/30 bg-[#050a17]/80 backdrop-blur px-3 py-2.5 sm:hidden" style={{paddingBottom: "max(env(safe-area-inset-bottom), 10px)"}}>
        <div className="mx-auto flex w-full max-w-5xl items-center gap-2">
          {!authUser ? (
            <button onClick={loginWithPi} className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00ffd5] to-[#0077ff] px-4 py-2.5 font-extrabold text-black text-sm shadow-[0_8px_24px_#22d3ee55] hover:brightness-110">
              <User className="h-4 w-4" /> Login with Pi to enter
            </button>
          ) : (
            <>
              <div className="flex items-center gap-2 rounded-xl border border-cyan-500/60 bg-black/30 px-2 py-1.5">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="h-8 w-8 rounded-lg bg-cyan-300/90 text-black font-extrabold text-lg leading-none">−</button>
                <input
                  inputMode="numeric"
                  type="number"
                  className="h-8 w-14 rounded-lg bg-white/10 text-center font-bold outline-none [appearance:textfield]"
                  value={qty}
                  min={1}
                  onChange={(e) => setQty(Math.max(1, parseInt(e.target.value || "1", 10)))}
                />
                <button onClick={() => setQty((q) => q + 1)} className="h-8 w-8 rounded-lg bg-cyan-300/90 text-black font-extrabold text-lg leading-none">+</button>
              </div>
              <button onClick={() => setShowSkill(true)} className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00ffd5] to-[#0077ff] px-4 py-2.5 font-extrabold text-black text-sm shadow-[0_8px_24px_#22d3ee55] hover:brightness-110">
                <Sparkles className="h-4 w-4" /> {totalPrice} π
              </button>
            </>
          )}
        </div>
      </div>

      {/* Skill modal */}
      <AnimatePresence>
        {showSkill && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4">
            <motion.div initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 24, opacity: 0 }} className="w-full max-w-sm rounded-2xl border border-cyan-500/60 bg-white/95 p-4 text-black shadow-2xl sm:p-5">
              <div className="mb-1.5 text-[11px] font-semibold text-cyan-700 sm:text-xs">SKILL CHECK</div>
              <div className="text-[13px] text-black/80 sm:text-sm">{skill.q}</div>
              <input
                autoFocus
                className="mt-2.5 w-full rounded-lg border border-cyan-500/50 bg-white px-3 py-2 font-semibold outline-none focus:ring-2 focus:ring-cyan-400"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && buy()}
              />
              {answerOk === false && <div className="mt-1.5 text-[11px] font-semibold text-rose-600">Incorrect — try again!</div>}
              <div className="mt-3.5 flex items-center justify-end gap-2">
                <button onClick={() => setShowSkill(false)} className="rounded-lg px-3 py-2 text-[13px] font-semibold text-cyan-800 hover:bg-cyan-50 sm:text-sm">Cancel</button>
                <button onClick={buy} className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#00ffd5] to-[#0077ff] px-3.5 py-2 text-[13px] font-extrabold text-black shadow-[0_8px_24px_#22d3ee55] hover:brightness-110 sm:text-sm sm:px-4 sm:py-2">
                  <Ticket size={16} /> Pay {totalPrice} π
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Toast show={toast.show} kind={toast.kind}>{toast.text}</Toast>
    </main>
  );
}
