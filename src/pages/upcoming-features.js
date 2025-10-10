// pages/future.jsx
import Head from 'next/head';
import Link from 'next/link';

export default function FuturePage() {
  return (
    <>
      <Head>
        <title>The Future • OhMyCompetitions</title>
        <meta name="description" content="A glimpse of upcoming competitions, rewards, and community features on OMC." />
      </Head>

      <main className="app-background min-h-screen flex justify-center px-4 text-white">
        <div className="competition-card max-w-3xl w-full bg-white bg-opacity-10 rounded-2xl shadow-lg">
          {/* Banner */}
          <div className="competition-top-banner title-gradient">The Future</div>

          <div className="p-6 space-y-10">
            <p className="text-lg">
              Here’s a glimpse at the amazing new features and ideas we’re building for our players!
            </p>

            {/* Competitions */}
            <section>
              <h2 className="text-xl font-bold gradient-text mb-4">Bigger and Better Competitions</h2>
              <ul className="list-disc list-inside space-y-2 text-white">
                <li><strong>Live Draws:</strong> Watch competition winners drawn live!</li>
                <li><strong>Regional Competitions:</strong> Country-specific competitions and prizes.</li>
                <li><strong>Mystery Competitions:</strong> Secret competitions that unlock over time.</li>
                <li><strong>Seasonal Events:</strong> Holiday-themed giveaways like Pi Day and Christmas!</li>
              </ul>
            </section>

            {/* Rewards */}
            <section>
              <h2 className="text-xl font-bold gradient-text mb-4">Bigger Rewards for Players</h2>
              <ul className="list-disc list-inside space-y-2 text-white">
                <li><strong>Bigger Prizes:</strong> Cars, Holidays, Goods, tons of Pi and more!</li>
                <li><strong>Loyalty Program:</strong> Earn exclusive rewards just for playing every day.</li>
                <li><strong>Prize Shop:</strong> Spend Pi to get special rewards directly from your account.</li>
                <li><strong>VIP Competitions:</strong> Private competitions just for active players.</li>
              </ul>
            </section>

            {/* Innovation */}
            <section>
              <h2 className="text-xl font-bold gradient-text mb-4">New Ways to Win & Earn</h2>
              <ul className="list-disc list-inside space-y-2 text-white">
                <li><strong>User-Generated Competitions:</strong> Let verified users create their own competitions and share the rewards.</li>
                <li><strong>Sponsor Integration:</strong> Official sponsored competitions with real-world prizes and Pi-backed entry fees.</li>
                <li><strong>Donation-Driven Competitions:</strong> Special competitions where entries help support real-world causes.</li>
                <li><strong>Flash Entry Multipliers:</strong> Limited-time 2x entry windows to boost chances and excitement.</li>
              </ul>
            </section>

            {/* Games */}
            <section>
              <h2 className="text-xl font-bold gradient-text mb-4">New Games & Daily Challenges</h2>
              <ul className="list-disc list-inside space-y-2 text-white">
                <li><strong>Quests & Challenges:</strong> Complete daily and weekly missions to earn bonus Pi.</li>
                <li><strong>Monthly Championships:</strong> Compete for the top of the leaderboard every month!</li>
                <li><strong>More Try Your Luck Games:</strong> Arcade games to win even more prizes.</li>
              </ul>
            </section>

            {/* Community */}
            <section>
              <h2 className="text-xl font-bold gradient-text mb-4">Growing the Community</h2>
              <ul className="list-disc list-inside space-y-2 text-white">
                <li><strong>Friend Referrals:</strong> Invite your friends and get rewarded!</li>
                <li><strong>Pi Leaderboards:</strong> Track top players, ticket buyers and daily winners.</li>
                <li><strong>Partnering with Pi Projects:</strong> Work together with other Pi apps and businesses.</li>
                <li><strong>You Vote, We Listen:</strong> Players decide the future competitions and features!</li>
              </ul>
            </section>

            {/* Q1 2026 Roadmap */}
            <section>
              <h2 className="text-xl font-bold gradient-text mb-4">Q1 2026 Roadmap</h2>
              <ul className="list-disc list-inside space-y-2 text-white">
                <li><strong>Live Draw Events:</strong> Real-time draws streamed in-app with countdowns, animations and live chat reactions.</li>
                <li><strong>Regional Competitions:</strong> Localized competitions by country (Nigeria, India, Philippines, etc.) with unique prizes.</li>
                <li><strong>Sponsored Competitions:</strong> Official partner competitions with real-world products and Pi-backed entry fees.</li>
                <li><strong>Scratch Card Games:</strong> Tap-to-reveal instant win games with effects and rarity tiers.</li>
                <li><strong>Pi Bomb Royale:</strong> Elimination-based mode with fast reflex rounds and a growing Pi prize pool.</li>
                <li><strong>Creator Competitions:</strong> Verified users host their own draws using provided tools and prize pools.</li>
                <li><strong>Real-Time Leaderboards:</strong> Track top winners, biggest earners and streak champions — global & local.</li>
                <li><strong>Scratch Card Wars:</strong> Real-time scratch-offs vs other users. Highest score wins the Pi pot.</li>
                <li><strong>Merchant Prize Integration:</strong> Pi-friendly businesses supply goods for draws or the prize shop.</li>
              </ul>
            </section>

            {/* Call to Action */}
            <div className="text-center mt-10">
              <Link href="/forums/general" className="btn-gradient inline-flex items-center justify-center">
                Join the Conversation
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
