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
    // ← you can add more competitions here
  ]

  return (
    <main className="page">
      {/* Page title */}
      <h1 className="text-4xl font-bold text-blue-600 text-center mb-12">
        All Competitions
      </h1>

      {/* Cards grid */}
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
