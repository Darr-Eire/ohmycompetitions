'use client'

import Head from 'next/head'
import Link from 'next/link'
import { FaComments, FaThumbsUp, FaPoll, FaUserFriends, FaStar } from 'react-icons/fa'

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
    description: 'Celebrate winners! Share your winning stories with the community.',
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
        <div className="max-w-4xl mx-auto">
          {/* Title Banner */}
          <div className="competition-top-banner title-gradient mb-6 text-center">
            Forums
          </div>

          {/* Intro Text */}
          <p className="mt-6 mb-6 text-white text-center font-semibold">
            Welcome to the OhMyCompetitions Forums! Connect, share, vote, and discuss with fellow players around the world.
          </p>

          {/* Pioneer of the Week Feature */}
          <div className="competition-card p-6 mb-8 bg-white bg-opacity-10 rounded-2xl shadow-lg text-center sm:col-span-2">
           <div className="text-3xl text-cyan-300 mb-2 font-bold">
  Pioneer of the Week
</div>

            <h2 className="text-lg font-bold gradient-text mb-2">Nominate Yourself or Vote for a Fellow Pioneer</h2>
            <p className="text-white text-sm mb-4">
              Tell us why you or someone you admire deserves to be recognized this week. The community will vote, and the top Pioneer will be featured!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <input
                type="text"
                placeholder="Your Name or Pi Username"
                className="flex-1 px-4 py-2 bg-white bg-opacity-20 text-white rounded placeholder-white/70"
              />
              <input
                type="text"
                placeholder="Why you deserve to be Pioneer of the Week"
                className="flex-1 px-4 py-2 bg-white bg-opacity-20 text-white rounded placeholder-white/70"
              />
            </div>
            <div className="flex justify-center gap-4">
              <button className="btn-gradient px-6 py-2 rounded-full">Submit Nomination</button>
              <Link href="/forums/pioneer-week">
                <button className="btn-gradient px-6 py-2 rounded-full">Vote Now</button>
              </Link>
            </div>
          </div>

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
