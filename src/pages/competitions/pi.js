'use client'

import PiCompetitionCard from '@components/PiCompetitionCard'

const piComps = [
   {
    comp: { slug: 'pi-giveaway-10k', entryFee: 2.2, totalTickets: 5200, ticketsSold: 0, endsAt: '2025-06-30T00:00:00Z' },
    title: '10,000 Pi',
    prize: '10,000 π',
    href: '/competitions/pi-giveaway-10k',
    imageUrl: '/images/10000.png',
    theme: 'pi',
  },
  {
    comp: { slug: 'pi-giveaway-5k', entryFee: 1.8, totalTickets: 2900, ticketsSold: 0, endsAt: '2025-06-29T00:00:00Z' },
    title: '5,000 Pi',
    prize: '5,000 π',
    href: '/competitions/pi-giveaway-5k',
    imageUrl: '/images/5000.png',
    theme: 'pi',
  },
  {
    comp: { slug: 'pi-giveaway-2.5k', entryFee: 1.6, totalTickets: 1600, ticketsSold: 0, endsAt: '2025-06-28T00:00:00Z' },
    title: '2,500 Pi',
    prize: '2,500 π',
    href: '/competitions/pi-giveaway-2.5k',
    imageUrl: '/images/2500.png',
    theme: 'pi',
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
