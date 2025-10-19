// src/pages/competitions/results.js
'use client';

import React, { useEffect, useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';

/* ---------------------------------- cards --------------------------------- */
const pick = (m, name) => m?.default ?? m?.[name] ?? null;

const DailyCompetitionCard = dynamic(
  () => import('../../components/DailyCompetitionCard').then((m) => pick(m, 'DailyCompetitionCard')).catch(() => null),
  { ssr: false }
);
const CompetitionCard = dynamic(
  () => import('../../components/CompetitionCard').then((m) => pick(m, 'CompetitionCard')).catch(() => null),
  { ssr: false }
);
const StagesCard = dynamic(
  () => import('../../components/StagesCard').then((m) => pick(m, 'StagesCard')).catch(() => null),
  { ssr: false }
);
const CashCodeCard = dynamic(
  () => import('../../components/CashCodeCard').then((m) => pick(m, 'CashCodeCard')).catch(() => null),
  { ssr: false }
);
const PiCompetitionCard = dynamic(
  () => import('../../components/PiCompetitionCard').then((m) => pick(m, 'PiCompetitionCard')).catch(() => null),
  { ssr: false }
);

const CARD_BY_TYPE = {
  daily: DailyCompetitionCard,
  raffle: CompetitionCard,
  standard: CompetitionCard,
  stages: StagesCard,
  'omc-stages': StagesCard,
  'pi-cash-code': CashCodeCard,
  cashcode: CashCodeCard,
  'pi-competition': PiCompetitionCard,
  pi: PiCompetitionCard,
};

/* -------------------------------- utils ----------------------------------- */
function normalizeCompetition(r) {
  if (!r) return {};
  const id = r.id || r._id || r.slug;
  const image =
    r.image || r.imageUrl || r.bannerUrl || (Array.isArray(r.images) && r.images[0]) || null;

  const drawAt = r.drawAt || r.endsAt || r.expiresAt || null;
  const endsAt = r.endsAt || r.expiresAt || r.drawAt || null;

  return {
    id,
    slug: r.slug || id,
    type: (r.type || 'standard').toLowerCase(),
    title: r.title || 'Competition',
    image,
    imageUrl: image,
    bannerUrl: image,
    prize: r.prize ?? (r.prizePool ? `${r.prizePool} π` : null),
    prizePool: r.prizePool,
    entryFee: r.entryFee,
    ticketsSold: r.ticketsSold,
    drawAt,
    endsAt,
    dropAt: r.dropAt || null,
    expiresAt: r.expiresAt || null,
    winners: Array.isArray(r.winners) ? r.winners : [],
    code: r.code,
    raw: r,
    drawTime: drawAt,
    endTime: endsAt,
  };
}

const formatDateShort = (v) =>
  v
    ? new Date(v).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
    : 'Unknown';

/* ----------------------------- Shared BG FX ------------------------------- */
function BackgroundFX() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* soft aurora beams */}
      <div className="absolute -inset-32 blur-3xl opacity-35 [background:conic-gradient(from_180deg_at_50%_50%,#00ffd5,rgba(0,255,213,.2),#0077ff,#00ffd5)] animate-[spin_35s_linear_infinite]" />
      {/* star grid */}
      <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:18px_18px]" />
      {/* drifting glow orbs */}
      <div className="absolute -top-20 -left-24 h-[420px] w-[420px] rounded-full blur-3xl opacity-25 bg-cyan-400 animate-[float_14s_ease-in-out_infinite]" />
      <div className="absolute -bottom-20 -right-24 h-[420px] w-[420px] rounded-full blur-3xl opacity-20 bg-blue-500 animate-[float2_18s_ease-in-out_infinite]" />

      <style jsx global>{`
        @keyframes float   {0%{transform:translate(0,0)}50%{transform:translate(12px,18px)}100%{transform:translate(0,0)}}
        @keyframes float2  {0%{transform:translate(0,0)}50%{transform:translate(-16px,-14px)}100%{transform:translate(0,0)}}
      `}</style>
    </div>
  );
}

