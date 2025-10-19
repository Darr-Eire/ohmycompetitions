'use client';
import Link from 'next/link';
import React, { useMemo } from 'react';
import FunnelStageCard from 'components/FunnelStageCard';

export default function FunnelStagesRow({
  // Backward-compat single props
  s1 = {},
  s2 = {},
  s3 = {},
  s4 = {},
  s5 = {},
  // New preferred prop (if you pass it)
  stages, // [{ stage:1..5, slug, comp?, entrants?, entrantsCount?, ... }]
  entryFeePi = 0.15,
  prizePoolPi = 2150,
  onEnterStage1,
  className = '',
}) {
  // --- Normalize a stage object into the shape FunnelStageCard expects ---
  const shape = (obj, stage) => {
    const entrants =
      Number.isFinite(obj?.entrants) ? obj.entrants :
      Number.isFinite(obj?.entrantsCount) ? obj.entrantsCount :
      Number.isFinite(obj?.comp?.ticketsSold) ? obj.comp.ticketsSold : 0;

    const capacity =
      Number.isFinite(obj?.capacity) ? obj.capacity :
      Number.isFinite(obj?.comp?.totalTickets) ? obj.comp.totalTickets :
      (stage === 5 ? 25 : 25); // sane default

    const advancing =
      Number.isFinite(obj?.advancing) ? obj.advancing : (stage < 5 ? 5 : 1);

    const status = obj?.status || obj?.comp?.status || 'filling';
    const slug = obj?.slug || obj?.comp?.slug || '';

    // ensure numeric price
    const pricePi =
      typeof obj?.pricePi === 'number' ? obj.pricePi :
      typeof obj?.comp?.entryFee === 'number' ? obj.comp.entryFee :
      (stage === 1 ? entryFeePi : 0);

    const hasTicket = Boolean(obj?.hasTicket);

    return { entrants, capacity, advancing, status, slug, pricePi, hasTicket };
  };

  // --- Build the 5 stage objects either from `stages` array or s1..s5 ---
  const STAGES = useMemo(() => {
    if (Array.isArray(stages) && stages.length) {
      const byStage = new Map(
        stages
          .map((s) => ({ ...s, stage: Number(s?.stage) }))
          .filter((s) => Number.isFinite(s.stage) && s.stage >= 1 && s.stage <= 5)
          .map((s) => [s.stage, s])
      );
      return [1, 2, 3, 4, 5].map((n) => shape(byStage.get(n) || {}, n));
    }
    // fallback to s1..s5 props
    return [shape(s1, 1), shape(s2, 2), shape(s3, 3), shape(s4, 4), shape(s5, 5)];
  }, [stages, s1, s2, s3, s4, s5]);

  const S1 = STAGES[0];
  const S2 = STAGES[1];
  const S3 = STAGES[2];
  const S4 = STAGES[3];
  const S5 = STAGES[4];

  return (
    <section
      className={[
        'rounded-xl border border-cyan-500/40 bg-white/5 backdrop-blur-md p-4 shadow-[0_0_20px_rgba(0,255,213,0.15)]',
        className,
      ].join(' ')}
    >
      {/* Live Stages Window */}
      <div className="rounded-lg border border-cyan-500/20 bg-black/30 p-2">
        {/* Mobile: horizontal scroll with snap */}
        <div className="sm:hidden -mx-2 px-2">
          <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-thin scrollbar-thumb-cyan-500/40">
            <div className="min-w-[85%] snap-center">
              <FunnelStageCard micro stage={1} {...S1} pricePi={S1.pricePi} onEnter={onEnterStage1} />
            </div>
            <div className="min-w-[85%] snap-center">
              <FunnelStageCard micro stage={2} {...S2} pricePi={0} />
            </div>
            <div className="min-w-[85%] snap-center">
              <FunnelStageCard micro stage={3} {...S3} pricePi={0} />
            </div>
            <div className="min-w-[85%] snap-center">
              <FunnelStageCard micro stage={4} {...S4} pricePi={0} />
            </div>
            <div className="min-w-[85%] snap-center">
              <FunnelStageCard micro stage={5} {...S5} pricePi={0} />
            </div>
          </div>
        </div>

        {/* Desktop: compact grid */}
        <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-1.5">
          <FunnelStageCard micro stage={1} {...S1} pricePi={S1.pricePi} onEnter={onEnterStage1} />
          <FunnelStageCard micro stage={2} {...S2} pricePi={0} />
          <FunnelStageCard micro stage={3} {...S3} pricePi={0} />
          <FunnelStageCard micro stage={4} {...S4} pricePi={0} />
          <FunnelStageCard micro stage={5} {...S5} pricePi={0} />
        </div>
      </div>

      {/* Entry Button */}
      <div className="mt-4 mb-2 text-center">
        <div className="inline-block bg-gradient-to-r from-cyan-500/20 via-green-500/20 to-cyan-500/20 border border-cyan-400/50 rounded-xl px-6 py-4 shadow-[0_0_20px_rgba(0,255,255,0.15)] backdrop-blur-md">
          <Link
            href="/stages"
            className="block w-full px-6 py-2 rounded-lg font-bold font-orbitron bg-gradient-to-r from-cyan-300 to-cyan-500 text-black text-center hover:from-cyan-300 hover:to-green-300 transition-all shadow-[0_0_15px_rgba(0,255,180,0.6)] hover:shadow-[0_0_20px_rgba(0,255,180,0.9)] animate-pulse"
          >
            View Pi Stages Now
          </Link>
          <p className="mt-2 text-xs text-cyan-200 italic">
            Stage 1 is always open, join now and start your journey to Stage&nbsp;5
          </p>
        </div>
      </div>
    </section>
  );
}
