'use client';

import Head from 'next/head';
import CompetitionCard from '@components/CompetitionCard';
import { premiumItems } from '@data/competitions'; // Adjust path to your data file

export default function TravelPage() {
  // Find lowest entry fee among premium items for subtitle
  const lowestEntryFee = premiumItems.reduce((min, item) => {
    const fee = item.comp?.entryFee ?? Infinity;
    return fee < min ? fee : min;
  }, Infinity);

  return (
    <>
      <Head>
        <title>Travel Competitions | OhMyCompetitions</title>
      </Head>

 <main className="app-background min-h-screen px-0 py-0 text-white">      
    <div className="max-w-screen-lg mx-auto px-4 sm:px-0">
          <h1
            className="
              text-3xl font-bold text-center mb-4
              bg-gradient-to-r from-[#00ffd5] to-[#0077ff]
              bg-clip-text text-transparent
            "
          >
            Travel & Lifestyle Giveaways
          </h1>

          {lowestEntryFee !== Infinity && (
           <p className="text-center text-white text-base sm:text-lg max-w-md mx-auto mb-8">
  Explore exclusive travel & lifestyle giveaways starting from just{' '}
  <span className="font-semibold">{lowestEntryFee.toFixed(2)} π</span> per entry. We’re always adding new competitions and creating even more winners as time goes on don’t miss your chance to join the excitement
</p>

          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {premiumItems.map((item, index) => (
              <CompetitionCard
                key={item.comp?.slug || index}
                {...item}
                comingSoon={item.comingSoon || item.comp?.comingSoon || false}
              />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
