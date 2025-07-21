export const techItems = [
  {
    comp: {
      slug: 'ps5-bundle-giveaway',
      entryFee: 0.40,
      totalTickets: 1100,
      ticketsSold: 0,
      startsAt: '2025-07-18T15:45:00Z',
      endsAt: '2025-08-25T15:45:00Z',
      paymentType: 'pi',
      piAmount: 0.40,
    },
    title: 'PS5 Bundle',
    prize: 'PlayStation 5 + Controller',
    href: '/competitions/ps5-bundle-giveaway',
    imageUrl: '/images/playstation.jpeg',
    thumbnails: [
      '/images/playstation1.jpeg',
      '/images/playstation2.jpeg',
      '/images/playstation3.jpeg',
    ],
    theme: 'tech',
  },
  {
    comp: {slug: '55-inch-tv-giveaway',comingSoon: true },
    totalTickets:0,
    title: '55″ Smart TV',
    prize: '55″ Smart TV',
    href: '/competitions/55-inch-tv-giveaway',
    imageUrl: '/images/tv.jpg',
    thumbnails: [
      '/images/tv1.jpeg',
      '/images/tv2.jpeg',
      '/images/tv3.jpeg',
    ],
    theme: 'tech',
  },
  
{
  comp: {
    slug: 'xbox-one-bundle',
    entryFee: 0.55,
    totalTickets: 1200,
    ticketsSold: 0,
    startsAt: '2025-07-21T00:24:00Z',
    endsAt: '2025-09-01T23:23:00Z',
    paymentType: 'pi',
    piAmount: 0.55,
  },
  title: 'Xbox One Bundle',
  prize: 'Xbox One + Game Pass',
  href: '/competitions/xbox-one-bundle',
  imageUrl: '/images/xbox1.jpeg',
  thumbnails: [
    '/images/xbox1.jpeg',
    '/images/xbox2.jpeg',
    '/images/xbox3.jpeg',
  ],
  theme: 'tech',
},

  {
    comp: {slug: 'nintendo-switch',comingSoon: true },
    totalTickets:0,
    title: 'Nintendo Switch',
    prize: 'Nintendo Switch',
    href: '/competitions/nintendo-switch',
    imageUrl: '/images/nintendo.png',
    thumbnails: [
      '/images/nintendo1.jpeg',
      '/images/nintendo2.jpeg',
      '/images/nintendo3.jpeg',
    ],
    theme: 'tech',
  },
  {
    comp: {slug: 'ray-ban', comingSoon: true },
     totalTickets:0,
    title: 'Ray-Ban Meta Wayfarer',
    prize: 'Ray-Ban Meta Wayfarer',
    href: '/competitions/ray-ban',
    imageUrl: '/images/glasses.jpg',
    thumbnails: [
      '/images/rayban1.jpeg',
      '/images/rayban2.jpeg',
      '/images/rayban3.jpeg',
    ],
    theme: 'tech',
  },
  {
    comp: { slug: 'gamer-pc-bundle', comingSoon: true },
    title: 'Gaming PC',
    prize: 'Gamer PC Bundle',
    href: '/competitions/gamer-pc-bundle',
    imageUrl: '/images/bundle.jpeg',
    thumbnails: [
      '/images/gamer1.jpeg',
      '/images/gamer2.jpeg',
      '/images/gamer3.jpeg',
    ],
    theme: 'tech',
  },

  {
    comp: { slug: 'matchday-tickets', comingSoon: true },
    title: 'Matchday Tickets',
    prize: 'Matchday Tickets',
    href: '/competitions/matchday-tickets',
    imageUrl: '/images/matchday.jpeg',
    thumbnails: [
      '/images/match1.jpeg',
      '/images/match2.jpeg',
      '/images/match3.jpeg',
    ],
    theme: 'tech',
  },

];


 
export const premiumItems = [
  {
    comp: {
      slug: 'dubai-luxury-holiday',
      entryFee: 2,
      totalTickets: 4000,
      ticketsSold: 0,
      startsAt: null, // optional or remove if not needed
      endsAt: '2025-12-15T13:06:55Z',              
      paymentType: 'pi',
      piAmount: 2.5,
     comingSoon: true,
status: 'active',  // added
    },
    title: 'Dubai Luxury Holiday',
    href: '/competitions/dubai-luxury-holiday',
    prize: '7-Day Dubai Trip',
    imageUrl: '/images/dubai-luxury-holiday.jpg',
    theme: 'premium',
  },
  {
    comp: {
      slug: 'penthouse-stay',
      entryFee: 0.75,
      totalTickets: 3000,
      ticketsSold: 0,
  startsAt: null, // optional or remove if not needed           
      endsAt: '2025-10-10T21:00:00Z',
      paymentType: 'pi',
      piAmount: 15,
     comingSoon: true,
status: 'active',  // added
    },
    title: 'Penthouse Stay',
    href: '/competitions/penthouse-stay',
    prize: 'Penthouse Hotel Stay of your choice',
    imageUrl: '/images/hotel.jpeg',
    theme: 'premium',
  },
 {
  comp: {
    slug: 'first-class-flight',
    entryFee: 1,
    totalTickets: 2500,
    ticketsSold: 0,
    startsAt: null, // or remove this line if handled elsewhere
    endsAt: null,   // or remove this line if handled elsewhere
    paymentType: 'pi',
    piAmount: 2,
   comingSoon: true,
status: 'active'
  },
  title: 'First Class Flight',
  prize: 'Return flights to anywhere in the world',
  href: '/competitions/first-class-flight',
  imageUrl: '/images/first.jpeg',
  thumbnails: [
    '/images/first1.jpeg',
    '/images/first2.jpeg',
    '/images/first3.jpeg'
  ],
  theme: 'premium',
},

  
{
  comp: {
    slug: 'weekend-getaway',
    entryFee: 2.5,
    totalTickets: 4000,
    ticketsSold: 0,
   startsAt: null, // optional or remove if not needed
    endsAt: '2025-08-01T22:00:00Z',
    paymentType: 'pi',
    piAmount: 12,
   comingSoon: true,
status: 'active',
  },
  title: 'Weekend Getaway',
  prize: '3,000 Pi Travel Voucher',
  href: '/competitions/weekend-getaway',
  imageUrl: '/images/weekend.jpeg',
  thumbnails: [
    '/images/weekend1.jpeg',
    '/images/weekend2.jpeg',
    '/images/weekend3.jpeg'
  ],
  theme: 'premium',
},

{
  comp: {
    slug: 'spa-day-package',
    entryFee: 1.2,
    totalTickets: 3000,
    ticketsSold: 0,
    startsAt: null, // optional or remove if not needed
    endsAt: '2025-06-05T22:00:00Z',
    paymentType: 'pi',
    piAmount: 1.2,
  comingSoon: true,
status: 'active',
  },
  title: 'Spa Day Package',
  prize: 'Luxury Spa Experience',
  href: '/competitions/spa-day-package',
  imageUrl: '/images/spa.jpeg',
  thumbnails: [
    '/images/spa1.jpeg',
    '/images/spa2.jpeg',
    '/images/spa3.jpeg'
  ],
  theme: 'premium',
},

];


