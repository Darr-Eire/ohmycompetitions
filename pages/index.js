// pages/index.js
'use client'

import { useRef } from 'react'
import CompetitionCard from '@/components/CompetitionCard'
import PiPaymentButton from '@/components/PiPaymentButton'

export default function HomePage() {
  const carouselRef = useRef(null)

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
      prize: '5000 PI Prize',
      fee: '3.14 π',
      theme: 'orange',
    },
    {
      comp: { slug: 'hack-the-vault', entryFee: 0.314 },
      title: 'Hack The Vault',
      href: '/competitions/hack-the-vault',
      prize: '750 PI Bounty',
      fee: '0.375 π',
      theme: 'purple',
    },
  ]

  const scroll = (offset) => {
    carouselRef.current?.scrollBy({ left: offset, behavior: 'smooth' })
  }

  return (
    <main className="pt-8 pb-12 px-4 bg-white min-h-screen">
      {/* Daily Carousel */}
      <div className="relative space-y-4">
        <h2 className="daily-competitions-title">Daily Competitions</h2>
        <div
          ref={carouselRef}
          className="daily-carousel flex space-x-4 overflow-x-auto pb-2"
        >
          {dailyComps.map((item) => (
            <CompetitionCard
              key={item.comp.slug}
              comp={item.comp}
              title={item.title}
              prize={item.prize}
              fee={item.fee}
              href={item.href}
              small
              theme={item.theme}
              className="flex-shrink-0"
            > </CompetitionCard>
          ))}
          </div>
      </div>
     {/* Free Competitions Section */}
<div className="w-full mt-12">
  <h2 className="free-competitions-title text-center mb-6">Free Competitions</h2>
  <div className="w-full grid grid-cols-2 gap-6">
    {/* Pi Day Freebie */}
    <CompetitionCard
      comp={{ slug: 'pi-day-freebie', entryFee: 0 }}
      title="Pi Day Freebie"
      prize="🎉 Pi Day Badge"
      fee="Free"
      href="/competitions/pi-day-freebie"
      small
      theme="green"
      className="w-full"
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

    {/* Weekly Pi Giveaway */}
    <CompetitionCard
      comp={{ slug: 'weekly-pi-giveaway', entryFee: 0 }}
      title="Weekly Pi Giveaway"
      prize="1,000 π Giveaway"
      fee="Free"
      href="/competitions/weekly-pi-giveaway"
      small
      theme="green"
      className="w-full"
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
</div>

    </main>
  )
}

export async function getServerSideProps() {
  return { props: {} }
}
