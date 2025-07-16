'use client';

import React from 'react';


  const selectedCompetitions = [
  {
    _id: '686c32e3494582332d2d652c',
    comp: {
      slug: 'ps5-bundle-giveaway',
      entryFee: 0.4,
      totalTickets: 1100,
      ticketsSold: 14,
      startsAt: '2025-06-20T14:00:00Z',
      endsAt: '2025-08-20T14:00:00Z',
      paymentType: 'pi',
      piAmount: 0.4,
      status: 'active',
      prizePool: 2.8,
      title: 'PS5 Bundle',
      prize: 'PlayStation 5',
      href: '/competitions/ps5-bundle-giveaway',
      imageUrl: '/images/playstation.jpeg',
      theme: 'tech',
    },
  },
  {
    _id: '686c32e3494582332d2d652d',
    comp: {
      slug: '55-inch-tv-giveaway',
      entryFee: 0.45,
      totalTickets: 1500,
      ticketsSold: 1,
      startsAt: '2025-06-16T11:30:00Z',
      endsAt: '2025-08-16T11:30:00Z',
      paymentType: 'pi',
      piAmount: 0.45,
      status: 'active',
      prizePool: 0.225,
      title: '55″ Smart TV',
      prize: '55″ Smart TV',
      href: '/competitions/55-inch-tv-giveaway',
      imageUrl: '/images/tv.jpg',
      theme: 'tech',
    },
  },

 
  {
    _id: '6875b0ed24da567558b1572e',
    comp: {
      slug: 'omc-launch-week-500-pi',
      entryFee: 1,
      totalTickets: 1000,
      ticketsSold: 11,
      startsAt: '2025-07-15T01:37:49.297Z',
      endsAt: '2025-07-16T00:00',
      paymentType: 'pi',
      piAmount: 0.5,
      status: 'active',
      prizePool: 5.5,
      title: 'OMC Launch Week 500 Pi',
      description: 'OMC 500 Pi Giveway',
      prize: '500',
      href: '/competitions/omc-launch-week-500-pi',
      imageUrl: '/images/pi5.png',
      theme: 'daily',
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
    <div className="w-full px-2 mt-2">
      <h3 className="text-cyan-300 font-orbitron font-semibold text-center mb-2 text-lg select-none">
        Live Competitions
      </h3>
      <div className="flex justify-center gap-2 flex-nowrap overflow-x-auto no-scrollbar">
       {liveCompetitions.map((item) => (
  // Link now points to /competitions
  <a
    key={item._id}
    href="/competitions"
    className="w-[100px] flex-shrink-0 bg-[#0f172a] border border-cyan-400 rounded-lg shadow text-white text-center font-orbitron px-2 py-2 text-[10px] leading-tight space-y-1 hover:opacity-90 transition"
  >
    <img
      src={item.comp.imageUrl}
      alt={item.comp.title}
      className="w-full h-[70px] object-cover rounded-md mb-1"
    />

    <div className="font-bold text-[11px] text-cyan-300 truncate">
      {item.comp.title}
    </div>
    <div className="text-[10px]">
      Draw: <span className="text-white">{formatDate(item.comp.endsAt)}</span>
    </div>
    <div className="text-[10px]">
      Fee: <span className="text-white">{item.comp.entryFee.toFixed(2)} π</span>
    </div>
    <div className="text-[10px]">
      Sold: <span className="text-white">{item.comp.ticketsSold.toLocaleString()}</span>
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
