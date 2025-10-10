// file: src/components/FunnelCompetitionMiniCard.jsx
'use client';

import Image from 'next/image';

export default function FunnelCompetitionMiniCard({
  title = 'Funnel — Stage 1',
  stage = 1,
  status = 'filling',
  imageUrl = '/pi.jpeg',
  entrants = 0,
  capacity = 25,
  tags = [],
  onClickJoin,
}) {
  const spotsLeft = Math.max(0, capacity - entrants);
  const isLive = status === 'live';

  return (
    <div className="relative rounded-xl border border-white/10 bg-white/5 text-white overflow-hidden">
      {/* LIVE ribbon */}
      {isLive && (
        <div className="pointer-events-none absolute -top-3 -right-12 z-20 w-48 rotate-45">
          <div className="bg-red-600 text-white text-xs font-extrabold tracking-widest text-center py-1 shadow-lg animate-pulse">
            LIVE
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
            Stage {stage}
          </span>
        </div>
        {/* Top-right tags */}
        {tags?.length > 0 && (
          <div className="absolute top-2 right-2 hidden sm:flex gap-2">
            {tags.slice(0, 2).map((t, i) => (
              <span
                key={i}
                className="rounded-full bg-white/10 px-2 py-[2px] text-[10px] border border-white/10"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold">{title}</div>
          <span
            className={[
              'text-[9px] font-bold px-2 py-[2px] rounded-full border border-black/10',
              isLive
                ? 'bg-emerald-400 text-black'
                : status === 'filling'
                ? 'bg-cyan-400 text-black'
                : 'bg-white/10 text-white/80',
            ].join(' ')}
          >
            {status.toUpperCase()}
          </span>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <div className="text-[11px] text-white/70">
            {entrants}/{capacity} entrants
          </div>
          <div className="text-[11px] text-white/60">
            {status === 'filling' ? `${spotsLeft} left` : '—'}
          </div>
        </div>

        <div className="mt-3">
          {onClickJoin ? (
            <button
              onClick={onClickJoin}
              className="w-full rounded-lg bg-cyan-400 text-black text-sm font-semibold px-3 py-1.5 hover:brightness-110 active:translate-y-[1px]"
            >
              {status === 'filling' ? 'Join' : 'View'}
            </button>
          ) : (
            <div className="w-full rounded-lg bg-white/10 text-white/60 text-center text-sm px-3 py-1.5">
              {status === 'filling' ? 'Join soon' : 'Locked'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
