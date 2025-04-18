'use client'

import LoginButton from '@/components/LoginButton'
import ThousandPiCompetitionCard from '@/components/ThousandPiCompetitionCard'

export default function Home() {
  return (
    <main className="flex-grow flex flex-col items-center justify-start p-6 gap-6">
      <LoginButton />
      <ThousandPiCompetitionCard
  competition={
    {
      title: '1000 Pi Giveaway',
      slug: '1000-pi-giveaway',
      imageUrl: '/pi.jpeg',
      ticketsToSell: 1000,
      ticketsSold: 0,
      entryFee: 0.314,
      endDate: new Date('2025-04-25T15:14:00Z'),
      description: 'Enter to win 1000 Pi in our daily giveaway!'
    }
    }
/>
 </main>
  )
}
