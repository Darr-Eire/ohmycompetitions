'use client';

import Head from 'next/head';
import DailyCompetitionCard from '@components/DailyCompetitionCard';
import { useState } from 'react';

// Import your static data or define it here
export const competitionsData = [
  {
    _id: "687c330c0d220984a4e83c59",
    comp: {
      title: "Ps5 Bundle Giveaway",
      description: "",
      prize: "Win This Ps5 Bundle",
      href: "/competitions/ps5-bundle-giveaway",
      theme: "tech",
      imageUrl: "/images/playstation.jpeg",
      thumbnail: null,
      winners: [],
      payments: [],
      createdAt: "2025-07-20T00:06:36.978+00:00",
      updatedAt: "2025-07-20T00:06:36.978+00:00",
      __v: 0,
    },
    title: "Ps5 Bundle Giveaway",
    prize: "Win This Ps5 Bundle",
    href: "/competitions/ps5-bundle-giveaway",
    theme: "tech",
    imageUrl: "/images/playstation.jpeg",
  },
  {
    _id: "688fbfdff765e858a83d4c60",
    comp: {
      title: "OMC Mega Pi Drop",
      description: "",
      prize: "300 Pi",
      href: "/competitions/omc-mega-pi-drop",
      theme: "daily",
      imageUrl: "/images/your.png",
      thumbnail: null,
      winners: [],
      payments: [],
      createdAt: "2025-08-03T20:00:31.603+00:00",
      updatedAt: "2025-08-03T20:00:31.603+00:00",
      __v: 0,
    },
    title: "OMC Mega Pi Drop",
    prize: "300 Pi",
    href: "/competitions/omc-mega-pi-drop",
    theme: "daily",
    imageUrl: "/images/your.png",
  },
  {
    _id: "688fcd7ff765e858a83d4d1a",
    comp: {
      title: "OMC 2,500 Pi Prize Pool",
      description: "",
      prize: "2500",
      href: "/competitions/omc-2500-pi-prize-pool",
      theme: "pi",
      imageUrl: "/images/your.png",
      thumbnail: null,
      winners: [],
      payments: [],
      createdAt: "2025-08-03T20:58:39.285+00:00",
      updatedAt: "2025-08-03T20:58:39.285+00:00",
      __v: 0,
    },
    title: "OMC 2,500 Pi Prize Pool",
    prize: "2500",
    href: "/competitions/omc-2500-pi-prize-pool",
    theme: "pi",
    imageUrl: "/images/your.png",
  },
  {
    _id: "688fd1dff765e858a83d4d52",
    comp: {
      title: "OMC Pi Mini Jackpot",
      description: "",
      prize: "250",
      href: "/competitions/omc-pi-mini-jackpot",
      theme: "daily",
      imageUrl: "/images/your.png",
      thumbnail: null,
      winners: [],
      payments: [],
      createdAt: "2025-08-03T21:17:19.624+00:00",
      updatedAt: "2025-08-03T21:17:19.624+00:00",
      __v: 0,
    },
    title: "OMC Pi Mini Jackpot",
    prize: "250",
    href: "/competitions/omc-pi-mini-jackpot",
    theme: "daily",
    imageUrl: "/images/your.png",
  },
  {
    _id: "688fd3fef765e858a83d4d9f",
    comp: {
      title: "OMC Pi Pioneers Draw",
      description: "",
      prize: "750",
      href: "/competitions/omc-pi-pioneers-draw",
      theme: "daily",
      imageUrl: "/images/your.png",
      thumbnail: null,
      winners: [],
      payments: [],
      createdAt: "2025-08-03T21:26:22.132+00:00",
      updatedAt: "2025-08-03T21:26:22.132+00:00",
      __v: 0,
    },
    title: "OMC Pi Pioneers Draw",
    prize: "750",
    href: "/competitions/omc-pi-pioneers-draw",
    theme: "daily",
    imageUrl: "/images/your.png",
  },
  {
    _id: "688fd4e1f765e858a83d4dbc",
    comp: {
      title: "OMC Mega Pi Draw",
      description: "",
      prize: "300",
      href: "/competitions/omc-mega-pi-draw",
      theme: "daily",
      imageUrl: "/images/your.png",
      thumbnail: null,
      winners: [],
      payments: [],
      createdAt: "2025-08-03T21:30:09.105+00:00",
      updatedAt: "2025-08-03T21:30:09.105+00:00",
      __v: 0,
    },
    title: "OMC Mega Pi Draw",
    prize: "300",
    href: "/competitions/omc-mega-pi-draw",
    theme: "daily",
    imageUrl: "/images/your.png",
  },
];



export default function DailyCompetitionsPage() {
  // Filter only daily competitions
  const dailyCompetitions = competitionsData.filter(item => item.comp?.theme === 'daily');

  return (
    <>
      <Head>
        <title>Daily Competitions | OhMyCompetitions</title>
      </Head>

      <main className="app-background min-h-screen px-0 py-0 text-white">
        <div className="max-w-screen-lg mx-auto px-6 sm:px-8 lg:px-10 py-8">
          <h1 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-[#00ffd5] to-[#0077ff] bg-clip-text text-transparent">
            Daily Competitions
          </h1>

          <p className="text-center text-white text-base sm:text-lg max-w-md mx-auto mb-10">
            Try your luck in our daily competitions starting from as little as{' '}
            <span className="font-semibold">0.31 π</span> per entry. We’re always adding new competitions and creating even more winners as time goes on — don’t miss your chance to join the excitement!
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16 mt-8">
            {dailyCompetitions.map((item) => {
              const hasStarted = new Date(item.comp.startsAt) <= new Date();

              return (
                <DailyCompetitionCard
                  key={item.comp.slug || item._id}
                  comp={item.comp}
                  title={item.title}
                  prize={item.prize}
                  fee={item.comp.entryFee !== undefined ? `${item.comp.entryFee.toFixed(2)} π` : 'Free'}
                  isLive={hasStarted}
                />
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
}
