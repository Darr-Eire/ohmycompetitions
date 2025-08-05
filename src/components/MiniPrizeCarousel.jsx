'use client';

import React, { useEffect, useRef, useState } from 'react';

export default function MiniPrizeCarousel() {
  const containerRef = useRef(null);
  const [competitions, setCompetitions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const groupSize = 3;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/competitions/all');
        const result = await res.json();
        if (!result.success) throw new Error('Failed to fetch competitions');

        const liveComps = result.data.filter((item) => item.comp?.status === 'active');
        setCompetitions(liveComps);
      } catch (err) {
        console.error('❌ Error loading competitions:', err);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (competitions.length <= groupSize) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = prevIndex + groupSize;
        return nextIndex >= competitions.length ? 0 : nextIndex;
      });
    }, 6000);

    return () => clearInterval(interval);
  }, [competitions]);

  const displayItems = competitions.slice(currentIndex, currentIndex + groupSize);

  if (competitions.length === 0) {
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
        {displayItems.map((item) => {
        const dailyStyleThemes = ['daily', 'regional', 'launch', 'pi', 'event'];


          const hasImage = !!item.imageUrl && !dailyStyleThemes.includes(item.theme);

          return (
            <div
              key={item._id}
              className="w-[100px] bg-[#0f172a] border border-cyan-400 rounded-lg shadow text-white text-center font-orbitron px-2 py-2 text-[10px] leading-tight space-y-1 opacity-70 cursor-default select-none"
            >
              {hasImage ? (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-[70px] object-cover rounded-md mb-1"
                />
              ) : (
                <div
                  className="h-[70px] mb-1 flex flex-col justify-center items-center rounded-md bg-[#0f172a] text-center px-3 shadow-inner border border-cyan-400"
                  style={{ minWidth: '80px' }}
                >
                  <span className="text-[14px] text-cyan-300 uppercase tracking-wider font-medium mb-1 select-none">
                    Prize
                  </span>
                  <span
                    className="text-[14px] font-extrabold text-cyan-400 leading-snug animate-pulse truncate max-w-full select-text"
                    title={item.prize}
                    style={{ lineHeight: 1.1 }}
                  >
                    {item.prize ? `${item.prize} π` : 'N/A'}
                  </span>
                  <span className="text-[9px] text-cyan-300 uppercase tracking-widest font-light mt-1 select-none">
                    Up for Grabs
                  </span>
                </div>
              )}

              <div className="font-bold text-[11px] text-cyan-300 truncate">
                {item.title}
              </div>

              <div>
                Draw: <span className="text-white">{formatDate(item.comp?.endsAt)}</span>
              </div>

              <div>
                Fee: <span className="text-white">{item.comp?.entryFee?.toFixed(2)} π</span>
              </div>

              <div>
                Tickets:{' '}
                <span className="text-white">
                  {item.comp?.ticketsSold?.toLocaleString()} / {item.comp?.totalTickets?.toLocaleString()}
                </span>
              </div>
            </div>
          );
        })}
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
