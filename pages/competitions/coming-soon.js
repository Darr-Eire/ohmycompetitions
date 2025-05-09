// pages/competitions/coming-soon.js
import Head from 'next/head'
import CompetitionCard from '@/components/CompetitionCard'
import { premiumItems } from '@/data/competitions' // adjust path if needed

export default function ComingSoonPage() {
  return (
    <>
      <Head>
        <title>Coming Soon | OhMyCompetitions</title>
      </Head>

      <main className="app-background min-h-screen px-4 py-8 text-white">
        <div className="max-w-screen-lg mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-[#00ffd5] to-[#0077ff] bg-clip-text text-transparent">
            Coming Soon
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {premiumItems.map((item) => (
              <CompetitionCard key={item.comp.slug} {...item} />
            ))}
          </div>
        </div>
      </main>
    </>
  )
}
