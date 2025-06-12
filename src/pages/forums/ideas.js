'use client'

import Link from 'next/link'
import { FaLightbulb } from 'react-icons/fa'

export default function IdeasDiscussions() {
  return (
    <main className="min-h-screen px-4 py-10 bg-[#0b1120] text-white font-orbitron">
      <div className="max-w-3xl mx-auto border border-cyan-400 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-[0_0_30px_#00fff055]">

        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-400 to-blue-500 text-black text-center text-lg sm:text-xl font-bold px-4 py-2 rounded-xl mb-8">
           Idea Discussions
        </div>

        {/* Intro */}
        <p className="text-white text-sm sm:text-base text-center mb-8">
          Got a great idea or want to see what others are thinking? Welcome to the idea board!
        </p>

        {/* Section */}
        <div className="border border-cyan-400 rounded-xl bg-[#0b1120]/50 p-6 shadow-[0_0_20px_#00fff044] mb-6">
          <h2 className="text-cyan-400 text-lg font-bold mb-4 text-center">What You Can Share</h2>
          <ul className="list-disc list-inside text-white text-sm sm:text-base space-y-2">
            <li>Innovative new feature ideas for the platform</li>
            <li>Suggestions to improve competitions and prizes</li>
            <li>Mini-game concepts or new challenge types</li>
            <li>Feedback about recent updates or features</li>
          </ul>
        </div>

        {/* Share Idea Button */}
        <div className="text-center mt-6">
          <Link href="/forums/new-idea">
            <span className="inline-block bg-gradient-to-r from-green-300 to-green-500 text-black font-semibold px-6 py-2 rounded-md shadow hover:brightness-110 transition">
              Share a New Idea
            </span>
          </Link>
        </div>

        {/* Back Button */}
        <div className="text-center mt-4">
          <Link href="/forums">
            <span className="inline-block bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-semibold px-6 py-2 rounded-md shadow hover:brightness-110 transition">
              Back to Forums
            </span>
          </Link>
        </div>
      </div>
    </main>
  )
}
