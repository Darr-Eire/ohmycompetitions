// pages/index.js
'use client'

import { useRef } from 'react'
import CompetitionCard from '@/components/CompetitionCard'

export default function HomePage() {
  const dailyRef = useRef(null)
  const freeRef = useRef(null)
  const itemRef = useRef(null)

  const dailyComps = [
    {
      comp: { slug: 'everyday-pioneer', entryFee: 0.314 },
      title: 'Everyday Pioneer',
      href: '/competitions/everyday-pioneer',
      prize: '1,000 PI Giveaway',
      fee: '0.314 π',
      theme: 'gold',
    },
    {
      comp: { slug: 'pi-to-the-moon', entryFee: 0.25 },
      title: 'Pi To The Moon',
      href: '/competitions/pi-to-the-moon',
      prize: '5,000 PI Prize',
      fee: '3.14 π',
      theme: 'orange',
    },
    {
      comp: { slug: 'hack-the-vault', entryFee: 0.375 },
      title: 'Hack The Vault',
      href: '/competitions/hack-the-vault',
      prize: '750 PI Bounty',
      fee: '0.375 π',
      theme: 'purple',
    },
  ]

  const scroll = (ref, offset) => {
    ref.current?.scrollBy({ left: offset, behavior: 'smooth' })
  }

  return (
    <main className="pt-8 pb-12 px-4 bg-white min-h-screen space-y-16">

      {/* Daily Competitions Carousel */}
      <div className="relative">
        <h2 className="daily-competitions-title">Daily Competitions</h2>
        <div
          ref={dailyRef}
          className="daily-carousel flex space-x-4 overflow-x-auto pb-2 no-scrollbar"
        >
          {dailyComps.map(item => (
            <CompetitionCard
              key={item.comp.slug}
              comp={item.comp}
              title={item.title}
              prize={item.prize}
              fee={item.fee}
              href={item.href}
              small
              theme="daily"
              className="flex-shrink-0 w-72"
            />
          ))}
        </div>
        <button
          onClick={() => scroll(dailyRef, -300)}
          className="absolute left-0 top-1/2 -translate-y-1/2 p-2 bg-white rounded-full shadow"
        >
          ‹
        </button>
        <button
          onClick={() => scroll(dailyRef, 300)}
          className="absolute right-0 top-1/2 -translate-y-1/2 p-2 bg-white rounded-full shadow"
        >
          ›
        </button>
      </div>

      {/* Free Competitions Carousel */}
      <div className="relative">
        <h2 className="free-competitions-title">Free Competitions</h2>
        <div
          ref={freeRef}
          className="daily-carousel flex space-x-4 overflow-x-auto pb-2 no-scrollbar"
        >
          {/* Pi Day Freebie */}
          <CompetitionCard
            comp={{ slug: 'pi-day-freebie', entryFee: 0 }}
            title="Pi Day Freebie"
            prize="🎉 Pi Day Badge"
            fee="Free"
            href="/competitions/pi-day-freebie"
            small
            theme="green"
            className="flex-shrink-0 w-72"
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
            <div className="mt-4">
              <button className="comp-button w-full">Enter Now</button>
            </div>
          </CompetitionCard>

          {/* Weekly Pi Giveaway */}
          <CompetitionCard
            comp={{ slug: 'weekly-pi-giveaway', entryFee: 0 }}
            title="Weekly Pi Giveaway"
            prize="1,000 π Giveaway"
            fee="Free"
            href="/competitions/weekly-pi-giveaway"
            small
            theme="green"
            className="flex-shrink-0 w-72"
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
            <div className="mt-4">
              <button className="comp-button w-full">Enter Now</button>
            </div>
          </CompetitionCard>
        </div>
        <button
          onClick={() => scroll(freeRef, -300)}
          className="absolute left-0 top-1/2 -translate-y-1/2 p-2 bg-white rounded-full shadow"
        >
          ‹
        </button>
        <button
          onClick={() => scroll(freeRef, 300)}
          className="absolute right-0 top-1/2 -translate-y-1/2 p-2 bg-white rounded-full shadow"
        >
          ›
        </button>
      </div>

      {/* Item Giveaways Carousel */}
      <div className="relative space-y-4">
        <h3 className="item-giveaways-title">Item Giveaways</h3>
        <div
          ref={itemRef}
          className="daily-carousel flex space-x-4 overflow-x-auto pb-2 no-scrollbar"
        >
          {/* PS5 Bundle */}
          <CompetitionCard
            comp={{ slug: 'ps5-bundle-giveaway', entryFee: 0.5 }}
            title="PS5 Bundle Giveaway"
            prize="PlayStation 5 + Extra Controller"
            fee="0.5 π"
            href="/competitions/ps5-bundle-giveaway"
            small
            theme="purple"
            className="flex-shrink-0 w-72"
          />

          {/* 55" TV */}
          <CompetitionCard
            comp={{ slug: '55-inch-tv-giveaway', entryFee: 0.75 }}
            title='55" TV Giveaway'
            prize='55" Smart TV'
            fee='0.75 π'
            href="/competitions/55-inch-tv-giveaway"
            small
            theme="gold"
            className="flex-shrink-0 w-72"
          />

          {/* Xbox One Bundle */}
          <CompetitionCard
            comp={{ slug: 'xbox-one-bundle', entryFee: 0.6 }}
            title="Xbox One Bundle"
            prize="Xbox One + Game Pass"
            fee="0.6 π"
            href="/competitions/xbox-one-bundle"
            small
            theme="orange"
            className="flex-shrink-0 w-72"
          />
        </div>
        <button
          onClick={() => scroll(itemRef, -300)}
          className="absolute left-0 top-1/2 -translate-y-1/2 p-2 bg-white rounded-full shadow"
        >
          ‹
        </button>
        <button
          onClick={() => scroll(itemRef, 300)}
          className="absolute right-0 top-1/2 -translate-y-1/2 p-2 bg-white rounded-full shadow"
        >
          ›
        </button>
      </div>
    </main>
  )
}

export async function getServerSideProps() {
  return { props: {} }
}
