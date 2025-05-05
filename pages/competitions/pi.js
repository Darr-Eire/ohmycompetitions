// pages/competitions/pi.js
import CompetitionCard from '@/components/CompetitionCard'

const piComps = [
  {
    comp: {
      slug: 'pi-giveaway-100k',
      entryFee: 10,
      totalTickets: 33000,
      ticketsSold: 0,
      endsAt: '2025-05-12T00:00:00Z',
    },
    title: '100 000 π Mega Giveaway',
    prize: '100 000 π',
    fee: '10 π',
    href: '/competitions/pi-giveaway-100k',
    imageUrl: '/images/100,000.png',
    theme: 'purple',
  },
  {
    comp: {
      slug: 'pi-giveaway-50k',
      entryFee: 5,
      totalTickets: 17000,
      ticketsSold: 0,
      endsAt: '2025-05-11T00:00:00Z',
    },
    title: '50 000 π Big Giveaway',
    prize: '50 000 π',
    fee: '5 π',
    href: '/competitions/pi-giveaway-50k',
    imageUrl: '/images/50,000.png',
    theme: 'purple',
  },
  {
    comp: {
      slug: 'pi-giveaway-25k',
      entryFee: 1.5,
      totalTickets: 18500,
      ticketsSold: 0,
      endsAt: '2025-05-10T00:00:00Z',
    },
    title: '25 000 π Weekly Giveaway',
    prize: '25 000 π',
    fee: '1.5 π',
    href: '/competitions/pi-giveaway-25k',
    imageUrl: '/images/25,000.png',
    theme: 'purple',
  },

    {
      comp: {
        slug: 'pi-giveaway-250k',
        entryFee: 15,
        totalTickets: 50000,
        ticketsSold: 0,
        endsAt: '2025-06-01T00:00:00Z',
      },
      title: '250 000 π Mega Giveaway',
      prize: '250 000 π',
      fee: '15 π',
      href: '/competitions/pi-giveaway-250k',
      imageUrl: '/images/250000.png',
      theme: 'purple',
    },
    {
      comp: {
        slug: 'pi-giveaway-100k',
        entryFee: 10,
        totalTickets: 33000,
        ticketsSold: 0,
        endsAt: '2025-05-20T00:00:00Z',
      },
      title: '100 000 π Grand Giveaway',
      prize: '100 000 π',
      fee: '10 π',
      href: '/competitions/pi-giveaway-100k',
      imageUrl: '/images/100000.png',
      theme: 'purple',
    },
    {
      comp: {
        slug: 'pi-giveaway-60000',
        entryFee: 6,
        totalTickets: 20000,
        ticketsSold: 0,
        endsAt: '2025-05-15T00:00:00Z',
      },
      title: '60 000 π Super Giveaway',
      prize: '60 000 π',
      fee: '6 π',
      href: '/competitions/pi-giveaway-60000',
      imageUrl: '/images/60000.png',
      theme: 'purple',
    },
    {
      comp: {
        slug: 'pi-giveaway-25000',
        entryFee: 2.5,
        totalTickets: 18500,
        ticketsSold: 0,
        endsAt: '2025-05-10T00:00:00Z',
      },
      title: '25 000 π Weekly Giveaway',
      prize: '25 000 π',
      fee: '2.5 π',
      href: '/competitions/pi-giveaway-25000',
      imageUrl: '/images/25000.png',
      theme: 'purple',
    },
    {
      comp: {
        slug: 'pi-giveaway-10000',
        entryFee: 1,
        totalTickets: 15000,
        ticketsSold: 0,
        endsAt: '2025-05-08T00:00:00Z',
      },
      title: '10 000 π Flash Giveaway',
      prize: '10 000 π',
      fee: '1 π',
      href: '/competitions/pi-giveaway-10000',
      imageUrl: '/images/10000.png',
      theme: 'purple',
    },
    {
      comp: {
        slug: 'pi-giveaway-5000',
        entryFee: 0.5,
        totalTickets: 10000,
        ticketsSold: 0,
        endsAt: '2025-05-05T00:00:00Z',
      },
      title: '5 000 π Daily Giveaway',
      prize: '5 000 π',
      fee: '0.5 π',
      href: '/competitions/pi-giveaway-5000',
      imageUrl: '/images/5000.png',
      theme: 'purple',
    },
  ]

export default function AllPiCompsPage() {
  return (
    <main className="pt-4 pb-10 px-4">
      {/* Title moved up (pt-4) and in white */}
      <h1
        className="category-page-title text-center text-2xl font-bold mb-6 text-white"
        style={{ marginTop: 0 }}
      >
        All Pi Giveaways
      </h1>

      {/* Always 3 columns */}
      <div className="category-grid mx-auto max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {piComps.map(item => (
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