/* --------------------------------- page ----------------------------------- */
export default function ResultsPage() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [type, setType] = useState('all');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await fetch('/api/competitions/results', { cache: 'no-store' });
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch results:', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  const typesFromData = useMemo(() => {
    const set = new Set(results.map((r) => (r.type || 'standard').toLowerCase()));
    return ['all', ...Array.from(set)];
  }, [results]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return results
      .filter((r) => (type === 'all' ? true : (r.type || 'standard').toLowerCase() === type))
      .filter((r) => {
        if (!needle) return true;
        return (
          (r.title || '').toLowerCase().includes(needle) ||
          (String(r.prize || '')).toLowerCase().includes(needle) ||
          (r.winners || []).some((w) => (w?.username || '').toLowerCase().includes(needle))
        );
      })
      .sort(
        (a, b) =>
          new Date(b.endsAt || b.expiresAt || b.drawAt || 0) -
          new Date(a.endsAt || a.expiresAt || a.drawAt || 0)
      );
  }, [results, q, type]);

  const hasAnyWinner = useMemo(
    () => filtered.some((c) => Array.isArray(c.winners) && c.winners.length > 0),
    [filtered]
  );

  return (
    <main className="app-background relative min-h-screen text-white">
      <BackgroundFX />

      <div className="mx-auto w-full max-w-6xl px-3 sm:px-4 py-6 sm:py-10">
        {/* Header */}
        <header className="text-center mb-5 sm:mb-7">
          <h1 className="text-2xl sm:text-2xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-[#00ffd5] to-[#0077ff] bg-clip-text text-transparent">
              Competition Results
            </span>
          </h1>
          <p className="mt-2 text-white/80 text-sm sm:text-base">
            Congrats to our winners! Check back after every draw for fresh results.
          </p>
        </header>

        {/* Filters */}
        <div className="mb-5 sm:mb-7 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
          {/* search */}
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            <input
              className="w-full bg-transparent outline-none text-sm sm:text-base placeholder-white/60"
              placeholder="Search results by title, prize, or winner…"
              value={q}
              onChange={(e) => startTransition(() => setQ(e.target.value))}
            />
            {q && (
              <button
                onClick={() => startTransition(() => setQ(''))}
                className="text-white/60 hover:text-white text-sm"
              >
                Clear
              </button>
            )}
          </div>

          {/* type chips */}
          <div className="flex flex-wrap items-center gap-2">
            {typesFromData.map((t) => (
              <button
                key={t}
                onClick={() => startTransition(() => setType(t))}
                className={`rounded-full px-3 py-1.5 text-xs sm:text-sm border transition
                  ${
                    type === t
                      ? 'border-cyan-400/70 bg-cyan-400/10 text-cyan-200'
                      : 'border-white/10 bg-white/5 text-white/80 hover:bg-white/10'
                  }`}
              >
                {t === 'all' ? 'All' : chipLabel(t)}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <LoadingBlock />
        ) : filtered.length === 0 ? (
          <EmptyState />
        ) : !hasAnyWinner ? (
          <NoWinnersYet />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filtered.map((raw) => (
              <ResultRouter key={raw.id || raw._id || raw.slug} comp={raw} />
            ))}
          </div>
        )}

        {/* Footer (optional; keeps page consistent) */}
        <div className="text-center mt-10 text-sm text-white/60 space-x-4">
          <Link href="/" className="underline text-cyan-300 hover:text-cyan-200">Home</Link>
          <Link href="/terms" className="underline hover:text-cyan-200">Terms</Link>
          <Link href="/privacy" className="underline hover:text-cyan-200">Privacy</Link>
          <Link href="/support" className="underline hover:text-cyan-200">Support</Link>
        </div>
        <div className="text-center text-white/50 mt-3 mb-2">© 2025 OhMyCompetitions</div>
      </div>
    </main>
  );
}

/* ---------------------------- router & fallback ---------------------------- */
function ResultRouter({ comp }) {
  const normalized = normalizeCompetition(comp);
  const Card = CARD_BY_TYPE[normalized.type] || null;

  if (Card) {
    return (
      <div className="relative">
        <CongratsRibbon winners={normalized?.winners} />
        <Card competition={normalized} data={normalized} item={normalized} raw={comp} mode="result" compact />
      </div>
    );
  }
  return <ResultCard comp={normalized} />;
}

