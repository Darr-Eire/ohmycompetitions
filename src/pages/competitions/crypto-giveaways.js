'use client'

import Head from 'next/head'
import CryptoGiveawayCard from '@components/CryptoGiveawayCard'
import { cryptoGiveawaysItems } from '@data/competitions'

export default function CryptoGiveawaysPage() {
  return (
    <>
      <Head>
        <title>Crypto Giveaways | OhMyCompetitions</title>
      </Head>

      <main className="app-background min-h-screen px-0 py-0 text-white">
        <div className="max-w-screen-lg mx-auto px-4 sm:px-0">
          <h1
            className="
              text-3xl font-bold text-center mb-4
              bg-gradient-to-r from-[#00ffd5] to-[#0077ff]
              bg-clip-text text-transparent
            "
          >
            Crypto Giveaways
          </h1>

         <p className="text-center text-white text-base sm:text-lg max-w-md mx-auto mb-8">
  No giveaways are live right now but don’t worry. Check back soon and be ready to grab your chance to win crypto prizes. We’re always adding new competitions and creating even more winners as time goes on don’t miss your chance to join the excitement
</p>


         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16 mt-8">

            {cryptoGiveawaysItems.length > 0 ? (
              cryptoGiveawaysItems.map((item) => (
                <CryptoGiveawayCard key={item.comp.slug} {...item} />
              ))
            ) : (
              <p className="text-center text-gray-400 col-span-full">
                There are currently no active crypto giveaways.
              </p>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
