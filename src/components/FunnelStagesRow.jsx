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
 * Props (all optional, safe defaults):
 * - stages: array of objects per stage [{ stage:1..5, capacity, entrants, advancing, endsAt, tags, isPoolPrize }]
 * - s1..s5: individual stage objects (if you prefer passing separately)
 * - entryFeePi: number (Stage 1 price display)
 * - onEnterStage1: function to handle Stage 1 Enter button
 * - headline: string title above the row
 * - subline: string subtitle below the title
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
  /* ---------- normalize one stage object ---------- */
  const shape = (obj, stage) => {
    const cap = toNum(obj?.capacity, 25);
    const ent = Math.max(0, Math.min(toNum(obj?.entrants ?? obj?.entrantsCount, 0), cap));
    const adv = toNum(obj?.advancing, stage < 5 ? 5 : 1);

    // Stage 1 shows price; others show "Advance Ticket"
    const price =
      stage === 1
        ? (typeof entryFeePi === 'number' ? entryFeePi : 0.15)
        : undefined;

    const isPoolPrize = stage === 5 || !!obj?.isPoolPrize;

    return {
      title: obj?.title || (isPoolPrize ? 'Pool Prize' : `Stage ${stage}`),
      detail: obj?.detail || (stage === 1 ? 'Open Qualifiers' : `Invite-only: advance to enter`),
      entrants: ent,
      capacity: cap,
      advancing: adv,
      price,
      endsAt: obj?.endsAt || null,
      tags: Array.isArray(obj?.tags) ? obj.tags : (isPoolPrize ? ['Final'] : [`Stage ${stage}`]),
      comingSoon: !!obj?.comingSoon,
      isPoolPrize,
      ctaLabel: stage === 1 ? 'Enter' : 'Advance Ticket',
      joinHref: stage === 1 ? undefined : (obj?.joinHref || undefined),
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
      <div className="mb-3 sm:mb-4">
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
            <FunnelStageCard stage={1} {...S1} onClickJoin={onEnterStage1} />
          </div>
          <div className="min-w-[70%] snap-center">
            <FunnelStageCard micro stage={2} {...S2} />
          </div>
          <div className="min-w-[70%] snap-center">
            <FunnelStageCard micro stage={3} {...S3} />
          </div>
          <div className="min-w-[70%] snap-center">
            <FunnelStageCard micro stage={4} {...S4} />
          </div>
          <div className="min-w-[70%] snap-center">
            <FunnelStageCard micro stage={5} {...S5} />
          </div>
        </div>
      </div>

      {/* Desktop grid */}
      <div className="hidden sm:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        <FunnelStageCard stage={1} {...S1} micro={false} onClickJoin={onEnterStage1} />
        <FunnelStageCard stage={2} {...S2} micro={false} />
        <FunnelStageCard stage={3} {...S3} micro={false} />
        <FunnelStageCard stage={4} {...S4} micro={false} />
        <FunnelStageCard stage={5} {...S5} micro={false} />
      </div>
    </section>
  );
}