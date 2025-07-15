'use client';

import React from 'react';

const selectedCompetitions = [
  {
    _id: '686c32e3494582332d2d652c',
    comp: {
      title: 'PS5 Bundle',
      href: '/competitions/ps5-bundle-giveaway',
      imageUrl: '/images/playstation.jpeg',
      theme: 'tech',
      status: 'active',
      endsAt: '2025-08-01T00:00:00Z',
    },
  },
  {
    _id: '686c32e3494582332d2d652d',
    comp: {
      title: '55″ Smart TV',
      href: '/competitions/55-inch-tv-giveaway',
      imageUrl: '/images/tv.jpg',
      theme: 'tech',
      status: 'active',
      endsAt: '2025-08-05T00:00:00Z',
    },
  },
  {
    _id: '687263423dc93943074b26d1',
    comp: {
      title: '500 Pi Giveaway',
      href: '/competitions/',
      imageUrl: '/images/pi5.png',
      theme: 'daily',
      status: 'active',
      endsAt: '2025-08-20T00:00:00Z',
    },
  },
];

export default function MiniPrizeCarousel() {
  const liveCompetitions = selectedCompetitions.filter(
    (item) => item.comp?.status === 'active'
  );

  if (liveCompetitions.length === 0) {
    return (
      <div className="w-full px-2 mt-6 text-center text-cyan-300 font-orbitron">
        No live competitions available.
      </div>
    );
  }

  return (
    <div className="w-full px-2 mt-2"> {/* Changed from mt-6 to mt-2 to move it up */}
      <h3 className="text-cyan-300 font-orbitron font-semibold text-center mb-1 text-lg select-none">
        Live Competitions
      </h3>
      <div className="flex justify-center gap-2 flex-nowrap overflow-x-auto no-scrollbar">
        {liveCompetitions.map((item) => (
          <a
            key={item._id}
            href={item.comp.href}
            className="w-[100px] flex-shrink-0 bg-[#0f172a] border border-cyan-400 rounded-xl shadow-lg text-white text-center font-orbitron px-2 py-2 text-[10px] leading-tight space-y-1 hover:opacity-90 transition"
          >
            <img
              src={item.comp.imageUrl}
              alt={item.comp.title}
              className="w-full h-[50px] object-cover rounded-md mb-1"
            />

            <div className="font-bold text-[11px] text-cyan-300 truncate">
              {item.comp.title}
            </div>
            <div>
              Draw: <span className="text-white">{formatDate(item.comp.endsAt)}</span>
            </div>
          </a>
        ))}
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

