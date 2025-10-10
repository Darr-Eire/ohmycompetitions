// src/pages/competitions/winners.js
'use client'

import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { FaTrophy, FaPlus, FaEye, FaReply, FaClock, FaStar } from 'react-icons/fa'

export default function WinnersPage() {
  const [threads, setThreads] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newCelebration, setNewCelebration] = useState({ title: '', body: '' })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchThreads()
  }, [])

  const fetchThreads = async () => {
    try {
      const res = await fetch('/api/forums/threads?category=winners')
      const data = await res.json()
      setThreads(data.threads || [])
    } catch (err) {
      console.error('Error fetching celebrations:', err)
    }
    setLoading(false)
  }

  const handleCreateCelebration = async (e) => {
    e.preventDefault()
    if (!newCelebration.title.trim() || !newCelebration.body.trim()) {
      alert('Title and story are required')
      return
    }

    setCreating(true)
    try {
      const res = await fetch('/api/submit/celebration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newCelebration.title,
          content: newCelebration.body
        })
      })

      if (res.ok) {
        alert('✅ Celebration posted!')
        setNewCelebration({ title: '', body: '' })
        setShowCreateForm(false)
        fetchThreads()
      } else {
        const error = await res.json()
        alert('❌ Error: ' + error.error)
      }
    } catch {
      alert('❌ Failed to post celebration')
    }
    setCreating(false)
  }

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

  return (
    <>
      <Head>
        <title>Winner Celebrations | OhMyCompetitions</title>
      </Head>

      <main className="min-h-screen bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white font-orbitron py-10 px-4">
        <div className="max-w-3xl mx-auto space-y-8">

          {/* Header */}
          <div className="text-center">
            <h1 className="inline-flex items-center gap-2 text-3xl sm:text-4xl font-bold px-6 py-3 bg-gradient-to-r from-[#0f172a]/70 via-[#1e293b]/70 to-[#0f172a]/70 border border-cyan-400 rounded-xl shadow-[0_0_30px_#00fff055]">
              <FaTrophy className="text-yellow-400" />
              Winner Celebrations
            </h1>
          </div>

          {/* Create Celebration Button */}
          <div className="text-center">
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold px-8 py-2 rounded-full transition"
            >
              <FaPlus /> {showCreateForm ? 'Cancel' : 'Share Your Win'}
            </button>
          </div>

          {/* Create Celebration Form */}
          {showCreateForm && (
            <form
              onSubmit={handleCreateCelebration}
              className="space-y-4 border border-cyan-600 bg-[#0f172a]/60 rounded-xl p-6 text-center"
            >
              <h2 className="text-xl font-semibold text-cyan-300">Celebrate Your Victory!</h2>
              <input
                type="text"
                value={newCelebration.title}
                onChange={(e) => setNewCelebration({ ...newCelebration, title: e.target.value })}
                placeholder="What did you win?"
                className="w-full bg-white/20 text-white placeholder-white/70 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400"
                required
              />
              <textarea
                value={newCelebration.body}
                onChange={(e) => setNewCelebration({ ...newCelebration, body: e.target.value })}
                placeholder="Tell us about your winning experience..."
                className="w-full bg-white/20 text-white placeholder-white/70 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400 h-32"
                required
              ></textarea>
              <div className="flex justify-center gap-4">
                <button
                  type="submit"
                  disabled={creating}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-2 rounded-full disabled:opacity-50"
                >
                  {creating ? 'Posting...' : 'Share Victory'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold px-6 py-2 rounded-full"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Celebrations List */}
          <div className="space-y-6">
            {loading ? (
              <p className="text-center text-cyan-300">Loading celebrations...</p>
            ) : threads.length === 0 ? (
              <div className="text-center space-y-2">
                <FaTrophy className="text-5xl text-gray-500 mx-auto" />
                <h3 className="text-2xl font-semibold text-gray-300">No celebrations yet</h3>
                <p className="text-gray-400">Be the first to share a winning story!</p>
              </div>
            ) : (
              threads.map(thread => (
                <Link key={thread._id} href={`/forums/thread/${thread.slug}`}>
                  <a className="block border border-cyan-600 bg-[#0f172a]/60 rounded-xl p-6 hover:bg-[#0f172a]/80 transition">
                    <div className="text-center space-y-2">
                      <h3 className="flex items-center justify-center gap-2 text-2xl font-bold text-purple-300">
                        <FaTrophy className="text-yellow-400" />
                        {thread.title}
                      </h3>
                      <p className="text-gray-300 text-sm line-clamp-2">{thread.body?.slice(0, 150)}...</p>
                      <div className="flex flex-wrap justify-center items-center gap-4 text-xs text-gray-400 pt-2">
                        <span>By {thread.author}</span>
                        <span className="inline-flex items-center gap-1"><FaClock /> {formatDate(thread.createdAt)}</span>
                        <span className="inline-flex items-center gap-1"><FaEye /> {thread.views || 0}</span>
                        <span className="inline-flex items-center gap-1"><FaReply /> {thread.replyCount || 0}</span>
                        <span className="inline-flex items-center gap-1"><FaStar className="text-yellow-400" /> {thread.upvotes || 0}</span>
                      </div>
                    </div>
                  </a>
                </Link>
              ))
            )}
          </div>

          {/* Back Button */}
          <div className="text-center pt-6">
            <Link href="/forums">
              <button className="bg-gray-600 hover:bg-gray-700 text-white font-bold px-8 py-2 rounded-full transition">
                Back to Forums
              </button>
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
