// pages/competitions/daily.js
import CompetitionCard from '@/components/CompetitionCard'

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
    href: '/competitions/everyday-pioneer',
    imageUrl: '/images/everyday.png',
    theme: 'daily',
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
    href: '/competitions/pi-to-the-moon',
    imageUrl: '/images/pitothemoon.png',
    theme: 'daily',
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
    href: '/competitions/hack-the-vault',
    imageUrl: '/images/vault.png',
    theme: 'daily',
  },
  {
    comp: {
      slug: 'daily-pi-slice',
      entryFee: 0.314,
      totalTickets: 1900,
      ticketsSold: 0,
      endsAt: '2025-05-03T15:14:00Z',
    },
    title: 'Daily Pi Slice',
    prize: '1,000 π',
    fee: '0.314 π',
    href: '/competitions/daily-pi-slice',
    imageUrl: '/images/daily.png',
    theme: 'daily',
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
    href: '/competitions/daily-jackpot',
    imageUrl: '/images/jackpot.png',
    theme: 'daily',
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
    href: '/competitions/the-daily-dash',
    imageUrl: '/images/dash.png',
    theme: 'daily',
  },
]

export default function DailyCompetitionsPage() {
  return (
    <main className="pt-4 pb-10 px-4">
      {/* Title moved up and in white */}
      <h1
        className="category-page-title text-center text-2xl font-bold mb-6 text-white"
        style={{ marginTop: 0 }}
      >
        All Daily Competitions
      </h1>

      {/* 3‑column grid */}
      <div className="category-grid mx-auto max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {dailyComps.map(item => (
          <CompetitionCard
            key={item.comp.slug}
            comp={item.comp}
            title={item.title}
            prize={item.prize}
            fee={item.fee}
            href={item.href}
            imageUrl={item.imageUrl}
            theme={item.theme}
            small
          />
        ))}
      </div>
    </main>
  )
}