function ResultCard({ comp }) {
  const when = comp.drawAt || comp.endsAt;
  const img = comp.image || comp.imageUrl || comp.bannerUrl;

  return (
    <div className="relative flex flex-col rounded-2xl border border-cyan-600/40 bg-white/5 p-4 shadow-[0_0_24px_#22d3ee22]">
      <CongratsRibbon winners={comp?.winners} />
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-base sm:text-lg font-bold text-cyan-200">{comp?.title || 'Competition'}</h2>
        <span className="rounded-full px-2 py-0.5 text-[11px] sm:text-xs border border-white/10 bg-white/5 text-white/70">
          {chipLabel(comp?.type || 'standard')}
        </span>
      </div>

      <p className="mt-1 text-xs sm:text-sm text-white/80">📅 Draw Date: {formatDateShort(when)}</p>
      <p className="text-amber-300 text-sm sm:text-base font-semibold mt-1">🏆 Prize: {comp?.prize ?? '—'}</p>

      {img ? (
        <div className="mt-3 relative w-full h-40 overflow-hidden rounded-xl border border-white/10">
          {img?.startsWith?.('/images') ? (
            <Image src={img} alt="Prize" fill className="object-cover" sizes="(max-width:768px) 100vw, 33vw" />
          ) : (
            <img src={img} alt="Prize" className="w-full h-full object-cover" />
          )}
        </div>
      ) : null}

      {/* Winners */}
      <div className="mt-3">
        {comp?.winners?.length ? (
          <>
            <div className="text-emerald-300 font-semibold text-sm mb-1">
              🎯 Winner{comp.winners.length > 1 ? 's' : ''}
            </div>
            <ul className="space-y-1 text-sm">
              {comp.winners.map((w, i) => (
                <li key={i} className="text-white/90">
                  <span className="inline-flex items-center gap-1">
                    {i === 0 && <span className="text-yellow-300">🥇</span>}
                    👤 {w?.username || 'Anonymous'}
                    {w?.ticketNumber ? <span className="text-white/60"> — 🎟 {w.ticketNumber}</span> : null}
                  </span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className="text-rose-300/90 text-sm">No winners recorded.</div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-4 flex flex-wrap gap-2">
        <ActionButton href={`/competitions/${comp?.slug || comp?.id || ''}`}>View Competition</ActionButton>
        <ShareButton comp={comp} />
      </div>
    </div>
  );
}

/* ---------------------------------- UI bits -------------------------------- */
function NoWinnersYet() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center shadow-[0_0_24px_#22d3ee22]">
      <div className="text-2xl mb-2">🕒</div>
      <div className="text-white/90 font-semibold mb-1">No winners yet — first draws pending</div>
      <p className="text-white/70 text-sm max-w-md mx-auto">
        Results will appear here as soon as our first competitions complete. In the meantime, jump into live
        competitions and secure your entries.
      </p>
      <div className="mt-4 flex justify-center gap-3 flex-wrap">
        <Link href="/competitions/live-now">
          <span className="inline-flex items-center justify-center rounded-xl border border-cyan-400/60 bg-white/5 px-4 py-2 text-sm font-bold shadow-[0_0_16px_#22d3ee33] hover:bg-white/10 transition">
            View Live Competitions
          </span>
        </Link>
        <Link href="/forums/winners">
          <span className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-bold hover:bg-white/10 transition">
            Winner Announcements
          </span>
        </Link>
      </div>
    </div>
  );
}

function CongratsRibbon({ winners }) {
  if (!winners?.length) return null;
  const top = winners[0];
  return (
    <div className="absolute -top-2 -left-2 rounded-lg border border-emerald-400/50 bg-emerald-500/10 text-emerald-200 text-xs font-bold px-2 py-1 shadow-[0_0_16px_#10b98155]">
      🎉 Congrats {top?.username || 'Pioneer'}!
    </div>
  );
}

function ActionButton({ href, children }) {
  return (
    <Link href={href || '#'} className="inline-flex">
      <span className="inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-400/60 bg-white/5 px-3 py-2 text-xs sm:text-sm font-bold shadow-[0_0_16px_#22d3ee33] hover:bg-white/10 transition">
        {children}
      </span>
    </Link>
  );
}

function ShareButton({ comp }) {
  const share = async () => {
    const winnerNames = (comp?.winners || []).map((w) => w?.username).filter(Boolean);
    const text = winnerNames.length
      ? `🏆 ${comp?.title} — Winner${winnerNames.length > 1 ? 's' : ''}: ${winnerNames.join(', ')}`
      : `🏆 ${comp?.title} — results`;
    const url = typeof window !== 'undefined' ? window.location.href : '';
    try {
      if (navigator.share) {
        await navigator.share({ title: 'OhMyCompetitions Result', text, url });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        alert('Link copied!');
      }
    } catch {}
  };
  return (
    <button
      onClick={share}
      className="inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-400/60 bg-white/5 px-3 py-2 text-xs sm:text-sm font-bold shadow-[0_0_16px_#22d3ee33] hover:bg-white/10 transition"
    >
      Share
    </button>
  );
}

function LoadingBlock() {
  return (
    <div className="text-center py-24">
      <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
      <p className="mt-4 text-sm sm:text-base text-white/90">Loading competition results…</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
      <div className="text-2xl mb-2">🤷‍♂️</div>
      <div className="text-white/80">No completed competitions found.</div>
      <div className="mt-4">
        <Link href="/competitions/live-now">
          <span className="inline-flex items-center justify-center rounded-xl border border-cyan-400/60 bg-white/5 px-4 py-2 text-sm font-bold shadow-[0_0_16px_#22d3ee33] hover:bg-white/10 transition">
            View Live Competitions
          </span>
        </Link>
      </div>
    </div>
  );
}

function chipLabel(t) {
  const map = {
    daily: 'Daily',
    standard: 'Standard',
    stages: 'OMC Stages',
    'omc-stages': 'OMC Stages',
    'pi-cash-code': 'Pi Cash Code',
    cashcode: 'Pi Cash Code',
    pi: 'Pi Competition',
    'pi-competition': 'Pi Competition',
  };
  return map[t?.toLowerCase?.()] || 'Competition';
}
