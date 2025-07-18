'use client'

import Head from 'next/head'
import DailyCompetitionCard from '@components/DailyCompetitionCard'
import { dailyItems, launchWeekItems } from '../../data/competitions'

export default function DailyCompetitionsPage() {
  const allDailyCompetitions = [...launchWeekItems, ...dailyItems];

  return (
    <>
      <Head>
        <title>Daily Competitions | OhMyCompetitions</title>
      </Head>

      <main className="app-background min-h-screen px-0 py-0 text-white">
        <div className="max-w-screen-lg mx-auto px-6 sm:px-8 lg:px-10 py-8">
          <h1 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-[#00ffd5] to-[#0077ff] bg-clip-text text-transparent">
            Daily Competitions
          </h1>

          <p className="text-center text-white text-base sm:text-lg max-w-md mx-auto mb-10">
            Try your luck in our daily competitions starting from as little as{' '}
            <span className="font-semibold">0.31 π</span> per entry! We’re always adding new competitions and creating even more winners as time goes on — don’t miss your chance to join the excitement!
          </p>

     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16 mt-8">
  {allDailyCompetitions.map(item => (
    <DailyCompetitionCard
      key={item.comp.slug}
      comp={item.comp}
      title={item.title}
      prize={item.prize}
      fee={`${item.comp.entryFee.toFixed(2)} π`}
      disabled={true}
    />
  ))}
</div>

        </div>
      </main>
    </>
  )
}
