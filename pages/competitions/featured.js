// pages/competitions/featured.js
import Head from 'next/head'
import CompetitionCard from '@/components/CompetitionCard'

const featuredComps = [
  {
    comp: {
      slug: 'ps5-bundle-giveaway',
      entryFee: 0.8,
      totalTickets: 1100,
      ticketsSold: 0,
      endsAt: '2025-05-07T14:00:00Z',
    },
    title: 'PS5 Bundle',
    prize: 'PlayStation 5',
    fee: '0.8 π',
    href: '/competitions/ps5-bundle-giveaway',
    imageUrl: '/images/playstation.jpeg',
    theme: 'tech',
  },
  {
    comp: {
      slug: '55-inch-tv-giveaway',
      entryFee: 0.25,
      totalTickets: 1400,
      ticketsSold: 0,
      endsAt: '2025-05-08T11:30:00Z',
    },
    title: '55″ Smart TV',
    prize: '55″ Smart TV',
    fee: '0.25 π',
    href: '/competitions/55-inch-tv-giveaway',
    imageUrl: '/images/tv.jpg',
    theme: 'tech',
  },
  {
    comp: {
      slug: 'xbox-one-bundle',
      entryFee: 0.3,
      totalTickets: 2000,
      ticketsSold: 0,
      endsAt: '2025-05-09T17:45:00Z',
    },
    title: 'Xbox One',
    prize: 'Xbox One + Game Pass',
    fee: '0.3 π',
    href: '/competitions/xbox-one-bundle',
    imageUrl: '/images/xbox.jpeg',
    theme: 'tech',
  },
  {
    comp: {
      slug: 'gamer-pc-bundle',
      entryFee: 0.25,
      totalTickets: 1400,
      ticketsSold: 0,
      endsAt: '2025-05-08T11:30:00Z',
    },
    title: 'Gaming PC',
    prize: 'Gamer PC Bundle',
    fee: '0.25 π',
    href: '/competitions/gamer-pc-bundle',
    imageUrl: '/images/bundle.jpeg',
    theme: 'tech',
  },
  {
    comp: {
      slug: 'electric-bike',
      entryFee: 0.25,
      totalTickets: 1400,
      ticketsSold: 0,
      endsAt: '2025-05-08T11:30:00Z',
    },
    title: 'Electric Bike',
    prize: 'Electric Bike',
    fee: '0.25 π',
    href: '/competitions/electric-bike',
    imageUrl: '/images/bike.jpeg',
    theme: 'tech',
  },
  {
    comp: {
      slug: 'matchday-tickets',
      entryFee: 0.25,
      totalTickets: 1400,
      ticketsSold: 0,
      endsAt: '2025-05-08T11:30:00Z',
    },
    title: 'Matchday Tickets',
    prize: 'Matchday Tickets',
    fee: '0.25 π',
    href: '/competitions/matchday-tickets',
    imageUrl: '/images/liverpool.jpeg',
    theme: 'tech',
  },
]

export default function FeaturedCompetitionsPage() {
  return (
    <>
      <Head>
        <title>Featured Competitions | OhMyCompetitions</title>
      </Head>

      <main className="app-background min-h-screen px-4 py-8 text-white">
        <div className="max-w-screen-lg mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-[#00ffd5] to-[#0077ff] bg-clip-text text-transparent">
            Featured Competitions
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredComps.map((item) => (
              <CompetitionCard key={item.comp.slug} {...item} />
            ))}
          </div>
        </div>
      </main>
    </>
  )
}
