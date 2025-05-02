// pages/competitions/tech.js
import CompetitionCard from '@/components/CompetitionCard'

const techComps = [
  {
    comp: { slug: 'ps5-bundle-giveaway', entryFee: 0.5 },
    title: 'PS5 Bundle Giveaway',
    href: '/competitions/ps5-bundle-giveaway',
    prize: 'PlayStation 5 + Extra Controller',
    fee: '0.5 π',
    imageUrl: '/images/ps5.jpeg',
  },
  {
    comp: { slug: '55-inch-tv-giveaway', entryFee: 0.75 },
    title: '55" TV Giveaway',
    href: '/competitions/55-inch-tv-giveaway',
    prize: '55" Smart TV',
    fee: '0.75 π',
    imageUrl: '/images/Tv.jpeg',
  },
  {
    comp: { slug: 'xbox-one-bundle', entryFee: 0.6 },
    title: 'Xbox One Bundle',
    href: '/competitions/xbox-one-bundle',
    prize: 'Xbox One + Game Pass',
    fee: '0.6 π',
    imageUrl: '/images/xbox.jpeg',
  },
]

export default function AllTechCompsPage() {
  return (
    <main className="py-10 px-4">
      <h1 className="category-page-title text-center text-2xl font-bold mb-6">All Tech Giveaways</h1>
      <div className="category-grid mx-auto max-w-5xl grid grid-cols-1 sm:grid-cols-2 gap-6">
        {techComps.map(item => (
          <CompetitionCard key={item.comp.slug} {...item} theme="orange" small />
        ))}
      </div>
    </main>
  )
}
