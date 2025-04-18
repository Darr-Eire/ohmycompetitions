import Header from '@/components/Header'
import Footer from '@/components/Footer'
import LoginButton from '@/components/LoginButton'
import ThousandPiCompetitionCard from '@/components/ThousandPiCompetitionCard'

export default function Home() {
  return (
    <>
      <Header />

      <main className="flex-grow flex flex-col items-center justify-start p-6 gap-6">
        <LoginButton />
        <ThousandPiCompetitionCard />
      </main>

      <Footer />
    </>
  )
}
