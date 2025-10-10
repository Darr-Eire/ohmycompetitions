'use client';

import React, { useEffect, useRef, useState } from 'react';

export default function MiniPrizeCarousel() {
  const containerRef = useRef(null);
  const [competitions, setCompetitions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const groupSize = 3;

  useEffect(() => {
    fetch('/api/competitions/all')
      .then(res => res.json())
      .then(result => {
        if (!result.success) throw new Error('Failed to fetch competitions');
        const live = result.data.filter(item => item.comp?.status === 'active');
        // free first
        const freeComps = live.filter(item => item.comp?.entryFee === 0);
        const paidComps = live.filter(item => item.comp?.entryFee > 0);
        setCompetitions([...freeComps, ...paidComps]);
      })
      .catch(err => console.error('❌ Error loading competitions:', err));
  }, []);

  useEffect(() => {
    if (competitions.length <= groupSize) return;
    const interval = setInterval(() => {
      setCurrentIndex(i => (i + groupSize) % competitions.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [competitions]);

  const displayItems = competitions.slice(currentIndex, currentIndex + groupSize);

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
      <div ref={containerRef} className="flex justify-center gap-3 transition-all duration-500">
        {displayItems.map(item => (
          <CompetitionCard key={item._id} item={item} />
        ))}
      </div>
    </div>
  );
}

function CompetitionCard({ item }) {
  const { comp, imageUrl, title, prize, theme } = item;
  const isFree = comp?.entryFee === 0;
  const dailyStyleThemes = ['daily', 'regional', 'launch', 'pi', 'event'];
  const hasImage = !!imageUrl && !dailyStyleThemes.includes(theme);

  const baseBg = 'bg-transparent';
  const baseBorder = 'border border-cyan-400 text-cyan-300 opacity-70';

  return (
    <div
      className={`w-[100px] rounded-lg shadow text-center font-orbitron px-2 py-2 text-[10px] leading-tight select-none
                  ${baseBg} ${baseBorder}`}
    >
      {isFree ? (
        // Free competition block with banner inside border
        <div className="flex flex-col justify-start items-center mb-1" style={{ minHeight: '70px' }}>
          {/* FREE banner inside */}
<div className="bg-cyan-500 bg-opacity-20 text-white font-semibold text-xs uppercase tracking-wider px-3 py-1 rounded-full shadow-md mb-2 transition-all hover:bg-opacity-30">
  FREE
</div>


          <span className="text-[14px] font-extrabold text-cyan-300">
            {prize ? `${prize} π` : 'N/A'}
          </span>
          <span className="text-[9px] uppercase tracking-widest font-light mt-1 text-cyan-300">
            No Fee
          </span>
        </div>
      ) : hasImage ? (
        // Paid competition with image
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-[70px] object-cover rounded-md mb-1"
        />
      ) : (
        // Paid competition without image
        <div
          className="flex flex-col justify-center items-center mb-1 rounded-md text-center
                     px-3 shadow-inner border border-cyan-400 bg-transparent"
          style={{ minWidth: '80px', height: '70px' }}
        >
          <span className="text-[14px] text-cyan-300 uppercase tracking-wider font-medium mb-1">
            Prize
          </span>
          <span
            className="text-[14px] font-extrabold text-cyan-400 leading-snug animate-pulse truncate max-w-full"
            title={prize}
            style={{ lineHeight: 1.1 }}
          >
            {prize ? `${prize} π` : 'N/A'}
          </span>
          <span className="text-[9px] text-cyan-300 uppercase tracking-widest font-light mt-1">
            Up for Grabs
          </span>
        </div>
      )}

      {/* Title */}
      <div className="font-bold text-[11px] truncate text-cyan-300">
        {title}
      </div>

      {/* Draw date */}
      <div className="text-white text-[10px]">
        Draw:{' '}
        <span className="text-white">{formatDate(comp?.endsAt)}</span>
      </div>

      {/* Entry fee */}
      <div className="text-white text-[10px]">
        Fee:{' '}
        <span className="text-white">
          {isFree ? 'Free' : `${comp?.entryFee.toFixed(2)} π`}
        </span>
      </div>

      {/* Tickets sold */}
      <div className="text-white text-[10px]">
        Tickets:{' '}
        <span className="text-white">
          {comp?.ticketsSold?.toLocaleString()} / {comp?.totalTickets?.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return 'TBA';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
