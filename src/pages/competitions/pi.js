'use client'

import PiCompetitionCard from '@components/PiCompetitionCard'
import { piItems } from '../../data/competitions' // adjust path if needed

export default function PiCompetitionsPage() {
  return (
    <main className="app-background min-h-screen px-0 py-0 text-white">
      <div className="max-w-screen-lg mx-auto px-4 sm:px-0">
        <h1
          className="
            text-3xl font-bold text-center mb-4
            bg-gradient-to-r from-[#00ffd5] to-[#0077ff]
            bg-clip-text text-transparent
          "
        >
          Pi Competitions
        </h1>

        <p className="text-center text-white text-base sm:text-lg max-w-md mx-auto mb-8">
          Join exciting Pi competitions starting from just{' '}
          <span className="font-semibold">1.6 π</span> per entry — grab your chance to win big! We’re always adding new competitions and creating even more winners as time goes on — don’t miss your chance to join the excitement!
        </p>

       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16 mt-8">

          {piItems.map((item) => (
            <PiCompetitionCard key={item.comp.slug} {...item} fee={`${item.comp.entryFee.toFixed(2)} π`} />
          ))}
        </div>
      </div>
    </main>
  )
}
