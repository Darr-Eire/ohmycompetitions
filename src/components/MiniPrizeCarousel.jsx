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
      prizePool: 220, // 0.4 * 1100 * 0.5
      title: 'PS5 Bundle',
      prize: 'PlayStation 5',
      href: '/competitions/ps5-bundle-giveaway',
      imageUrl: '/images/playstation.jpeg',
      theme: 'tech',
    },
  },
  {
    _id: '6878ec52b448fa6d97ae1b6e',
    comp: {
      slug: 'omc-launch-week-pi-pioneers',
      entryFee: 0.3,
      totalTickets: 1000,
      ticketsSold: 0,
      startsAt: '2025-07-17T00:00:00Z',
      endsAt: '2025-07-30T00:00:00Z',
      paymentType: 'pi',
      piAmount: 0.3,
      status: 'active',
      prizePool: 150, // 0.3 * 1000 * 0.5
      title: 'OMC Launch Week Pi Pioneers',
      description: '',
      prize: '500',
      href: '/competitions/omc-launch-week-pi-pioneers',
      imageUrl: '/images/pi3.png',
      theme: 'daily',
    },
  },
  {
    _id: '6878ef398a488879fa19dcdd',
    comp: {
      slug: 'omc-launch-week-pi-giveaway',
      entryFee: 0.4,
      totalTickets: 1000,
      ticketsSold: 0,
      startsAt: '2025-07-17T00:00:00Z',
      endsAt: '2025-08-01T00:00:00Z',
      paymentType: 'pi',
      piAmount: 0.4,
      status: 'active',
      prizePool: 200, // 0.4 * 1000 * 0.5
      title: 'OMC Launch Week Pi Giveaway',
      description: '',
      prize: '1000',
      href: '/competitions/omc-launch-week-pi-giveaway',
      imageUrl: '/images/pi1.png',
      theme: 'daily',
    },
  },
  {
    _id: '6878efad8a488879fa19dce6',
    comp: {
      slug: 'omc-launch-week-pi-power',
      entryFee: 0.5,
      totalTickets: 1000,
      ticketsSold: 0,
      startsAt: '2025-07-17T00:00:00Z',
      endsAt: '2025-08-05T00:00:00Z',
      paymentType: 'pi',
      piAmount: 0.5,
      status: 'active',
      prizePool: 250, // 0.5 * 1000 * 0.5
      title: 'OMC Launch Week Pi Power',
      description: '',
      prize: '250',
      href: '/competitions/omc-launch-week-pi-power',
      imageUrl: '/images/pi2.png',
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
