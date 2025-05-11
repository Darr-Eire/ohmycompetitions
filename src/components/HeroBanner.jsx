'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import FlipCountdownTimer from './FlipCountdownTimer';
import PrizePoolDisplay from './PrizePoolDisplay';
import PhaseStepper from './PhaseStepper';

const INITIAL_PRIZE = 25000;
const TICKET_PRICE = 3.14;
const ROLLOVER_INCREASE = 1.25;
const TICKET_ROLLOVER_PERCENT = 0.2;

const HeroBanner = () => {
  const [currentPhase, setCurrentPhase] = useState('pre-drop');
  const [nextTarget, setNextTarget] = useState(new Date());
  const [prizePool, setPrizePool] = useState(INITIAL_PRIZE);
  const [ticketsSold, setTicketsSold] = useState(0);
  const [phaseProgress, setPhaseProgress] = useState(0);

  const getMondayDropTime = () => {
    const now = new Date();
    const monday = new Date(now);
    monday.setUTCHours(15, 14, 0, 0);
    monday.setUTCDate(now.getUTCDate() - now.getUTCDay() + 1);
    if (now > monday) monday.setUTCDate(monday.getUTCDate() + 7);
    return monday;
  };

  const getFridayDrawTime = () => {
    const now = new Date();
    const friday = new Date(now);
    friday.setUTCHours(15, 14, 0, 0);
    friday.setUTCDate(now.getUTCDate() - now.getUTCDay() + 5);
    if (now > friday) friday.setUTCDate(friday.getUTCDate() + 7);
    return friday;
  };

  const updatePhaseAndCountdown = () => {
    const now = new Date();
    const mondayDrop = getMondayDropTime();
    const fridayDraw = getFridayDrawTime();
    const dropEnd = new Date(mondayDrop.getTime() + (31 * 60 + 4) * 60 * 1000);
    const claimEnd = new Date(fridayDraw.getTime() + (31 * 60 + 4) * 1000);

    let phase = 'pre-drop';
    let target = mondayDrop;
    let start = null;

    if (now < mondayDrop) {
      phase = 'pre-drop';
      target = mondayDrop;
      start = new Date(mondayDrop.getTime() - 1000 * 60 * 60 * 24); // 1 day prior
    } else if (now >= mondayDrop && now <= dropEnd) {
      phase = 'drop-active';
      target = dropEnd;
      start = mondayDrop;
    } else if (now > dropEnd && now < fridayDraw) {
      phase = 'waiting-draw';
      target = fridayDraw;
      start = dropEnd;
    } else if (now >= fridayDraw && now <= claimEnd) {
      phase = 'claim-window';
      target = claimEnd;
      start = fridayDraw;
    } else {
      phase = 'rollover';
      target = getMondayDropTime();
      start = claimEnd;
    }

    setCurrentPhase(phase);
    setNextTarget(target);

    // progress calculation
    const totalDuration = target - start;
    const elapsed = now - start;
    setPhaseProgress(Math.min(1, Math.max(0, elapsed / totalDuration)));
  };

  useEffect(() => {
    updatePhaseAndCountdown();
    const interval = setInterval(updatePhaseAndCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const pool = INITIAL_PRIZE + ticketsSold * TICKET_PRICE;
    setPrizePool(parseFloat(pool.toFixed(2)));
  }, [ticketsSold]);

  return (
    <section className="pt-8 pb-10 text-center max-w-6xl mx-auto px-4 bg-gradient-to-br from-[#0d1117] to-[#1c2230] rounded-lg shadow-2xl border border-blue-900">
      <p className="text-lg uppercase tracking-widest text-cyan-400 font-semibold mb-2">
        Pi Cash Code Challenge
      </p>

      <PrizePoolDisplay prizePool={prizePool} />

      <FlipCountdownTimer to={nextTarget} />

      <div className="text-white/90 mt-4 mb-6 text-base sm:text-lg italic">
        {currentPhase === 'pre-drop' && <p>Next code drop starts soon!</p>}
        {currentPhase === 'drop-active' && <p className="text-yellow-300 font-semibold">Code is live! Enter now to win the pot!</p>}
        {currentPhase === 'waiting-draw' && <p>Waiting for draw on <span className="text-blue-400 font-semibold">Friday at 3:14 PM UTC</span></p>}
        {currentPhase === 'claim-window' && <p className="text-green-400 font-semibold">Winner drawn! 31 minutes to claim the pot!</p>}
        {currentPhase === 'rollover' && <p className="text-purple-400 font-semibold">No claim — <span className="text-white">prize rolls over with +25%</span>!</p>}
      </div>

      <PhaseStepper currentPhase={currentPhase} phaseProgress={phaseProgress} />

      <div className="mt-6">
        <Link href="/ticket-purchase/pi-cash-code">
          <button className="comp-button w-full sm:w-auto px-8 py-3 rounded-full font-bold text-lg bg-gradient-to-r from-cyan-400 to-pink-500 text-black shadow-md hover:scale-105 transition-transform duration-200">
            {currentPhase === 'drop-active' ? 'Enter Now' : 'Get Ready'}
          </button>
        </Link>
      </div>
    </section>
  );
};

export default HeroBanner;
