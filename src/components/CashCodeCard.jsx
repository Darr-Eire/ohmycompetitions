// src/components/CashCodeCard.jsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useMemo } from 'react';
import {
  LockKeyhole,
  Timer,
  Ticket,
  Trophy,
  Sparkles,
} from 'lucide-react';

/**
 * CashCodeCard
 *
 * Props:
 * - data | competition: the competition object
 *    {
 *      id, slug, title, type, prize, prizePool, ticketsSold,
 *      dropAt, expiresAt, endsAt, code, imageUrl,
 *      winners: [{ username, ticketNumber }]
 *    }
 * - mode: "result" | "live" | "default"  (default: "default")
 * - compact: boolean (default: false)
 */
export default function CashCodeCard({ data, competition, mode = 'default', compact = false }) {
  const comp = data || competition || {};
  const {
    slug,
    title = 'Pi Cash Code',
    prize,
    prizePool,
    ticketsSold,
    imageUrl,
    code,
    winners = [],
    dropAt,
    expiresAt,
    endsAt,
  } = comp;

  const now = Date.now();
  const dropTs = dropAt ? new Date(dropAt).getTime() : null;
  const expTs  = expiresAt ? new Date(expiresAt).getTime() : null;
  const endTs  = endsAt ? new Date(endsAt).getTime() : (expTs || dropTs);

  const status = useMemo(() => {
    if (mode === 'result' || (endTs && now > endTs)) return 'Ended';
    if (dropTs && now < dropTs) return 'Upcoming';
    if (dropTs && expTs && now >= dropTs && now < expTs) return 'Live';
    if (expTs && now >= expTs) return 'Ended';
    return 'Live';
  }, [mode, now, dropTs, expTs, endTs]);

  const whenText = useMemo(() => {
    const fmt = (ts) =>
      ts
        ? new Date(ts).toLocaleString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : 'TBA';

    if (status === 'Upcoming') return `Drops: ${fmt(dropTs)}`;
    if (status === 'Live')     return `Ends: ${fmt(expTs)}`;
    return `Ended: ${fmt(endTs)}`;
  }, [status, dropTs, expTs, endTs]);

  return (
    <div
      className={`relative flex flex-col rounded-2xl border border-cyan-600/40 bg-white/5 p-4 shadow-[0_0_24px_#22d3ee22] ${
        compact ? 'gap-3' : 'gap-4'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className={`font-extrabold tracking-tight ${compact ? 'text-base' : 'text-lg'}`}>
            <span className="bg-gradient-to-r from-[#00ffd5] to-[#0077ff] bg-clip-text text-transparent">
              {title || 'Pi Cash Code'}
            </span>
          </h3>
          <div className="mt-1 flex items-center gap-2 text-xs text-white/80">
            <Timer size={14} className="shrink-0 text-cyan-300" />
            <span>{whenText}</span>
          </div>
        </div>

        <StatusPill status={status} />
      </div>

      {/* Image */}
      {imageUrl ? (
        <div className="relative w-full overflow-hidden rounded-xl border border-white/10"
             style={{ height: compact ? 140 : 160 }}>
          {imageUrl.startsWith('/images') ? (
            <Image
              src={imageUrl}
              alt="Prize"
              fill
              className="object-cover"
              sizes="(max-width:768px) 100vw, 33vw"
            />
          ) : (
            <img src={imageUrl} alt="Prize" className="w-full h-full object-cover" />
          )}
        </div>
      ) : null}

      {/* Code / Mask */}
      <div className="rounded-xl border border-cyan-500/40 bg-black/30 p-3">
        <div className="flex items-center gap-2 text-cyan-200 text-xs tracking-widest">
          <LockKeyhole size={16} className="shrink-0 text-cyan-300" />
          <span>Cash Code</span>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <div
            className={`font-mono ${
              compact ? 'text-lg tracking-[0.15em]' : 'text-2xl tracking-[0.18em]'
            } text-cyan-100`}
          >
            {mode === 'result' || status === 'Ended'
              ? (code || 'XXXX-XXXX')
              : 'XXXX-XXXX'}
          </div>

          {status === 'Live' && (
            <span className="rounded-lg border border-cyan-400/40 bg-cyan-400/10 px-2 py-1 text-[11px] text-cyan-200">
              Revealed During Drop
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Prize" value={prize ? String(prize) : (prizePool ? `${prizePool} π` : '—')} icon={Trophy} />
        <Stat label="Tickets" value={ticketsSold ?? '—'} icon={Ticket} />
        <Stat label="Status" value={status} icon={Sparkles} />
      </div>

      {/* Winners */}
      <div className="mt-1">
        {winners?.length ? (
          <>
            <div className="text-emerald-300 font-semibold text-sm mb-1">
              🎯 Winner{winners.length > 1 ? 's' : ''}
            </div>
            <ul className="space-y-1 text-sm">
              {winners.map((w, i) => (
                <li key={i} className="text-white/90">
                  <span className="inline-flex items-center gap-1">
                    {i === 0 && <span className="text-yellow-300">🥇</span>}
                    👤 {w?.username || 'Pioneer'}
                    {w?.ticketNumber ? (
                      <span className="text-white/60"> — 🎟 {w.ticketNumber}</span>
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className="text-white/70 text-sm">No winners recorded yet.</div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-2 flex flex-wrap gap-2">
        <Action href={slug ? `/competitions/${slug}` : '#'}>View Competition</Action>
        <ShareButton title={title} winners={winners} />
      </div>
    </div>
  );
}

/* --------------------------------- Bits ---------------------------------- */

function StatusPill({ status }) {
  const style =
    status === 'Live'
      ? 'border-emerald-400/60 bg-emerald-400/10 text-emerald-200'
      : status === 'Upcoming'
      ? 'border-amber-400/60 bg-amber-400/10 text-amber-200'
      : 'border-white/15 bg-white/5 text-white/70';

  return (
    <span className={`rounded-full px-2.5 py-1 text-[11px] border ${style}`}>
      {status}
    </span>
  );
}

function Stat({ label, value, icon: Icon }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-2 text-center">
      <div className="flex items-center justify-center gap-1 text-[10px] text-cyan-300/80 uppercase tracking-wider">
        {Icon ? <Icon size={12} className="shrink-0 text-cyan-300/80" /> : null}
        {label}
      </div>
      <div className="mt-0.5 text-sm font-bold text-white tabular-nums">{value}</div>
    </div>
  );
}

function Action({ href, children }) {
  return (
    <Link href={href} className="inline-flex">
      <span className="inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-400/60 bg-white/5 px-3 py-2 text-xs sm:text-sm font-bold shadow-[0_0_16px_#22d3ee33] hover:bg-white/10 transition">
        {children}
      </span>
    </Link>
  );
}

function ShareButton({ title, winners }) {
  const share = async () => {
    const names = (winners || []).map(w => w?.username).filter(Boolean).join(', ');
    const text = names
      ? `🏆 ${title} — Winner${winners.length > 1 ? 's' : ''}: ${names}`
      : `🏆 ${title} — results`;
    const url  = typeof window !== 'undefined' ? window.location.href : '';
    try {
      if (navigator.share) {
        await navigator.share({ title: 'OhMyCompetitions Result', text, url });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        alert('Link copied!');
      }
    } catch {
      /* ignore */
    }
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
