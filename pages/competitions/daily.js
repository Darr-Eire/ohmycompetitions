// pages/competitions/daily.js
import CompetitionCard from '@/components/CompetitionCard'

const dailyComps = [
  {
    comp: {
      slug: 'pi-to-the-moon',
      entryFee: 3.14,
      totalTickets: 1900,
      ticketsSold: 0,
      endsAt: '2025-05-04T12:00:00Z',
    },
    title: 'Pi To The Moon',
    href: '/competitions/pi-to-the-moon',
    prize: '5,000 Pi',
    fee: '3.14 π',
    imageUrl: '/images/pitothemoon.jpeg',
  },
  {
    comp: {
      slug: 'everyday-pioneer',
      entryFee: 0.314,
      totalTickets: 1900,
      ticketsSold: 0,
      endsAt: '2025-05-03T15:14:00Z',
    },
    title: 'Everyday Pioneer',
    href: '/competitions/everyday-pioneer',
    prize: '1,000 Pi',
    fee: '0.314 π',
    imageUrl: '/images/everyday.png',
  },
  {
    comp: {
      slug: 'hack-the-vault',
      entryFee: 0.375,
      totalTickets: 2225,
      ticketsSold: 0,
      endsAt: '2025-05-03T23:59:59Z',
    },
    title: 'Hack The Vault',
    href: '/competitions/hack-the-vault',
    prize: '750 Pi',
    fee: '0.375 π',
    imageUrl: '/images/vault.png',
  },
  {
    comp: {
      slug: 'pi-to-the-moon',
      entryFee: 3.14,
      totalTickets: 1900,
      ticketsSold: 0,
      endsAt: '2025-05-04T12:00:00Z',
    },
    title: 'Pi To The Moon',
    href: '/competitions/pi-to-the-moon',
    prize: '5,000 Pi',
    fee: '3.14 π',
    imageUrl: '/images/pitothemoon.jpeg',
  },
  {
    comp: {
      slug: 'everyday-pioneer',
      entryFee: 0.314,
      totalTickets: 1900,
      ticketsSold: 0,
      endsAt: '2025-05-03T15:14:00Z',
    },
    title: 'Everyday Pioneer',
    href: '/competitions/everyday-pioneer',
    prize: '1,000 Pi',
    fee: '0.314 π',
    imageUrl: '/images/everyday.png',
  },
  {
    comp: {
      slug: 'hack-the-vault',
      entryFee: 0.375,
      totalTickets: 2225,
      ticketsSold: 0,
      endsAt: '2025-05-03T23:59:59Z',
    },
    title: 'Hack The Vault',
    href: '/competitions/hack-the-vault',
    prize: '750 Pi',
    fee: '0.375 π',
    imageUrl: '/images/vault.png',
  },
]

export default function DailyCompetitionsPage() {
  return (
    <main className="pt-8 pb-12 px-4 bg-white min-h-screen">
 <h1 className="category-page-title">All Daily Competitions</h1>
<div className="category-grid">
  {dailyComps.map(item => (
    <CompetitionCard
      key={item.comp.slug}
      comp={item.comp}
      title={item.title}
      prize={item.prize}
      fee={item.fee}
      href={item.href}
      imageUrl={item.imageUrl}
      theme="daily"
      small
    />
  ))}
</div>

    </main>
  )
}
