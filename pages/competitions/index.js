// pages/competitions/index.js
import CompetitionCard from '@/components/CompetitionCard'

export default function AllCompetitions() {
  const comps = [
    {
      title: 'Everyday Pioneer',
      href: '/competitions/everyday-pioneer',
      prize: '1,000 PI Giveaway',
      fee: '0.314 π',
    },
    // …other comps
  ]

  return (
    <main className="pt-20 pb-12 px-4">
      {/* Page Title */}
      <h1 className="text-4xl font-extrabold text-blue-600 text-center mb-12">
        All Competitions
      </h1>

      {/* Card Grid */}
      <div className="flex flex-wrap justify-center gap-6">
        {comps.map(c => (
          <CompetitionCard
            key={c.href}
            title={c.title}
            prize={c.prize}
            fee={c.fee}
            href={c.href}
          />
        ))}
      </div>
    </main>
  )
}
