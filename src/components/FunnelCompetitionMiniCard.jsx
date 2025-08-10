// file: src/components/FunnelCompetitionMiniCard.jsx
'use client';

import Link from 'next/link';

export default function FunnelCompetitionMiniCard({
  compId,
  title = 'Qualifier',
  stage = 1,
  entrants = 0,
  capacity = 25,
  advancing = 5,
  status = 'filling', // or 'live'|'ended'
  hasTicket = false,
  onClickJoin,
  joinHref,
}) {
  const spotsLeft = Math.max(0, capacity - entrants);
  const pct = Math.max(0, Math.min(100, Math.floor((entrants / capacity) * 100)));
  const canJoin = status === 'filling' && (stage === 1 || (stage > 1 && hasTicket));
  const safeHref = (joinHref || `/competitions/${compId || ''}`).replace(/\/+$/, '');

  return (
    <div className="rounded-xl border border-white/10 bg-[#0b1220] p-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-white/60">Stage {stage}</div>
          <div className="text-white font-semibold">{title}</div>
        </div>
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
          status === 'live' ? 'bg-emerald-400 text-black'
          : status === 'filling' ? 'bg-cyan-400 text-black'
          : 'bg-white/10 text-white/80'
        }`}>
          {status.toUpperCase()}
        </span>
      </div>

      <div className="mt-2 text-xs text-white/70">
        Players {entrants}/{capacity} • Advance Top {advancing}
      </div>

      <div className="mt-2 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
        <div className="h-full rounded-full bg-cyan-400" style={{ width: `${pct}%` }} />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="text-xs text-white/60">
          {status === 'filling' ? `${spotsLeft} spots left` : '—'}
        </div>

        {canJoin ? (
          onClickJoin ? (
            <button
              onClick={onClickJoin}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold bg-cyan-400 text-black hover:brightness-110"
            >
              Join
            </button>
          ) : (
            <Link
              href={safeHref}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold bg-cyan-400 text-black hover:brightness-110"
            >
              Join
            </Link>
          )
        ) : (
          <span className="rounded-lg px-3 py-1.5 text-xs font-semibold bg-white/10 text-white/70">
            {stage > 1 && !hasTicket ? 'Qualified Only' : 'View'}
          </span>
        )}
      </div>
    </div>
  );
}
