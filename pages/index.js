// pages/index.js
'use client'

import { useRef } from 'react'
import CompetitionCard from '@/components/CompetitionCard'

export default function HomePage() {
  const dailyRef = useRef(null)
  const freeRef  = useRef(null)
  const itemRef  = useRef(null)
  const piRef    = useRef(null)
   const premiumRef = useRef(null)

  const dailyComps = [
    { comp: { slug: 'everyday-pioneer', entryFee: 0.314 }, title: 'Everyday Pioneer', href: '/competitions/everyday-pioneer', prize: '1,000 PI Giveaway', fee: '0.314 π' },
    { comp: { slug: 'pi-to-the-moon',     entryFee: 0.25  }, title: 'Pi To The Moon',      href: '/competitions/pi-to-the-moon',      prize: '5,000 PI Prize',    fee: '3.14 π'   },
    { comp: { slug: 'hack-the-vault',     entryFee: 0.375 }, title: 'Hack The Vault',      href: '/competitions/hack-the-vault',      prize: '750 PI Bounty',    fee: '0.375 π' },
  ]

  const scroll = (ref, offset) => {
    ref.current?.scrollBy({ left: offset, behavior: 'smooth' })
  }

  return (
    <main className="pt-8 pb-12 px-4 bg-white min-h-screen space-y-16">

      {/* Daily Competitions */}
      <section className="relative text-center">
        <h2 className="daily-competitions-title mx-auto">Daily Competitions</h2>
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
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg"
          aria-label="Scroll daily left"
        >‹</button>
        <button
          onClick={() => scroll(dailyRef, 300)}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg"
          aria-label="Scroll daily right"
        >›</button>
      </section>

      {/* Free Competitions */}
      <section className="relative text-center">
        <h2 className="free-competitions-title mx-auto">Free Competitions</h2>
        <div
          ref={freeRef}
          className="daily-carousel flex space-x-4 overflow-x-auto pb-2 no-scrollbar"
        >
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
              <p className="text-sm text-gray-600">Earn 1 free entry for every friend who signs up!</p>
              <a href={`/refer?comp=pi-day-freebie`} className="text-green-600 text-sm underline">
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
            small
            theme="green"
            className="flex-shrink-0 w-72"
          >
            <div className="mt-2 p-2 bg-green-50 rounded text-center">
              <h4 className="text-green-700 font-semibold">Referral Rewards</h4>
              <p className="text-sm text-gray-600">Earn 1 free entry for every friend who signs up!</p>
              <a href={`/refer?comp=pi-day-freebie`} className="text-green-600 text-sm underline">
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
            small
            theme="green"
            className="flex-shrink-0 w-72"
          >
            <div className="mt-2 p-2 bg-green-50 rounded text-center">
              <h4 className="text-green-700 font-semibold">Social Media Entry</h4>
              <p className="text-sm text-gray-600">Earn 1 free entry for every new social media follower you get this week!</p>
              <a href="https://twitter.com/YourTwitterHandle" target="_blank" rel="noopener noreferrer" className="text-green-600 text-sm underline">
                Follow us on Twitter
              </a>
            </div>
          </CompetitionCard>
        </div>
        <button
          onClick={() => scroll(freeRef, -300)}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg"
          aria-label="Scroll free left"
        >‹</button>
        <button
          onClick={() => scroll(freeRef, 300)}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg"
          aria-label="Scroll free right"
        >›</button>
      </section>

      {/* Tech Giveaways */}
      <section className="relative text-center">
        <h3 className="item-giveaways-title mx-auto">Tech Giveaways</h3>
        <div
          ref={itemRef}
          className="daily-carousel flex space-x-4 overflow-x-auto pb-2 no-scrollbar"
        >
          <CompetitionCard
            comp={{ slug: 'ps5-bundle-giveaway', entryFee: 0.5 }}
            title="PS5 Bundle Giveaway"
            prize="PlayStation 5 + Extra Controller"
            fee="0.5 π"
            href="/competitions/ps5-bundle-giveaway"
            small
            theme="orange"
            className="flex-shrink-0 w-72"
          />
          <CompetitionCard
            comp={{ slug: '55-inch-tv-giveaway', entryFee: 0.75 }}
            title='55" TV Giveaway'
            prize='55" Smart TV'
            fee='0.75 π'
            href="/competitions/55-inch-tv-giveaway"
            small
            theme="orange"
            className="flex-shrink-0 w-72"
          />
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
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-orange-600 hover:bg-orange-700 text-white rounded-full shadow-lg"
          aria-label="Scroll items left"
        >‹</button>
        <button
          onClick={() => scroll(itemRef, 300)}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-orange-600 hover:bg-orange-700 text-white rounded-full shadow-lg"
          aria-label="Scroll items right"
        >›</button>
      </section>

      {/* Pi Giveaways */}
      <section className="relative text-center">
        <h2 className="pi-giveaways-title">Pi Giveaways</h2>

        <div
          ref={piRef}
          className="daily-carousel flex space-x-4 overflow-x-auto pb-2 no-scrollbar"
        >
          <CompetitionCard
            comp={{ slug: 'pi-giveaway-100k', entryFee: 10 }}
            title="100 000 π Giveaway"
            prize="100 000 π"
            fee="10 π"
            href="/competitions/pi-giveaway-100k"
            small
            theme="purple"
            className="flex-shrink-0 w-72"
          />
          <CompetitionCard
            comp={{ slug: 'pi-giveaway-50k', entryFee: 5 }}
            title="50 000 π Giveaway"
            prize="50 000 π"
            fee="5 π"
            href="/competitions/pi-giveaway-50k"
            small
            theme="purple"
            className="flex-shrink-0 w-72"
          />
          <CompetitionCard
            comp={{ slug: 'pi-giveaway-25k', entryFee: 2.5 }}
            title="25 000 π Giveaway"
            prize="25 000 π"
            fee="2.5 π"
            href="/competitions/pi-giveaway-25k"
            small
            theme="purple"
            className="flex-shrink-0 w-72"
          />
        </div>
        <button
          onClick={() => scroll(piRef, -300)}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg"
          aria-label="Scroll Pi left"
        >‹</button>
        <button
          onClick={() => scroll(piRef, 300)}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg"
          aria-label="Scroll Pi right"
        >›</button>
      </section>

   {/* Premium Competitions */}
   <section className="relative text-center">
        <h2 className="premium-competitions-title mx-auto">Premium Competitions</h2>
        <div
          ref={premiumRef}
          className="daily-carousel flex space-x-4 overflow-x-auto pb-2 no-scrollbar"
        >
          <CompetitionCard
            comp={{ slug: 'tesla-model-3-giveaway', entryFee: 50 }}
            title="Tesla Model 3 Giveaway"
            prize="Tesla Model 3"
            fee="50 π"
            href="/competitions/tesla-model-3-giveaway"
            small
            theme="premium"
            className="flex-shrink-0 w-72"
          />
          <CompetitionCard
            comp={{ slug: 'dubai-luxury-holiday', entryFee: 25 }}
            title="Dubai Luxury Holiday"
            prize="7-Day Dubai Trip"
            fee="25 π"
            href="/competitions/dubai-luxury-holiday"
            small
            theme="premium"
            className="flex-shrink-0 w-72"
          />
          <CompetitionCard
            comp={{ slug: 'macbook-pro-2025-giveaway', entryFee: 15 }}
            title="MacBook Pro 2025"
            prize="Apple MacBook Pro"
            fee="15 π"
            href="/competitions/macbook-pro-2025-giveaway"
            small
            theme="premium"
            className="flex-shrink-0 w-72"
          />
        </div>
        <button
          onClick={() => scroll(premiumRef, -300)}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-yellow-600 hover:bg-yellow-700 text-white rounded-full shadow-lg"
        >‹</button>
        <button
          onClick={() => scroll(premiumRef, 300)}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-yellow-600 hover:bg-yellow-700 text-white rounded-full shadow-lg"
        >›</button>
      </section>

    </main>
  )
}

// This must be after your component
export async function getServerSideProps() {
  return { props: {} }
}