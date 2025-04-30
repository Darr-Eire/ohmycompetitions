'use client'

import { useRef } from 'react'
import CompetitionCard from '@/components/CompetitionCard'

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
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: offset, behavior: 'smooth' })
    }
  }

  return (
    <main className="pt-8 pb-12 px-4 space-y-12 bg-white min-h-screen">
      {/* Daily Carousel */}
      <div className="relative">
        <h2 className="text-2xl font-bold text-blue-600 text-center mb-4">Daily Competitions</h2>
        <div ref={carouselRef} className="daily-carousel">
          {dailyComps.map((c) => (
            <CompetitionCard
              key={c.href}
              comp={c.comp}
              title={c.title}
              prize={c.prize}
              fee={c.fee}
              href={c.href}
              small
              theme={c.theme}
            />
          ))}
        </div>
      </div>

      {/* Free Competitions Section */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-green-600 mb-4">Free Competitions</h2>
        <div className="flex justify-center">
          <CompetitionCard
            comp={{ slug: 'pi-day-freebie', entryFee: 0 }}
            title="Pi Day Freebie"
            prize="🎉 Pi Day Badge"
            fee="Free"
            href="/competitions/pi-day-freebie"
            small
            theme="green"
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
        </div>
      </div>
    </main>
  )
}

// Ensure session and dynamic features work
export async function getServerSideProps() {
  return { props: {} }
}
