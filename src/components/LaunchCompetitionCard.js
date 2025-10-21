// components/LaunchCompetitionCard.jsx (or wherever you keep it)
'use client';

import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';

/* ───────────── Prize helpers ───────────── */
function formatPi(amount) {
  if (amount == null) return 'TBA';
  if (typeof amount === 'number' && Number.isFinite(amount)) {
    return `${amount % 1 === 0 ? amount.toFixed(0) : amount.toFixed(2)} π`;
  }
  const s = String(amount).trim();
  return /\bπ\b|[$€£]/.test(s) ? s : `${s} π`;
}

function normalizePrizeBreakdown(raw) {
  if (!raw) return {};
  if (typeof raw === 'object' && !Array.isArray(raw)) {
    const out = {};
    const map = {
      '1st': '1st','first':'1st','first prize':'1st','grand':'1st','grand prize':'1st',
      '2nd': '2nd','second':'2nd','second prize':'2nd',
      '3rd': '3rd','third':'3rd','third prize':'3rd',
    };
    for (const [k, v] of Object.entries(raw)) {
      const m = map[String(k).toLowerCase()];
      if (m && out[m] == null) out[m] = v;
    }
    if (out['1st'] || out['2nd'] || out['3rd']) return out;

    const sorted = Object.values(raw)
      .map(v => ({ v, n: Number(String(v).replace(/[^\d.-]/g, '')) || -Infinity }))
      .sort((a, b) => b.n - a.n)
      .slice(0, 3);
    const ord = ['1st', '2nd', '3rd'];
    sorted.forEach((e, i) => { if (e?.v != null) out[ord[i]] = e.v; });
    return out;
  }
  if (Array.isArray(raw)) {
    const ord = ['1st', '2nd', '3rd'];
    const out = {};
    raw.slice(0, 3).forEach((v, i) => { out[ord[i]] = v; });
    return out;
  }
  return {};
}

function getPrizeTiers({ comp, prizeBreakdownProp, prizeProp }) {
  const c = comp?.comp ?? comp ?? {};
  const explicit = { '1st': c.firstPrize ?? c.prize1, '2nd': c.secondPrize ?? c.prize2, '3rd': c.thirdPrize ?? c.prize3 };
  if (explicit['1st'] || explicit['2nd'] || explicit['3rd']) return explicit;

  const fromProp  = normalizePrizeBreakdown(prizeBreakdownProp);
  const fromComp  = normalizePrizeBreakdown(c.prizeBreakdown);
  const fromArray = normalizePrizeBreakdown(c.prizes);

  const tiers = { ...fromProp, ...fromComp, ...fromArray };
  if (!tiers['1st'] && prizeProp != null) tiers['1st'] = prizeProp;
  return tiers;
}

function getWinnersCount(comp, tiers) {
  const c = comp?.comp ?? comp ?? {};
  const direct = c.winners ?? c.totalWinners ?? c.numberOfWinners ?? c.numWinners;
  const n = Number(direct);
  if (Number.isFinite(n) && n > 0) return Math.min(3, Math.max(1, Math.floor(n)));

  if (typeof direct === 'string') {
    if (/single|one/i.test(direct)) return 1;
    if (/two|2/i.test(direct))      return 2;
    if (/three|3/i.test(direct))    return 3;
    if (/multiple|multi/i.test(direct)) {
      const count = Object.values(tiers || {}).filter(v => v != null).length;
      return Math.min(3, count || 3);
    }
  }
  const count = Object.values(tiers || {}).filter(v => v != null).length;
  return Math.min(3, count || 1);
}

