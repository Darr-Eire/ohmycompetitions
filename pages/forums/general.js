'use client'

import Link from 'next/link'
import { FaComments } from 'react-icons/fa'

export default function GeneralDiscussions() {
  return (
    <main className="page">
      <div className="competition-card max-w-2xl w-full">

        {/* Title */}
        <div className="competition-top-banner flex items-center justify-center gap-2">
          <FaComments className="text-white text-2xl" />
          General Discussions
        </div>

        <div className="h-1 w-24 bg-blue-300 mx-auto rounded mb-6" />

        {/* Body */}
        <div className="p-6 space-y-6 text-center">

          <p className="text-gray-700">
            🗨️ Talk about anything Pi-related, competitions, prizes, or life in general!
          </p>

          {/* Post Button */}
          <Link href="/forums/general/new-post">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded mt-4">
              ✏️ Start a Discussion
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
