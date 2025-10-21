'use client';

import React, { useMemo } from 'react';
import FunnelStageCard from './FunnelStageCard.jsx';

/* Small helpers */
function toNum(v, d = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

/**
 * FunnelStagesRow
 *
 * Props:
 * - stages?: [{ stage:1..5, capacity, entrants, advancing, hasTicket, status, slug, endsAt }]
 * - s1..s5?: individual stage objects
 * - entryFeePi?: number (Stage 1 price, default 0.15)
 * - onEnterStage1?: () => void
 * - headline?: string
 * - subline?: string
 */
export default function FunnelStagesRow({
  stages = [],
  s1 = null,
  s2 = null,
  s3 = null,
  s4 = null,
  s5 = null,
  entryFeePi = 0.15,
  onEnterStage1 = () => {},
  headline = 'OMC Pi Stages',
  subline = 'Each room: 25 enter — top 5 advance with an Advance Ticket. Stage 5 is the Pool Prize.'
}) {
  /* ---------- normalize one stage object to FunnelStageCard props ---------- */
  const shape = (obj, stage) => {
    const cap = toNum(obj?.capacity, 25);
    const ent = Math.max(0, Math.min(toNum(obj?.entrants ?? obj?.entrantsCount, 0), cap));
    const adv = toNum(obj?.advancing, stage < 5 ? 5 : 1);

    // Stage 1 shows a numeric price; all others require an Advance Ticket.
    const pricePi = stage === 1
      ? (typeof entryFeePi === 'number' ? entryFeePi : 0.15)
      : undefined;

    return {
      // names that FunnelStageCard.jsx expects:
      stage,
      title: obj?.title || (stage === 5 ? 'Finals' : `Stage ${stage}`),
      entrants: ent,
      capacity: cap,
      advancing: adv,
      status: obj?.status || 'filling',
      pricePi,                      // only defined for stage 1
      hasTicket: !!obj?.hasTicket,  // default false -> shows “Qualified Only/Locked”
      compSlug: obj?.slug || '',
    };
  };

  /* ---------- build the five stages ---------- */
  const STAGES = useMemo(() => {
    if (Array.isArray(stages) && stages.length) {
      const byStage = new Map(
        stages
          .map(s => ({ ...s, stage: toNum(s?.stage, 0) }))
          .filter(s => s.stage >= 1 && s.stage <= 5)
          .map(s => [s.stage, s])
      );
      return [1, 2, 3, 4, 5].map(n => shape(byStage.get(n) || {}, n));
    }
    // fall back to individually provided props or defaults
    return [
      shape(s1 || {}, 1),
      shape(s2 || {}, 2),
      shape(s3 || {}, 3),
      shape(s4 || {}, 4),
      shape(s5 || {}, 5),
    ];
  }, [stages, s1, s2, s3, s4, s5, entryFeePi]);

  const [S1, S2, S3, S4, S5] = STAGES;

  return (
    <section className="w-full">
      {/* Header */}
      <div className="mb-3 sm:mb-3">
        <h2 className="text-lg sm:text-xl font-extrabold bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
          {headline}
        </h2>
        {!!subline && (
          <p className="text-xs sm:text-sm text-white/70 mt-1">
            {subline}
          </p>
        )}
      </div>

      {/* Mobile: horizontal scroll (compact) */}
      <div className="sm:hidden -mx-2 px-2">
        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2">
          <div className="min-w-[85%] snap-center">
            <FunnelStageCard {...S1} onEnter={onEnterStage1} />
          </div>
          <div className="min-w-[70%] snap-center">
            <FunnelStageCard micro {...S2} />
          </div>
          <div className="min-w-[70%] snap-center">
            <FunnelStageCard micro {...S3} />
          </div>
          <div className="min-w-[70%] snap-center">
            <FunnelStageCard micro {...S4} />
          </div>
          <div className="min-w-[70%] snap-center">
            <FunnelStageCard micro {...S5} />
          </div>
        </div>
      </div>

      {/* Desktop grid */}
      <div className="hidden sm:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        <FunnelStageCard {...S1} micro={false} onEnter={onEnterStage1} />
        <FunnelStageCard {...S2} micro={false} />
        <FunnelStageCard {...S3} micro={false} />
        <FunnelStageCard {...S4} micro={false} />
        <FunnelStageCard {...S5} micro={false} />
      </div>
    </section>
  );
}
