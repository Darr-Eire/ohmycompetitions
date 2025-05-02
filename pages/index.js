// pages/index.js
'use client'

import { useRef } from 'react'
import CompetitionCard from '@/components/CompetitionCard'

export default function HomePage() {
  const dailyRef   = useRef(null)
  const freeRef    = useRef(null)
  const itemRef    = useRef(null)
  const piRef      = useRef(null)
  const premiumRef = useRef(null)

  const dailyComps = [
    {
      comp: { slug: 'everyday-pioneer', entryFee: 0.314 },
      title: 'Everyday Pioneer',
      href: '/competitions/everyday-pioneer',
      prize: '1,000 PI Giveaway',
      fee: '0.314 π',
      imageUrl: '/images/everyday.png',
    },
    {
      comp: { slug: 'pi-to-the-moon', entryFee: 0.25 },
      title: 'Pi To The Moon',
      href: '/competitions/pi-to-the-moon',
      prize: '5,000 PI Prize',
      fee: '3.14 π',
      imageUrl: '/images/pitothemoon.jpeg',
    },
    {
      comp: { slug: 'hack-the-vault', entryFee: 0.375 },
      title: 'Hack The Vault',
      href: '/competitions/hack-the-vault',
      prize: '750 PI Bounty',
      fee: '0.375 π',
      imageUrl: '/images/vault.png',
    },
  ]

  const scroll = (ref, offset) => {
    ref.current?.scrollBy({ left: offset, behavior: 'smooth' })
  }

  return (
    <main className="pt-8 pb-12 px-4 bg-white min-h-screen space-y-16">

      {/* Daily Competitions */}
      <section className="relative text-center">
        <h2 className="daily-competitions-title inline-block mx-auto">
          Daily Competitions
        </h2>
        <div
          ref={dailyRef}
          className="daily-carousel flex space-x-4 overflow-x-auto pb-2 no-scrollbar px-4 sm:px-0"


        >
          {dailyComps.map(item => (
            <CompetitionCard
              key={item.comp.slug}
              comp={item.comp}
              title={item.title}
              prize={item.prize}
              fee={item.fee}
              href={item.href}
              imageUrl={item.imageUrl}
              small
              theme="daily"
              className="flex-shrink-0 w-64"


            />
          ))}
        </div>
      </section>

      {/* Free Competitions */}
      <section className="relative text-center">
        <h2 className="free-competitions-title inline-block mx-auto">
          Free Competitions
        </h2>
        <div
          ref={freeRef}
          className="daily-carousel flex space-x-4 overflow-x-auto pb-2 no-scrollbar px-4 sm:px-0"


        >
          <CompetitionCard
            comp={{ slug: 'pi-day-freebie', entryFee: 0 }}
            title="Pi Day Freebie"
            prize="🎉 Pi Day Badge"
            fee="Free"
            href="/competitions/pi-day-freebie"
            imageUrl="/images/freebie.png"
            small
            theme="green"
            className="flex-shrink-0 w-64"


          >
            <div className="mt-2 p-2 bg-green-50 rounded text-center">
              <h4 className="text-green-700 font-semibold">Referral Rewards</h4>
              <p className="text-sm text-gray-600">
                Earn 1 free entry for every friend who signs up!
              </p>
              <a
                href={`/refer?comp=pi-day-freebie`}
                className="text-green-600 text-sm underline"
              >
                Get your referral link
              </a>
            </div>
          </CompetitionCard>
          <CompetitionCard
            comp={{ slug: 'everyones-a-winner', entryFee: 0 }}
            title="Everyones A Winner"
            prize="🎉1st 9999 2nd 5555  3rd 1111"
            fee="Free"
            href="/competitions/everyones-a-winner"
            imageUrl="/images/everyone.png"
            small
            theme="green"
            className="flex-shrink-0 w-64"


          >
            <div className="mt-2 p-2 bg-green-50 rounded text-center">
              <h4 className="text-green-700 font-semibold">Referral Rewards</h4>
              <p className="text-sm text-gray-600">
                Earn 1 free entry for every friend who signs up!
              </p>
              <a
                href={`/refer?comp=everyones-a-winner`}
                className="text-green-600 text-sm underline"
              >
                Get your referral link
              </a>
            </div>
          </CompetitionCard>
          <CompetitionCard
            comp={{ slug: 'weekly-pi-giveaway', entryFee: 0 }}
            title="Weekly Pi Giveaway"
            prize="1,000 π Giveaway"
            fee="Free"
            href="/competitions/weekly-pi-giveaway"
            imageUrl="/images/weekly.png"
            small
            theme="green"
            className="flex-shrink-0 w-64"


          >
            <div className="mt-2 p-2 bg-green-50 rounded text-center">
              <h4 className="text-green-700 font-semibold">Social Media Entry</h4>
              <p className="text-sm text-gray-600">
                Earn 1 free entry for every new social media follower you get this week!
              </p>
              <a
                href="https://twitter.com/YourTwitterHandle"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 text-sm underline"
              >
                Follow us on Twitter
              </a>
            </div>
          </CompetitionCard>
        </div>
      </section>

      {/* Tech Giveaways */}
      <section className="relative text-center">
        <h3 className="item-giveaways-title inline-block mx-auto">
          Tech Giveaways
        </h3>
        <div
          ref={itemRef}
          className="daily-carousel flex space-x-4 overflow-x-auto pb-2 no-scrollbar px-4 sm:px-0"


        >
          <CompetitionCard
            comp={{ slug: 'ps5-bundle-giveaway', entryFee: 0.5 }}
            title="PS5 Bundle Giveaway"
            prize="PlayStation 5 + Extra Controller"
            fee="0.5 π"
            href="/competitions/ps5-bundle-giveaway"
            imageUrl="/images/ps5.jpeg"
            small
            theme="orange"
            className="flex-shrink-0 w-64"


          />
          <CompetitionCard
            comp={{ slug: '55-inch-tv-giveaway', entryFee: 0.75 }}
            title='55" TV Giveaway'
            prize='55" Smart TV'
            fee='0.75 π'
            href="/competitions/55-inch-tv-giveaway"
            imageUrl="/images/Tv.jpeg"
            small
            theme="orange"
            className="flex-shrink-0 w-64"


          />
          <CompetitionCard
            comp={{ slug: 'xbox-one-bundle', entryFee: 0.6 }}
            title="Xbox One Bundle"
            prize="Xbox One + Game Pass"
            fee="0.6 π"
            href="/competitions/xbox-one-bundle"
            imageUrl="/images/xbox.jpeg"
            small
            theme="orange"
            className="flex-shrink-0 w-64"


          />
        </div>
      </section>

      {/* Pi Giveaways */}
      <section className="relative text-center">
        <h2 className="pi-giveaways-title inline-block mx-auto">
          Pi Giveaways
        </h2>
        <div
          ref={piRef}
          className="daily-carousel flex space-x-4 overflow-x-auto pb-2 no-scrollbar px-4 sm:px-0"


        >
          <CompetitionCard
            comp={{ slug: 'pi-giveaway-100k', entryFee: 10 }}
            title="100 000 π Giveaway"
            prize="100 000 π"
            fee="10 π"
            href="/competitions/pi-giveaway-100k"
            imageUrl="/images/100,000.png"
            small
            theme="purple"
            className="flex-shrink-0 w-64"


          />
          <CompetitionCard
            comp={{ slug: 'pi-giveaway-50k', entryFee: 5 }}
            title="50 000 π Giveaway"
            prize="50 000 π"
            fee="5 π"
            href="/competitions/pi-giveaway-50k"
            imageUrl="/images/50,000.png"
            small
            theme="purple"
            className="flex-shrink-0 w-64"


          />
          <CompetitionCard
            comp={{ slug: 'pi-giveaway-25k', entryFee: 2.5 }}
            title="25 000 π Giveaway"
            prize="25 000 π"
            fee="2.5 π"
            href="/competitions/pi-giveaway-25k"
            imageUrl="/images/25,000.png"
            small
            theme="purple"
            className="flex-shrink-0 w-64"


          />
        </div>
      </section>

      {/* Premium Competitions */}
      <section className="relative text-center">
        <h2 className="premium-competitions-title inline-block mx-auto">
          Premium Competitions
        </h2>
        <div
          ref={premiumRef}
          className="daily-carousel flex space-x-4 overflow-x-auto pb-2 no-scrollbar px-4 sm:px-0"


        >
          <CompetitionCard
            comp={{ slug: 'tesla-model-3-giveaway', entryFee: 50 }}
            title="Tesla Model 3 Giveaway"
            prize="Tesla Model 3"
            fee="50 π"
            href="/competitions/tesla-model-3-giveaway"
            imageUrl="/images/tesla.jpeg"
            small
            theme="premium"
            className="flex-shrink-0 w-64"


          />
          <CompetitionCard
            comp={{ slug: 'dubai-luxury-holiday', entryFee: 25 }}
            title="Dubai Luxury Holiday"
            prize="7-Day Dubai Trip"
            fee="25 π"
            href="/competitions/dubai-luxury-holiday"
            imageUrl="/images/dubai-luxury-holiday.jpg"
            small
            theme="premium"
            className="flex-shrink-0 w-64"


          />
          <CompetitionCard
            comp={{ slug: 'penthouse-hotel Stay', entryFee: 15 }}
            title="Penthouse Hotel Stay"
            prize="Penthouse Hotel Stay of your choice"
            fee="15 π"
            href="/competitions/macbook-pro-2025-giveaway"
            imageUrl="/images/hotel.jpeg"
            small
            theme="premium"
            className="flex-shrink-0 w-64"


          />
        </div>
      </section>

    </main>
  )
}

// This must remain to satisfy Next.js
export async function getServerSideProps() {
  return { props: {} }
}
