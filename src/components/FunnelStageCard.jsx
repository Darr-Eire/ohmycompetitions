'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';

export default function FunnelStageCard({
  stage = 1,
  title = '',
  entrants = 0,
  capacity = 25,
  advancing = 5,
  status = 'filling',
  pricePi = 0.15,   // numeric for stage 1, omit for others
  hasTicket = false,
  compSlug = '',
  onEnter,          // kept, but we show “coming soon” modal instead of calling it
  small = false,
  micro = false,
  rtl = undefined,
}) {
  const warnedRef = useRef(false);
  const [showComingSoon, setShowComingSoon] = useState(false);

  function coercePrice(input) {
    if (input == null) return { num: 0, label: 'Free' };
    if (typeof input === 'number') {
      const num = Math.max(0, input);
      return { num, label: num > 0 ? `${num.toFixed(2)} π` : 'Free' };
    }
    if (typeof input === 'string') {
      const raw = input.trim();
      if (/^free(?:\s+ticket)?$/i.test(raw)) return { num: 0, label: 'Free' };
      const cleaned = raw.replace(/[^\d.,-]/g, '').replace(',', '.');
      const num = Number(cleaned);
      if (Number.isFinite(num)) {
        const n = Math.max(0, num);
        return { num: n, label: n > 0 ? `${n.toFixed(2)} π` : 'Free' };
      }
      if (!warnedRef.current) {
        console.warn(
          '[FunnelStageCard] Non-numeric price string received:',
          input,
          '— treating as Free. Pass a number (e.g. pricePi={0.15}) or omit the prop.'
        );
        warnedRef.current = true;
      }
      return { num: 0, label: 'Free' };
    }
    return { num: 0, label: 'Free' };
  }

  const { num: priceNum, label: priceLabel } = coercePrice(pricePi);

  const safeCapacity = Math.max(1, Number(capacity) || 1);
  const safeEntrants = Math.max(0, Number(entrants) || 0);
  const pct = Math.min(100, Math.floor((safeEntrants / safeCapacity) * 100));
  const spotsLeft = Math.max(0, safeCapacity - safeEntrants);

  // only S1 joinable unless you pass hasTicket for later stages
  const canJoin = status === 'filling' && (stage === 1 || (stage > 1 && hasTicket));

  const ctaLabel = (() => {
    if (status === 'coming-soon') return 'Coming Soon';
    if (status === 'ended') return 'Completed';
    if (status === 'live') return 'In Progress';
    if (stage > 1 && !hasTicket) return 'Qualified Only';
    return `Enter • ${spotsLeft} left`;
  })();

  const isMicro = !!micro;
  const isSmall = !isMicro && !!small;

  const pad = isMicro ? 'p-1.5' : isSmall ? 'p-2' : 'p-4';
  const titleSize = isMicro ? 'text-[11px]' : isSmall ? 'text-sm' : 'text-base';
  const textSize = isMicro ? 'text-[10px]' : isSmall ? 'text-xs' : 'text-sm';
  const headerH = isMicro ? 'h-10' : isSmall ? 'h-14' : 'h-20';
  const barH = isMicro ? 'h-[5px]' : isSmall ? 'h-1' : 'h-1.5';
  const btnPad = isMicro ? 'px-2 py-1' : isSmall ? 'px-2.5 py-1.5' : 'px-3 py-2';
  const btnText = isMicro ? 'text-[10px]' : isSmall ? 'text-xs' : 'text-sm';

  const isFinals = stage === 5;
  const useRTL = typeof rtl === 'boolean' ? rtl : isFinals;

  // click handler: show "coming soon" popup (and a tiny haptic if available)
  const handleEnterClick = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(12);
    setShowComingSoon(true);
  };

  return (
    <>
      <div
        dir={useRTL ? 'rtl' : 'ltr'}
        className={`group relative rounded-xl bg-[#0b1220] shadow-lg overflow-hidden ${pad}
        ${useRTL ? 'text-right border-cyan-400' : 'text-left border-white/10'} border`}
      >
        {/* Header strip */}
        <div className={`relative w-full ${headerH} rounded-md bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500 shadow-md`}>
          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.05),transparent)]" />
          <div className={`absolute top-1 ${useRTL ? 'right-1' : 'left-1'} rounded-full bg-gradient-to-r from-cyan-300 to-sky-400 text-[#021017] font-bold ${textSize} px-2 py-[2px] shadow-sm`}>
            Stage {stage}
          </div>
          <div className={`absolute top-1 ${useRTL ? 'left-1' : 'right-1'} rounded-full bg-gradient-to-r from-indigo-300 to-sky-400 text-[#021017] font-extrabold tracking-wide ${isMicro ? 'text-[9px]' : 'text-[10px]'} px-2 py-[2px] shadow-sm`}>
            {status.toUpperCase()}
          </div>
        </div>

        {/* Body */}
        <div className={`${isMicro ? 'pt-1.5' : isSmall ? 'pt-2' : 'pt-3'}`}>
          <h3 className={`font-semibold text-white ${titleSize} truncate ${useRTL ? 'text-right' : 'text-center'}`} title={title}>
            {title}
          </h3>

          <div className={`mt-1 grid grid-cols-3 gap-1 ${textSize} text-white/80`}>
            {/* Players */}
            <div className="rounded bg-white/5 px-1 py-[2px] text-center leading-tight">
              Players
              <br />
              <span className="font-semibold text-white">
                {safeEntrants}/{safeCapacity}
              </span>
            </div>

            {/* Advance / Winners */}
            <div className="rounded bg-white/5 px-1 py-[2px] text-center leading-tight">
              {stage === 5 ? 'Winners' : 'Advance'}
              <br />
              <span className="font-semibold text-white">
                {stage === 5 ? '25' : `Top ${advancing}`}
              </span>
            </div>

            {/* Entry */}
            <div className="rounded bg-white/5 px-1 py-[2px] text-center leading-tight">
              Entry
              <br />
              <span className="font-semibold text-white">
                {stage > 1 ? 'Ticket' : priceLabel}
              </span>
            </div>
          </div>

          {/* Progress */}
          <div className={`${isMicro ? 'mt-1.5' : 'mt-2'}`}>
            <div className={`flex justify-between text-white/60 ${isMicro ? 'text-[9px]' : textSize} mb-1`} dir="ltr">
              <span>Filling</span>
              <span>{pct}%</span>
            </div>
            <div className={`w-full ${barH} bg-white/10 rounded-full overflow-hidden`} dir="ltr">
              <div className="h-full bg-cyan-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>

          {/* CTA */}
          <div className={`${isMicro ? 'mt-1.5' : 'mt-2'} flex items-center justify-between`}>
            <div className={`text-white/60 ${isMicro ? 'text-[9px]' : textSize}`}>
              {stage === 1 ? `${spotsLeft} left` : hasTicket ? 'Qualified' : 'Locked'}
            </div>

            {canJoin ? (
              // Always show “Coming Soon” popup on click:
              <button
                onClick={handleEnterClick}
                type="button"
                className={`
                  rounded-lg font-semibold ${btnPad} ${btnText}
                  text-black
                  bg-gradient-to-r from-[#00ffd5] to-[#0077ff]
                  hover:brightness-110 active:translate-y-[1px]
                  shadow-sm
                `}
                aria-label="Enter Now"
              >
                Enter Now
              </button>
            ) : (
              <span className={`rounded-lg bg-white/10 text-white/70 font-semibold ${btnPad} ${btnText}`}>
                {ctaLabel}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Coming Soon Modal */}
      {showComingSoon && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Coming Soon"
          onClick={() => setShowComingSoon(false)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-cyan-400 bg-[#101426] text-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-cyan-900/50 flex items-center justify-between">
              <h4 className="text-lg font-bold text-cyan-300">Coming Soon</h4>
              <button
                onClick={() => setShowComingSoon(false)}
                className="text-cyan-200 hover:text-white text-sm"
                type="button"
              >
                Close
              </button>
            </div>

            <div className="p-4 space-y-2">
              <p className="text-white/90">We’re still creating the magic ✨</p>
              <p className="text-white/70 text-sm">Stay tuned — it’s almost ready!</p>
            </div>

            <div className="px-4 pb-4">
              <button
                onClick={() => setShowComingSoon(false)}
                className="w-full py-2 rounded-md font-bold text-black bg-gradient-to-r from-[#00ffd5] to-[#0077ff] hover:brightness-110"
                type="button"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
