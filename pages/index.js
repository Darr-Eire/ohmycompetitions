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
      prize: '500 PI Prize',
      fee: '0.250 π',
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
            >
              {/* PiPaymentButton drives authenticate + U2A payment */}
              <PiPaymentButton
                amount={item.comp.entryFee}
                memo={`Entry fee for ${item.title}`}
                metadata={{ compSlug: item.comp.slug }}
              />
            </CompetitionCard>
          ))}
          {/* Scroll Arrows */}
          <button
            onClick={() => scroll(-300)}
            className="absolute left-0 top-1/2 -translate-y-1/2 p-2 bg-white rounded-full shadow"
          >
            ‹
          </button>
          <button
            onClick={() => scroll(300)}
            className="absolute right-0 top-1/2 -translate-y-1/2 p-2 bg-white rounded-full shadow"
          >
            ›
          </button>
        </div>
      </div>

      {/* Free Competitions Section */}
      <div className="text-center space-y-4">
        <h2 className="free-competitions-title">Free Competitions</h2>
        <div className="flex justify-center">
          <CompetitionCard
            comp={{ slug: 'pi-day-freebie', entryFee: 0 }}
            title="Pi Day Freebie"
            prize="🎉 Pi Day Badge"
            fee="Free"
            href="/competitions/pi-day-freebie"
            small
            theme="green"
            className="w-full max-w-xs"
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
            {/* Simple “Enter Now” for freebie */}
            <button className="mt-2 comp-button w-full">Enter Now</button>
          </CompetitionCard>
        </div>
      </div>
    </main>
  )
}

export async function getServerSideProps() {
  return { props: {} }
}
