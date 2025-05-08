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

      <main className="app-background min-h-screen p-4 text-white">
        <div className="max-w-2xl mx-auto">
          {/* Title Banner */}
          <div className="competition-top-banner title-gradient mb-6">
            Forums
          </div>

          {/* Intro Text */}
          <p className="mt-6 mb-6 text-white text-center">
            <strong>
              Welcome to the OhMyCompetitions Forums! Connect, share, vote, and discuss with fellow players around the world.
            </strong>
          </p>

          {/* Sections Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {forumSections.map((section) => (
              <div
                key={section.slug}
                className="competition-card p-6 flex flex-col items-center text-center bg-white bg-opacity-10 rounded-2xl shadow-lg"
              >
                <div className="text-2xl text-white mb-2">{section.icon}</div>
                <h2 className="text-lg font-bold gradient-text mb-2">
                  {section.title}
                </h2>
                <p className="text-white text-sm mb-4 flex-1">{section.description}</p>
                <Link href={section.href}>
                  <button className="btn-gradient">{section.buttonText}</button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}
