'use client'

import Head from 'next/head'
import Link from 'next/link'

export default function CelebratePioneerPage() {
  const winner = {
    name: 'Darr-Eire',
    reason: 'For consistently helping grow the Pi community and building amazing Pi apps!',
    week: 'June 9 – June 15, 2025',
  }

  return (
    <>
      <Head>
        <title>This Week’s Pioneer | OhMyCompetitions</title>
      </Head>

      <main className="min-h-screen px-4 py-6 bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white font-orbitron">
        <div className="max-w-3xl mx-auto border border-cyan-700 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-[0_0_30px_#00fff055]">
          
          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-cyan-300 px-6 py-4 rounded-xl shadow-[0_0_30px_#00fff055] border border-cyan-400 inline-block">
               This Week’s Pioneer 
            </h1>
          </div>

          {/* Winner Info */}
          <div className="text-cyan-300 text-3xl font-bold text-center mb-2">{winner.name}</div>
          <p className="text-white text-sm text-center mb-6 italic">Week of {winner.week}</p>

          <div className="bg-[#0f172a]/60 border border-cyan-700 rounded-xl px-6 py-4 shadow-[0_0_20px_#00fff044] backdrop-blur-md mb-6">
            <p className="text-white text-center">{winner.reason}</p>
          </div>

          {/* Celebration Message */}
          <p className="text-sm text-white text-center mb-8">
            Thank you for being a leader in the community! <br />
            We’re proud to feature you as our Pioneer of the Week.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
            <Link href="/forums/pioneer-of-the-week">
              <button className="btn-gradient px-6 py-2 rounded-full">
                Vote for Next Pioneer
              </button>
            </Link>
            <Link href="/forums">
              <button className="btn-gradient px-6 py-2 rounded-full">
                Back to Forums
              </button>
            </Link>
          </div>

          {/* Social Style Callout */}
          <div className="border border-cyan-700 bg-[#0f172a]/50 rounded-xl p-4 shadow-[0_0_20px_#00fff033] mb-4">
            <p className="text-cyan-300 font-semibold mb-1">Send them a shoutout!</p>
            <p className="text-white text-sm">
              Join the forums and leave a message for <strong>{winner.name}</strong> in the celebrations thread.
            </p>
          </div>

          {/* Link to Past Winners */}
          <div className="text-center mt-6">
            <Link href="/forums/pioneer-of-the-week/history">
              <button className="bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white font-semibold px-6 py-2 rounded-md shadow hover:brightness-110 transition border border-cyan-700">
                View Past Pioneers
              </button>
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
