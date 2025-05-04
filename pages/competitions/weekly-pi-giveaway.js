// pages/competitions/weekly-pi-giveaway.js
'use client'

import Link from 'next/link'
import CompetitionCard from '@/components/CompetitionCard'

export default function WeeklyPiGiveaway() {
  const comp = { slug: 'weekly-pi-giveaway', entryFee: 0 }

  return (
    <main className="pt-8 pb-12 px-4 bg-white min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-6">
        Weekly Pi Giveaway
      </h1>
      <div className="max-w-md mx-auto">
        <CompetitionCard
          comp={comp}
          title="Weekly Pi Giveaway"
          prize="1,000 π Giveaway"
          fee="Free"
          href="/competitions/weekly-pi-giveaway"
          small={false}
          theme="blue"
        >
          <div className="mt-4 p-4 bg-blue-50 rounded text-center">
            <h4 className="text-blue-700 font-semibold">Social Media Entry</h4>
            <p className="text-sm text-gray-600 mb-2">
              Earn 1 free entry for every new social media follower you get this week!
            </p>
            <a
              href="https://twitter.com/YourTwitterHandle"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 text-sm underline"
            >
              Follow us on Twitter
            </a>
          </div>
          <div className="mt-4">
            <button className="comp-button w-full">Enter Now</button>
          </div>
        </CompetitionCard>

        <p className="mt-6 text-center text-gray-500">
          Want more chances? Refer friends to earn bonus entries!
        </p>
        <Link
          href={`/refer?comp=weekly-pi-giveaway`}
          className="mt-2 block text-center text-blue-600 underline"
        >
          Get your referral link
        </Link>
      </div>
    </main>
  )
}

// If you need any server-side data, you can add getServerSideProps here.
// For now it’s static:
export async function getServerSideProps() {
  return { props: {} }
}
