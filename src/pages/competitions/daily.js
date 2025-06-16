'use client'

import Head from 'next/head'
import DailyCompetitionCard from '@components/DailyCompetitionCard'

const dailyComps = [
  {
    comp: { 
      slug: 'daily-jackpot', 
      entryFee: 0.45, 
      totalTickets: 1820, 
      ticketsSold: 0, 
      endsAt: '2025-06-30T23:59:59Z',
      comingSoon: true,
    },
    title: 'Daily Jackpot',
    prize: '750 π',
    href: 'ticket-purchase/daily',
    imageUrl: '/images/jackpot.png',
    theme: 'daily',
  },
  {
    comp: { 
      slug: 'everyday-pioneer', 
      entryFee: 0.31, 
      totalTickets: 1900, 
      ticketsSold: 0, 
      endsAt: '2025-06-30T15:14:00Z',
      comingSoon: true,
    },
    title: 'Everyday Pioneer',
    prize: '1,000 π',
    href: '/competitions/everyday-pioneer',
    imageUrl: '/images/everyday.png',
    theme: 'daily',
  },
  {
    comp: { 
      slug: 'daily-pi-slice', 
      entryFee: 0.37, 
      totalTickets: 1500, 
      ticketsSold: 0, 
      endsAt: '2025-06-25T15:14:00Z',
      comingSoon: true,
    },
    title: 'Daily Pi Slice',
    prize: '500 π',
    href: '/competitions/daily-pi-slice',
    imageUrl: '/images/daily.png',
    theme: 'daily',
  },
]


export default function DailyCompetitionsPage() {
  return (
    <>
      <Head>
        <title>Daily Competitions | OhMyCompetitions</title>
      </Head>

      <main className="app-background min-h-screen px-4 py-8 text-white">
        <div className="max-w-screen-lg mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-[#00ffd5] to-[#0077ff] bg-clip-text text-transparent">
            Daily Competitions
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {dailyComps.map(item => (
              <DailyCompetitionCard
                key={item.comp.slug}
                comp={item.comp}
                title={item.title}
                prize={item.prize}
                fee={item.fee}
              />
            ))}
          </div>
        </div>
      </main>
    </>
  )
}
