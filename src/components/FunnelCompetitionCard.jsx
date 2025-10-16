// file: src/components/FunnelCompetitionCard.jsx
'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useSafeTranslation } from '../hooks/useSafeTranslation';

export default function FunnelCompetitionCard({
  title = 'Funnel Competition',
  detail = '',
  stage = 1,
  compId,
  entrants = 0,
  capacity = 25,
  advancing = 5,
  price = null,                       // string or number
  status,
  comingSoon = false,
  endsAt,
  tags = [],
  hasTicket = false,
  joinHref,
  onClickJoin,
  liveVideoUrl,
  ctaLabel,                           // ✅ allow override from parent
}) {
  const { t } = useSafeTranslation();

  // ✅ robust numeric coercion (handles strings)
  const capNum = Number(capacity);
  const entNum = Number(entrants);
  const safeCapacity = Number.isFinite(capNum) && capNum > 0 ? capNum : 25;
  const safeEntrants = Math.max(0, Number.isFinite(entNum) ? entNum : 0);

  const pct = Math.max(0, Math.min(100, Math.floor((safeEntrants / safeCapacity) * 100)));
  const spotsLeft = Math.max(0, safeCapacity - safeEntrants);

  const safeHref = useMemo(() => {
    const base = (joinHref || `/competitions/${compId || ''}`).replace(/\/+$/, '');
    return base || '/competitions';
  }, [joinHref, compId]);

  const derivedStatus = useMemo(() => {
    if (comingSoon) return 'coming-soon';
    if (status) return status;
    if (safeEntrants >= safeCapacity) return 'live';
    return 'filling';
  }, [status, comingSoon, safeEntrants, safeCapacity]);

  const canJoin =
    derivedStatus === 'filling' &&
    !comingSoon &&
    (stage === 1 || (stage > 1 && hasTicket));

  // ✅ compute label but let caller override via prop
  const computedCta = (() => {
    if (comingSoon) return t('coming_soon', 'Coming Soon');
    if (derivedStatus === 'ended') return t('completed', 'Completed');
    if (derivedStatus === 'live') return t('in_progress', 'In Progress');
    if (stage > 1 && !hasTicket) return t('qualified_only', 'Qualified Only');
    // Use i18next {{var}} OR parent can pass template string via ctaLabel
    return t('enter_spots_left', 'Enter — {{spots}} left', { spots: spotsLeft });
  })();
  const finalCta = ctaLabel || computedCta;

  const endsAtLabel = useMemo(() => {
    if (!endsAt) return null;
    const d = new Date(endsAt);
    return isNaN(d.getTime()) ? null : d.toLocaleString();
  }, [endsAt]);

  // ✅ price: treat 0 as Free
  const normalizedPrice = (() => {
    if (typeof price === 'number') return price > 0 ? `${price.toFixed(2)} π` : t('free', 'Free');
    if (typeof price === 'string' && price.trim().length) {
      const n = Number(price);
      if (Number.isFinite(n)) return n > 0 ? `${n.toFixed(2)} π` : t('free', 'Free');
      return price.trim();
    }
    return t('free', 'Free');
  })();

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-[#0b1220] border border-white/10 shadow-xl hover:shadow-2xl transition-all">
      {/* Dynamic Background */}
      <div className="relative h-40 w-full overflow-hidden">
        {derivedStatus === 'live' ? (
          <>
            {liveVideoUrl ? (
              <video
                className="absolute inset-0 h-full w-full object-cover"
                src={liveVideoUrl}
                autoPlay
                loop
                muted
                playsInline
              />
            ) : (
              <div
                className={`absolute inset-0 bg-gradient-to-r ${stageGradient(stage)} bg-[length:200%_200%]`}
                style={{ animation: 'omcGradient 10s ease infinite' }}
              />
            )}
            {derivedStatus === 'live' && (
              <div className="absolute top-3 right-3 z-20">
                <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-2 py-[2px] text-[10px] font-bold text-white shadow-lg animate-pulse">
                  <span className="h-[6px] w-[6px] rounded-full bg-white" />
                  {t('live', 'LIVE')}
                </span>
              </div>
            )}

            <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />
            {stage === 5 && (
              <div className="absolute inset-0">
                <div className="absolute -inset-12 m-auto h-[200%] w-[200%] rounded-full border-2 border-yellow-300/30 blur-md animate-ping" />
              </div>
            )}
          </>
        ) : (
          <div
            className={`absolute inset-0 bg-gradient-to-r ${stageGradient(stage)} opacity-90`}
            style={{ animation: 'omcShimmer 6s ease-in-out infinite' }}
          />
        )}
        <div className="absolute inset-0 bg-[radial-gradient(transparent,rgba(0,0,0,0.35))]" />

        {/* Top-left badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge tone={badgeTone(derivedStatus)}>{statusText(derivedStatus, t)}</Badge>
          <Badge>{t('stage', 'Stage')} {stage}</Badge>
        </div>
        {tags?.length > 0 && (
          <div className="absolute top-3 right-3 hidden sm:flex gap-2">
            {tags.slice(0, 3).map((tItem, i) => (
              <Badge key={i} tone="muted">{tItem}</Badge>
            ))}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 sm:p-5">
        <h3 className="font-semibold text-white text-lg sm:text-xl leading-snug">
          {title}
        </h3>

        {detail && (
          <p className="mt-1 text-sm text-white/70 leading-snug">
            {detail}
          </p>
        )}

        <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
          <Stat label={t('players', 'Players')} value={`${safeEntrants}/${safeCapacity}`} />
          <Stat label={t('advance', 'Advance')} value={`${t('top', 'Top')} ${advancing}`} />
          <Stat label={t('entry_price', 'Entry Price')} value={normalizedPrice} />
        </div>

        {/* Progress */}
        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between text-xs text-white/70">
            <span>{t('filling_to', 'Filling to')} {safeCapacity}</span>
            <span>{pct}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-cyan-400 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-xs text-white/60">
            {endsAtLabel ? (
              <span>
                {t('ends', 'Ends')}:&nbsp;<time dateTime={endsAt}>{endsAtLabel}</time>
              </span>
            ) : (
              <span>{t('always_on_funnel', 'Always-on funnel')}</span>
            )}
          </div>

          {canJoin ? (
            onClickJoin ? (
              <button
                onClick={onClickJoin}
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold bg-cyan-400 text-black hover:brightness-110 active:translate-y-[1px] transition-all"
              >
                {finalCta}
                {normalizedPrice && <span className="text-xs font-normal text-black/80">{normalizedPrice}</span>}
              </button>
            ) : (
              <Link
                href={safeHref}
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold bg-cyan-400 text-black hover:brightness-110 active:translate-y-[1px] transition-all"
              >
                {finalCta}
                {normalizedPrice && <span className="text-xs font-normal text-black/80">{normalizedPrice}</span>}
              </Link>
            )
          ) : (
            <span className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold bg-white/10 text-white/70">
              {finalCta}
              {normalizedPrice && <span className="text-xs font-normal text-white/60">{normalizedPrice}</span>}
            </span>
          )}
        </div>

        {/* Stage note */}
        <div className="mt-3 text-xs text-white/70">
          {stage === 1 ? (
            <span>{t('stage_1_open_entry', 'Stage 1 is open entry. Finish top {{adv}} to advance.', { adv: advancing })}</span>
          ) : hasTicket ? (
            <span>{t('hold_ticket_stage', 'You hold a ticket for Stage {{st}}. Finish top {{adv}} to advance.', { st: stage, adv: advancing })}</span>
          ) : (
            <span>{t('invite_only_stage', 'Invite-only: you need a Stage {{st}} ticket to enter.', { st: stage })}</span>
          )}
        </div>
      </div>
    </div>
  );
}

