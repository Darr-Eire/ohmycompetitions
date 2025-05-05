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
    title: 'Pi‑Day Freebie',
    prize: 'Special Badge',
    fee: 'Free',
    href: '/competitions/pi-day-freebie',
    imageUrl: '/images/piday.png',
    theme: 'free',
  },
  {
    comp: {
      slug: 'weekly-giveaway',
      entryFee: 0,
      totalTickets: 5000,
      ticketsSold: 0,
      endsAt: '2025-05-05T23:59:59Z',
    },
    title: 'Weekly Giveaway',
    prize: '1,000 π',
    fee: 'Free',
    href: '/competitions/weekly-pi-giveaway',
    imageUrl: '/images/weekly.png',
    theme: 'free',
  },
  {
    comp: {
      slug: 'pi-miners-bonanza',
      entryFee: 0,
      totalTickets: 10000,
      ticketsSold: 0,
      endsAt: '2025-05-06T20:00:00Z',
    },
    title: 'Pi Miners Bonanza',
    prize: 'Special Badge',
    fee: 'Free',
    href: '/competitions/pi-miners-bonanza',
    imageUrl: '/images/bonanza.png',
    theme: 'free',
  },
  {
    comp: {
      slug: 'pi-nugget-giveaway',
      entryFee: 0,
      totalTickets: 10000,
      ticketsSold: 0,
      endsAt: '2025-05-10T18:00:00Z',
    },
    title: 'Pi Nugget Giveaway',
    prize: '',
    fee: 'Free',
    href: '/competitions/pi-nugget-giveaway',
    imageUrl: '/images/nugget.png',
    theme: 'free',
  },
]

export default function AllFreeCompsPage() {
  return (
    <main className="pt-4 pb-10 px-4">
      {/* Moved up and in white */}
      <h1
        className="category-page-title text-center text-2xl font-bold mb-6 text-white"
        style={{ marginTop: 0 }}
      >
        All Free Competitions
      </h1>

      {/* 3‑column grid */}
      <div className="category-grid mx-auto max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {freeComps.map(item => (
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