/* ───────────── Component ───────────── */
export default function LaunchCompetitionCard({ comp = {}, title, prize, className = '' }) {
  const {
    slug = '',
    entryFee = 0,
    totalTickets = 100,
    ticketsSold = 0,
    startsAt,
    endsAt,
    comingSoon = false,
    prizeBreakdown = {},
    type = 'standard', // unused for routing now
  } = comp;

  const [status, setStatus] = useState('UPCOMING');
  const [timeLeft, setTimeLeft] = useState('');
  const [showCountdown, setShowCountdown] = useState(false);

  const sold = Number.isFinite(Number(ticketsSold)) ? Number(ticketsSold) : 0;
  const total = Number.isFinite(Number(totalTickets)) ? Math.max(0, Number(totalTickets)) : 100;
  const remaining = Math.max(0, total - sold);
  const progress = total > 0 ? Math.min(100, Math.max(0, Math.round((sold / total) * 100))) : 0;

  const isSoldOut = total > 0 && sold >= total;
  const isLowStock = total > 0 && remaining <= total * 0.1 && remaining > 0;
  const isNearlyFull = total > 0 && remaining <= total * 0.25 && remaining > 0;

  const tiers = useMemo(
    () => getPrizeTiers({ comp, prizeBreakdownProp: prizeBreakdown, prizeProp: prize }),
    [comp, prizeBreakdown, prize]
  );
  const winnersCount = useMemo(() => getWinnersCount(comp, tiers), [comp, tiers]);

  const entryFeeLabel = useMemo(() => {
    const n = Number(entryFee);
    return !comingSoon && Number.isFinite(n) ? `${n.toFixed(2)} π` : 'TBA';
  }, [entryFee, comingSoon]);

  useEffect(() => {
    if (!endsAt || comingSoon) {
      setStatus('COMING SOON');
      setShowCountdown(false);
      return;
    }
    const interval = setInterval(() => {
      const now = Date.now();
      const start = startsAt ? new Date(startsAt).getTime() : 0;
      const end = new Date(endsAt).getTime();

      if (start && now < start) {
        setStatus('UPCOMING');
        setShowCountdown(false);
        return;
      }
      const diff = end - now;
      if (diff <= 0) {
        setStatus('ENDED');
        setShowCountdown(false);
        clearInterval(interval);
        return;
      }
      setStatus('LIVE NOW');
      setShowCountdown(diff <= 24 * 60 * 60 * 1000);

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);

      let time = '';
      if (d > 0) time += `${d}D `;
      if (h > 0 || d > 0) time += `${h}H `;
      if (m > 0 || h > 0 || d > 0) time += `${m}M `;
      if (d === 0 && h === 0) time += `${s}S`;
      setTimeLeft(time.trim());
    }, 1000);
    return () => clearInterval(interval);
  }, [endsAt, startsAt, comingSoon]);

  const hasValidSlug = typeof slug === 'string' && slug.length > 0;
  const competitionHref = hasValidSlug ? `/ticket-purchase/${encodeURIComponent(slug)}` : '#';

  return (
    <div
      className={`
        flex flex-col w-full mx-auto
        bg-[#0f172a] border border-cyan-600 rounded-2xl shadow-lg
        text-white font-orbitron overflow-hidden
        select-none transition-colors duration-200
        hover:shadow-[0_0_24px_rgba(0,255,213,0.18)]
        ${className}
      `}
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      {/* Header / Title */}
      <div className="px-4 pt-4 text-center">
        <h3 className="text-[18px] sm:text-[20px] font-bold bg-gradient-to-r from-cyan-300 to-blue-500 text-transparent bg-clip-text drop-shadow-md">
          {title}
        </h3>
      </div>

      {/* Status */}
      <div className="px-4 pt-2">
        <div
          className={`text-center text-[11px] font-bold py-1 rounded-md ${
            status === 'LIVE NOW'
              ? 'bg-green-400 text-black'
              : status === 'COMING SOON'
              ? 'bg-yellow-500 text-black'
              : status === 'ENDED'
              ? 'bg-red-600 text-white'
              : 'bg-orange-500 text-black'
          }`}
        >
          {status}
        </div>
      </div>

      {/* Winners Banner */}
      <div className="text-center text-[11px] bg-cyan-500 text-black font-semibold py-1 mt-2 mx-4 rounded-md">
        {winnersCount === 3 ? '1st • 2nd • 3rd Prizes' : winnersCount === 2 ? '1st • 2nd Prizes' : 'Single Winner'}
      </div>

      {/* Subline */}
      <p className="text-center text-xs text-white mt-4">
        Join us this Launch Week and be part of Pi history
      </p>

      {/* Countdown */}
      {showCountdown && (
        <div className="text-center mt-2 text-cyan-300 text-sm font-bold">{timeLeft}</div>
      )}

      {/* Body */}
      <div className="p-4 text-sm space-y-3">
        {/* Prize Pool */}
        <div className="relative rounded-xl border border-cyan-300 bg-cyan-300/10 p-4 shadow-[0_0_12px_rgba(34,211,238,0.25)]">
          <div className="pointer-events-none absolute -inset-0.5 rounded-xl bg-cyan-300/10 blur-md animate-pulse" aria-hidden="true" />
          <h4 className="relative text-center text-cyan-300 font-bold text-sm mb-3 tracking-wide">
            Prize Pool
          </h4>

          <div className="relative grid grid-cols-1 gap-3">
            {['1st','2nd','3rd'].slice(0, winnersCount).map((label) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-lg border border-cyan-300/40 bg-[#0b1220]/80 px-4 py-2"
              >
                <span className="text-[12px] uppercase tracking-wide text-cyan-300 font-semibold">
                  {label} Prize
                </span>
                <span className="font-extrabold text-cyan-300 text-lg tabular-nums tracking-wide animate-pulse">
                  {formatPi((getPrizeTiers({ comp, prizeBreakdownProp: prizeBreakdown, prizeProp: prize }))[label])}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Key facts */}
        <div className="flex justify-between items-center">
          <span className="text-cyan-300 font-medium">Entry Fee</span>
          <span className="text-white font-semibold">{entryFeeLabel}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-cyan-300">Draw Date</span>
          <span>{endsAt ? new Date(endsAt).toLocaleDateString() : 'TBA'}</span>
        </div>

        {/* Tickets */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-cyan-300">Tickets Sold</span>
            <div className="text-right">
              {status === 'COMING SOON' ? (
                <span className="text-sm font-semibold text-gray-300">TBA</span>
              ) : (
                <span
                  className={`text-sm font-semibold ${
                    isSoldOut
                      ? 'text-red-400'
                      : isLowStock
                      ? 'text-orange-400'
                      : isNearlyFull
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }`}
                >
                  {progress}% ({sold.toLocaleString()} / {total.toLocaleString()})
                </span>
              )}
              {isSoldOut && <div className="text-xs text-red-400 font-bold">SOLD OUT</div>}
              {isLowStock && !isSoldOut && (
                <div className="text-xs text-orange-400 font-bold">Only {remaining} left!</div>
              )}
              {isNearlyFull && !isLowStock && !isSoldOut && (
                <div className="text-xs text-yellow-400">{remaining} remaining</div>
              )}
            </div>
          </div>

          <div className="w-full bg-gray-700 rounded-full h-2">
            {status === 'COMING SOON' ? (
              <div className="h-2 w-[20%] bg-gray-400 rounded-full animate-pulse" />
            ) : (
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  isSoldOut
                    ? 'bg-red-500'
                    : isLowStock
                    ? 'bg-orange-500'
                    : isNearlyFull
                    ? 'bg-yellow-500'
                    : 'bg-blue-500'
                }`}
                style={{ width: `${progress}%` }}
              />
            )}
          </div>
        </div>

        {/* CTA */}
        {hasValidSlug ? (
          <Link href={competitionHref} className="block mt-4 focus:outline-none focus-visible:outline-none">
            <button
              type="button"
              disabled={comingSoon}
              className={`w-full py-2 rounded-lg font-bold text-center transition-opacity duration-150 ${
                comingSoon
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-300 to-blue-500 text-black hover:opacity-90'
              }`}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {comingSoon ? 'Coming Soon' : 'More Details'}
            </button>
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className="w-full py-2 rounded-lg font-bold text-center bg-gray-400 text-white cursor-not-allowed mt-4"
          >
            Unavailable
          </button>
        )}
      </div>
    </div>
  );
}
