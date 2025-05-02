// pages/competitions/premium.js
import CompetitionCard from '@/components/CompetitionCard'

const premiumComps = [
  {
    comp: { slug: 'tesla-model-3-giveaway', entryFee: 50 },
    title: 'Tesla Model 3 Giveaway',
    href: '/competitions/tesla-model-3-giveaway',
    prize: 'Tesla Model 3',
    fee: '50 π',
    imageUrl: '/images/tesla.jpeg',
  },
  {
    comp: { slug: 'dubai-luxury-holiday', entryFee: 25 },
    title: 'Dubai Luxury Holiday',
    href: '/competitions/dubai-luxury-holiday',
    prize: '7-Day Dubai Trip',
    fee: '25 π',
    imageUrl: '/images/dubai-luxury-holiday.jpg',
  },
  {
    comp: { slug: 'penthouse-hotel-stay', entryFee: 15 },
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
