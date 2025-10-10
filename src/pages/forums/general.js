'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { FaComments, FaPlus, FaEye, FaReply, FaClock } from 'react-icons/fa'

export default function GeneralDiscussions() {
  const [threads, setThreads] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newThread, setNewThread] = useState({ title: '', body: '' })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchThreads()
  }, [])

  const fetchThreads = async () => {
    try {
      const res = await fetch('/api/forums/threads?category=general')
      const data = await res.json()
      setThreads(data.threads || [])
    } catch (err) {
      console.error('Error fetching threads:', err)
    }
    setLoading(false)
  }

  const handleCreateThread = async (e) => {
    e.preventDefault()
    if (!newThread.title.trim() || !newThread.body.trim()) {
      alert('Title and content are required')
      return
    }

    setCreating(true)
    try {
      const res = await fetch('/api/submit/discussion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newThread.title,
          content: newThread.body
        })
      })

      if (res.ok) {
        alert('✅ Discussion created!')
        setNewThread({ title: '', body: '' })
        setShowCreateForm(false)
        fetchThreads() // Refresh the list
      } else {
        const error = await res.json()
        alert('❌ Error: ' + error.error)
      }
    } catch (err) {
      alert('❌ Failed to create discussion')
    }
    setCreating(false)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <main className="min-h-screen px-4 py-10 bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white font-orbitron">
      <div className="max-w-4xl mx-auto border border-cyan-700 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-[0_0_30px_#00fff055]">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="w-full text-lg sm:text-xl font-bold text-white px-4 py-3 rounded-xl font-orbitron shadow-[0_0_30px_#00fff055] bg-gradient-to-r from-[#0f172a]/70 via-[#1e293b]/70 to-[#0f172a]/70 backdrop-blur-md border border-cyan-400">
            <div className="flex justify-center items-center gap-2">
              <FaComments />
              General Discussions
            </div>
          </h1>
        </div>

        {/* Create Thread Button */}
        <div className="text-center mb-6">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold px-6 py-2 rounded-full transition flex items-center gap-2 mx-auto"
          >
            <FaPlus />
            {showCreateForm ? 'Cancel' : 'Start Discussion'}
          </button>
        </div>

        {/* Create Thread Form */}
        {showCreateForm && (
          <div className="border border-cyan-600 rounded-xl bg-[#0f172a]/60 p-6 mb-6">
            <h2 className="text-lg font-bold text-cyan-300 mb-4">Start a New Discussion</h2>
            <form onSubmit={handleCreateThread} className="space-y-4">
              <input
                type="text"
                value={newThread.title}
                onChange={(e) => setNewThread({...newThread, title: e.target.value})}
                placeholder="Discussion title..."
                className="w-full px-4 py-2 bg-white bg-opacity-20 text-white rounded placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                required
              />
              <textarea
                value={newThread.body}
                onChange={(e) => setNewThread({...newThread, body: e.target.value})}
                placeholder="What's on your mind?"
                className="w-full px-4 py-2 bg-white bg-opacity-20 text-white rounded placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-cyan-400 h-32"
                required
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={creating}
                  className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-black font-bold px-6 py-2 rounded-full transition disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Post Discussion'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold px-6 py-2 rounded-full transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Thread List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-cyan-300">Loading discussions...</p>
            </div>
          ) : threads.length === 0 ? (
            <div className="text-center py-8">
              <FaComments className="text-4xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-300 mb-2">No discussions yet</h3>
              <p className="text-gray-400">Be the first to start a conversation!</p>
            </div>
          ) : (
            threads.map((thread) => (
              <Link key={thread._id} href={`/forums/thread/${thread.slug}`}>
                <div className="border border-cyan-600 rounded-xl bg-[#0f172a]/60 p-4 hover:bg-[#0f172a]/80 transition cursor-pointer">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-cyan-300 mb-2">{thread.title}</h3>
                      <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                        {thread.body?.substring(0, 150)}...
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span>By {thread.author}</span>
                        <div className="flex items-center gap-1">
                          <FaClock />
                          {formatDate(thread.createdAt)}
                        </div>
                        <div className="flex items-center gap-1">
                          <FaEye />
                          {thread.views || 0}
                        </div>
                        <div className="flex items-center gap-1">
                          <FaReply />
                          {thread.replyCount || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Back Button */}
        <div className="text-center mt-8">
          <Link href="/forums">
            <button className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold px-6 py-2 rounded-full transition">
              Back to Forums
            </button>
          </Link>
        </div>
      </div>
    </main>
  )
}
