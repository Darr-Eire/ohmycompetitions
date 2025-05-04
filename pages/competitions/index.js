// pages/competitions/index.js
'use client'

import CompetitionCard from '@/components/CompetitionCard'

export default function AllCompetitionsPage() {
  const allComps = [
    /* your competition objects here */
  ]

  return (
    <main
      className="pt-8 pb-12 px-4 min-h-screen"
      style={{
        backgroundImage: 'linear-gradient(to bottom right, #1E3A8A, #60A5FA)',
      }}
    >
      <h1 className="text-3xl font-bold text-white mb-8 text-center">
        All Competitions
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allComps.map(item => (
          <CompetitionCard
            key={item.comp.slug}
            comp={item.comp}
            title={item.title}
            prize={item.prize}
            fee={item.fee}
            theme={item.theme}
            imageUrl={item.imageUrl}
            endsAt={item.comp.endsAt}
          />
        ))}
      </div>
    </main>
  )
}