export const piItems = [
  {
    comp: {
      slug: 'pi-giveaway-10k',
      entryFee: 2.2,
      totalTickets: 5200,
      ticketsSold: 0,
      startsAt: '2025-09-26T00:00:00Z',
      endsAt: '2025-10-26T00:00:00Z',
      status: 'active',
      prizeBreakdown: {
        first: '5,000 π',
        second: '3,000 π',
        third: '2,000 π',
      },
    },
    title: '10,000 π Prize Pool',
    prize: '10,000 π',
    imageUrl: '/images/100000.png',
    href: '/competitions/pi-giveaway-10k',
    theme: 'pi',
  },
  {
    comp: {
      slug: 'pi-giveaway-5k',
      entryFee: 1.8,
      totalTickets: 2900,
      ticketsSold: 0,
      startsAt: '2025-08-25T00:00:00Z',
      endsAt: '2025-09-25T00:00:00Z',
      status: 'active',
      prizeBreakdown: {
        first: '2,500 π',
        second: '1,500 π',
        third: '1,000 π',
      },
    },
    title: '5,000 π Prize Pool',
    prize: '5,000 π',
    href: '/competitions/pi-giveaway-5k',
    imageUrl: '/images/50000.png',
    theme: 'pi',
  },
  {
    comp: {
      slug: 'pi-giveaway-2.5k',
      entryFee: 1.6,
      totalTickets: 1600,
      ticketsSold: 0,
      startsAt: '2025-07-25T00:00:00Z',
      endsAt: '2025-08-25T00:00:00Z',
      status: 'active',
      prizeBreakdown: {
        first: '1,250 π',
        second: '750 π',
        third: '500 π',
      },
    },
    title: '2,500 π Prize Pool',
    prize: '2,500 π',
    href: '/competitions/pi-giveaway-2.5k',
    imageUrl: '/images/25000.png',
    theme: 'pi',
  },
];


