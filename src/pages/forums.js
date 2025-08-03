'use client'

import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import {
  FaComments, FaThumbsUp, FaPoll, FaUserFriends,
  FaLightbulb, FaTrophy, FaFire, FaClock
} from 'react-icons/fa'

export default function ForumsPage() {
  const [nominee, setNominee] = useState('')
  const [reason, setReason] = useState('')
  const [forumStats, setForumStats] = useState({})
  const [recentThreads, setRecentThreads] = useState([])
  const [loading, setLoading] = useState(true)
  const [topPioneer, setTopPioneer] = useState(null) // ✅ ADDED

  useEffect(() => {
    fetchForumData()
    fetchTopPioneer() // ✅ ADDED
  }, [])

  const fetchForumData = async () => {
    try {
      const categories = ['general', 'ideas', 'vote', 'winners']
      const statsPromises = categories.map(async (category) => {
        const res = await fetch(`/api/forums/threads?category=${category}&limit=5`)
        const data = await res.json()
        return {
          category,
          count: data.pagination?.count || 0,
          threads: data.threads || []
        }
      })

      const results = await Promise.all(statsPromises)
      const stats = {}
      let allRecent = []

      results.forEach(({ category, count, threads }) => {
        stats[category] = count
        allRecent = [...allRecent, ...threads.slice(0, 2)]
      })

      allRecent.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      setForumStats(stats)
      setRecentThreads(allRecent.slice(0, 6))
    } catch (err) {
      console.error('Error fetching forum data:', err)
    }
    setLoading(false)
  }

  // ✅ Fetch Top Pioneer Nominee
  const fetchTopPioneer = async () => {
    try {
      const res = await fetch('/api/pioneer-nomination')
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        setTopPioneer(data[0])
      }
    } catch (err) {
      console.error('Failed to load Pioneer of the Week:', err)
    }
  }

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

  const forumSections = [
    {
      slug: 'general',
      title: 'General Discussions',
      icon: <FaComments />,
      description: 'Chat about anything — competitions, prizes, Pi Network and more!',
      href: '/forums/general',
      buttonText: 'Enter',
      color: 'from-blue-500 to-blue-600',
      count: forumStats.general || 0
    },
    {
      slug: 'vote',
      title: 'Vote for Next Prize',
      icon: <FaThumbsUp />,
      description: 'Help us pick the next big giveaway! Make your voice heard.',
      href: '/forums/vote',
      buttonText: 'Vote',
      color: 'from-green-500 to-green-600',
      count: forumStats.vote || 0
    },
    {
      slug: 'ideas',
      title: 'Post Your Ideas',
      icon: <FaLightbulb />,
      description: 'Got a cool idea for Oh My Competitions? Share it here!',
      href: '/forums/ideas',
      buttonText: 'Post Idea',
      color: 'from-yellow-500 to-yellow-600',
      count: forumStats.ideas || 0
    },
    {
      slug: 'winners',
      title: 'Winner Celebrations',
      icon: <FaTrophy />,
      description: 'Celebrate winners! Share your winning stories with the community.',
      href: '/forums/winners',
      buttonText: 'Celebrate',
      color: 'from-purple-500 to-purple-600',
      count: forumStats.winners || 0
    },
  ]

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getCategoryColor = (category) => {
    const colors = {
      general: 'text-blue-400',
      ideas: 'text-yellow-400',
      vote: 'text-green-400',
      winners: 'text-purple-400'
    }
    return colors[category] || 'text-cyan-400'
  }

  return (
    <>
      <Head>
        <title>Forums | Oh My Competitions</title>
      </Head>

      <main className="app-background min-h-screen p-4 text-white">
        <div className="max-w-6xl mx-auto">

          {/* Banner */}
          <div className="competition-top-banner title-gradient mb-6 text-center">
            Forums
          </div>

          <p className="text-center text-white text-sm sm:text-base mb-10">
            Welcome to the Oh My Competitions Forums! Connect, share, vote and discuss with fellow players around the world.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">

              {/* Pioneer of the Week Nomination Card */}
              <div className="border border-cyan-700 rounded-2xl bg-[#0f172a]/60 shadow-[0_0_30px_#00fff055] p-6 sm:p-8 mb-8 backdrop-blur-md text-center">
                <div className="text-2xl sm:text-3xl text-cyan-300 font-bold mb-3">Pioneer of the Week</div>
                <h2 className="text-lg font-bold gradient-text mb-2">Nominate Yourself or Vote for a Fellow Pioneer</h2>
                <p className="text-sm text-white mb-6">
                  Tell us why you or someone you admire deserves to be recognized this week. The community will vote and the top Pioneer will be featured!
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
                    <button className="btn-gradient px-6 py-2 rounded-full">Vote Now</button>
                  </Link>
                  <Link href="/forums/pioneer-of-the-week/celebrate">
                    <button className="btn-gradient px-6 py-2 rounded-full">This Week's Pioneer</button>
                  </Link>
                </div>
              </div>

              {/* Forum Categories */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {forumSections.map((section) => (
                  <div key={section.slug}
                    className="border border-cyan-700 bg-[#0f172a]/60 backdrop-blur-md rounded-2xl shadow-[0_0_20px_#00fff044] p-6 flex flex-col items-center text-center">
                    <div className="text-2xl text-white mb-2">{section.icon}</div>
                    <h2 className="text-lg font-bold gradient-text mb-2">{section.title}</h2>
                    <p className="text-white text-sm mb-4 flex-1">{section.description}</p>
                    <div className="text-xs text-gray-400 mb-4">
                      {loading ? 'Loading...' : `${section.count} discussions`}
                    </div>
                    <Link href={section.href}>
                      <button className={`bg-gradient-to-r ${section.color} hover:brightness-110 text-white font-bold px-6 py-2 rounded-full transition`}>
                        {section.buttonText}
                      </button>
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="border border-cyan-700 bg-[#0f172a]/60 backdrop-blur-md rounded-2xl shadow-[0_0_20px_#00fff044] p-6 sticky top-4">
                <h2 className="text-xl font-bold text-cyan-300 mb-6 flex items-center gap-2">
                  <FaFire />
                  Recent Activity
                </h2>

                {loading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400">Loading...</p>
                  </div>
                ) : recentThreads.length === 0 ? (
                  <div className="text-center py-8">
                    <FaComments className="text-3xl text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">No recent activity</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentThreads.map((thread) => (
                      <Link key={thread._id} href={`/forums/thread/${thread.slug}`}>
                        <div className="border border-cyan-600/50 rounded-lg bg-[#0f172a]/40 p-3 hover:bg-[#0f172a]/60 transition cursor-pointer">
                          <h4 className="text-sm font-bold text-white mb-1 line-clamp-2">{thread.title}</h4>
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <span className={getCategoryColor(thread.category)}>{thread.category}</span>
                            <div className="flex items-center gap-1">
                              <FaClock />
                              {formatDate(thread.createdAt)}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Forum Stats */}
                <div className="mt-6 pt-6 border-t border-cyan-700/50">
                  <h3 className="text-sm font-bold text-cyan-300 mb-3">Forum Stats</h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-center">
                      <div className="text-white font-bold">{Object.values(forumStats).reduce((a, b) => a + b, 0)}</div>
                      <div className="text-gray-400">Total Threads</div>
                    </div>
                    <div className="text-center">
                      <div className="text-white font-bold">{recentThreads.length}</div>
                      <div className="text-gray-400">Recent Posts</div>
                    </div>
                  </div>
                </div>

                {/* 🌟 Pioneer of the Week (Sidebar) */}
                <div className="mt-6 pt-6 border-t border-cyan-700/50 text-center">
                  <h3 className="text-sm font-bold text-cyan-300 mb-3">🌟 Pioneer of the Week</h3>

                  {topPioneer && topPioneer.votes > 0 ? (
                    <div className="text-white text-sm mb-4">
                      <div className="font-bold text-cyan-400">{topPioneer.name}</div>
                      <div className="italic text-xs text-gray-300 mt-1">"{topPioneer.reason}"</div>
                      <div className="text-xs text-cyan-200 mt-2">🗳 {topPioneer.votes} votes</div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 mb-4">No nominations yet.</p>
                  )}

                  <Link href="/forums/pioneer-of-the-week">
                    <button className="btn-gradient px-4 py-2 text-sm rounded-full mb-2 w-full">Nominate / Vote</button>
                  </Link>
                  <Link href="/forums/pioneer-of-the-week/celebrate">
                    <button className="btn-gradient px-4 py-2 text-sm rounded-full w-full">View Winner</button>
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </>
  )
}
