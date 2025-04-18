import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Competition } from '@/lib/types'
import ThousandPiCompetitionCard from '@/components/ThousandPiCompetitionCard'

async function getCompetitions() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/competitions`, {
    cache: 'no-store',
  })
  if (!res.ok) {
    throw new Error('Failed to fetch competitions')
  }
  return res.json()
}

export default async function AllCompetitionsPage() {
  const competitions: Competition[] = await getCompetitions()

  return (
    <>
      <Header />
      <main className="max-w-5xl mx-auto px-6 py-10 text-black space-y-6">
        <h1 className="text-3xl font-bold text-center mb-6">🔥 All Competitions</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {competitions.map((comp: Competition) => (
  <ThousandPiCompetitionCard key={comp.id} competition={comp} />
))}

 </div>
      </main>
      <Footer />
    </>
  )
}