export const launchWeekItems = [
  {
    comp: {
      slug: 'omc-launch-week-pi-pioneers',
      title: 'OMC Launch Week Pi Pioneers',
      entryFee: 0.20,
      startsAt: '2025-07-20T00:00:00.000Z',
      endsAt: '2025-12-08T00:00:00.000Z',
      totalTickets: 2500,
      maxTicketsPerUser: 10,
      theme: 'daily',
      imageUrl: '/images/your.png',
    },
    title: 'OMC Launch Week Pi Pioneers',
    prize: 'Win 500 Pi',
  },
  {
    comp: {
      slug: 'omc-launch-week-pi-giveaway',
      title: 'OMC Launch Week Pi Giveaway',
      entryFee: 1.00,
      startsAt: '2025-07-20T00:00:00.000Z',
      endsAt: '2025-08-16T00:00:00.000Z',
      totalTickets: 1000,
      maxTicketsPerUser: 10,
      theme: 'daily',
      imageUrl: '/images/your.png',
    },
    title: 'OMC Launch Week Pi Giveaway',
    prize: 'Win 1000 Pi',
  },
  {
    comp: {
      slug: 'omc-launch-week-pi-power',
      title: 'OMC Launch Week Pi Power',
      entryFee: 0.50,
      startsAt: '2025-07-20T00:00:00.000Z',
      endsAt: '2025-08-12T00:00:00.000Z',
      totalTickets: 500,
      maxTicketsPerUser: 10,
      theme: 'daily',
      imageUrl: '/images/your.png',
    },
    title: 'OMC Launch Week Pi Power',
    prize: 'Win 250 Pi',
  },
];

export const dailyItems = [];



export const freeItems = [
  {
    comp: {
      slug: 'pi-to-the-moon',
      entryFee: 0,
      totalTickets: 20000,
      ticketsSold: 0,
      startsAt: '2025-08-20T18:00:00Z',
      endsAt: '2025-08-31T18:00:00Z',
      location: 'Online Global Draw',
    },
    title: 'Pi To The Moon',
    prize: '10,000 π',
    href: '/competitions/pi-to-the-moon',
    theme: 'free',
  },
];
export const cryptoGiveawaysItems = [
  {
    comp: {
      slug: 'crypto-eth',
      entryFee: 0.5,
      totalTickets: 6000,
      ticketsSold: 0,
      startsAt: '2025-07-10T00:00:00Z',
      endsAt: '2025-08-01T23:59:00Z',
      status: 'active',
      comingSoon: true,
    },
    title: 'Win ETH',
    href: '/crypto/crypto-eth',
    token: 'ETH',
    imageUrl: '/images/crypto-eth.png',
    theme: 'crypto',
  },
  {
    comp: {
      slug: 'crypto-xrp',
      entryFee: 0.4,
      totalTickets: 8000,
      ticketsSold: 0,
      startsAt: '2025-07-10T00:00:00Z',
      endsAt: '2025-08-02T23:59:00Z',
      status: 'active',
      comingSoon: true,
    },
    title: 'Win XRP',
    href: '/crypto/crypto-xrp',
    token: 'XRP',
    imageUrl: '/images/crypto-xrp.png',
    theme: 'crypto',
  },
  {
    comp: {
      slug: 'crypto-sol',
      entryFee: 0.4,
      totalTickets: 7000,
      ticketsSold: 0,
      startsAt: '2025-07-10T00:00:00Z',
      endsAt: '2025-08-03T23:59:00Z',
      status: 'active',
      comingSoon: true,
    },
    title: 'Win SOL',
    href: '/crypto/crypto-sol',
    token: 'SOL',
    imageUrl: '/images/crypto-sol.png',
    theme: 'crypto',
  },
  {
    comp: {
      slug: 'crypto-bnb',
      entryFee: 0.4,
      totalTickets: 4000,
      ticketsSold: 0,
      startsAt: '2025-07-10T00:00:00Z',
      endsAt: '2025-08-04T23:59:00Z',
      status: 'active',
      comingSoon: true,
    },
    title: 'Win BNB',
    href: '/crypto/crypto-bnb',
    token: 'BNB',
    imageUrl: '/images/crypto-bnb.png',
    theme: 'crypto',
  },
  {
    comp: {
      slug: 'crypto-doge',
      entryFee: 0.3,
      totalTickets: 10000,
      ticketsSold: 0,
      startsAt: '2025-07-10T00:00:00Z',
      endsAt: '2025-08-05T23:59:00Z',
      status: 'active',
      comingSoon: true,
    },
    title: 'Win DOGE',
    href: '/crypto/crypto-doge',
    token: 'DOGE',
    imageUrl: '/images/crypto-doge.png',
    theme: 'crypto',
  },
];



export const allComps = [
  ...techItems,
  ...premiumItems,
  ...piItems,
  ...dailyItems,
  ...freeItems,
  ...cryptoGiveawaysItems,
];
