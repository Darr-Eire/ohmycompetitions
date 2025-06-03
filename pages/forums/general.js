'use client'

import Link from 'next/link'
import { FaComments } from 'react-icons/fa'

export default function GeneralDiscussions() {
  return (
    <main className="min-h-screen px-4 py-10 bg-[#0b1120] text-white font-orbitron">
      <div className="max-w-3xl mx-auto border border-cyan-400 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-[0_0_30px_#00fff055]">

        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-400 to-blue-500 text-black text-center text-lg sm:text-xl font-bold px-4 py-2 rounded-xl mb-8">
          General Discussions
        </div>

        {/* Intro */}
        <p className="text-white text-sm sm:text-base text-center mb-8">
          Here’s where you can share your thoughts, ideas, and connect with other Pioneers!
        </p>

        {/* Section */}
        <div className="border border-cyan-400 rounded-xl bg-[#0b1120]/50 p-6 shadow-[0_0_20px_#00fff044] mb-6">
          <h2 className="text-cyan-400 text-lg font-bold mb-4 text-center">What You Can Discuss</h2>
          <ul className="list-disc list-inside text-white text-sm sm:text-base space-y-2">
            <li>Upcoming competitions and suggestions</li>
            <li>Prize ideas or what you’d love to win</li>
            <li>Tips for new players or Pi strategy</li>
            <li>Fun stories, streaks, or team talk</li>
          </ul>
        </div>

        {/* Start Discussion Button */}
        <div className="text-center mt-6">
          <Link href="/forums/start-discussion">
            <span className="inline-block bg-gradient-to-r from-green-300 to-green-500 text-black font-semibold px-6 py-2 rounded-md shadow hover:brightness-110 transition">
              ✏️ Start a Discussion
            </span>
          </Link>
        </div>

        {/* Back Button */}
        <div className="text-center mt-4">
          <Link href="/forums">
            <span className="inline-block bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-semibold px-6 py-2 rounded-md shadow hover:brightness-110 transition">
              ← Back to Forums
            </span>
          </Link>
        </div>
      </div>
    </main>
  )
}
