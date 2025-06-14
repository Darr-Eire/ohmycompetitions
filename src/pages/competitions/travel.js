'use client';

import Head from 'next/head';
import CompetitionCard from '@components/CompetitionCard';
import { premiumItems } from '@data/competitions'; // Adjust path to your data file

export default function TravelPage() {
  return (
    <>
      <Head>
        <title>Travel Competitions | OhMyCompetitions</title>
      </Head>

      <main className="app-background min-h-screen px-4 py-8 text-white">
        <div className="max-w-screen-lg mx-auto">
          <h1 className="text-3xl font-bold text-center mb-10 bg-gradient-to-r from-[#00ffd5] to-[#0077ff] bg-clip-text text-transparent">
            Travel & Lifestyle Giveaways
          </h1>

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
