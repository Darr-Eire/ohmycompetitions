'use client'

import PiCompetitionCard from '@/components/PiCompetitionCard'

const piComps = [
  {
    comp: {
      slug: 'pi-giveaway-100k',
      entryFee: 10,
      totalTickets: 33000,
      ticketsSold: 0,
      endsAt: '2025-05-20T00:00:00Z',
    },
    title: '100,000 Pi Giveaway',
    prize: '100,000 π',
    fee: '10 π',
  },
  {
    comp: {
      slug: 'pi-giveaway-50k',
      entryFee: 5,
      totalTickets: 17000,
      ticketsSold: 0,
      endsAt: '2025-05-11T00:00:00Z',
    },
    title: '50,000 Pi Giveaway',
    prize: '50,000 π',
    fee: '5 π',
  },
  {
    comp: {
      slug: 'pi-giveaway-25k',
      entryFee: 2,
      totalTickets: 17000,
      ticketsSold: 0,
      endsAt: '2025-05-11T00:00:00Z',
    },
    title: '25,000 Pi Giveaway',
    prize: '25,000 π',
    fee: '2 π',
  },
]

export default function PiCompetitionsPage() {
  return (
    <main className="app-background min-h-screen px-4 py-8 text-white">
      <div className="max-w-screen-lg mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-[#00ffd5] to-[#0077ff] bg-clip-text text-transparent">
          Pi Competitions
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {piComps.map((item) => (
            <PiCompetitionCard key={item.comp.slug} {...item} />
          ))}
        </div>
      </div>
    </main>
  )
}
