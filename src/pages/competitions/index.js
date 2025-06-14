'use client';

import { useState } from 'react';
import {
  techItems,
  premiumItems,
  piItems,
  freeItems,
  cryptoGiveawaysItems,
  dailyItems,
} from '@data/competitions';

import CompetitionCard from '@components/CompetitionCard';
import PiCompetitionCard from '@components/PiCompetitionCard';
import DailyCompetitionCard from '@components/DailyCompetitionCard';
import FreeCompetitionCard from '@components/FreeCompetitionCard';
import CryptoGiveawayCard from '@components/CryptoGiveawayCard';

// Ensure theme is attached to each item
const themed = (items, theme) => items.map((item) => ({ ...item, theme }));

const FILTERS = {
  All: [
    ...themed(techItems, 'tech'),
    ...themed(premiumItems, 'premium'),
    ...themed(piItems, 'pi'),
    ...themed(freeItems, 'free'),
    ...themed(cryptoGiveawaysItems, 'crypto'),
    ...themed(dailyItems, 'daily'),
  ],
  Pi: themed(piItems, 'pi'),
  Crypto: themed(cryptoGiveawaysItems, 'crypto'),
  Free: themed(freeItems, 'free'),
  Daily: themed(dailyItems, 'daily'),
  Tech: themed(techItems, 'tech'),
  Premium: themed(premiumItems, 'premium'),
};

export default function AllCompetitionsPage() {
  const [active, setActive] = useState('All');

  const renderCard = (item, i) => {
    const key = item.comp?.slug || `item-${i}`;
    const props = {
      key,
      comp: item.comp,
      title: item.title,
      prize: item.prize,
      fee: `${(item.comp?.entryFee ?? 0).toFixed(2)} π`,
      imageUrl: item.imageUrl,
      endsAt: item.comp.endsAt,
    };

    switch (item.theme) {
      case 'pi':
        return <PiCompetitionCard {...props} />;
      case 'daily':
        return <DailyCompetitionCard {...props} />;
      case 'crypto':
        return <CryptoGiveawayCard {...props} />;
      case 'free':
        return <FreeCompetitionCard {...props} />;
      default:
        return <CompetitionCard {...props} />;
    }
  };

  return (
    <main className="app-background min-h-screen px-4 py-2 text-white font-orbitron">
    {/* Hero banner */}
<div className="text-center mb-0 mt-0">
  <h1 className="text-xl sm:text-xl font-bold text-cyan-300 mb-2">
    Explore Live Competitions
  </h1>
  <p className="text-white/80 max-w-md mx-auto text-xs sm:text-sm leading-snug">
    Enter exclusive competitions powered by Pi. Win tech, crypto, lifestyle experiences and more — new draws every week.
  </p>
</div>


      {/* Filter bar */}
      <div className="flex flex-wrap justify-center gap-3 mb-10">
        {Object.keys(FILTERS).map((key) => (
          <button
            key={key}
            onClick={() => setActive(key)}
            className={`px-4 py-2 rounded-md border text-sm font-bold transition ${
              active === key
                ? 'bg-cyan-400 text-black shadow-lg'
                : 'border-cyan-400 text-cyan-300 hover:bg-cyan-800/20'
            }`}
          >
            {key}
          </button>
        ))}
      </div>

      {/* Grid display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {FILTERS[active].map((item, i) => renderCard(item, i))}
      </div>
    </main>
  );
}
