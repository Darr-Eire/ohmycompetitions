'use client'

import LoginButton from '@/components/LoginButton'
import ThousandPiCompetitionCard from '@/components/ThousandPiCompetitionCard'

export default function Home() {
  return (
    <main className="flex-grow flex flex-col items-center justify-start p-6 gap-6">
      <LoginButton />
      <ThousandPiCompetitionCard />
    </main>
  )
}
