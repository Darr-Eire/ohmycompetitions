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
    <main className="pt-4 pb-10 px-4 bg-[#0d1021] min-h-screen">
      <h1 className="category-page-title text-center text-2xl font-bold mb-6 text-white font-orbitron">
        All Pi Competitions
      </h1>

      <div className="category-grid mx-auto max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {piComps.map(item => (
          <PiCompetitionCard
            key={item.comp.slug}
            comp={item.comp}
            title={item.title}
            prize={item.prize}
            fee={item.fee}
          />
        ))}
      </div>
    </main>
  )
}
