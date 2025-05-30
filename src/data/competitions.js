// data/competitions.js

export const techItems = [
  {
    comp: { slug: 'ps5-bundle-giveaway', entryFee: 0.8, totalTickets: 2000, ticketsSold: 0, endsAt: '2025-05-31T14:00:00Z' },
    title: 'PS5 Bundle',
    prize: 'PlayStation 5',
    fee: '0.25 π',
    href: '/competitions/ps5-bundle-giveaway',
    imageUrl: '/images/playstation.jpeg',
    theme: 'tech',
  },
  {
    comp: { slug: '55-inch-tv-giveaway', entryFee: 0.25, totalTickets: 1500, ticketsSold: 0, endsAt: '2025-05-31T11:30:00Z' },
    title: '55″ TV',
    prize: '55″ Smart TV',
    fee: '0.4 π',
    href: '/competitions/55-inch-tv-giveaway',
    imageUrl: '/images/tv.jpg',
    theme: 'tech',
  },
  {
    comp: { slug: 'xbox-one-bundle', entryFee: 0.3, totalTickets: 1300, ticketsSold: 0, endsAt: '2025-05-31T17:45:00Z' },
    title: 'Xbox One',
    prize: 'Xbox One + Game Pass',
    fee: '0.35 π',
    href: '/competitions/xbox-one-bundle',
    imageUrl: '/images/xbox.jpeg',
    theme: 'tech',
  },
  {
    comp: { slug: 'electric-bike', entryFee: 0.25, totalTickets: 1850, ticketsSold: 0, endsAt: '2025-05-31T11:30:00Z' },
    title: 'Electric Bike',
    prize: 'Electric Bike',
    fee: '0.65 π',
    href: '/competitions/electric-bike',
    imageUrl: '/images/bike.jpeg',
    theme: 'tech',
  },
  {
    comp: { slug: 'matchday-tickets', entryFee: 0.25, totalTickets: 1200, ticketsSold: 0, endsAt: '2025-05-31T11:30:00Z' },
    title: 'Matchday mTickets',
    prize: 'Matchday Tickets',
    fee: '0.75 π',
    href: '/competitions/matchday-tickets',
    imageUrl: '/images/liverpool.jpeg',
    theme: 'tech',
  },
];

export const premiumItems = [
  {
    comp: { slug: 'dubai-luxury-holiday', entryFee: 20, totalTickets: 4000, ticketsSold: 7100, endsAt: '2025-05-31T22:00:00Z' },
    title: 'Dubai Luxury Holiday',
    href: '/competitions/dubai-luxury-holiday',
    prize: '7-Day Dubai Trip',
    fee: '2.5 π',
    imageUrl: '/images/dubai-luxury-holiday.jpg',
    theme: 'premium',
  },
  {
    comp: { slug: 'penthouse-stay', entryFee: 15, totalTickets: 3000, ticketsSold: 4875, endsAt: '2025-05-31T21:00:00Z' },
    title: 'Penthouse Stay',
    href: '/competitions/penthouse-stay',
    prize: 'Penthouse Hotel Stay of your choice',
    fee: '1.5 π',
    imageUrl: '/images/hotel.jpeg',
    theme: 'premium',
  },
  {
    comp: { slug: 'first-class-flight', entryFee: 15, totalTickets: 2500, ticketsSold: 4875, endsAt: '2025-05-31T21:00:00Z' },
    title: 'First Class Flight',
    href: '/competitions/first-class-flight',
    prize: 'Return flights to anywhere in the world',
    fee: '3 π',
    imageUrl: '/images/first.jpeg',
    theme: 'premium',
  },
];

export const piItems = [
  {
    comp: { slug: 'pi-giveaway-10k', entryFee: 10, totalTickets: 5000, ticketsSold: 0, endsAt: '2025-05-31T00:00:00Z' },
    title: '10,000 Pi',
    prize: '10,000 π',
    fee: '2.2 π',
    href: '/competitions/pi-giveaway-10k',
    imageUrl: '/images/100000.png',
    theme: 'pi',
  },
  {
    comp: { slug: 'pi-giveaway-5k', entryFee: 5, totalTickets: 2500, ticketsSold: 0, endsAt: '2025-05-31T00:00:00Z' },
    title: '5,000 Pi',
    prize: '5,000 π',
    fee: '2.2 π',
    href: '/competitions/pi-giveaway-50k',
    imageUrl: '/images/50000.png',
    theme: 'pi',
  },
  {
    comp: { slug: 'pi-giveaway-2.5k', entryFee: 5, totalTickets: 3750, ticketsSold: 0, endsAt: '2025-05-31T00:00:00Z' },
    title: '2,500 Pi',
    prize: '2,500 π',
    fee: '.8 π',
    href: '/competitions/pi-giveaway-25k',
    imageUrl: '/images/25000.png',
    theme: 'pi',
  },
];

