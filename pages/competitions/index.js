import CompetitionCard from '@/components/CompetitionCard'
export default function AllCompetitionsPage() {
   const allComps = [
    {
      comp: {
        slug: 'everyday-pioneer',
        entryFee: 0.314,
        totalTickets: 1900,
        ticketsSold: 1500,
        endsAt: '2025-05-04T12:00:00Z'
      },
      title: 'Everyday Pioneer',
      prize: '1,000 π',
      fee: '0.314 π',
      href: '/competitions/everyday-pioneer',
      imageUrl: '/images/everyday.png',
      theme: 'daily'
    },
    {
      comp: {
        slug: 'pi-to-the-moon',
        entryFee: 0.25,
        totalTickets: 2500,
        ticketsSold: 2400,
        endsAt: '2025-05-05T15:00:00Z'
      },
      title: 'Pi To The Moon',
      prize: '5,000 π',
      fee: '1.314 π',
      href: '/competitions/pi-to-the-moon',
      imageUrl: '/images/pitothemoon.jpeg',
      theme: 'daily'
    },
    {
      comp: {
        slug: 'hack-the-vault',
        entryFee: 0.375,
        totalTickets: 2225,
        ticketsSold: 1800,
        endsAt: '2025-05-03T23:59:59Z'
      },
      title: 'Hack The Vault',
      prize: '7,750 π',
      fee: '3.14 π',
      href: '/competitions/hack-the-vault',
      imageUrl: '/images/vault.png',
      theme: 'daily'
    },
  ]

  const freeItems = [
    {
      comp: {
        slug: 'pi-day-freebie',
        entryFee: 0,
        totalTickets: 10000,
        ticketsSold: 7500,
        endsAt: '2025-05-06T20:00:00Z'
      },
      title: 'Pi‑Day Freebie',
      prize: '3,314 Reward',
      fee: 'Free',
      href: '/competitions/pi-day-freebie',
      imageUrl: '/images/freebie.png',
      theme: 'free'
    },
    {
      comp: {
        slug: 'everyones-a-winner',
        entryFee: 0,
        totalTickets: 10000,
        ticketsSold: 8500,
        endsAt: '2025-05-10T18:00:00Z'
      },
      title: 'Everyone’s A Winner',
      prize: '6,000 / 3,000 / 1,000 π',
      fee: 'Free',
      href: '/competitions/everyones-a-winner',
      imageUrl: '/images/everyone.png',
      theme: 'free'
    },
    {
      comp: {
        slug: 'weekly-pi-giveaway',
        entryFee: 0,
        totalTickets: 5000,
        ticketsSold: 4200,
        endsAt: '2025-05-05T23:59:59Z'
      },
      title: 'Weekly Pi Giveaway',
      prize: '1,000 π',
      fee: 'Free',
      href: '/competitions/weekly-pi-giveaway',
      imageUrl: '/images/weekly.png',
      theme: 'free'
    },
  ]

  const techItems = [
    {
      comp: {
        slug: 'ps5-bundle-giveaway',
        entryFee: 0.5,
        totalTickets: 1100,
        ticketsSold: 900,
        endsAt: '2025-05-07T14:00:00Z'
      },
      title: 'PS5 Bundle Giveaway',
      prize: 'PS5 + Extra Controller',
      fee: '0.5 π',
      href: '/competitions/ps5-bundle-giveaway',
      imageUrl: '/images/ps5.jpeg',
      theme: 'tech'
    },
    {
      comp: {
        slug: '55-inch-tv-giveaway',
        entryFee: 0.75,
        totalTickets: 1400,
        ticketsSold: 1200,
        endsAt: '2025-05-08T11:30:00Z'
      },
      title: '55″ TV Giveaway',
      prize: '55″ Smart TV',
      fee: '0.75 π',
      href: '/competitions/55-inch-tv-giveaway',
      imageUrl: '/images/Tv.jpeg',
      theme: 'tech'
    },
    {
      comp: {
        slug: 'xbox-one-bundle',
        entryFee: 0.6,
        totalTickets: 2000,
        ticketsSold: 1750,
        endsAt: '2025-05-09T17:45:00Z'
      },
      title: 'Xbox One Bundle',
      prize: 'Xbox One + Game Pass',
      fee: '0.6 π',
      href: '/competitions/xbox-one-bundle',
      imageUrl: '/images/xbox.jpeg',
      theme: 'tech'
    },
  ]

  const piItems = [
    {
      comp: {
        slug: 'pi-giveaway-100k',
        entryFee: 10,
        totalTickets: 33000,
        ticketsSold: 32000,
        endsAt: '2025-05-12T00:00:00Z'
      },
      title: '100 000 π Giveaway',
      prize: '100 000 π',
      fee: '10 π',
      href: '/competitions/pi-giveaway-100k',
      imageUrl: '/images/100,000.png',
      theme: 'pi'
    },
    {
      comp: {
        slug: 'pi-giveaway-50k',
        entryFee: 5,
        totalTickets: 17000,
        ticketsSold: 16000,
        endsAt: '2025-05-11T00:00:00Z'
      },
      title: '50 000 π Giveaway',
      prize: '50 000 π',
      fee: '5 π',
      href: '/competitions/pi-giveaway-50k',
      imageUrl: '/images/50,000.png',
      theme: 'pi'
    },
    {
      comp: {
        slug: 'pi-giveaway-25k',
        entryFee: 2.5,
        totalTickets: 18500,
        ticketsSold: 17500,
        endsAt: '2025-05-10T00:00:00Z'
      },
      title: '25 000 π Giveaway',
      prize: '25 000 π',
      fee: '2.5 π',
      href: '/competitions/pi-giveaway-25k',
      imageUrl: '/images/25,000.png',
      theme: 'pi'
    },
  ]

  const premiumItems = [
    {
      comp: {
        slug: 'tesla-model-3-giveaway',
        entryFee: 50,
        totalTickets: 20000,
        ticketsSold: 5120,
        endsAt: '2025-05-20T23:59:00Z'
      },
      title: 'Tesla Model 3 Giveaway',
      prize: 'Tesla Model 3',
      fee: '50 π',
      href: '/competitions/tesla-model-3-giveaway',
      imageUrl: '/images/tesla.jpeg',
      theme: 'premium'
    },
    {
      comp: {
        slug: 'dubai-luxury-holiday',
        entryFee: 25,
        totalTickets: 15000,
        ticketsSold: 7100,
        endsAt: '2025-05-18T22:00:00Z'
      },
      title: 'Dubai Luxury Holiday',
      prize: '7‑Day Dubai Trip',
      fee: '25 π',
      href: '/competitions/dubai-luxury-holiday',
      imageUrl: '/images/dubai-luxury-holiday.jpg',
      theme: 'premium'
    },
    {
      comp: {
        slug: 'penthouse-hotel-stay',
        entryFee: 15,
        totalTickets: 5000,
        ticketsSold: 4875,
        endsAt: '2025-05-15T21:00:00Z'
      },
      title: 'Penthouse Hotel Stay',
      prize: 'Your Choice Penthouse',
      fee: '15 π',
      href: '/competitions/macbook-pro-2025-giveaway',
      imageUrl: '/images/hotel.jpeg',
      theme: 'premium'
    },
    { comp:{slug:'the-daily-dash',entryFee:3.14,totalTickets:1900,ticketsSold:0,endsAt:'2025-05-04T12:00:00Z'}, title:'The Daily Dash', prize:'5,000 π', fee:'3.14 π', href:'/competitions/the-daily-dash', imageUrl:'/images/.jpeg', theme:'daily' },
    { comp:{slug:'the-daily-hustle',entryFee:0.375,totalTickets:2225,ticketsSold:0,endsAt:'2025-05-03T23:59:59Z'}, title:'The Daily Hustle', prize:'750 π', fee:'0.375 π', href:'/competitions/the-daily-hustle', imageUrl:'/images/vault.png', theme:'daily' },
    { comp: { slug: 'pi-day-freebie', entryFee: 0 },            title: 'Pi Day Freebie',          prize: 'Pi Day Badge',             fee: 'Free',        href: '/competitions/pi-day-freebie',         imageUrl: '/images/freebie.png',              theme: 'green'    },
    { comp: { slug: 'everyones-a-winner', entryFee: 0 },        title: 'Everyone’s A Winner',     prize: '9999 / 5555 / 1111 π',      fee: 'Free',        href: '/competitions/everyones-a-winner',     imageUrl: '/images/everyone.png',             theme: 'green'    },
    { comp: { slug: 'weekly-pi-giveaway', entryFee: 0 },        title: 'Weekly Pi Giveaway',      prize: '1,000 π Giveaway',         fee: 'Free',        href: '/competitions/weekly-pi-giveaway',     imageUrl: '/images/weekly.png',               theme: 'green'    },
    { comp: { slug: 'ps5-bundle-giveaway', entryFee: 0.5 },     title: 'PS5 Bundle Giveaway',     prize: 'PlayStation 5 + Extra Controller', fee: '0.5 π', href: '/competitions/ps5-bundle-giveaway', imageUrl: '/images/ps5.jpeg',                theme: 'orange'   },
    { comp: { slug: '55-inch-tv-giveaway', entryFee: 0.75 },    title: '55" TV Giveaway',         prize: '55" Smart TV',              fee: '0.75 π',     href: '/competitions/55-inch-tv-giveaway',    imageUrl: '/images/Tv.jpeg',                  theme: 'orange'   },
    { comp: { slug: 'xbox-one-bundle', entryFee: 0.6 },         title: 'Xbox One Bundle',         prize: 'Xbox One + Game Pass',      fee: '0.6 π',      href: '/competitions/xbox-one-bundle',        imageUrl: '/images/xbox.jpeg',                theme: 'orange'   },
    { comp: { slug: 'pi-giveaway-100k', entryFee: 10 },         title: '100 000 π Giveaway',      prize: '100 000 π',                 fee: '10 π',       href: '/competitions/pi-giveaway-100k',       imageUrl: '/images/100,000.png',              theme: 'purple'   },
    { comp: { slug: 'pi-giveaway-50k', entryFee: 5 },           title: '50 000 π Giveaway',       prize: '50 000 π',                  fee: '5 π',        href: '/competitions/pi-giveaway-50k',        imageUrl: '/images/50,000.png',               theme: 'purple'   },
    { comp: { slug: 'pi-giveaway-25k', entryFee: 2.5 },         title: '25 000 π Giveaway',       prize: '25 000 π',                  fee: '2.5 π',      href: '/competitions/pi-giveaway-25k',        imageUrl: '/images/25,000.png',               theme: 'purple'   },
    { comp: { slug: 'tesla-model-3-giveaway', entryFee: 50 },   title: 'Tesla Model 3 Giveaway',  prize: 'Tesla Model 3',             fee: '50 π',       href: '/competitions/tesla-model-3-giveaway', imageUrl: '/images/tesla.jpeg',               theme: 'premium'  },
    { comp: { slug: 'dubai-luxury-holiday', entryFee: 25 },     title: 'Dubai Luxury Holiday',     prize: '7-Day Dubai Trip',          fee: '25 π',       href: '/competitions/dubai-luxury-holiday',   imageUrl: '/images/dubai-luxury-holiday.jpg', theme: 'premium'  },
    { comp: { slug: 'penthouse-hotel-stay', entryFee: 15 },     title: 'Penthouse Hotel Stay',     prize: 'Penthouse Hotel Stay of your choice', fee: '15 π', href: '/competitions/macbook-pro-2025-giveaway', imageUrl: '/images/hotel.jpeg', theme: 'premium' },
  ] 
  return (
    <main className="pt-8 pb-12 px-4 bg-white min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">
          All Competitions
        </h2>

        {/* Desktop: 3‑column grid */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-6">
          {allComps.map(item => (
            <CompetitionCard
              key={item.comp.slug}
              {...item}
              small
              className="transform scale-90 transition-all duration-200"
            />
          ))}
        </div>

        {/* Mobile/Tablet: swipeable carousel */}
        <div className="lg:hidden flex space-x-4 overflow-x-auto scroll-snap-type-x-mandatory snap-x pb-4">
          {allComps.map(item => (
            <div key={item.comp.slug} className="flex-none w-64 snap-start">
              <CompetitionCard {...item} small />
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}