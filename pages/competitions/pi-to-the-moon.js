import CompetitionCard from '@/components/CompetitionCard'

export default function PiToTheMoon() {
  return (
    <main className="page px-4 py-8">
      <CompetitionCard
        title="Pi To The Moon"
        href="/competitions/pi-to-the-moon"
        prize="500 PI Prize"
        fee="2 π"
      />
    </main>
  )
}
