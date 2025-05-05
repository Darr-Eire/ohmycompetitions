// pages/ticket-purchase/[slug].js
'use client'
import { useRouter } from 'next/router'
import BuyTicketButton from '@/components/BuyTicketButton'
  const COMPETITIONS = {
 
    'everyday-pioneer': {
      title: 'Everyday Pioneer',
      imageUrl: '/images/everyday.png',
      prize: '🎉 1000 pi',
      entryFee: 0.314,
      totalTickets: 1900,
      ticketsSold: 0,
      endsAt: '2025-05-03T15:14:00Z',
      theme: 'daily',
    },
    'pi-to-the-moon': {
      title: 'Pi To The Moon',
      imageUrl: '/images/pitothemoon.jpeg',
      prize: '🎉 5000',
      entryFee: 3.14,
      totalTickets: 1900,
      ticketsSold: 0,
      endsAt: '2025-05-04T12:00:00Z',
      theme: 'daily',
    },
    'hack-the-vault': {
      title: 'Hack The Vault',
      imageUrl: '/images/vault.png',
      prize: '🎉  750',
      entryFee: 0.375,
      totalTickets: 850,
      ticketsSold: 0,
      endsAt: '2025-05-03T23:59:59Z',
      theme: 'daily',
    },
    'pi-day-freebie': {
      title: 'Pi Day Freebie',
      imageUrl: '/images/piday.png',
      prize: '🎉 Pi Day Badge',
      entryFee: 0,
      totalTickets: 10000,
      ticketsSold: 0,
      endsAt: '2025-05-06T20:00:00Z',
      theme: 'free',
    },
  

    'ps5-bundle-giveaway': {
      title: 'PS5 Bundle Giveaway',
      imageUrl: '/images/playstation.jpeg',
      prize: 'PlayStation 5 + Extra Controller',
      entryFee: 0.8,
      totalTickets: 1100,
      ticketsSold: 0,
      endsAt: '2025-05-07T14:00:00Z',
      theme: 'tech',
    },
    '55-inch-tv-giveaway': {
      title: '55" TV Giveaway',
      imageUrl: '/images/tv.jpg',
      prize: '55" Smart TV',
      entryFee: 0.25,
      totalTickets: 1400,
      ticketsSold: 0,
      endsAt: '2025-05-08T11:30:00Z',
      theme: 'tech',
    },
    'xbox-one-bundle': {
      title: 'Xbox One Bundle',
      imageUrl: '/images/xbox.jpeg',
      prize: 'Xbox One + Game Pass',
      entryFee: 0.2,
      totalTickets: 2000,
      ticketsSold: 0,
      endsAt: '2025-05-09T17:45:00Z',
      theme: 'tech',
    },
   'pi-giveaway-100k': {
      title: '100,000 π Giveaway',
      imageUrl: '/images/100000.png',
      prize: '100,000 π',
      entryFee: 3.14,
      totalTickets: 17000,
      ticketsSold: 0,
      endsAt: '2025-05-11T00:00:00Z',
      theme: 'pi',
    },
    'weekly-giveaway': {
  title: 'Weekly Giveaway',
  imageUrl: '/images/weekly.png', // Ensure this image is in your public/images folder
  prize: 'Exciting New Prizes Every Week',
  entryFee: 5,
  totalTickets: 500,
  ticketsSold: 0,
  endsAt: '2025-05-12T21:00:00Z',
  theme: 'daily'
},

    'pi-giveaway-50k': {
      title: '50 000 π Giveaway',
      imageUrl: '/images/50000.png',
      prize: '50 000 π',
      entryFee: 3.14,
      totalTickets: 17000,
      ticketsSold: 0,
      endsAt: '2025-05-11T00:00:00Z',
      theme: 'pi',
    },
    'pi-giveaway-25k': {
      title: '25 000 π Giveaway',
      imageUrl: '/images/25000.png',
      prize: '25 000 π',
      entryFee: 2.5,
      totalTickets: 11200,
      ticketsSold: 0,
      endsAt: '2025-05-10T00:00:00Z',
      theme: 'pi',
    },
    'tesla-model-3-giveaway': {
      title: 'Tesla Model 3 Giveaway',
      imageUrl: '/images/tesla.jpeg',
      prize: 'Tesla Model 3',
      entryFee: 40,
      totalTickets: 15000,
      ticketsSold: 0,
      endsAt: '2025-05-20T23:59:00Z',
      theme: 'premium',
    },
    'dubai-luxury-holiday': {
      title: 'Dubai Luxury Holiday',
      imageUrl: '/images/dubai-luxury-holiday.jpg',
      prize: '7-Day Dubai Trip',
      entryFee: 25,
      totalTickets: 8000,
      ticketsSold: 7100,
      endsAt: '2025-05-18T22:00:00Z',
      theme: 'premium',
    },
    'penthouse-hotel-stay': {
      title: 'Penthouse Hotel Stay',
      imageUrl: '/images/hotel.jpeg',
      prize: 'Penthouse Hotel Stay of your choice',
      entryFee: 20,
      totalTickets: 15000,
      ticketsSold: 0,
      endsAt: '2025-05-15T21:00:00Z',
      theme: 'premium',
    },
  
   'luxury-yacht-weekend': {
    title: 'Luxury Yacht Weekend',
    imageUrl: '/images/yacht.jpeg',
    prize: '3 day Mediterranean Yacht Cruise',
    entryFee: 20,
    totalTickets: 15000,
    ticketsSold: 0,
    endsAt: '2025-05-15T21:00:00Z',
    theme: 'premium'},
  
    'the-crown-jewels': {
      title: 'The Crown Jewels',
      imageUrl: '/images/jew.jpeg',
      prize: 'Gold Rings',
      entryFee: 20,
      totalTickets: 15000,
      ticketsSold: 0,
      endsAt: '2025-05-15T21:00:00Z',
      theme: 'premium'},
  
      'first-class-flight': {
        title: 'First Class Flight',
        imageUrl: '/images/first.jpeg',
        prize: 'Return Flights Anywhere In The World',
        entryFee: 20,
        totalTickets: 15000,
        ticketsSold: 0,
        endsAt: '2025-05-15T21:00:00Z',
        theme: 'premium'},
  
        'pi-giveaway-250k': {
          title: '25,000 π Giveaway',
          imageUrl: '/images/250000.png',
          prize: '25 000 π',
          entryFee: 20,
          totalTickets: 15000,
          ticketsSold: 0,
          endsAt: '2025-05-15T21:00:00Z',
          theme: 'premium'},
  
          'pi-giveaway-100k': {
          title: '100,000 π Giveaway',
          imageUrl: '/images/100000.png',
          prize: '25 000 π',
          entryFee: 20,
          totalTickets: 15000,
          ticketsSold: 0,
          endsAt: '2025-05-15T21:00:00Z',
          theme: 'premium'},
  
          'pi-giveaway-60000': {
            title: '60,000 π Giveaway',
            imageUrl: '/images/60000.png',
            prize: '25 000 π',
            entryFee: 20,
            totalTickets: 15000,
            ticketsSold: 0,
            endsAt: '2025-05-15T21:00:00Z',
            theme: 'premium'},
  
            'pi-giveaway-25k': {
              title: '100,000 π Giveaway',
              imageUrl: '/images/100000.png',
              prize: '100,000 π',
              entryFee: 20,
              totalTickets: 15000,
              ticketsSold: 0,
              endsAt: '2025-05-15T21:00:00Z',
              theme: 'premium'},
  
              'pi-giveaway-25000': {
              title: '25,000 Giveaway',
              imageUrl: '/images/25000.png',
              prize: '25,000 π',
              entryFee: 20,
              totalTickets: 15000,
              ticketsSold: 0,
              endsAt: '2025-05-15T21:00:00Z',
              theme: 'premium'},
  
              'pi-giveaway-10000': {
                title: '10,000 Giveaway',
                imageUrl: '/images/10000.png',
                prize: '10,000 π',
                entryFee: 20,
                totalTickets: 15000,
                ticketsSold: 0,
                endsAt: '2025-05-15T21:00:00Z',
                theme: 'premium'},
  
                'pi-giveaway-5000': {
                title: '5000 Giveaway',
                imageUrl: '/images/5000.png',
                prize: '5000 π',
                entryFee: 20,
                totalTickets: 5000,
                ticketsSold: 0,
                endsAt: '2025-05-15T21:00:00Z',
                theme: 'premium'},
  
                 'apple-iphone': {
                title: 'Apple Iphone',
                imageUrl: '/images/iphone.jpeg',
                prize: 'Iphone',
                entryFee: 20,
                totalTickets: 1000,
                ticketsSold: 0,
                endsAt: '2025-05-15T21:00:00Z',
                theme: 'premium'},
  
                'Rolex': {
                title: 'Rolex',
                imageUrl: '/images/rolex.jpeg',
                prize: 'Rolex Watch',
                entryFee: 20,
                totalTickets: 1000,
                ticketsSold: 0,
                endsAt: '2025-05-15T21:00:00Z',
                theme: 'premium'},
  
                'gamer-pc-bundle': {
                title: 'Gamer Pc nBundle',
                imageUrl: '/images/bundle.jpeg',
                prize: 'Rolex Watch',
                entryFee: 20,
                totalTickets: 1000,
                ticketsSold: 0,
                endsAt: '2025-05-15T21:00:00Z',
                theme: 'premium'},
  
                'mac-book-pro': {
                  title: 'Mac Book Pro',
                  imageUrl: '/images/macbook.jpeg',
                  prize: 'Rolex Watch',
                  entryFee: 20,
                  totalTickets: 1000,
                  ticketsSold: 0,
                  endsAt: '2025-05-15T21:00:00Z',
                  theme: 'premium'},
                  
                  'electric-bike': {
                    title: 'Electric Bike',
                    imageUrl: '/images/bike.jpeg',
                    prize: 'Electric Bike',
                    entryFee: 20,
                    totalTickets: 1000,
                    ticketsSold: 0,
                    endsAt: '2025-05-15T21:00:00Z',
                    theme: 'premium'},
  
                    'pi-miners-bonanza': {
                      title: 'Pi Miners Bonanza',
                      imageUrl: '/images/bonanza.png',
                      prize: '',
                      entryFee: 20,
                      totalTickets: 1000,
                      ticketsSold: 0,
                      endsAt: '2025-05-15T21:00:00Z',
                      theme: 'premium'},
  
                      'pi-nugget-giveaway': {
                        title: 'Pi-Nugget-Giveaway',
                        imageUrl: '/images/nugget.png',
                        prize: '',
                        entryFee: 20,
                        totalTickets: 1000,
                        ticketsSold: 0,
                        endsAt: '2025-05-15T21:00:00Z',
                        theme: 'premium'},

  
                            'daily-pi-slice': {
                            title: 'Daily Pi Slice',
                            imageUrl: '/images/daily.png',
                            prize: '',
                            entryFee: 20,
                            totalTickets: 1000,
                            ticketsSold: 0,
                            endsAt: '2025-05-15T21:00:00Z',
                            theme: 'premium'},
  
                              'daily-jackpot': {
                              title: 'Daily Jackpot',
                              imageUrl: '/images/jackpot.png',
                              prize: '',
                              entryFee: 20,
                              totalTickets: 1000,
                              ticketsSold: 0,
                              endsAt: '2025-05-15T21:00:00Z',
                              theme: 'premium'},
  
                              'the-daily-dash': {
                                title: 'The Daily Dash',
                                imageUrl: '/images/dash.png',
                                prize: '',
                                entryFee: 20,
                                totalTickets: 1000,
                                ticketsSold: 0,
                                endsAt: '2025-05-15T21:00:00Z',
                                theme: 'premium'},
    
  
  }

  export default function TicketPurchasePage() {
    const router = useRouter()
    const { slug } = router.query
  
    // Before Next hydrates on the client, slug may be undefined:
    if (!slug) return <p>Loading…</p>
  
    const comp = COMPETITIONS[slug]
    if (!comp) return <p>Competition “{slug}” not found</p>
  
    return (
      <div className="max-w-xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">{comp.title}</h1>
        <p className="mb-6">Entry Fee: {comp.entryFee} π</p>
        <BuyTicketButton
          entryFee={comp.entryFee}
          competitionSlug={slug}
        />
      </div>
    )
  }