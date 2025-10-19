// src/components/FunnelStageCard.jsx
'use client';

import React from 'react';

function formatPi(v) {
  if (typeof v !== 'number') return v;
  return `${v.toFixed(2)} π`;
}

export default function FunnelStageCard({
  stage = 1,
  title = 'Stage 1',
  detail = 'Open Qualifiers',
  entrants = 0,
  capacity = 25,
  advancing = stage < 5 ? 5 : 1,
  price,                 // number for Stage 1 (e.g., 0.15)
  tags = [],
  comingSoon = false,
  isPoolPrize = false,
  ctaLabel = stage === 1 ? 'Enter' : 'Advance Ticket',
  joinHref,              // optional deep link for stages > 1
  onClickJoin,           // handler for Stage 1 or generic CTA
  micro = false,         // compact style for mobile scroller
}) {
  const pct = Math.max(0, Math.min(100, Math.round((entrants / Math.max(1, capacity)) * 100)));

  const Card = ({ children }) => (
    <div
      className={[
        'relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur',
        micro ? 'p-3' : 'p-4',
        'overflow-hidden'
      ].join(' ')}
    >
      {/* subtle gradient header */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/10" />
      {children}
    </div>
  );

  const CTA = () => {
    const inner = (
      <div className="inline-flex items-center justify-center rounded-lg bg-cyan-400 text-black font-bold px-3 py-1.5 text-sm">
        {comingSoon ? 'Coming Soon' : ctaLabel}
      </div>
    );
    if (comingSoon) return inner;

    if (joinHref) {
      return (
        <a href={joinHref} className="focus:outline-none focus:ring-2 focus:ring-cyan-400/70 rounded-lg">
          {inner}
        </a>
      );
    }
    return (
      <button
        type="button"
        onClick={onClickJoin}
        className="focus:outline-none focus:ring-2 focus:ring-cyan-400/70 rounded-lg"
      >
        {inner}
      </button>
    );
  };

  return (
    <Card>
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between gap-2">
        <div>
          <div className="text-xs text-white/60">Stage {stage}{isPoolPrize ? ' · Final' : ''}</div>
          <div className={`font-bold text-white ${micro ? 'text-sm' : 'text-base'}`}>{title}</div>
        </div>

        {/* Tags */}
        {tags?.length ? (
          <div className="hidden sm:flex flex-wrap gap-1">
            {tags.slice(0, 3).map((t, i) => (
              <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 border border-white/15 text-white/70">
                {t}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      {/* Detail */}
      <div className={`relative z-10 mt-1 text-white/70 ${micro ? 'text-xs' : 'text-sm'}`}>
        {detail}
      </div>

      {/* Meta row */}
      <div className="relative z-10 mt-3 grid grid-cols-3 gap-2 text-[11px] text-white/70">
        <div>
          <div className="text-white/50">Entrants</div>
          <div className="text-white font-semibold">
            {entrants}/{capacity}
          </div>
        </div>
        <div>
          <div className="text-white/50">Advance</div>
          <div className="text-white font-semibold">Top {advancing}</div>
        </div>
        <div className="text-right">
          <div className="text-white/50">{stage === 1 ? 'Entry' : 'Access'}</div>
          <div className="text-white font-semibold">
            {stage === 1 ? (typeof price === 'number' ? formatPi(price) : '—') : 'Advance Ticket'}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative z-10 mt-3">
        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-1 text-[11px] text-white/60">
          {pct}% full
        </div>
      </div>

      {/* CTA */}
      <div className="relative z-10 mt-3 flex items-center justify-between">
        <div className="text-[11px] text-white/60">
          {isPoolPrize ? 'Pool Prize Round' : stage === 1 ? 'Open Entry' : 'Invite Only (advance)'}
        </div>
        <CTA />
      </div>
    </Card>
  );
}
