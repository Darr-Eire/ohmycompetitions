'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import DailyCompetitionCard from '@/components/DailyCompetitionCard';
import FreeCompetitionCard from '@/components/FreeCompetitionCard';
import PiCompetitionCard from '@/components/PiCompetitionCard';
import CryptoGiveawayCard from '@/components/CryptoGiveawayCard';
import CompetitionCard from '@/components/CompetitionCard';
import PiCashHeroBanner from '@/components/PiCashHeroBanner';


import {
  techItems,
  premiumItems,
  piItems,
  dailyItems,
  freeItems,
  cryptoGiveawaysItems,
} from '@/data/competitions';

export default function HomePage() {
 
   const mockPiCashProps = {
    code: '7H3X-PL4Y',
    prizePool: 14250,
    weekStart: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
    drawAt: new Date(Date.now() + 1000 * 60 * 60 * 5).toISOString(),
    claimExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 10).toISOString(),
  };

  const TopWinnersCarousel = () => {
    const winners = [
      { name: 'Jack Jim', prize: 'Matchday Tickets', date: 'March 26th', image: '/images/winner2.png' },
      { name: 'Shanahan', prize: 'Playstation 5', date: 'February 14th', image: '/images/winner2.png' },
      { name: 'Emily Rose', prize: 'Luxury Car', date: 'January 30th', image: '/images/winner2.png' },
      { name: 'John Doe', prize: '€10,000 Pi', date: 'December 15th', image: '/images/winner2.png' },
    ];
    const [index, setIndex] = useState(0);

    useEffect(() => {
      const interval = setInterval(() => setIndex((prev) => (prev + 1) % winners.length), 5000);
      return () => clearInterval(interval);
    }, []);

    const current = winners[index];
    return (
      <div className="max-w-md mx-auto mt-12 bg-white bg-opacity-10 backdrop-blur-lg rounded-xl shadow-lg p-6 text-white text-center">
        <h2 className="text-2xl font-bold mb-4">🏆 Top Winner</h2>
        <Image src={current.image} alt={current.name} width={120} height={120} className="rounded-full border-4 border-blue-500 mb-4" />
        <h3 className="text-xl font-semibold">{current.name}</h3>
        <p className="text-blue-300">{current.prize}</p>
        <p className="text-sm text-white/70">{current.date}</p>
      </div>
    );
  };

  return (
    <>
      <div className="mt-0 mb-2 flex justify-center">
        <PiCashHeroBanner {...mockPiCashProps} />
      </div>

      <main className="space-y-16">
        <Section title="Featured Competitions" items={techItems} viewMoreHref="/competitions/featured" />
        <Section title="Travel & Lifestyle" items={premiumItems} viewMoreHref="/competitions/travel" />
        <Section title="Pi Giveaways" items={piItems} viewMoreHref="/competitions/pi" extraClass="mt-12" />
        <Section title="Crypto Giveaways" items={cryptoGiveawaysItems} viewMoreHref="/competitions/crypto-giveaways" />
        <Section title="Daily Competitions" items={dailyItems} viewMoreHref="/competitions/daily" extraClass="mt-12" />

        <section className="w-full bg-white/5 backdrop-blur-lg px-6 sm:px-10 py-12 my-8 border border-cyan-400 rounded-3xl shadow-[0_0_60px_#00ffd577] neon-outline">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-cyan-300 mb-10 font-orbitron">
              ✨ Featured Free Competition ✨
            </h2>
            <FreeCompetitionCard
              comp={{ endsAt: '2025-05-10T23:59:59Z', ticketsSold: 0, totalTickets: 10000, slug: 'pi-to-the-moon' }}
              title="Pi To The Moon"
              prize="10,000 π"
            />
          </div>
        </section>

        <TopWinnersCarousel />

        <div className="flex justify-center mt-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-md px-6 py-6 bg-gradient-to-r from-cyan-300 to-blue-500 rounded-xl shadow-lg text-black text-center text-base">
            <div><div className="text-xl font-bold">44,000+</div><div>Winners</div></div>
            <div><div className="text-xl font-bold">106,400 π</div><div>Total Pi Won</div></div>
            <div><div className="text-xl font-bold">15,000 π</div><div>Donated to Charity</div></div>
            <div><div className="text-xl font-bold">5★</div><div>User Rated</div></div>
          </div>
        </div>
      </main>
    </>
  );
}

// Reusable Section
function Section({ title, items, viewMoreHref, viewMoreText = 'View More', extraClass = '' }) {
  const isDaily = title.toLowerCase().includes('daily');
  const isFree = title.toLowerCase().includes('free');
  const isPi = title.toLowerCase().includes('pi');
  const isCrypto = title.toLowerCase().includes('crypto');

  return (
    <section className={`mb-12 ${extraClass}`}>
      <div className="text-center mb-12">
        <h2 className="w-full text-base font-bold text-center text-black bg-gradient-to-r from-[#00ffd5] to-[#0077ff] px-4 py-2 rounded-xl shadow font-orbitron">
          {title}
        </h2>
      </div>

      <div className="centered-carousel lg:hidden">
        {items.map((item, i) => {
          const key = item?.comp?.slug || i;
          if (!item?.comp) return null;

          if (isDaily) return <DailyCompetitionCard key={key} {...item} />;
          if (isFree) return <FreeCompetitionCard key={key} {...item} />;
          if (isPi) return <PiCompetitionCard key={key} {...item} />;
          if (isCrypto) return <CryptoGiveawayCard key={key} {...item} />;
          return <CompetitionCard key={key} {...item} />;
        })}
      </div>

      <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {items.map((item, i) => {
          const key = item?.comp?.slug || i;
          if (!item?.comp) return null;

          if (isDaily) return <DailyCompetitionCard key={key} {...item} />;
          if (isFree) return <FreeCompetitionCard key={key} {...item} />;
          if (isPi) return <PiCompetitionCard key={key} {...item} />;
          if (isCrypto) return <CryptoGiveawayCard key={key} {...item} />;
          return <CompetitionCard key={key} {...item} />;
        })}
      </div>

      <div className="text-center mt-4">
        <Link
          href={viewMoreHref}
          className="inline-block text-base font-bold px-3 py-1.5 rounded-md font-medium text-black bg-gradient-to-r from-[#00ffd5] to-[#0077ff] shadow hover:opacity-90 transition"
        >
          {viewMoreText}
        </Link>
      </div>
    </section>
  );
}
