// pages/competitions/pi.js

import CompetitionCard from '@/components/CompetitionCard'

const piComps = [
  {
    comp: {
      slug: 'pi-giveaway-100k',
      entryFee: 3.14,
      totalTickets: 33000,
      ticketsSold: 0,
      endsAt: '2025-05-12T00:00:00Z',
    },
    title: '100,000 π Giveaway',
    href: '/competitions/pi-giveaway-100k',
    prize: '100,000 π',
    fee: '10 π',
    imageUrl: '/images/100,000.png',
  },
  {
    comp: {
      slug: 'pi-giveaway-50k',
      entryFee: 3.14,
      totalTickets: 17000,
      ticketsSold: 0,
      endsAt: '2025-05-11T00:00:00Z',
    },
    title: '50,000 π Giveaway',
    href: '/competitions/pi-giveaway-50k',
    prize: '50,000 π',
    fee: '3.14 π',
    imageUrl: '/images/50,000.png',
  },
  {
    comp: {
      slug: 'pi-giveaway-25k',
      entryFee: 1.5,
      totalTickets: 18500,
      ticketsSold: 0,
      endsAt: '2025-05-10T00:00:00Z',
    },
    title: '25,000 π Giveaway',
    href: '/competitions/pi-giveaway-25k',
    prize: '25,000 π',
    fee: '1.5 π',
    imageUrl: '/images/25,000.png',
  },
  {
    comp: {
      slug: 'pi-giveaway-50k-encore',
      entryFee: 3.14,
      totalTickets: 17000,
      ticketsSold: 0,
      endsAt: '2025-05-11T00:00:00Z',
    },
    title: '50,000 π Giveaway (Encore)',
    href: '/competitions/pi-giveaway-50k',
    prize: '50,000 π',
    fee: '3.14 π',
    imageUrl: '/images/50,000.png',
  },
  {
    comp: {
      slug: 'pi-giveaway-25k-encore',
      entryFee: 1.5,
      totalTickets: 18500,
      ticketsSold: 0,
      endsAt: '2025-05-10T00:00:00Z',
    },
    title: '25,000 π Giveaway (Encore)',
    href: '/competitions/pi-giveaway-25k',
    prize: '25,000 π',
    fee: '1.5 π',
    imageUrl: '/images/25,000.png',
  },
]

export default function AllPiCompsPage() {
  return (
    <main className="py-10 px-4">
      <h1 className="category-page-title text-center text-2xl font-bold mb-6">
        All Pi Giveaways
      </h1>

      <div
        className="
          mx-auto max-w-5xl
          grid
          grid-cols-2       /* 2 columns on small screens */
          sm:grid-cols-3    /* 3 columns at ≥640px */
          md:grid-cols-4    /* 4 columns at ≥768px */
          gap-4             /* tighter spacing so more cards fit */
        "
      >
        {piComps.map(item => (
          <CompetitionCard
            key={item.comp.slug}
            comp={item.comp}
            title={item.title}
            prize={item.prize}
            fee={item.fee}
            href={item.href}
            imageUrl={item.imageUrl}
            small
            theme="purple"
            className="transform scale-100 transition-all duration-200"
          />
        ))}
      </div>
    </main>
  )
}
