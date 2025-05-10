// pages/competitions/daily.js
import DailyCompetitionCard from '@/components/DailyCompetitionCard'

const dailyComps = [
  {
    comp: {
      slug: 'everyday-pioneer',
      entryFee: 0.314,
      totalTickets: 1900,
      ticketsSold: 0,
      endsAt: '2025-05-03T15:14:00Z',
    },
    title: 'Everyday Pioneer',
    prize: '1,000 π',
    fee: '0.314 π',
  },
  {
    comp: {
      slug: 'pi-to-the-moon',
      entryFee: 3.14,
      totalTickets: 1900,
      ticketsSold: 0,
      endsAt: '2025-05-04T12:00:00Z',
    },
    title: 'Pi to the Moon',
    prize: '5,000 π',
    fee: '3.14 π',
  },
  {
    comp: {
      slug: 'hack-the-vault',
      entryFee: 0.375,
      totalTickets: 2225,
      ticketsSold: 1800,
      endsAt: '2025-05-03T23:59:59Z',
    },
    title: 'Hack The Vault',
    prize: '7,750 π',
    fee: '0.375 π',
  },
  {
    comp: {
      slug: '€5000',
      entryFee: 1.314,
      totalTickets: 5000,
      ticketsSold: 0,
      endsAt: '2025-05-03T15:14:00Z',
    },
    title: '€5000',
    prize: '€5000 Paid in Pi Equivalent',
    fee: '0.314 π',
  },
  {
    comp: {
      slug: 'daily-jackpot',
      entryFee: 0.375,
      totalTickets: 2225,
      ticketsSold: 0,
      endsAt: '2025-05-03T23:59:59Z',
    },
    title: 'Daily Jackpot',
    prize: '750 π',
    fee: '0.375 π',
  },
  {
    comp: {
      slug: 'the-daily-dash',
      entryFee: 3.14,
      totalTickets: 1900,
      ticketsSold: 0,
      endsAt: '2025-05-04T12:00:00Z',
    },
    title: 'The Daily Dash',
    prize: '5,000 π',
    fee: '3.14 π',
  },
]

export default function DailyCompetitionsPage() {
  return (
    <main className="pt-4 pb-10 px-4">
      <h1
        className="category-page-title text-center text-2xl font-bold mb-6 text-white"
        style={{ marginTop: 0 }}
      >
        All Daily Competitions
      </h1>

      <div className="category-grid mx-auto max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
    </main>
  )
}
