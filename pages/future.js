// pages/future.js
'use client'

import Link from 'next/link'

export default function FuturePage() {
  return (
    <main className="app-background min-h-screen flex justify-center px-4 text-white">
      <div className="competition-card max-w-3xl w-full bg-white bg-opacity-10 rounded-2xl shadow-lg">
        {/* Banner */}
        <div className="competition-top-banner title-gradient">
          🚀 The Future
        </div>

        {/* Body */}
        <div className="p-6 space-y-8">
          <p className="text-lg">
            🎉 Here’s a glimpse at the amazing new features and ideas we’re building for our players!
          </p>

          {/* Section: Competitions */}
          <section>
            <h2 className="text-xl font-bold gradient-text mb-4">🎯 Bigger and Better Competitions</h2>
            <ul className="list-disc list-inside space-y-2 text-white">
              <li><strong>🎥 Live Draws:</strong> Watch competition winners drawn live!</li>
              <li><strong>🌍 Regional Competitions:</strong> Country-specific competitions and prizes.</li>
              <li><strong>🧩 Mystery Competitions:</strong> Secret competitions that unlock over time.</li>
              <li><strong>🎉 Seasonal Events:</strong> Holiday-themed giveaways like Pi Day and Christmas!</li>
            </ul>
          </section>

          {/* Section: Games & Mini Challenges */}
          <section>
            <h2 className="text-xl font-bold gradient-text mb-4">🎮 New Games & Daily Challenges</h2>
            <ul className="list-disc list-inside space-y-2 text-white">
              <li><strong>🎯 Quests & Challenges:</strong> Complete daily and weekly missions to earn bonus Pi.</li>
              <li><strong>🏆 Monthly Championships:</strong> Compete for the top of the leaderboard every month!</li>
              <li><strong>🎡 More Try Your Luck Games:</strong> Arcade games to win even more prizes.</li>
            </ul>
          </section>

          {/* Section: Rewards & Loyalty */}
          <section>
            <h2 className="text-xl font-bold gradient-text mb-4">🎁 Bigger Rewards for Players</h2>
            <ul className="list-disc list-inside space-y-2 text-white">
              <li><strong>🚀 Bigger Prizes:</strong> Electronics, Pi NFTs, Pi Merch and more!</li>
              <li><strong>🎁 Loyalty Program:</strong> Earn exclusive rewards just for playing every day.</li>
              <li><strong>🛒 Prize Shop:</strong> Spend Pi to get special rewards directly from your account.</li>
              <li><strong>🔒 VIP Competitions:</strong> Private competitions just for active players.</li>
            </ul>
          </section>

          {/* Section: Community Growth */}
          <section>
            <h2 className="text-xl font-bold gradient-text mb-4">👥 Growing the Community</h2>
            <ul className="list-disc list-inside space-y-2 text-white">
              <li><strong>👥 Friend Referrals:</strong> Invite your friends and get rewarded!</li>
              <li><strong>📈 Pi Leaderboards:</strong> Track top players, ticket buyers, and daily winners.</li>
              <li><strong>🤝 Partnering with Pi Projects:</strong> Work together with other Pi apps and businesses.</li>
              <li><strong>🗳️ You Vote, We Listen:</strong> Players decide the future competitions and features!</li>
            </ul>
          </section>

          {/* Call to Action */}
          <div className="text-center mt-8">
            <Link href="/forums/general">
              <button className="btn-gradient">
                Join the Conversation
              </button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}