// file: src/components/FunnelStagesRow.jsx
'use client';

import React from 'react';
import FunnelStageCard from '@components/FunnelStageCard';

export default function FunnelStagesRow({
  s1 = {},
  s2 = {},
  s3 = {},
  s4 = {},
  s5 = {},
  entryFeePi = 0.15,
  prizePoolPi = 2150,
  onEnterStage1,
  className = '',
}) {
  const shape = (obj, stage) => {
    const entrants =
      Number.isFinite(obj?.entrants) ? obj.entrants :
      Number.isFinite(obj?.entrantsCount) ? obj.entrantsCount :
      Number.isFinite(obj?.comp?.ticketsSold) ? obj.comp.ticketsSold : 0;

    const capacity =
      Number.isFinite(obj?.capacity) ? obj.capacity :
      Number.isFinite(obj?.comp?.totalTickets) ? obj.comp.totalTickets :
      (stage === 5 ? 25 : 25);

    const advancing =
      Number.isFinite(obj?.advancing) ? obj.advancing : (stage < 5 ? 5 : 1);

    const status = obj?.status || obj?.comp?.status || 'filling';
    const slug = obj?.slug || obj?.comp?.slug || '';
    const pricePi =
      typeof obj?.pricePi === 'number' ? obj.pricePi :
      typeof obj?.comp?.entryFee === 'number' ? obj.comp.entryFee :
      entryFeePi;

    const hasTicket = Boolean(obj?.hasTicket);

    return { entrants, capacity, advancing, status, slug, pricePi, hasTicket };
  };

  const S1 = shape(s1, 1);
  const S2 = shape(s2, 2);
  const S3 = shape(s3, 3);
  const S4 = shape(s4, 4);
  const S5 = shape(s5, 5);

  const handleEnterStage1 = () => {
    if (typeof onEnterStage1 === 'function') onEnterStage1();
  };

  const fmt = (n) => Number(n || 0).toLocaleString();

  // Inline LIVE badge helper
  const stageTitle = (label, status) => (
    <>
      {label}
      {status === 'live' && (
        <span className="ml-1 rounded-full bg-red-600 px-1.5 py-[1px] text-[9px] font-bold text-white align-middle animate-pulse">
          LIVE
        </span>
      )}
    </>
  );

  return (
    <section
      className={[
        'mt-3 rounded-xl border border-cyan-500/20 bg-white/5 backdrop-blur-md',
        'shadow-[0_0_16px_rgba(0,255,213,0.12)] px-2 py-2 sm:px-3 sm:py-3',
        className,
      ].join(' ')}
      aria-label="Competition funnel stages"
    >
      {/* Row 1: Stage 1 + Stage 2 */}
      <div className="grid grid-cols-2 gap-1.5">
        <FunnelStageCard
          micro
          stage={1}
          title={stageTitle('Stage 1 Qualifier', S1.status)}
          entrants={S1.entrants}
          capacity={S1.capacity}
          advancing={S1.advancing}
          status={S1.status}
          pricePi={S1.pricePi}
          compSlug={S1.slug}
          onEnter={handleEnterStage1}
        />
        <FunnelStageCard
          micro
          stage={2}
          title={stageTitle('Stage 2', S2.status)}
          entrants={S2.entrants}
          capacity={S2.capacity}
          advancing={S2.advancing}
          status={S2.status}
          hasTicket={S2.hasTicket}
          compSlug={S2.slug}
          pricePi="Free"
        />
      </div>

      {/* Row 2: Stage 3 + Stage 4 */}
      <div className="grid grid-cols-2 gap-1.5">
        <FunnelStageCard
          micro
          stage={3}
          title={stageTitle('Stage 3', S3.status)}
          entrants={S3.entrants}
          capacity={S3.capacity}
          advancing={S3.advancing}
          status={S3.status}
          hasTicket={S3.hasTicket}
          compSlug={S3.slug}
          pricePi="Free"
        />
        <FunnelStageCard
          micro
          stage={4}
          title={stageTitle('Stage 4', S4.status)}
          entrants={S4.entrants}
          capacity={S4.capacity}
          advancing={S4.advancing}
          status={S4.status}
          hasTicket={S4.hasTicket}
          compSlug={S4.slug}
          pricePi="Free"
        />
      </div>

      {/* Row 3: Stage 5 full width */}
      <div>
        <FunnelStageCard
          micro
          stage={5}
          title={stageTitle('Stage 5', S5.status)}
          entrants={S5.entrants}
          capacity={S5.capacity}
          advancing={S5.advancing}
          status={S5.status}
          hasTicket={S5.hasTicket}
          compSlug={S5.slug}
          pricePi="Free"
        />
      </div>

      {/* Divider */}
      <div className="border-t border-cyan-500/20 my-1" />

      {/* Prize Pool */}
      <div>
        <div className="flex flex-col items-center justify-center text-center">
          <h3 className="text-cyan-300 font-semibold text-xs sm:text-sm">
            Final Prize Pool
          </h3>
          <span className="mt-1 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2 py-[2px] text-[10px] text-cyan-200">
            Stage 5
          </span>
        </div>

        <div className="mt-2 text-center">
          <div className="text-lg font-bold text-white">
            {fmt(prizePoolPi)} π
          </div>
          <div className="text-[10px] text-cyan-200/80">
            Distributed among finalists
          </div>
        </div>

        {/* Prize Breakdown */}
        <div className="mt-3 grid grid-cols-2 gap-1 text-[10px] sm:text-[11px] text-cyan-200">
          <div className="bg-yellow-400/20 border border-yellow-400/40 rounded px-1 py-[2px]">
            🥇 1st: <span className="text-white font-semibold">1,000 π</span>
          </div>
          <div className="bg-gray-300/20 border border-gray-300/40 rounded px-1 py-[2px]">
            🥈 2nd: <span className="text-white font-semibold">500 π</span>
          </div>
          <div className="bg-orange-400/20 border border-orange-400/40 rounded px-1 py-[2px]">
            🥉 3rd: <span className="text-white font-semibold">250 π</span>
          </div>
          <div>🏅 4th: <span className="text-white font-semibold">100 π</span></div>
          <div>🎖 5th: <span className="text-white font-semibold">50 π</span></div>
          <div>🏆 6–10: <span className="text-white font-semibold">20 π</span></div>
          <div>💠 11–25: <span className="text-white font-semibold">10 π</span></div>
        </div>
      </div>

      {/* Final note */}
      <div className="rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-2 py-1.5 text-[11px] text-cyan-300 text-center">
        All players who make it to <span className="font-semibold text-white">Stage 5</span> win a Pi prize
      </div>
    </section>
  );
}
