'use client'

import Head from 'next/head'
import CryptoGiveawayCard from '@/components/CryptoGiveawayCard'
import { cryptoGiveawaysItems } from '@/data/competitions'

export default function CryptoGiveawaysPage() {
  return (
    <>
      <main className="app-background min-h-screen px-4 py-8 text-white">
        <div className="max-w-screen-lg mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-[#00ffd5] to-[#0077ff] bg-clip-text text-transparent">
            Crypto Giveaways
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-6">
            {cryptoGiveawaysItems.map((item) => (
              <CryptoGiveawayCard key={item.comp.slug} {...item} />
            ))}
          </div>

        </div>
      </main>
    </>
  )
}
