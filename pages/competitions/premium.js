// pages/competitions/premium.js
import CompetitionCard from '@/components/CompetitionCard'

const premiumComps = [
  {
    comp: {
      slug: 'tesla-model-3-giveaway',
      entryFee: 40,
      totalTickets: 20000,
      ticketsSold: 5120,
      endsAt: '2025-05-20T23:59:00Z',
    },
    title: 'Tesla Model 3 Giveaway',
    href: '/competitions/tesla-model-3-giveaway',
    prize: 'Tesla Model 3',
    fee: '40 π',
    imageUrl: '/images/tesla.jpeg',
  },
  {
    comp: {
      slug: 'dubai-luxury-holiday',
      entryFee: 20,
      totalTickets: 15000,
      ticketsSold: 7100,
      endsAt: '2025-05-18T22:00:00Z',
    },
    title: 'Dubai Luxury Holiday',
    href: '/competitions/dubai-luxury-holiday',
    prize: '7-Day Dubai Trip',
    fee: '20 π',
    imageUrl: '/images/dubai-luxury-holiday.jpg',
  },
  {
    comp: {
      slug: 'penthouse-hotel-stay',
      entryFee: 15,
      totalTickets: 5000,
      ticketsSold: 4875,
      endsAt: '2025-05-15T21:00:00Z',
    },
    title: 'Penthouse Hotel Stay',
    href: '/competitions/macbook-pro-2025-giveaway',
    prize: 'Penthouse Hotel Stay of your choice',
    fee: '15 π',
    imageUrl: '/images/hotel.jpeg',
  },
  {
    comp: {
      slug: 'tesla-model-3-giveaway',
      entryFee: 40,
      totalTickets: 20000,
      ticketsSold: 5120,
      endsAt: '2025-05-20T23:59:00Z',
    },
    title: 'Tesla Model 3 Giveaway',
    href: '/competitions/tesla-model-3-giveaway',
    prize: 'Tesla Model 3',
    fee: '40 π',
    imageUrl: '/images/tesla.jpeg',
  },
  {
    comp: {
      slug: 'dubai-luxury-holiday',
      entryFee: 20,
      totalTickets: 15000,
      ticketsSold: 7100,
      endsAt: '2025-05-18T22:00:00Z',
    },
    title: 'Dubai Luxury Holiday',
    href: '/competitions/dubai-luxury-holiday',
    prize: '7-Day Dubai Trip',
    fee: '20 π',
    imageUrl: '/images/dubai-luxury-holiday.jpg',
  },
  {
    comp: {
      slug: 'penthouse-hotel-stay',
      entryFee: 15,
      totalTickets: 5000,
      ticketsSold: 4875,
      endsAt: '2025-05-15T21:00:00Z',
    },
    title: 'Penthouse Hotel Stay',
    href: '/competitions/macbook-pro-2025-giveaway',
    prize: 'Penthouse Hotel Stay of your choice',
    fee: '15 π',
    imageUrl: '/images/hotel.jpeg',
  },
]

export default function AllPremiumCompsPage() {
  return (
    <main className="py-10 px-4">
      <h1 className="category-page-title text-center text-2xl font-bold mb-6">All Premium Competitions</h1>
      <div className="category-grid mx-auto max-w-5xl grid grid-cols-1 sm:grid-cols-2 gap-6">
        {premiumComps.map(item => (
          <CompetitionCard key={item.comp.slug} {...item} theme="premium" small />
        ))}
      </div>
    </main>
  )
}
