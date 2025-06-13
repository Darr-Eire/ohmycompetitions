'use client'

import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import { FaComments, FaThumbsUp, FaPoll, FaUserFriends, FaLightbulb, FaTrophy } from 'react-icons/fa'

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
    icon: <FaLightbulb />,
    description: 'Got a cool idea for OhMyCompetitions? Share it here!',
    href: '/forums/ideas',
    buttonText: 'Post Idea',
  },
  {
    slug: 'winners',
    title: 'Winner Celebrations',
    icon: <FaTrophy />,
    description: 'Celebrate winners! Share your winning stories with the community.',
    href: '/forums/winners',
    buttonText: 'Celebrate',
  },
]

export default function ForumsPage() {
  const [nominee, setNominee] = useState('')
  const [reason, setReason] = useState('')

  const handleSubmitNomination = async () => {
    if (!nominee || !reason) {
      alert('Please fill in both fields.')
      return
    }

    const res = await fetch('/api/submit/nomination', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nominee, reason }),
    })

    const result = await res.json()
    if (res.ok) {
      alert('✅ Nomination submitted!')
      setNominee('')
      setReason('')
    } else {
      alert('❌ Error: ' + result.error)
    }
  }

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
          <p className="text-center text-white text-sm sm:text-base mb-10">
            Welcome to the OhMyCompetitions Forums! Connect, share, vote, and discuss with fellow players around the world.
          </p>

          {/* Pioneer of the Week Card */}
          <div className="border border-cyan-700 rounded-2xl bg-[#0f172a]/60 shadow-[0_0_30px_#00fff055] p-6 sm:p-8 mb-12 backdrop-blur-md text-center">
            <div className="text-2xl sm:text-3xl text-cyan-300 font-bold mb-3">Pioneer of the Week</div>
            <h2 className="text-lg font-bold gradient-text mb-2">Nominate Yourself or Vote for a Fellow Pioneer</h2>
            <p className="text-sm text-white mb-6">
              Tell us why you or someone you admire deserves to be recognized this week. The community will vote, and the top Pioneer will be featured!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <input
                type="text"
                value={nominee}
                onChange={(e) => setNominee(e.target.value)}
                placeholder="Your Name or Pi Username"
                className="flex-1 px-4 py-2 bg-white bg-opacity-20 text-white rounded placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Why you deserve to be Pioneer of the Week"
                className="flex-1 px-4 py-2 bg-white bg-opacity-20 text-white rounded placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <button onClick={handleSubmitNomination} className="btn-gradient px-6 py-2 rounded-full">
                Submit Nomination
              </button>
              <Link href="/forums/pioneer-of-the-week">
                <button className="btn-gradient px-6 py-2 rounded-full">
                  Vote Now
                </button>
              </Link>
            </div>

            <div className="w-full mt-4 text-center">
              <Link href="/forums/pioneer-of-the-week/celebrate">
                <button className="btn-gradient px-6 py-2 rounded-full">
                  This Week’s Pioneer
                </button>
              </Link>
            </div>
          </div>

          {/* Forum Section Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {forumSections.map((section) => (
              <div
                key={section.slug}
                className="border border-cyan-700 bg-[#0f172a]/60 backdrop-blur-md rounded-2xl shadow-[0_0_20px_#00fff044] p-6 flex flex-col items-center text-center"
              >
                <div className="text-2xl text-white mb-2">{section.icon}</div>
                <h2 className="text-lg font-bold gradient-text mb-2">{section.title}</h2>
                <p className="text-white text-sm mb-4 flex-1">{section.description}</p>
                <Link href={section.href}>
                  <button className="btn-gradient px-6 py-2 rounded-full">
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
