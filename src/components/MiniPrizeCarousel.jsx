'use client';

import React, { useEffect, useRef, useState } from 'react';

export default function MiniPrizeCarousel() {
  const containerRef = useRef(null);
  const [competitions, setCompetitions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const groupSize = 3;

  useEffect(() => {
    fetch('/api/competitions/all')
      .then((res) => res.json())
      .then((result) => {
        if (!result?.success) throw new Error('Failed to fetch competitions');
        const live = (result.data || []).filter((item) => item?.comp?.status === 'active');

        // free first
        const freeComps = live.filter((item) => Number(item?.comp?.entryFee) === 0);
        const paidComps = live.filter((item) => Number(item?.comp?.entryFee) > 0);
        setCompetitions([...freeComps, ...paidComps]);
      })
      .catch((err) => console.error('❌ Error loading competitions:', err));
  }, []);

  useEffect(() => {
    if (competitions.length <= groupSize) return;

    // Respect reduced-motion users
    const media =
      typeof window !== 'undefined' && window.matchMedia
        ? window.matchMedia('(prefers-reduced-motion: reduce)')
        : null;
    if (media?.matches) return;

    const interval = setInterval(() => {
      setCurrentIndex((i) => (i + groupSize) % competitions.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [competitions]);

  // Wrap-around window of size groupSize
  const displayItems =
    competitions.length <= groupSize
      ? competitions
      : Array.from({ length: groupSize }, (_, k) => competitions[(currentIndex + k) % competitions.length]);

  if (!competitions.length) {
    return (
      <div className="w-full px-2 mt-6 text-center text-cyan-300 font-orbitron">
        No live competitions available.
      </div>
    );
  }

  return (
    <div className="w-full px-2 mt-0 mb-2 section-tight">
      <h3 className="text-cyan-300 font-orbitron font-semibold text-center mb-2 text-lg select-none">
        Live Competitions
      </h3>
      <div
        ref={containerRef}
        className="flex justify-center gap-3 transition-all duration-500 scrollbar-none scroll-smooth"
      >
        {displayItems.map((item) => (
          <CompetitionCard key={item?._id || item?.comp?._id || `${item?.slug}-${Math.random()}`} item={item} />
        ))}
      </div>
    </div>
  );
}

/* -------------------------- helpers: Pi prize -------------------------- */

const nf = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 2 });
const nfCompact = new Intl.NumberFormat('en-GB', { notation: 'compact', maximumFractionDigits: 1 });

function formatPi(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return null;
  return `${n >= 1000 ? nfCompact.format(n) : nf.format(n)} π`;
}

function sanitizePrizeString(str) {
  // Remove existing π or 'pi' tokens to avoid doubling, trim spaces
  return String(str).replace(/π|pi/gi, '').trim();
}

function coerceNumber(v) {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const cleaned = sanitizePrizeString(v).replace(/[^\d.,-]/g, '');
    const num = Number(cleaned.replace(/,/g, ''));
    return Number.isFinite(num) ? num : null;
  }
  return null;
}

/** Derives whether prize is denominated in Pi and returns { isPi, display, amount } */
function getPiPrizeDisplay(item) {
  const comp = item?.comp || {};

  const candidates = [
    item?.prizePi,
    comp?.prizePi,
    item?.prize?.pi,
    comp?.prize?.pi,
    item?.prize?.amountPi,
    comp?.prize?.amountPi,
    // strings like "2200π", "2,200 pi"
    item?.prize,
    comp?.prize,
  ];

  for (const c of candidates) {
    if (c == null) continue;

    const n = coerceNumber(c);
    if (n != null) {
      return { isPi: true, amount: n, display: `${nf.format(n)} π` };
    }

    if (typeof c === 'string' && /π|pi/i.test(c)) {
      const n2 = coerceNumber(c);
      if (n2 != null) return { isPi: true, amount: n2, display: `${nf.format(n2)} π` };
      const cleaned = sanitizePrizeString(c);
      return { isPi: true, display: `${cleaned} π`.trim() };
    }
  }

  return { isPi: false };
}

/* --------------------------- helpers: misc --------------------------- */

function formatDate(dateStr) {
  if (!dateStr) return 'TBA';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });
}

function toLocale(n) {
  const num = Number(n);
  return Number.isFinite(num) ? num.toLocaleString('en-GB') : '0';
}

/* Detect multiple winners to switch footnote to "1st Prize" */
function hasMultipleWinners(item) {
  const comp = item?.comp || item || {};

  if (Number(comp?.numWinners) > 1) return true;
  if (Array.isArray(comp?.winners) && comp.winners.length > 1) return true;
  if (Array.isArray(comp?.prizes) && comp.prizes.length > 1) return true;
  if (Array.isArray(comp?.prizeTiers) && comp.prizeTiers.length > 1) return true;
  if (Array.isArray(comp?.prize_breakdown) && comp.prize_breakdown.length > 1) return true;

  if (comp?.prizeBreakdown && typeof comp.prizeBreakdown === 'object') {
    const keys = Object.keys(comp.prizeBreakdown).filter(Boolean);
    if (keys.length > 1) return true;
  }

  return false;
}

