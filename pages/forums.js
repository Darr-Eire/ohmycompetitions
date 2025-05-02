'use client'

import Link from 'next/link'
import { FaComments, FaThumbsUp, FaPoll, FaUserFriends } from 'react-icons/fa'

export default function ForumsPage() {
  return (
    <main className="page">
      <div className="competition-card max-w-3xl w-full">

        {/* Title Banner */}
        <div className="competition-top-banner flex items-center justify-center gap-2">
          Forums
        </div>

        {/* Divider */}
        <div className="h-1 w-24 bg-blue-300 mx-auto rounded mb-6" />

        {/* Intro Text */}
        <div className="p-6 space-y-6 text-center">
        <p className="text-2xl text-gray-700 font-semibold">

            Welcome to the <strong>OhMyCompetitions Forums</strong>!  
            Connect, share, vote, and discuss with fellow players around the world.
          </p>

          {/* Sections */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">

            {/* General Discussions */}
            <div className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition text-center">
              <h2 className="text-lg font-bold text-blue-700 mb-2">General Discussions</h2>
              <p className="text-gray-600 text-sm mb-4">
                Chat about anything — competitions, prizes, Pi Network, and more!
              </p>
              <Link href="/forums/general">
                <button style={{ backgroundColor: '#064e3b', color: 'white' }} className="hover:bg-green-800 font-semibold py-2 px-4 rounded">
                  Enter
                </button>
              </Link>
            </div>
            <br/>

            {/* Vote for Next Prize */}
            <div className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition text-center">
              <h2 className="text-lg font-bold text-blue-700 mb-2">Vote for Next Prize</h2>
              <p className="text-gray-600 text-sm mb-4">
                Help us pick the next big giveaway! 🎯  
                Make your voice heard.
              </p>
              <Link href="/forums/vote">
                <button style={{ backgroundColor: '#064e3b', color: 'white' }} className="hover:bg-green-800 font-semibold py-2 px-4 rounded">
                  Vote
                </button>
              </Link>
            </div>
            <br/>

            {/* Post Ideas */}
            <div className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition text-center">
              <h2 className="text-lg font-bold text-blue-700 mb-2">Post Your Ideas</h2>
              <p className="text-gray-600 text-sm mb-4">
                Got a cool idea for OhMyCompetitions? 🚀  
                Share it here!
              </p>
              <Link href="/forums/ideas">
                <button style={{ backgroundColor: '#064e3b', color: 'white' }} className="hover:bg-green-800 font-semibold py-2 px-4 rounded">
                  Post Idea
                </button>
              </Link>
            </div>
            <br/>

            {/* Winner Celebrations */}
            <div className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition text-center">
              <h2 className="text-lg font-bold text-blue-700 mb-2">Winner Celebrations</h2>
              <p className="text-gray-600 text-sm mb-4">
                🎉 Celebrate winners! Share your winning stories with the community.
              </p>
              <Link href="/forums/winners">
                <button style={{ backgroundColor: '#064e3b', color: 'white' }} className="hover:bg-green-800 font-semibold py-2 px-4 rounded">
                  Celebrate
                </button>
              </Link>
            </div>
              </div>
        </div>
      </div>
    </main>
  )
}

