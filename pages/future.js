'use client'

import Link from 'next/link'

export default function FuturePage() {
  return (
    <main className="page">
      <div className="competition-card max-w-4xl w-full">

        {/* Banner */}
        <div className="competition-top-banner text-center">
          🚀 The Future of OhMyCompetitions
        </div>

        {/* Divider */}
        <div className="h-1 w-24 bg-blue-300 mx-auto rounded mb-6" />

        {/* Body */}
        <div className="p-6 space-y-10 text-gray-700 text-left">

          {/* Intro */}
          <p className="text-lg text-center">
            Here's a glimpse at the amazing new features and ideas we’re building for our players! 🎉
          </p>

          {/* Section: Competitions */}
          <section>
            <h2 className="text-2xl font-bold text-blue-600 mb-4">🎯 Bigger and Better Competitions</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li><strong>🎥 Live Draws:</strong> Watch competition winners drawn live!</li>
              <li><strong>🌍 Regional Competitions:</strong> Country-specific competitions and prizes.</li>
              <li><strong>🧩 Mystery Competitions:</strong> Secret competitions that unlock over time.</li>
              <li><strong>🎉 Seasonal Events:</strong> Holiday-themed giveaways like Pi Day and Christmas!</li>
            </ul>
          </section>

          {/* Section: Games & Mini Challenges */}
          <section>
            <h2 className="text-2xl font-bold text-blue-600 mb-4">🎮 New Games & Daily Challenges</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li><strong>🎯 Quests & Challenges:</strong> Complete daily and weekly missions to earn bonus Pi.</li>
              <li><strong>🏆 Monthly Championships:</strong> Compete for the top of the leaderboard every month!</li>
              <li><strong>🎡 More Try Your Luck Games:</strong> Arcade games to win even more prizes.</li>
            </ul>
          </section>

          {/* Section: Rewards & Loyalty */}
          <section>
            <h2 className="text-2xl font-bold text-blue-600 mb-4">🎁 Bigger Rewards for Players</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li><strong>🚀 Bigger Prizes:</strong> Electronics, Pi NFTs, Pi Merch and more!</li>
              <li><strong>🎁 Loyalty Program:</strong> Earn exclusive rewards just for playing every day.</li>
              <li><strong>🛒 Prize Shop:</strong> Spend Pi to get special rewards directly from your account.</li>
              <li><strong>🔒 VIP Competitions:</strong> Private competitions just for active players.</li>
            </ul>
          </section>

          {/* Section: Community Growth */}
          <section>
            <h2 className="text-2xl font-bold text-blue-600 mb-4">👥 Growing the Community</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li><strong>👥 Friend Referrals:</strong> Invite your friends and get rewarded!</li>
              <li><strong>📈 Pi Leaderboards:</strong> Track top players, ticket buyers, and daily winners.</li>
              <li><strong>🤝 Partnering with Pi Projects:</strong> Work together with other Pi apps and businesses.</li>
              <li><strong>🗳️ You Vote, We Listen:</strong> Players decide the future competitions and features!</li>
            </ul>
          </section>

          {/* Back Home Button */}
          <div className="text-center mt-10">
            <Link href="/">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded">
                ← Back to Home
              </button>
            </Link>
          </div>

        </div>
      </div>
    </main>
  )
}
