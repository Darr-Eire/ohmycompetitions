// pages/competitions/premium.js
import CompetitionCard from '@/components/CompetitionCard'

const premiumComps = [
  
   
  
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
    prize: '7‑Day Dubai Trip',
    fee: '20 π',
    imageUrl: '/images/dubai-luxury-holiday.jpg',
    theme: 'premium',
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
    href: '/competitions/penthouse-hotel-stay',
    prize: 'Penthouse Hotel Stay of your choice',
    fee: '15 π',
    imageUrl: '/images/hotel.jpeg',
    theme: 'premium',
  },
  {
    comp: {
      slug: 'the-crown-jewels',
      entryFee: 20,
      totalTickets: 15000,
      ticketsSold: 7100,
      endsAt: '2025-05-18T22:00:00Z',
    },
    title: 'The Crown Jewels',
    href: '/competitions/the-crown-jewels',
    prize: 'Crown Jewels',
    fee: '20 π',
    imageUrl: '/images/jew.jpeg',
    theme: 'premium',
  },
  {
    comp: {
      slug: 'first-class-flight',
      entryFee: 15,
      totalTickets: 5000,
      ticketsSold: 4875,
      endsAt: '2025-05-15T21:00:00Z',
    },
    title: 'First Class Flight',
    href: '/competitions/first-class-flight',
    prize: 'Return flights to anywhere in the world',
    fee: '15 π',
    imageUrl: '/images/first.jpeg',
    theme: 'premium',
  },
  {
    comp: {
      slug: 'luxury-yacht-weekend',
      entryFee: 30,
      totalTickets: 8000,
      ticketsSold: 0,
      endsAt: '2025-06-10T00:00:00Z',
    },
    title: 'Luxury Yacht Weekend',
    href: '/competitions/luxury-yacht-weekend',
    prize: '3‑day Mediterranean Yacht Cruise',
    fee: '30 π',
    imageUrl: '/images/yacht.jpeg',
    theme: 'premium',
  },
]

export default function AllPremiumCompsPage() {
  return (
    <main className="pt-4 pb-10 px-4">
      {/* Title moved up (pt-4) and in white */}
      <h1
  className="category-page-title text-center text-2xl font-bold mb-6 bg-gradient-to-r from-[#00ffd5] to-[#0077ff] bg-clip-text text-transparent"
  style={{ marginTop: 0 }}
>
  Coming Soon
</h1>


      {/* Always 3 columns */}
      <div className="category-grid mx-auto max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {premiumComps.map(item => (
          <CompetitionCard
            key={item.comp.slug}
            {...item}
            small
          />
        ))}
      </div>
    </main>
  )
}
