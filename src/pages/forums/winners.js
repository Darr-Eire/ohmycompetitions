'use client'

import Link from 'next/link'
import { FaTrophy } from 'react-icons/fa'

export default function WinnersPage() {
  return (
    <main className="min-h-screen px-4 py-10 bg-[#0b1120] text-white font-orbitron">
      <div className="max-w-3xl mx-auto border border-cyan-400 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-[0_0_30px_#00fff055]">

        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-400 to-blue-500 text-black text-center text-lg sm:text-xl font-bold px-4 py-2 rounded-xl mb-8">
          <div className="flex justify-center items-center gap-2">
            <FaTrophy className="text-black text-2xl" />
            Winner Celebrations
          </div>
        </div>

        {/* Intro */}
        <p className="text-white text-sm sm:text-base text-center mb-8">
          🎉 Celebrate with fellow winners!<br />
          Share your win story or give a shoutout to someone else's big moment.
        </p>

        {/* Celebrate Button */}
        <div className="text-center mt-6">
          <Link href="/forums/winners/celebrate">
            <span className="inline-block bg-gradient-to-r from-green-300 to-green-500 text-black font-semibold px-6 py-2 rounded-md shadow hover:brightness-110 transition">
              🎉 Celebrate Now
            </span>
          </Link>
        </div>

        {/* Back Button */}
        <div className="text-center mt-6">
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
