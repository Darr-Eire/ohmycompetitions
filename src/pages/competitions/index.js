'use client'
import CompetitionCard from '@components/CompetitionCard'
import PiCompetitionCard from '@components/PiCompetitionCard'
import DailyCompetitionCard from '@components/DailyCompetitionCard'
import FreeCompetitionCard from '@components/FreeCompetitionCard'
import CryptoGiveawayCard from '@components/CryptoGiveawayCard'  // Don't forget to import CryptoGiveawayCard

export default function AllCompetitionsPage() {
   const allComps = [
    {
    comp: {
      slug: 'ps5-bundle-giveaway',
      entryFee: 0.25,
      totalTickets: 2000,
      ticketsSold: 750,
      endsAt: '2025-05-14T14:00:00Z',
    },
    title: 'PS5 Bundle Giveaway',
    prize: 'PlayStation 5 + Extra Controller',
    fee: '0.25 π',
    href: '/competitions/ps5-bundle-giveaway',
    imageUrl: '/images/playstation.jpeg',
    theme: 'orange',
  },
  {
    comp: {
      slug: '55-inch-tv-giveaway',
      entryFee: 0.40,
      totalTickets: 1500,
      ticketsSold: 750,
      endsAt: '2025-05-15T11:30:00Z',
    },
    title: '55″ TV Giveaway',
    prize: '55″ Smart TV',
    fee: '0.4 π',
    href: '/competitions/55-inch-tv-giveaway',
    imageUrl: '/images/tv.jpg',
    theme: 'orange',
  },
  {
    comp: {
      slug: 'xbox-one-bundle',
      entryFee: 0.35,
      totalTickets: 1300,
      ticketsSold: 750,
      endsAt: '2025-05-09T17:45:00Z',
    },
    title: 'Xbox One Bundle',
    prize: 'Xbox One + Game Pass',
    fee: '0.35 π',
    href: '/competitions/xbox-one-bundle',
    imageUrl: '/images/xbox.jpeg',
    theme: 'orange',
  },
  {
    comp: {
      slug: 'matchday-tickets',
      entryFee: 0.65,
      totalTickets: 1200,
      ticketsSold: 755,
      endsAt: '2025-05-27T23:59:00Z',
    },
    title: 'Matchday Tickets',
    href: '/competitions/matchday-tickets',
    prize: 'Matchday Tickets',
    fee: '0.65 π',
    imageUrl: '/images/liverpool.jpeg',
  },
  {
    comp: {
      slug: 'apple-iphone',
      entryFee: 0.6,
      totalTickets: 1100,
      ticketsSold: 340,
      endsAt: '2025-05-14T14:00:00Z',
    },
    title: 'Apple Iphone',
    prize: 'PlayStation 5 + Extra Controller',
    fee: '0.6 π',
    href: '/competitions/apple-iphone',
    imageUrl: '/images/iphone.jpeg',
    theme: 'orange',
  },
  {
    comp: {
      slug: 'rolex',
      entryFee: 0.25,
      totalTickets: 1400,
      ticketsSold: 0,
      endsAt: '2025-05-15T11:30:00Z',
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
      endsAt: '2025-05-16T17:45:00Z',
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
      endsAt: '2025-05-16T17:45:00Z',
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
      endsAt: '2025-05-16T17:45:00Z',
    },
    title: 'Electric Bike',
    prize: 'Electric Bike',
    fee: '0.3 π',
    href: '/competitions/electric-bike',
    imageUrl: '/images/bike.jpeg',
    theme: 'orange',
  },
  {
    comp: {
      slug: 'dubai-luxury-holiday',
      entryFee: 20,
      totalTickets: 15000,
      ticketsSold: 7100,
      endsAt: '2025-05-25T22:00:00Z',
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
      endsAt: '2025-05-22T21:00:00Z',
    },
    title: 'Penthouse Hotel Stay',
    href: '/competitions/macbook-pro-2025-giveaway',
    prize: 'Penthouse Hotel Stay of your choice',
    fee: '15 π',
    imageUrl: '/images/hotel.jpeg',
  },
  {
    comp: {
      slug: 'first-class-flight',
      entryFee: 15,
      totalTickets: 5000,
      ticketsSold: 4875,
      endsAt: '2025-05-22T21:00:00Z',
    },
    title: 'First Class Flight',
    href: '/competitions/first-class-flight',
    prize: 'Return flights to anywhere in the wORLD',
    fee: '15 π',
    imageUrl: '/images/first.jpeg',
  },
  {
    comp: {
      slug: 'luxury-yacht-weekend',
      entryFee: 30,
      totalTickets: 8000,
      ticketsSold: 0,
      endsAt: '2025-06-17T00:00:00Z',
    },
    title: 'Luxury Yacht Weekend',
    prize: '3 day Mediterranean Yacht Cruise',
    fee: '30 π',
    href: '/competitions/luxury-yacht-weekend',
    imageUrl: '/images/yacht.jpeg',
    theme: 'premium',
  },

  {
    comp: {
      slug: 'pi-giveaway-25000',
      entryFee: 2.5,
      totalTickets: 18500,
      ticketsSold: 0,
      endsAt: '2025-05-17T00:00:00Z',
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
      endsAt: '2025-05-15T00:00:00Z',
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
      endsAt: '2025-05-12T00:00:00Z',
    },
    title: '5 000 π Daily Giveaway',
    prize: '5 000 π',
    fee: '0.5 π',
    href: '/competitions/pi-giveaway-5000',
    imageUrl: '/images/5000.png',
    theme: 'purple',
}, 
{
    comp: {
      slug: 'crypto-btc',
      entryFee: 0.5,
      totalTickets: 5000,
      ticketsSold: 0,
      endsAt: '2025-06-02T00:59:00Z',
    },
    title: 'Win Bitcoin (BTC)',
    prize: '0.01 BTC',
    fee: '0.5 π',
    href: '/competitions/crypto-btc',
    token: 'BTC',
    totalTickets: 5000,
    endsAt: '2025-06-02T00:59:00Z',
    theme: 'yellow',
  },
  {
    comp: {
      slug: 'crypto-eth',
      entryFee: 0.5,
      totalTickets: 5000,
      ticketsSold: 0,
      endsAt: '2025-06-03T23:59:00Z',
    },
    title: 'Win Ethereum (ETH)',
    prize: '0.5 ETH',
    fee: '0.5 π',
    href: '/competitions/crypto-eth',
    token: 'ETH',
    totalTickets: 5000,
    endsAt: '2025-06-03T23:59:00Z',
    theme: 'blue',
  },
  {
    comp: {
      slug: 'crypto-sol',
      entryFee: 0.4,
      totalTickets: 5000,
      ticketsSold: 0,
      endsAt: '2025-06-05T23:59:00Z',
    },
    title: 'Win Solana (SOL)',
    prize: '10 SOL',
    fee: '0.4 π',
    href: '/competitions/crypto-sol',
    token: 'SOL',
    totalTickets: 5000,
    endsAt: '2025-06-05T23:59:00Z',
    theme: 'emerald',
  },
  {
    comp: {
      slug: 'crypto-bnb',
      entryFee: 0.4,
      totalTickets: 5000,
      ticketsSold: 0,
      endsAt: '2025-06-07T23:59:00Z',
    },
    title: 'Win Binance Coin (BNB)',
    prize: '2 BNB',
    fee: '0.4 π',
    href: '/competitions/crypto-bnb',
    token: 'BNB',
    totalTickets: 5000,
    endsAt: '2025-06-07T23:59:00Z',
    theme: 'amber',
  },
  {
    comp: {
      slug: 'crypto-xrp',
      entryFee: 0.4,
      totalTickets: 5000,
      ticketsSold: 0,
      endsAt: '2025-06-09T23:59:00Z',
    },
    title: 'Win Ripple (XRP)',
    prize: '1000 XRP',
    fee: '0.4 π',
    href: '/competitions/crypto-xrp',
    token: 'XRP',
    totalTickets: 5000,
    endsAt: '2025-06-09T23:59:00Z',
    theme: 'indigo',
  },
  {
    comp: {
      slug: 'crypto-doge',
      entryFee: 0.3,
      totalTickets: 5000,
      ticketsSold: 0,
      endsAt: '2025-06-11T23:59:00Z',
    },
    title: 'Win Dogecoin (DOGE)',
    prize: '10,000 DOGE',
    fee: '0.3 π',
    href: '/competitions/crypto-doge',
    token: 'DOGE',
    totalTickets: 5000,
    endsAt: '2025-06-11T23:59:00Z',
    theme: 'rose',
  },
  {
    comp: {
      slug: 'hack-the-vault',
      entryFee: 0.375,
      totalTickets: 2225,
      ticketsSold: 1800,
      endsAt: '2025-05-10T23:59:59Z',
    },
    title: 'Hack The Vault',
    prize: '7,750 π',
    fee: '3.14 π',
    href: '/competitions/hack-the-vault',
    imageUrl: '/images/vault.png',
    theme: 'daily',
  },
  {
    comp: {
      slug: 'daily-pi-slice',
      entryFee: 0.314,
      totalTickets: 1900,
      ticketsSold: 0,
      endsAt: '2025-05-10T15:14:00Z',
    },
    title: 'Daily Pi Slice',
    prize: '1,000 π',
    fee: '0.314 π',
    href: '/competitions/daily-pi-slice',
    imageUrl: '/images/daily.png',
    theme: 'daily',
  },
  {
    comp: {
      slug: 'daily-jackpot',
      entryFee: 0.375,
      totalTickets: 2225,
      ticketsSold: 0,
      endsAt: '2025-05-10T23:59:59Z',
    },
    title: 'Daily Jackpot',
    prize: '750 π',
    fee: '0.375 π',
    href: '/competitions/daily-jackpot',
    imageUrl: '/images/jackpot.png',
    theme: 'daily',
  },
    ]

 const renderCompetitionCard = (item) => {
    const props = {
      key: item.comp.slug,
      comp: item.comp,
      title: item.title,
      prize: item.prize,
      fee: item.fee,
      theme: item.theme,
      imageUrl: item.imageUrl,
      endsAt: item.comp.endsAt,
    };

    // Check if it's a crypto competition
    if (item.token) {
      return (
        <CryptoGiveawayCard
          key={item.comp.slug}
          comp={item.comp}
          title={item.title}
          prize={item.prize}
          fee={item.fee}
          href={item.href}
          token={item.token}
          totalTickets={item.totalTickets}
          endsAt={item.endsAt}
        />
      );
    }

    // Render based on theme
    switch (item.theme) {
      case 'purple':
        return <PiCompetitionCard {...props} />;
      case 'daily':
        return <DailyCompetitionCard {...props} />;
      case 'green':
        return <FreeCompetitionCard {...props} />;
      default:
        return <CompetitionCard {...props} />;
    }
  };

  return (
    <main className="app-background min-h-screen p-4 text-white">
      <div className="competition-top-banner title-gradient mb-6 text-black">
        All Competitions
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allComps.map(item => renderCompetitionCard(item))}
      </div>
    </main>
  );
}