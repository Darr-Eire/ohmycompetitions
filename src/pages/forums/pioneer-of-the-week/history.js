'use client'

import Head from 'next/head'
import Link from 'next/link'

export default function PioneerHistoryPage() {
  const previousWinners = [
    {
      name: 'PiChamp2025',
      reason: 'Hosted community competitions and supported hundreds of pioneers.',
      week: 'June 2 – June 8, 2025',
    },
    {
      name: 'PiWarrior',
      reason: 'Built tools for fellow Pioneers and mentored new users.',
      week: 'May 26 – June 1, 2025',
    },
    {
      name: 'CodeMasterPi',
      reason: 'Developed open-source Pi mini-games loved by the community.',
      week: 'May 19 – May 25, 2025',
    },
    {
      name: 'SatoshiSpark',
      reason: 'Spread awareness of OhMyCompetitions on socials non-stop!',
      week: 'May 12 – May 18, 2025',
    },
  ]

  return (
    <>
      <Head>
        <title>Past Pioneers | OhMyCompetitions</title>
      </Head>

      <main className="min-h-screen px-4 py-10 bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white font-orbitron">
        <div className="max-w-3xl mx-auto border border-cyan-700 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-[0_0_30px_#00fff055]">
          
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold px-6 py-4 rounded-xl border border-cyan-300 inline-block bg-gradient-to-r from-cyan-400 to-cyan-400 text-cyan-300 bg-clip-text drop-shadow shadow-[0_0_30px_#00fff055]">
               Past Pioneers of the Week 
            </h1>
          </div>

          {/* Intro Text */}
          <p className="text-center text-white text-sm mb-10">
            Let’s honor the pioneers who’ve inspired, contributed, and uplifted the community.
          </p>

          {/* Winner List */}
          <div className="space-y-6">
            {previousWinners.map((winner, i) => (
              <div
                key={i}
                className="bg-[#0f172a]/60 border border-cyan-600 rounded-xl px-6 py-5 shadow-[0_0_20px_#00fff044] backdrop-blur-md"
              >
                <div className="text-cyan-300 text-xl font-bold mb-1">{winner.name}</div>
                <p className="text-white text-sm mb-2 italic">Week of {winner.week}</p>
                <p className="text-white text-sm">{winner.reason}</p>
              </div>
            ))}
          </div>

          {/* Social Message */}
          <div className="mt-10 mb-6 text-center border border-cyan-700 bg-[#0f172a]/60 rounded-xl shadow-[0_0_20px_#00fff044] px-6 py-5 backdrop-blur-md">
            <p className="text-cyan-300 font-semibold text-base mb-2">Stay Connected!</p>
            <p className="text-white text-sm">
              Don’t forget to <strong>follow these pioneers on the Pi Network</strong>, connect through their Pi profiles,
              and grow the community together. Unity is power. 
            </p>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-6 space-y-4">
            <p className="text-cyan-300 text-sm">Do you know someone amazing?</p>

            <div>
              <Link href="/forums/pioneer-of-the-week">
                <button className="btn-gradient px-6 py-2 rounded-full">
                  Nominate a New Pioneer
                </button>
              </Link>
            </div>

            <div>
              <Link href="/forums">
                <button className="btn-gradient px-6 py-2 rounded-full">
                  Back to Forums
                </button>
              </Link>
            </div>
          </div>

        </div>
      </main>
    </>
  )
}
