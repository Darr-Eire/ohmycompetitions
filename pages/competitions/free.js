// pages/competitions/free.js
import CompetitionCard from '@/components/CompetitionCard'

const freeComps = [
  {
    comp: {
      slug: 'pi-day-freebie',
      entryFee: 0,
      totalTickets: 10000,
      ticketsSold: 0,
      endsAt: '2025-05-06T20:00:00Z',
    },
    title: 'Pi Day Freebie',
    href: '/competitions/pi-day-freebie',
    prize: '🎉 TBH',
    fee: 'Free',
    imageUrl: '/images/freebie.png',
  },
  {
    comp: {
      slug: 'everyones-a-winner',
      entryFee: 0,
      totalTickets: 10000,
      ticketsSold: 0,
      endsAt: '2025-05-10T18:00:00Z',
    },
    title: "Everyone's A Winner",
    href: '/competitions/everyones-a-winner',
    prize: '🎉 1st 6,000\n2nd 3,000\n3rd 1,000',
    fee: 'Free',
    imageUrl: '/images/everyone.png',
  },
  {
    comp: {
      slug: 'weekly-pi-giveaway',
      entryFee: 0,
      totalTickets: 5000,
      ticketsSold: 0,
      endsAt: '2025-05-05T23:59:59Z',
    },
    title: 'Weekly Pi Giveaway',
    href: '/competitions/weekly-pi-giveaway',
    prize: '1,000 π Giveaway',
    fee: 'Free',
    imageUrl: '/images/weekly.png',
  },
  {
    comp: {
      slug: 'pi-day-freebie',
      entryFee: 0,
      totalTickets: 10000,
      ticketsSold: 0,
      endsAt: '2025-05-06T20:00:00Z',
    },
    title: 'Pi Day Freebie',
    href: '/competitions/pi-day-freebie',
    prize: '🎉 TBH',
    fee: 'Free',
    imageUrl: '/images/freebie.png',
  },
  {
    comp: {
      slug: 'everyones-a-winner',
      entryFee: 0,
      totalTickets: 10000,
      ticketsSold: 0,
      endsAt: '2025-05-10T18:00:00Z',
    },
    title: "Everyone's A Winner",
    href: '/competitions/everyones-a-winner',
    prize: '🎉 1st 6,000\n2nd 3,000\n3rd 1,000',
    fee: 'Free',
    imageUrl: '/images/everyone.png',
  },
  {
    comp: {
      slug: 'weekly-pi-giveaway',
      entryFee: 0,
      totalTickets: 5000,
      ticketsSold: 0,
      endsAt: '2025-05-05T23:59:59Z',
    },
    title: 'Weekly Pi Giveaway',
    href: '/competitions/weekly-pi-giveaway',
    prize: '1,000 π Giveaway',
    fee: 'Free',
    imageUrl: '/images/weekly.png',
  },
]

export default function AllFreeCompsPage() {
  return (
    <main className="py-10 px-4">
      <h1 className="category-page-title text-center text-2xl font-bold mb-6">All Free Competitions</h1>
      <div className="category-grid mx-auto max-w-5xl grid grid-cols-1 sm:grid-cols-2 gap-6">
        {freeComps.map(item => (
          <CompetitionCard key={item.comp.slug} {...item} theme="green" small />
        ))}
      </div>
    </main>
  )
}