/* helpers */
function Badge({ children, tone = 'default' }) {
  const tones = {
    default: 'bg-white/10 text-white',
    muted: 'bg-white/10 text-white/80',
    live: 'bg-emerald-400 text-black',
    warn: 'bg-amber-400 text-black',
    danger: 'bg-rose-500 text-white',
    info: 'bg-cyan-400 text-black',
  }[tone] || 'bg-white/10 text-white';
  return (
    <span className={`rounded-full px-2 py-1 text-[10px] tracking-wide font-bold ${tones}`}>
      {children}
    </span>
  );
}

function badgeTone(status) {
  switch (status) {
    case 'coming-soon': return 'muted';
    case 'filling':     return 'info';
    case 'live':        return 'live';
    case 'ended':       return 'danger';
    default:            return 'default';
  }
}

function statusText(status, t) {
  switch (status) {
    case 'coming-soon': return t('coming_soon', 'COMING SOON');
    case 'filling':     return t('filling', 'FILLING');
    case 'live':        return t('live', 'LIVE');
    case 'ended':       return t('ended', 'ENDED');
    default:            return t('active', 'ACTIVE');
  }
}

function Stat({ label, value }) {
  return (
    <div className="rounded-lg bg-white/5 p-2 text-center">
      <div className="text-base text-white font-semibold leading-tight">{value}</div>
      <div className="mt-0.5 text-[11px] text-white/60">{label}</div>
    </div>
  );
}

const STAGE_GRADIENTS = {
  1: 'from-cyan-500 via-sky-500 to-indigo-500',
  2: 'from-indigo-500 via-violet-500 to-fuchsia-500',
  3: 'from-fuchsia-500 via-pink-500 to-rose-500',
  4: 'from-amber-400 via-orange-500 to-rose-500',
  5: 'from-yellow-400 via-amber-500 to-orange-500',
};

function stageGradient(stage) {
  return STAGE_GRADIENTS[stage] || STAGE_GRADIENTS[1];
}
