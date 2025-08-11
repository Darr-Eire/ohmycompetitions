'use client';
import Link from 'next/link';

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

  const fmt = (n) => Number(n || 0).toLocaleString();

// Inline LIVE badge helper
const stageTitle = (label, status) => (
  <>
    {label}
    {status === 'live' && (
      <span className="ml-1 rounded-full bg-green-600 px-1.5 py-[1px] text-[9px] font-bold text-white align-middle animate-pulse">
        LIVE
      </span>
    )}
  </>
);


  return (
    <section
      className={[
        'rounded-xl border border-cyan-500/40 bg-white/5 backdrop-blur-md p-4 shadow-[0_0_20px_rgba(0,255,213,0.15)]',
        className,
      ].join(' ')}
    >
      {/* Entry Button */}
<div className="mb-4 text-center">
  <div className="inline-block bg-gradient-to-r from-cyan-500/20 via-green-500/20 to-cyan-500/20 border border-cyan-400/50 rounded-xl px-6 py-4 shadow-[0_0_20px_rgba(0,255,255,0.15)] backdrop-blur-md">
    
    {/* Button linking to Pi Stages */}
    <Link
      href="/battles" // <-- Pi Stages page
      className="block w-full px-6 py-2 rounded-lg font-bold font-orbitron bg-gradient-to-r from-cyan-400 to-green-400 text-black text-center hover:from-cyan-300 hover:to-green-300 transition-all shadow-[0_0_15px_rgba(0,255,180,0.6)] hover:shadow-[0_0_20px_rgba(0,255,180,0.9)] animate-pulse"
    >
      View Pi Stages Now
    </Link>

    {/* Supporting message */}
    <p className="mt-2 text-xs text-cyan-200 italic">
      Stage 1 is always open join now and start your journey to Stage&nbsp;5
    </p>
  </div>
</div>



      {/* Live Stages Window */}
      <div className="rounded-lg border border-cyan-500/20 bg-black/30 p-2">
        <div className="grid grid-cols-2 gap-1.5 mb-1.5">
          <FunnelStageCard micro stage={1} title={stageTitle('Stage 1 Qualifier', S1.status)} {...S1} />
          <FunnelStageCard micro stage={2} title={stageTitle('Stage 2', S2.status)} {...S2} pricePi="Free" />
        </div>
        <div className="grid grid-cols-2 gap-1.5 mb-1.5">
          <FunnelStageCard micro stage={3} title={stageTitle('Stage 3', S3.status)} {...S3} pricePi="Free" />
          <FunnelStageCard micro stage={4} title={stageTitle('Stage 4', S4.status)} {...S4} pricePi="Free" />
        </div>
        <div>
          <FunnelStageCard micro stage={5} title={stageTitle('Stage 5', S5.status)} {...S5} pricePi="Free" />
        </div>
      </div>

      {/* Prize Pool Info */}
      <div className="mt-4 text-center">
        <h3 className="text-cyan-300 font-semibold text-sm">Final Prize Pool</h3>
        <div className="text-lg font-bold text-white">{fmt(prizePoolPi)} π</div>
        <div className="text-[10px] text-cyan-200/80">Distributed among finalists</div>
      </div>
    </section>
  );
}
