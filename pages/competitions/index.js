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
    {
      title: 'Weekly Miner',
      href: '/competitions/weekly-miner',
      prize: '500 PI Giveaway',
      fee: '0.100 π',
    },
    // …add more as needed
  ]

  return (
    <main className="page">
      <h1 className="text-3xl font-bold text-center text-blue-600 mb-8">
        All Competitions
      </h1>

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
