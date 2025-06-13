'use client';

import React, { useEffect, useState } from 'react';
import {
  techItems,
  premiumItems,
  piItems,
  freeItems,
  cryptoGiveawaysItems,
  dailyItems,
} from 'data/competitions';

const allCompetitions = [
  ...techItems,
  ...premiumItems,
  ...piItems,
  ...freeItems,
  ...cryptoGiveawaysItems,
  ...dailyItems,
];

export default function MiniPrizeCarousel() {
  const [index, setIndex] = useState(0);
  const visibleCount = 5;
  const items = allCompetitions;

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) =>
        (prevIndex + visibleCount) % items.length
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [items.length]);

  const visibleItems = Array.from({ length: visibleCount }, (_, i) => {
    return items[(index + i) % items.length];
  });

  return (
    <div className="w-full px-2 mt-6">
      <div className="flex justify-center gap-3 transition-all duration-500 ease-in-out">
        {visibleItems.map((item, i) => (
          <div
            key={item.comp?.slug || `info-${i}`}
            className="w-[140px] bg-[#0f172a] border border-cyan-400 rounded-xl shadow-lg text-white text-center font-orbitron px-3 py-3 text-[11px] leading-tight space-y-1"
          >
            <div className="font-bold text-[12px] text-cyan-300 truncate">
              {item.title}
            </div>
            <div>
              Entry: <span className="text-white">{(item.comp?.entryFee ?? 0).toFixed(2)} π</span>
            </div>
            <div>
              Draw: <span className="text-white">{formatDate(item.comp?.endsAt)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Helper to format draw date
function formatDate(dateStr) {
  if (!dateStr) return 'TBA';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