export const dailyItems = [
  {
    comp: { slug: 'daily-jackpot', entryFee: 0.375, totalTickets: 2400, ticketsSold: 0, endsAt: '2025-05-31T23:59:59Z' },
    title: 'Daily Jackpot',
    prize: '750 π',
    fee: '0.38 π',
    href: '/competitions/daily-jackpot',
    imageUrl: '/images/jackpot.png',
    theme: 'daily',
  },
  {
    comp: { slug: 'everyday-pioneer', entryFee: 0.314, totalTickets: 1700, ticketsSold: 0, endsAt: '2025-05-31T15:14:00Z' },
    title: 'Everyday Pioneer',
    prize: '1,000 π',
    fee: '0.65 π',
    href: '/competitions/everyday-pioneer',
    imageUrl: '/images/everyday.png',
    theme: 'daily',
  },
  {
    comp: { slug: 'daily-pi-slice', entryFee: 0.314, totalTickets: 3000, ticketsSold: 0, endsAt: '2025-05-31T15:14:00Z' },
    title: 'Daily Pi Slice',
    prize: '2,000 π',
    fee: '0.75 π',
    href: '/competitions/daily-pi-slice',
    imageUrl: '/images/daily.png',
    theme: 'daily',
  },
];

export const freeItems = [
  {
    comp: { slug: 'pi-to-the-mon', entryFee: 0, totalTickets: 20000, ticketsSold: 0, endsAt: '2025-05-31T18:00:00Z' },
    title: 'Pi To The Moon',
    prize: '10,000 π',
    fee: 'Free',
    href: '/competitions/Pi To The Moon',
    theme: 'free',
  },
];

export const cryptoGiveawaysItems = [
  {
    comp: { slug: 'crypto-btc', entryFee: 0.5, totalTickets: 5000, ticketsSold: 0, endsAt: '2025-06-02T00:59:00Z' },
    title: 'Win 1 BTC',

    fee: '2 π',
    href: '/crypto/crypto-btc',
    token: 'BTC',
    imageUrl: '/images/crypto-btc.png',
  },
  {
    comp: { slug: 'crypto-eth', entryFee: 0.5, totalTickets: 6000, ticketsSold: 0, endsAt: '2025-06-03T23:59:00Z' },
    title: 'Win 2 ETH',

    fee: '1.5 π',
    href: '/crypto/crypto-eth',
    token: 'ETH',
    imageUrl: '/images/crypto-eth.png',
  },
  {
    comp: { slug: 'crypto-xrp', entryFee: 0.4, totalTickets: 8000, ticketsSold: 0, endsAt: '2025-06-09T23:59:00Z' },
    title: 'Win 1000 XRP',
  
    fee: '1.6 π',
    href: '/crypto/crypto-crp',
    token: 'XRP',
    imageUrl: '/images/crypto-xrp.png',
  },
  {
    comp: { slug: 'crypto-sol', entryFee: 0.4, totalTickets: 7000, ticketsSold: 0, endsAt: '2025-06-05T23:59:00Z' },
    title: 'Win 10 SOL',
 
    fee: '1.1 π',
    href: '/crypto/crypto-sol',
    token: 'SOL',
    imageUrl: '/images/crypto-sol.png',
  },
  {
    comp: { slug: 'crypto-bnb', entryFee: 0.4, totalTickets: 4000, ticketsSold: 0, endsAt: '2025-06-07T23:59:00Z' },
    title: 'Win 2 BNB',

    fee: '.5 π',
    href: '/crypto/crypto-bnb',
    token: 'BNB',
    imageUrl: '/images/crypto-bnb.png',
  },
  {
    comp: { slug: 'crypto-doge', entryFee: 0.3, totalTickets: 10000, ticketsSold: 0, endsAt: '2025-06-11T23:59:00Z' },
    title: 'Win 10,000 DOGE',

    fee: '0.2 π',
    href: '/crypto/crypto-doge',
    token: 'DOGE',
    imageUrl: '/images/crypto-doge.png',
  },
];
