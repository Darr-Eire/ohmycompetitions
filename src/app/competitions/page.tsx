import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ThousandPiCompetitionCard from '@/components/ThousandPiCompetitionCard'

export default function CompetitionsPage() {
  return (
    <>
      <Header />
      <main className="p-6 max-w-6xl mx-auto flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-blue-600">All Competitions</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <ThousandPiCompetitionCard />
          {/* Add more competition cards here */}
        </div>
      </main>
      <Footer />
    </>
  )
}
