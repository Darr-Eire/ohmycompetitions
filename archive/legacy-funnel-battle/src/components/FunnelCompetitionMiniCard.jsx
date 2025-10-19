// file: src/components/FunnelCompetitionMiniCard.jsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';
import { useSafeTranslation } from '../hooks/useSafeTranslation';

export default function FunnelCompetitionMiniCard({
  title = 'Funnel — Stage 1',
  stage = 1,
  status = 'filling',          // 'filling' | 'live' | 'ended' | 'coming-soon'
  imageUrl = '/pi.jpeg',
  entrants = 0,
  capacity = 25,
  tags = [],
  price = null,                // number | string | null
  joinHref,                    // optional href to go join/view
  onClickJoin,                 // optional click handler
}) {
  const { t } = useSafeTranslation();

  // Robust numbers
  const capNum = Number(capacity);
  const entNum = Number(entrants);
  const safeCapacity = Number.isFinite(capNum) && capNum > 0 ? capNum : 25;
  const safeEntrants = Math.max(0, Number.isFinite(entNum) ? entNum : 0);

  const isLive = status === 'live';
  const isFilling = status === 'filling';
  const spotsLeft = Math.max(0, safeCapacity - safeEntrants);

  const normalizedPrice = useMemo(() => {
    if (typeof price === 'number') return price > 0 ? `${price.toFixed(2)} π` : t('free', 'Free');
    if (typeof price === 'string' && price.trim()) {
      const n = Number(price);
      if (Number.isFinite(n)) return n > 0 ? `${n.toFixed(2)} π` : t('free', 'Free');
      return price.trim();
    }
    return t('free', 'Free');
  }, [price, t]);

  const showPriceOnCta =
    normalizedPrice &&
    normalizedPrice.toLowerCase() !== t('free', 'Free').toLowerCase();

  const ctaLabel = isFilling ? t('enter_now', 'Enter Now') : t('view_detail', 'View Detail');

  const statusTone =
    isLive ? 'bg-emerald-400 text-black'
           : isFilling ? 'bg-cyan-400 text-black'
           : 'bg-white/10 text-white/80';

  const BtnInner = (
    <>
      {ctaLabel}
      {showPriceOnCta && (
        <span className="ml-2 text-xs font-normal opacity-90">
          {normalizedPrice}
        </span>
      )}
    </>
  );

  return (
    <div className="relative rounded-xl border border-white/10 bg-white/5 text-white overflow-hidden">
      {/* LIVE ribbon */}
      {isLive && (
        <div className="pointer-events-none absolute -top-3 -right-12 z-20 w-48 rotate-45">
          <div className="bg-red-600 text-white text-xs font-extrabold tracking-widest text-center py-1 shadow-lg animate-pulse">
            {t('live', 'LIVE')}
          </div>
        </div>
      )}

      {/* Media / background */}
      <div className="relative h-28 w-full overflow-hidden">
        <Image src={imageUrl} alt={title} fill className="object-cover" />
        <div className="absolute inset-0 bg-black/30" />

        {/* Top-left badges */}
        <div className="absolute top-2 left-2 flex gap-2">
          <span className="rounded-full bg-white/10 px-2 py-[2px] text-[10px] border border-white/10">
            {status.toUpperCase()}
          </span>
          <span className="rounded-full bg-white/10 px-2 py-[2px] text-[10px] border border-white/10">
            {t('stage', 'Stage')} {stage}
          </span>
        </div>

        {/* Top-right tags */}
        {tags?.length > 0 && (
          <div className="absolute top-2 right-2 hidden sm:flex gap-2">
            {tags.slice(0, 2).map((tag, i) => (
              <span
                key={i}
                className="rounded-full bg-white/10 px-2 py-[2px] text-[10px] border border-white/10"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold">{title}</div>
          <span className={`text-[9px] font-bold px-2 py-[2px] rounded-full border border-black/10 ${statusTone}`}>
            {status.toUpperCase()}
          </span>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <div className="text-[11px] text-white/70">
            {safeEntrants}/{safeCapacity} {t('players', 'Players')}
          </div>
          <div className="text-[11px] text-white/60">
            {isFilling ? `${spotsLeft} ${t('left', 'left')}` : '—'}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-3">
          {onClickJoin ? (
            <button
              onClick={onClickJoin}
              className="w-full rounded-lg bg-cyan-400 text-black text-sm font-semibold px-3 py-1.5 hover:brightness-110 active:translate-y-[1px]"
            >
              {BtnInner}
            </button>
          ) : joinHref ? (
            <Link
              href={joinHref}
              className="block w-full text-center rounded-lg bg-cyan-400 text-black text-sm font-semibold px-3 py-1.5 hover:brightness-110 active:translate-y-[1px]"
            >
              {BtnInner}
            </Link>
          ) : (
            <div className="w-full rounded-lg bg-white/10 text-white/60 text-center text-sm px-3 py-1.5">
              {isFilling ? t('coming_soon', 'Coming Soon') : t('closed', 'Closed')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
