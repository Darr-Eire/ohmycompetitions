// pages/competitions/tech.js
import CompetitionCard from '@/components/CompetitionCard'
export default function AllTechCompsPage() {
const techComps = [
  {
    comp: {
      slug: 'ps5-bundle-giveaway',
      entryFee: 0.8,
      totalTickets: 1100,
      ticketsSold: 0,
      endsAt: '2025-05-07T14:00:00Z',
    },
    title: 'PS5 Bundle Giveaway',
    prize: 'PlayStation 5 + Extra Controller',
    fee: '0.8 π',
    href: '/competitions/ps5-bundle-giveaway',
    imageUrl: '/images/playstation.jpeg',
    theme: 'orange',
  },
  {
    comp: {
      slug: '55-inch-tv-giveaway',
      entryFee: 0.25,
      totalTickets: 1400,
      ticketsSold: 0,
      endsAt: '2025-05-08T11:30:00Z',
    },
    title: '55″ TV Giveaway',
    prize: '55″ Smart TV',
    fee: '0.25 π',
    href: '/competitions/55-inch-tv-giveaway',
    imageUrl: '/images/tv.jpg',
    theme: 'orange',
  },
  {
    comp: {
      slug: 'xbox-one-bundle',
      entryFee: 0.3,
      totalTickets: 2000,
      ticketsSold: 0,
      endsAt: '2025-05-09T17:45:00Z',
    },
    title: 'Xbox One Bundle',
    prize: 'Xbox One + Game Pass',
    fee: '0.3 π',
    href: '/competitions/xbox-one-bundle',
    imageUrl: '/images/xbox.jpeg',
    theme: 'orange',
  },
  {
    comp: {
      slug: 'apple-iphone',
      entryFee: 0.8,
      totalTickets: 1100,
      ticketsSold: 0,
      endsAt: '2025-05-07T14:00:00Z',
    },
    title: 'Apple Iphone',
    prize: 'PlayStation 5 + Extra Controller',
    fee: '0.8 π',
    href: '/competitions/apple-iphone',
    imageUrl: '/images/iphone.jpeg',
    theme: 'orange',
  },
  {
    comp: {
      slug: 'Rolex',
      entryFee: 0.25,
      totalTickets: 1400,
      ticketsSold: 0,
      endsAt: '2025-05-08T11:30:00Z',
    },
    title: 'Rolex',
    prize: 'Rolex',
    fee: '0.25 π',
    href: '/competitions/rolex',
    imageUrl: '/images/rolex.jpeg',
    theme: 'orange',
  },
  {
    comp: {
      slug: 'gamer-pc-bundle',
      entryFee: 0.3,
      totalTickets: 2000,
      ticketsSold: 0,
      endsAt: '2025-05-09T17:45:00Z',
    },
    title: 'Gamer Pc Bundle',
    prize: 'Electic-Bundle',
    fee: '0.3 π',
    href: '/competitions/gamer-pc-bundle',
    imageUrl: '/images/bundle.jpeg',
    theme: 'orange',
  },
  {
    comp: {
      slug: 'mac-book-pro',
      entryFee: 0.3,
      totalTickets: 2000,
      ticketsSold: 0,
      endsAt: '2025-05-09T17:45:00Z',
    },
    title: 'Macbook Pro',
    prize: 'MacBook Pro',
    fee: '0.3 π',
    href: '/competitions/macbook-pro',
    imageUrl: '/images/macbook.jpeg',
    theme: 'orange',
  },
  {
    comp: {
      slug: 'electric-bike',
      entryFee: 0.3,
      totalTickets: 2000,
      ticketsSold: 0,
      endsAt: '2025-05-09T17:45:00Z',
    },
    title: 'Electric Bike',
    prize: 'Electric Bike',
    fee: '0.3 π',
    href: '/competitions/electric-bike',
    imageUrl: '/images/bike.jpeg',
    theme: 'orange',
  },
]


  return (
    <main className="pt-4 pb-10 px-4">
      {/* Title moved up (pt-4) and in white */}
      <h1
        className="category-page-title text-center text-2xl font-bold mb-6 text-white"
        style={{ marginTop: 0 }}
      >
        All Tech Giveaways
      </h1>

      {/* Always 3 columns */}
      <div className="category-grid mx-auto max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {techComps.map(item => (
          <CompetitionCard
            key={item.comp.slug}
            {...item}
            theme="orange"
            small
          />
        ))}
      </div>
    </main>
  )
}
