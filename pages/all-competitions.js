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
      key={comp._id}
      title={comp.title}
      prize={comp.prize}
      // Use entryFee if present, otherwise show 'Free'
      fee={comp.entryFee != null ? `${comp.entryFee} π` : 'Free'}
      href={`/competitions/${comp.slug}`}
      small
    />
    
      ))}
    </main>
  )
}

