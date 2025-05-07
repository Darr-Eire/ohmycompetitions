// pages/competitions/index.js
'use client'

import CompetitionCard from '@/components/CompetitionCard'

export default function AllCompetitionsPage() {
  const allComps = [
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
        slug: 'matchday-tickets',
        entryFee: 2.2,
        totalTickets: 250,
        ticketsSold: 0,
        endsAt: '2025-05-20T23:59:00Z',
      },
      title: 'Matchday Tickets',
      href: '/competitions/matchday-tickets',
      prize: 'Matchday Tickets',
      fee: '2.2 π',
      imageUrl: '/images/liverpool.jpeg',
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
        endsAt: '2025-05-15T21:00:00Z',
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
        endsAt: '2025-05-15T21:00:00Z',
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
          endsAt: '2025-06-10T00:00:00Z',
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
      imageUrl: '/images/100000.png',
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
      imageUrl: '/images/50000.png',
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
      imageUrl: '/images/25000.png',
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
        imageUrl: '/images/5000.png',theme: 'purple',},
    { comp:{slug:'everyday-pioneer',entryFee:0.314,totalTickets:1900,ticketsSold:0,endsAt:'2025-05-03T15:14:00Z'}, title:'Everyday Pioneer', prize:'1,000 π', fee:'0.314 π', href:'/competitions/everyday-pioneer', imageUrl:'/images/everyday.png', theme:'daily' },
    { comp:{slug:'pi-to-the-moon',entryFee:3.14,totalTickets:1900,ticketsSold:0,endsAt:'2025-05-04T12:00:00Z'}, title:'Pi to the Moon', prize:'5,000 π', fee:'3.14 π', href:'/competitions/pi-to-the-moon', imageUrl:'/images/pitothemoon.png', theme:'daily' },
    { comp: {slug:'hack-the-vault',entryFee: 0.375,totalTickets: 2225,ticketsSold: 1800,endsAt: '2025-05-03T23:59:59Z'},title: 'Hack The Vault',prize: '7,750 π',fee: '3.14 π',href: '/competitions/hack-the-vault',imageUrl: '/images/vault.png',theme: 'daily'},
    { comp:{slug:'daily-pi-slice',entryFee:0.314,totalTickets:1900,ticketsSold:0,endsAt:'2025-05-03T15:14:00Z'}, title:'Daily Pi Slice', prize:'1,000 π', fee:'0.314 π', href:'/competitions/daily-pi-slice', imageUrl:'/images/daily.png', theme:'daily' },
    { comp:{slug:'daily-jackpot',entryFee:0.375,totalTickets:2225,ticketsSold:0,endsAt:'2025-05-03T23:59:59Z'}, title:'Daily Jackpot', prize:'750 π', fee:'0.375 π', href:'/competitions/daily-jackpot', imageUrl:'/images/jackpot.png', theme:'daily' },
    { comp:{slug:'the-daily-dash',entryFee:3.14,totalTickets:1900,ticketsSold:0,endsAt:'2025-05-04T12:00:00Z'}, title:'The Daily Dash', prize:'5,000 π', fee:'3.14 π', href:'/competitions/the-daily-dash', imageUrl:'/images/dash.png', theme:'daily' },
    { comp:{slug:'pi-day-freebie', entryFee:0, totalTickets:10000, ticketsSold:0, endsAt:'2025-05-06T20:00:00Z'}, title:'Pi‑Day Freebie', href:'/competitions/pi-day-freebie', prize:'Special Badge', fee:'Free', imageUrl:'/images/piday.png', theme:'green' },
    
   
    { comp:{slug:'pi-miners-bonanza', entryFee:0, totalTickets:10000, ticketsSold:0, endsAt:'2025-05-06T20:00:00Z'}, title:'Pi Miners Bonanza', href:'/competitions/pi-miners-bonanza', prize:'Special Badge', fee:'Free', imageUrl:'/images/bonanza.png', theme:'green' },
    { comp:{slug:'pi-nugget-giveaway',   entryFee:0, totalTickets:10000, ticketsSold:0, endsAt:'2025-05-10T18:00:00Z'}, title:"Pi Nugget Giveaway",    href:'/competitions/pi-nugget-giveaway', prize:'9,999 / 5,555 / 1,111 π', fee:'Free', imageUrl:'/images/winner.png', theme:'green' },
    ]


  return (
    <main className="app-background min-h-screen p-4 text-white">
      <div className="competition-top-banner title-gradient mb-6 text-black">
        All Competitions
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allComps.map(item => (
          <CompetitionCard
            key={item.comp.slug}
            comp={item.comp}
            title={item.title}
            prize={item.prize}
            fee={item.fee}
            theme={item.theme}
            imageUrl={item.imageUrl}
            endsAt={item.comp.endsAt}
          />
        ))}
      </div>
    </main>
  );
}
