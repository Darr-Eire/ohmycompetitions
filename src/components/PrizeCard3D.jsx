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
  advancedLastHour = 0,
  winRate = 0,
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
    <div className="relative rounded-xl border border-white/10 bg-[#0b1220] p-4 sm:p-5 shadow-lg overflow-hidden text-xs">
      {/* Ambient glow */}
      <div
        className={`absolute -inset-px rounded-xl bg-gradient-to-r ${gradient} opacity-20 blur-lg`}
        aria-hidden
      />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-white font-semibold text-sm">{title}</div>
            <span className="mt-0.5 inline-block text-[10px] bg-white/10 text-white/70 px-2 py-[2px] rounded-full">
              Advance Top {advancing}
            </span>
          </div>

          <span
            className={[
              'text-[10px] font-bold px-2 py-[2px] rounded-full border border-black/10',
              status === 'live'
                ? 'bg-emerald-400 text-black'
                : status === 'filling'
                ? 'bg-cyan-400 text-black'
                : 'bg-white/10 text-white/80',
            ].join(' ')}
          >
            {status.toUpperCase()}
          </span>
        </div>

        {/* Compact Stats Row */}
        <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] sm:text-[11px] text-white/80 text-center">
          <div className="bg-white/5 rounded-lg py-1 border border-white/10">
            👥 {entrants}/{capacity}
          </div>
          <div className="bg-white/5 rounded-lg py-1 border border-white/10">
            ⬆ {advancedLastHour} last hr
          </div>
          <div className="bg-white/5 rounded-lg py-1 border border-white/10">
            🎯 {winRate}%
          </div>
          <div className="bg-white/5 rounded-lg py-1 border border-white/10">
            🪙 {pricePi} π
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 h-2 w-full rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-cyan-400 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* CTA */}
        <div className="mt-4 flex justify-center">
          {canEnter ? (
            onEnter ? (
              <button
                onClick={() => onEnter(1)}
                className="w-full rounded-lg px-3 py-2 text-[11px] font-semibold bg-cyan-400 text-black hover:brightness-110 active:translate-y-[1px] transition"
              >
                {ctaLabel}
              </button>
            ) : (
              <Link
                href={compSlug ? `/competitions/${compSlug}` : '#'}
                className="w-full text-center rounded-lg px-3 py-2 text-[11px] font-semibold bg-cyan-400 text-black hover:brightness-110 active:translate-y-[1px] transition"
              >
                {ctaLabel}
              </Link>
            )
          ) : (
            <span className="w-full text-center rounded-lg px-3 py-2 text-[11px] font-semibold bg-white/10 text-white/70">
              {ctaLabel}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
