// pages/competitions/index.js

import CompetitionCard from '@/components/CompetitionCard'

export default function AllCompetitionsPage() {
  const allComps = [
    { comp: { slug: 'everyday-pioneer', entryFee: 0.314 },      title: 'Everyday Pioneer',       prize: '1,000 PI Giveaway',        fee: '0.314 π',      href: '/competitions/everyday-pioneer',      imageUrl: '/images/everyday.png',              theme: 'daily'    },
    { comp: { slug: 'pi-to-the-moon', entryFee: 0.25 },          title: 'Pi To The Moon',          prize: '5,000 PI Prize',           fee: '3.14 π',      href: '/competitions/pi-to-the-moon',          imageUrl: '/images/pitothemoon.jpeg',         theme: 'daily'    },
    { comp: { slug: 'hack-the-vault', entryFee: 0.375 },        title: 'Hack The Vault',          prize: '750 PI Bounty',           fee: '0.375 π',     href: '/competitions/hack-the-vault',         imageUrl: '/images/vault.png',               theme: 'daily'    },
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

        <div className="border-2 border-blue-500 rounded-xl p-4 bg-blue-50 shadow-md">
          {/* here’s the grid: exactly 3 columns, no flex */}
          <div className="grid grid-cols-2 gap-6">
            {allComps.map(item => (
              <CompetitionCard
                key={item.comp.slug}
                comp={item.comp}
                title={item.title}
                prize={item.prize}
                fee={item.fee}
                href={item.href}
                imageUrl={item.imageUrl}
                small
                theme={item.theme}
                className="transform scale-90 transition-all duration-200"
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
