'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useSafeTranslation } from 'hooks/useSafeTranslation';
export default function InfoPopover({ align = 'left', size = 'md', className = '' }) {
  const { t } = useSafeTranslation();
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const popRef = useRef(null);

  useEffect(() => {
    const onKey = e => e.key === 'Escape' && setOpen(false);
    const onClick = e => {
      if (!open) return;
      if (!popRef.current || !btnRef.current) return;
      if (!popRef.current.contains(e.target) && !btnRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  const width = size === 'lg' ? 'w-[300px]' : size === 'sm' ? 'w-[220px]' : 'w-[260px]';
  const side = align === 'left' ? 'right-0' : 'left-0';
  const caretSide = align === 'left' ? 'right-3' : 'left-3';

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        ref={btnRef}
        aria-label={t('what_is_xp', 'What is XP?')}
        onClick={() => setOpen(v => !v)}
        className="inline-flex items-center justify-center w-6 h-6 rounded-full
                   bg-white/10 text-white/80 border border-white/10 hover:bg-white/15
                   focus:outline-none focus:ring-2 focus:ring-cyan-400"
      >
        ?
      </button>

      {open && (
        <div ref={popRef} role="dialog" aria-modal="false" className={`absolute z-40 mt-2 ${side}`}>
          <div className={`relative ${width} rounded-xl border border-white/10 bg-[#0b1220] backdrop-blur p-4 text-sm text-white/80 shadow-xl`}>
            {/* caret */}
            <div className={`absolute -top-1 ${caretSide} w-3 h-3 rotate-45 bg-[#0b1220] border-t border-l border-white/10`} />
            <div className="text-white font-semibold">{t('xp_levels', 'XP & Levels')}</div>
            <p className="mt-1 text-white/70">
              {t('xp_description', 'XP measures your activity in OMC Stages. Earn XP to level up and unlock perks.')}
            </p>

           <div className="mt-3 text-white/80">
              <div className="text-[12px] uppercase tracking-wide text-white/50">{t('use_xp_for', 'Use XP for')}</div>
              <ul className="mt-1 list-disc list-inside space-y-1">
                <li>{t('tickets_for_competitions', 'Tickets for competitions')}</li>
                <li>{t('omc_stages_entry_tickets', 'OMC Stages entry tickets')}</li>
                <li>{t('limited_exclusive_competitions', 'Limited entry competitions, exclusive competitions')}</li>
              </ul>
              <div className="mt-1 text-[11px] text-white/50">{t('more_xp_rewards_coming', 'More XP rewards & perks coming soon.')}</div>
    </div>
            <button onClick={() => setOpen(false)} className="mt-3 w-full rounded-lg bg-cyan-400 text-black font-bold py-2">
              {t('got_it', 'Got it')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