/* ------------------------------ Card ------------------------------ */

function CompetitionCard({ item }) {
  const { comp, imageUrl, title, theme } = item || {};
  const entryFeeNum = Number(comp?.entryFee);
  const isFree = Number.isFinite(entryFeeNum) ? entryFeeNum === 0 : false;

  const dailyStyleThemes = ['daily', 'regional', 'launch', 'pi', 'event'];
  const hasImage = !!imageUrl && !dailyStyleThemes.includes(theme);

  const baseBg = 'bg-transparent';
  const baseBorder = 'border border-cyan-400 text-cyan-300 opacity-70';

  // --- Prize display (Pi-aware) ---
  const piPrize = getPiPrizeDisplay(item);
  const piPrizeCompact = piPrize.isPi ? (formatPi(piPrize.amount) || piPrize.display) : 'N/A';

  // --- Footer/footnote label ---
  const multiWinners = hasMultipleWinners(item);
  const prizeFootnote = multiWinners ? '1st Prize' : 'Up for Grabs';

  return (
    <div
      role="group"
      aria-label={`${title || 'Competition'} — Prize: ${piPrizeCompact}, Draw: ${formatDate(
        comp?.endsAt
      )}, Fee: ${isFree ? 'Free' : Number.isFinite(entryFeeNum) ? `${nf.format(entryFeeNum)} π` : 'TBA'}`}
      className={`w-[130px] h-[190px] rounded-lg shadow text-center font-orbitron px-2 py-2 text-[10px] leading-tight select-none
                  flex flex-col ${baseBg} ${baseBorder}`}
    >
      {/* Top section for FREE banner, Image, or Prize block - consistent min-height, flex-grow to fill */}
      <div className="flex flex-col justify-center items-center w-full min-h-[70px] flex-grow">
        {isFree ? (
          <div className="flex flex-col justify-center items-center">
            <div className="bg-cyan-500 bg-opacity-20 text-white font-semibold text-xs uppercase tracking-wider px-3 py-1 rounded-full shadow-md mb-1 transition-all">
              FREE
            </div>
            <span className="text-[14px] font-extrabold text-cyan-300 whitespace-nowrap">
              {piPrizeCompact}
            </span>
            <span className="text-[9px] uppercase tracking-widest font-light text-cyan-300 mt-1">
              No Fee
            </span>
          </div>
        ) : hasImage ? (
          <img
            src={imageUrl}
            alt={title || 'competition'}
            className="w-full h-full object-cover rounded-md"
          />
        ) : (
          <div
            className="flex flex-col justify-center items-center w-full h-full rounded-md text-center
                       px-3 shadow-inner border border-cyan-400 bg-transparent"
          >
            <span className="text-[14px] text-cyan-300 uppercase tracking-wider font-medium mb-1">Prize</span>
            <span
              className="text-[14px] font-extrabold text-cyan-400 leading-snug animate-pulse whitespace-nowrap max-w-full"
              title={piPrizeCompact}
              style={{ lineHeight: 1.1 }}
            >
              {piPrizeCompact}
            </span>
            <span className="text-[9px] text-cyan-300 uppercase tracking-widest font-light mt-1">
              {prizeFootnote}
            </span>
          </div>
        )}
      </div>

      {/* Title - fixed height and line-clamp for multiline truncation */}
      <div className="h-[30px] flex items-center justify-center w-full mt-2 mb-1 overflow-hidden">
        <div
          className="font-bold text-[11px] text-cyan-300 px-1 w-full text-center
                     line-clamp-2" // Ensures title takes max 2 lines
          title={title || 'Untitled'}
        >
          {title || 'Untitled'}
        </div>
      </div>

      {/* Bottom section for details - flex-grow-0 to take only necessary space */}
      <div className="flex flex-col justify-end w-full flex-grow-0">
        <div className="text-white text-[10px]">
          Draw: <span className="text-white">{formatDate(comp?.endsAt)}</span>
        </div>
        <div className="text-white text-[10px]">
          Fee:{' '}
          <span className="text-white">
            {isFree ? 'Free' : Number.isFinite(entryFeeNum) ? `${nf.format(entryFeeNum)} π` : 'TBA'}
          </span>
        </div>
        <div className="text-white text-[10px]">
          Tickets:{' '}
          <span className="text-white">
            {toLocale(comp?.ticketsSold)} / {toLocale(comp?.totalTickets)}
          </span>
        </div>
      </div>
    </div>
  );
}