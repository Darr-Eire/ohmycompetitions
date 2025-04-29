'use client'

import Link from 'next/link'
import { FaThumbsUp } from 'react-icons/fa'

export default function IdeasPage() {
  return (
    <main className="page">
      <div className="competition-card max-w-2xl w-full">

        {/* Title */}
        <div className="competition-top-banner flex items-center justify-center gap-2">
          <FaThumbsUp className="text-white text-2xl" />
          Post Your Ideas
        </div>

        <div className="h-1 w-24 bg-blue-300 mx-auto rounded mb-6" />

        {/* Body */}
        <div className="p-6 space-y-6 text-center">

          <p className="text-gray-700">
            💡 Got a brilliant idea for OhMyCompetitions?  
            Help us grow — share your innovation!
          </p>

          {/* Post Idea Button */}
          <Link href="/forums/ideas/new-idea">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded mt-4">
              💡 Share Your Idea
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
