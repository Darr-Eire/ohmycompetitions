// pages/forums.js
'use client'

import Head from 'next/head'
import Link from 'next/link'
import { FaComments, FaThumbsUp, FaPoll, FaUserFriends } from 'react-icons/fa'

const forumSections = [
  {
    slug: 'general',
    title: 'General Discussions',
    icon: <FaComments />,
    description: 'Chat about anything — competitions, prizes, Pi Network, and more!',
    href: '/forums/general',
    buttonText: 'Enter',
  },
  {
    slug: 'vote',
    title: 'Vote for Next Prize',
    icon: <FaThumbsUp />,
    description: 'Help us pick the next big giveaway! Make your voice heard.',
    href: '/forums/vote',
    buttonText: 'Vote',
  },
  {
    slug: 'ideas',
    title: 'Post Your Ideas',
    icon: <FaPoll />,
    description: 'Got a cool idea for OhMyCompetitions? Share it here!',
    href: '/forums/ideas',
    buttonText: 'Post Idea',
  },
  {
    slug: 'winners',
    title: 'Winner Celebrations',
    icon: <FaUserFriends />,
    description: '🎉 Celebrate winners! Share your winning stories with the community.',
    href: '/forums/winners',
    buttonText: 'Celebrate',
  },
]

export default function ForumsPage() {
  return (
    <>
      <Head>
        <title>Forums | OhMyCompetitions</title>
      </Head>

      <main className="font semi-bold text-black mt-6">
        <div className="max-w-2xl mx-auto">
          
          {/* Title Banner */}
          <div className="competition-top-banner bg-blue-600 text-white text-center px-4 py-2 mb-4">
            Forums
          </div>

          {/* Intro Text */}
          <p className="font semi-bold text-black mt-6">
            <strong>
              Welcome to the OhMyCompetitions Forums! Connect, share, vote, and discuss with fellow players around the world.
            </strong>
          </p>

          {/* Sections Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {forumSections.map(section => (
              <div
                key={section.slug}
                className="competition-card p-6 flex flex-col items-center text-center mx-auto"
              >
                <div className="text-2xl text-blue-600 mb-2">{section.icon}</div>
                <h2 className="text-lg font-bold text-black mb-2">
                  {section.title}
                </h2>
                <p className="text-black text-sm mb-4 flex-1">
                  {section.description}
                </p>
                <Link href={section.href}>
                  <button className="bg-blue-700 text-white py-2 px-4 rounded hover:bg-green-900 transition">
                    {section.buttonText}
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}
