'use client'

import Link from 'next/link'
import { FaTrophy } from 'react-icons/fa'

export default function WinnersPage() {
  return (
    <main className="page">
      <div className="competition-card max-w-2xl w-full">

        {/* Title */}
        <div className="competition-top-banner flex items-center justify-center gap-2">
          <FaTrophy className="text-white text-2xl" />
          Winner Celebrations
        </div>

        <div className="h-1 w-24 bg-blue-300 mx-auto rounded mb-6" />

        {/* Body */}
        <div className="p-6 space-y-6 text-center">

          <p className="text-gray-700">
            🎉 Celebrate with winners!  
            Share your win story or congratulate others!
          </p>

          {/* Celebrate Button */}
          <Link href="/forums/winners/celebrate">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded mt-4">
              🎉 Celebrate Now
            </button>
          </Link>

          {/* Back */}
          <div className="mt-10">
            <Link href="/forums">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded">
                ← Back to Forums
              </button>
            </Link>
          </div>

        </div>

      </div>
    </main>
  )
}
