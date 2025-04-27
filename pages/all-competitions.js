// pages/all-competitions.js
import CompetitionCard from '@/components/CompetitionCard'

const competitions = [
  {
    slug: 'everyday-pioneer',
    title: 'Everyday Pioneer',
    prize: '1,000 PI Giveaway',
    fee: '0.314 π',
  },
]

export default function AllCompetitions() {
  return (
    <main className="page">
      {competitions.map((c) => (
        <CompetitionCard
          key={c.slug}
          title={c.title}
          prize={c.prize}
          fee={c.fee}
          href={`/competitions/${c.slug}`}
        />
      ))}
    </main>
  )
}

