'use client';

import React from 'react';
import Link from 'next/link';

const STAGE_GRADIENTS = {
  1: 'from-cyan-500 via-sky-500 to-indigo-500',
};

export default function FunnelStageCardStage1({
  title = 'Stage 1 Qualifier',
  entrants = 0,
  capacity = 25,
  advancing = 5,
  status = 'filling',
  pricePi = 0.15,
  compSlug,
  onEnter,
}) {
  const pct = Math.max(0, Math.min(100, Math.floor((entrants / capacity) * 100)));
  const spotsLeft = Math.max(0, capacity - entrants);
  const gradient = STAGE_GRADIENTS[1];
  const canEnter = status === 'filling' && spotsLeft > 0;
  const ctaLabel = spotsLeft > 0 ? `Enter • ${spotsLeft} left` : 'Full';

  return (
    <div className="relative rounded-xl border border-white/10 bg-[#0b1220] p-2 shadow-md overflow-hidden text-xs">
      {/* Ambient ring */}
      <div
        className={`absolute -inset-px rounded-xl bg-gradient-to-r ${gradient} opacity-30 blur-md`}
        aria-hidden
      />
      <div className="relative">
        {/* Header */}
    <div className="flex items-center justify-between relative">
  <div>
    <div className="text-white font-semibold text-xs">{title}</div>
  </div>

  <span
    className={[
      'text-[9px] font-bold px-2 py-[2px] rounded-full border border-black/10',
      status === 'live'
        ? 'bg-emerald-400 text-black'
        : status === 'filling'
        ? 'bg-cyan-400 text-black'
        : 'bg-white/10 text-white/80',
    ].join(' ')}
  >
    {status.toUpperCase()}
  </span>

  {/* LIVE Banner */}
  {status === 'live' && (
    <div className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold px-2 py-[1px] rounded shadow-lg animate-pulse">
      LIVE
    </div>
  )}
</div>


        {/* Stats */}
        <div className="mt-1 text-[10px] text-white">
          Max Players {entrants}/{capacity}      Advance Top {advancing}
        </div>
        <div className="mt-1 h-1.5 w-full rounded-full bg-white/10 overflow-hidden" aria-hidden>
          <div className="h-full rounded-full bg-cyan-400 transition-all" style={{ width: `${pct}%` }} />
        </div>

        {/* Footer */}
        <div className="mt-2 flex items-center justify-between">
          <div className="text-[10px] text-white">{spotsLeft} spots left</div>
          {canEnter ? (
            onEnter ? (
              <button
                onClick={() => onEnter(1)}
                className="rounded-lg px-2 py-1 text-[10px] font-semibold bg-cyan-400 text-black hover:brightness-110 active:translate-y-[1px]"
              >
                {ctaLabel} · {pricePi} π
              </button>
            ) : (
              <Link
                href={compSlug ? `/competitions/${compSlug}` : '#'}
                className="rounded-lg px-2 py-1 text-[10px] font-semibold bg-cyan-400 text-black hover:brightness-110 active:translate-y-[1px]"
              >
                {ctaLabel} · {pricePi} π
              </Link>
            )
          ) : (
            <span className="rounded-lg px-2 py-1 text-[10px] font-semibold bg-white/10 text-white/70">
              {ctaLabel}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
