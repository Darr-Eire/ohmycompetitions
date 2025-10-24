// file: src/components/CompetitionCard.js
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import { usePiAuth } from 'context/PiAuthContext';
import { useSafeTranslation } from '../hooks/useSafeTranslation';
import '@fontsource/orbitron';

const WIDTH = {
  fluid: 'w-full max-w-[440px]',
  sm: 'min-w-[240px] sm:min-w-[260px] max-w-[360px]',
  md: 'min-w-[280px] sm:min-w-[320px] max-w-[420px]',
  lg: 'min-w-[320px] sm:min-w-[360px] max-w-[440px]',
};

export default function CompetitionCard({
  comp = {},
  data,
  competition,
  item,
  size = 'md',
  className = '',
  hideButton = false,
  disableGift = false,
}) {
  const { t } = useSafeTranslation();
  const { user } = usePiAuth();
  const c = comp ?? data ?? competition ?? item ?? {};

  /* ---------- normalized props ---------- */
  const headerTitle = c.title || t('exclusive_draw', 'Exclusive Draw');
  const prize = c.prize ?? c.prizeLabel ?? '';
  const entryFee = c.pricePi ?? c.entryFeePi ?? c.feePi ?? c.entryFee ?? 0;

  const img = useMemo(() => {
    const src = (c.imageUrl || '/pi.jpeg')
      .replace(/\\/g, '/')
      .replace(/^(?!\/|https?:\/\/)/, '/');
    const external = /^https?:\/\//i.test(src);
    return { src, external };
  }, [c.imageUrl]);

  const total = c.totalTickets ?? 100;
  const sold = c.ticketsSold ?? 0;
  const remaining = Math.max(0, total - sold);
  const soldPct = total > 0 ? Math.min((sold / total) * 100, 100) : 0;
  const isSoldOut = sold >= total;
  const lowStock = remaining <= total * 0.1 && remaining > 0;
  const nearlyFull = remaining <= total * 0.25 && remaining > 0;

  /* ---------- status + countdown ---------- */
  const startAt = c.startsAt || c.startAt || null;
  const endAt =
    c.endsAt || c.endAt || new Date(Date.now() + 864e5).toISOString();

  const [status, setStatus] = useState('UPCOMING');
  const [timeLeft, setTimeLeft] = useState('');
  const [showCountdown, setShowCountdown] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const s = startAt ? new Date(startAt).getTime() : undefined;
      const e = endAt ? new Date(endAt).getTime() : undefined;

      if (s && now < s) {
        setStatus('UPCOMING');
        setShowCountdown(false);
        setTimeLeft('');
        return;
      }
      if (!e || now >= e) {
        setStatus('ENDED');
        setShowCountdown(false);
        setTimeLeft('');
        return;
      }

      setStatus('LIVE NOW');
      const diff = e - now;
      setShowCountdown(diff <= 48 * 3600 * 1000);

      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const sLeft = Math.floor((diff % 60000) / 1000);

      setTimeLeft(
        d > 0
          ? `${d}D ${h}H ${m}M`
          : h > 0
          ? `${h}H ${m}M`
          : `${m}M ${String(sLeft).padStart(2, '0')}S`
      );
    }, 1000);
    return () => clearInterval(timer);
  }, [startAt, endAt]);

  const isGiftable = status === 'LIVE NOW' && !isSoldOut && (c.slug || c.comp?.slug);

  /* ---------- root styles ---------- */
  const root = [
    'mx-auto flex flex-col overflow-hidden text-white font-orbitron',
    'bg-[#0f172a] border border-cyan-600 rounded-2xl shadow-md',
    'transition-transform duration-200 hover:scale-[1.02]',
    WIDTH[size] || WIDTH.md,
    className,
  ].join(' ');

  return (
    <>
      <div className={root}>
        {/* Header */}
        <div className="relative z-10 px-4 py-2 bg-gradient-to-r from-[#00ffd5] via-[#00ccff] to-[#0077ff]">
          <h3 className="text-base font-bold uppercase text-black text-center truncate">
            {headerTitle}
          </h3>
        </div>

        {/* Image */}
        <div className="relative w-full aspect-[16/9] bg-black/70">
          {img.external ? (
            <img
              src={img.src}
              alt={headerTitle || 'Competition image'}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <Image
              src={img.src}
              alt={headerTitle || 'Competition image'}
              fill
              priority={false}
              className="object-cover"
              sizes="(max-width: 480px) 100vw, (max-width: 960px) 50vw, 33vw"
            />
          )}
        </div>

        {/* Status */}
        <div className="px-3 pt-2">
          <div
            className={[
              'w-full text-center px-2 py-1 rounded-full text-[11px] font-bold shadow',
              status === 'LIVE NOW'
                ? 'bg-gradient-to-r from-emerald-400 to-emerald-500 text-black'
                : status === 'UPCOMING'
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black'
                : 'bg-rose-600 text-white',
            ].join(' ')}
          >
            {status === 'UPCOMING'
              ? t('upcoming', 'Upcoming')
              : status === 'ENDED'
              ? t('ended', 'Ended')
              : t('live_now', 'LIVE NOW')}
          </div>

          {showCountdown && (
            <div className="mt-1 text-center">
              <span className="inline-block px-2 py-0.5 rounded-md bg-cyan-400 text-black font-mono text-xs font-bold">
                {timeLeft}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3 text-sm space-y-2">
          <Row label={t('prize', 'Prize')} value={prize} />
          <Row
            label={t('entry_fee', 'Entry Fee')}
            value={
              entryFee > 0 ? `${entryFee} π` : t('free_entry', 'Free Entry')
            }
          />
          <Row
            label={t('draw_date', 'Draw Date')}
            value={
              endAt
                ? new Date(endAt).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : t('tba', 'TBA')
            }
          />

          {/* Tickets */}
          <div className="mt-2">
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-cyan-300">
                {t('tickets_sold', 'Tickets Sold')}
              </span>
              <span
                className={[
                  'font-semibold',
                  isSoldOut
                    ? 'text-rose-400'
                    : lowStock
                    ? 'text-orange-300'
                    : nearlyFull
                    ? 'text-yellow-300'
                    : 'text-zinc-300',
                ].join(' ')}
              >
                {sold.toLocaleString()} / {total.toLocaleString()}
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-zinc-700 mt-1 overflow-hidden">
              <div
                className={[
                  'h-full transition-all',
                  isSoldOut
                    ? 'bg-rose-500'
                    : lowStock
                    ? 'bg-orange-400'
                    : nearlyFull
                    ? 'bg-yellow-400'
                    : 'bg-gradient-to-r from-[#00ffd5] to-[#0077ff]',
                ].join(' ')}
                style={{ width: `${soldPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        {!hideButton && (
          <div className="px-3 pb-3 space-y-2 mt-auto">
            {c.slug ? (
              <Link href={`/ticket-purchase/${c.slug}`} className="block">
                <button className="w-full py-2 rounded-md font-bold text-black text-sm bg-gradient-to-r from-[#00ffd5] to-[#0077ff] hover:brightness-110 active:translate-y-px">
                  {t('enter_now', 'More Details')}
                </button>
              </Link>
            ) : (
              <button className="w-full py-2 rounded-md font-bold text-white bg-zinc-600 text-sm">
                {t('not_available', 'Not Available')}
              </button>
            )}

            {isGiftable && !disableGift && user?.username && (
              <button
                onClick={() => alert('🎁 Gift feature coming soon!')}
                className="w-full py-2 rounded-md font-bold text-cyan-400 border border-cyan-400 hover:bg-cyan-400 hover:text-black transition-colors text-sm"
              >
                {t('gift_ticket', 'Gift Ticket')}
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}

/* ---------- Helpers ---------- */
function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-cyan-300 font-semibold">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
