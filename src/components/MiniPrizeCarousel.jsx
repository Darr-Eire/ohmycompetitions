'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

const selectedCompetitions = [
  {
    _id: '687c330c0d220984a4e83c59',
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
      prizePool: 220,
      title: 'Ps5 Bundle Giveaway',
      description: '',
      prize: 'Win This Ps5 Bundle',
      href: '/competitions/ps5-bundle-giveaway',
      imageUrl: '/images/playstation.jpeg',
      theme: 'tech',
    },
  },
  {
    _id: '687d7d759c8f45807d0affff',
    comp: {
      slug: 'omc-launch-week-pi-power',
      entryFee: 0.5,
      totalTickets: 500,
      ticketsSold: 0,
      startsAt: '2025-07-17T00:00:00Z',
      endsAt: '2025-08-05T00:00:00Z',
      paymentType: 'pi',
      piAmount: 0.5,
      status: 'active',
      prizePool: 250,
      title: 'OMC Launch Week Pi Power',
      description: '',
      prize: 'Win 250 Pi',
      href: '/competitions/omc-launch-week-pi-power',
      imageUrl: '/images/pi2.png',
      theme: 'daily',
    },
  },
  {
    _id: '687d7ded9c8f45807d0b0013',
    comp: {
      slug: 'omc-launch-week-pi-giveaway',
      entryFee: 1,
      totalTickets: 1000,
      ticketsSold: 0,
      startsAt: '2025-07-17T00:00:00Z',
      endsAt: '2025-08-01T00:00:00Z',
      paymentType: 'pi',
      piAmount: 1,
      status: 'active',
      prizePool: 1000,
      title: 'OMC Launch Week Pi Giveaway',
      description: '',
      prize: 'Win 1000 Pi',
      href: '/competitions/omc-launch-week-pi-giveaway',
      imageUrl: '/images/pi1.png',
      theme: 'daily',
    },
  },
  {
    _id: '687d7e7d9c8f45807d0b0021',
    comp: {
      slug: 'omc-launch-week-early-pioneers',
      entryFee: 0.5,
      totalTickets: 200,
      ticketsSold: 0,
      startsAt: '2025-08-01T00:00:00Z',
      endsAt: '2025-08-02T00:00:00Z',
      paymentType: 'pi',
      piAmount: 0.5,
      status: 'active',
      prizePool: 100,
      title: 'OMC Launch Week Early Pioneers',
      description: 'Join now and compete for the Pi prize!',
      prize: 'Win 100 Pi',
      href: '/competitions/omc-launch-week-early-pioneers',
      imageUrl: '/images/pi3.png',
      theme: 'daily',
      maxPerUser: 10,
    },
  },
  {
    _id: '687d93591981446f9a153164',
    comp: {
      slug: 'omc-launch-week-pi-pioneers',
      entryFee: 0.2,
      totalTickets: 2500,
      ticketsSold: 0,
      startsAt: '2025-07-17T00:00:00Z',
      endsAt: '2025-07-30T00:00:00Z',
      paymentType: 'pi',
      piAmount: 0.2,
      status: 'active',
      prizePool: 500,
      title: 'OMC Launch Week Pi Pioneers',
      description: '',
      prize: 'Win 500 Pi',
      href: '/competitions/omc-launch-week-pi-pioneers',
      imageUrl: '/images/pi4.png',
      theme: 'daily',
    },
  }
];

export default function MiniPrizeCarousel() {
  const containerRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const liveCompetitions = selectedCompetitions.filter(
    (item) => item.comp?.status === 'active'
  );

  const groupSize = 3;

  useEffect(() => {
    if (liveCompetitions.length <= groupSize) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = prevIndex + groupSize;
        return nextIndex >= liveCompetitions.length ? 0 : nextIndex;
      });
    }, 6000);

    return () => clearInterval(interval);
  }, [liveCompetitions.length]);

  const visibleItems = liveCompetitions.slice(
    currentIndex,
    currentIndex + groupSize
  );

  const displayItems =
    visibleItems.length < groupSize
      ? [...visibleItems, ...liveCompetitions.slice(0, groupSize - visibleItems.length)]
      : visibleItems;

  if (liveCompetitions.length === 0) {
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
        className="flex justify-center gap-3 transition-all duration-500"
      >
        {displayItems.map((item) => (
         <Link
  key={item._id}
  href="/competitions/live-now"
  className="w-[100px] bg-[#0f172a] border border-cyan-400 rounded-lg shadow text-white text-center font-orbitron px-2 py-2 text-[10px] leading-tight space-y-1 hover:opacity-90 transition"
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
</Link>

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
