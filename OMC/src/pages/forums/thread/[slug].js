'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { FaArrowLeft, FaReply, FaEye, FaClock, FaThumbsUp, FaThumbsDown, FaUser } from 'react-icons/fa'

export default function ThreadPage() {
  const router = useRouter()
  const { slug } = router.query
  const [thread, setThread] = useState(null)
  const [replies, setReplies] = useState([])
  const [loading, setLoading] = useState(true)
  const [replyText, setReplyText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (slug) {
      fetchThreadData()
    }
  }, [slug])

  const fetchThreadData = async () => {
    try {
      const res = await fetch(`/api/forums/thread/${slug}`)
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      
      const data = await res.json()
      setThread(data.thread)
      setReplies(data.replies || [])
      setError('')
    } catch (err) {
      console.error('Error fetching thread:', err)
      setError('Failed to load thread')
    }
    setLoading(false)
  }

  const handleReplySubmit = async (e) => {
    e.preventDefault()
    if (!replyText.trim()) {
      alert('Please enter a reply')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(`/api/forums/thread/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          body: replyText,
          author: 'Anonymous' // TODO: Add proper auth
        })
      })

      if (res.ok) {
        setReplyText('')
        fetchThreadData() // Refresh thread and replies
        alert('✅ Reply posted!')
      } else {
        const error = await res.json()
        alert('❌ Error: ' + error.error)
      }
    } catch (err) {
      alert('❌ Failed to post reply')
    }
    setSubmitting(false)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getCategoryInfo = (category) => {
    const categories = {
      general: { name: 'General Discussion', color: 'text-blue-400', bg: 'bg-blue-400/20' },
      ideas: { name: 'Ideas', color: 'text-yellow-400', bg: 'bg-yellow-400/20' },
      vote: { name: 'Vote', color: 'text-green-400', bg: 'bg-green-400/20' },
      winners: { name: 'Winners', color: 'text-purple-400', bg: 'bg-purple-400/20' },
      'pioneer-week': { name: 'Pioneer of the Week', color: 'text-cyan-400', bg: 'bg-cyan-400/20' }
    }
    return categories[category] || categories.general
  }

  if (loading) {
    return (
      <main className="min-h-screen px-4 py-10 bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-cyan-300">Loading thread...</p>
        </div>
      </main>
    )
  }

  if (error || !thread) {
    return (
      <main className="min-h-screen px-4 py-10 bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Error</h1>
          <p className="text-white mb-6">{error || 'Thread not found'}</p>
          <Link href="/forums">
            <button className="btn-gradient px-6 py-2 rounded-full">
              Back to Forums
            </button>
          </Link>
        </div>
      </main>
    )
  }

  const categoryInfo = getCategoryInfo(thread.category)

  return (
    <main className="min-h-screen px-4 py-10 bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white font-orbitron">
      <div className="max-w-4xl mx-auto">
        
        {/* Back Button */}
        <div className="mb-6">
          <Link href={`/forums/${thread.category}`}>
            <button className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition">
              <FaArrowLeft />
              Back to {categoryInfo.name}
            </button>
          </Link>
        </div>

        {/* Thread Container */}
        <div className="border border-cyan-700 rounded-2xl backdrop-blur-md shadow-[0_0_30px_#00fff055] overflow-hidden">
          
          {/* Thread Header */}
          <div className="bg-[#0f172a]/80 p-6 border-b border-cyan-700">
            <div className="flex items-center gap-2 mb-3">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${categoryInfo.bg} ${categoryInfo.color}`}>
                {categoryInfo.name}
              </span>
              {thread.isPinned && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-400/20 text-red-400">
                  Pinned
                </span>
              )}
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-4">{thread.title}</h1>
            
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <FaUser />
                {thread.author}
              </div>
              <div className="flex items-center gap-1">
                <FaClock />
                {formatDate(thread.createdAt)}
              </div>
              <div className="flex items-center gap-1">
                <FaEye />
                {thread.views || 0} views
              </div>
              <div className="flex items-center gap-1">
                <FaReply />
                {thread.replyCount || 0} replies
              </div>
            </div>
          </div>

          {/* Thread Content */}
          <div className="bg-[#0f172a]/60 p-6">
            <div className="text-white whitespace-pre-wrap mb-6">
              {thread.body}
            </div>
            
            {/* Thread Actions */}
            <div className="flex items-center gap-4 pt-4 border-t border-cyan-700/50">
              <button className="flex items-center gap-2 text-green-400 hover:text-green-300 transition">
                <FaThumbsUp />
                {thread.upvotes || 0}
              </button>
              <button className="flex items-center gap-2 text-red-400 hover:text-red-300 transition">
                <FaThumbsDown />
                {thread.downvotes || 0}
              </button>
            </div>
          </div>
        </div>

        {/* Replies Section */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-white mb-6">
            Replies ({replies.length})
          </h2>

          {/* Reply Form */}
          {!thread.isLocked && (
            <div className="border border-cyan-600 rounded-xl bg-[#0f172a]/60 p-6 mb-6">
              <h3 className="text-lg font-bold text-cyan-300 mb-4">Post a Reply</h3>
              <form onSubmit={handleReplySubmit} className="space-y-4">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="w-full px-4 py-2 bg-white bg-opacity-20 text-white rounded placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-cyan-400 h-32"
                  required
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-black font-bold px-6 py-2 rounded-full transition disabled:opacity-50"
                >
                  {submitting ? 'Posting...' : 'Post Reply'}
                </button>
              </form>
            </div>
          )}

          {/* Replies List */}
          <div className="space-y-4">
            {replies.length === 0 ? (
              <div className="text-center py-8 border border-cyan-600 rounded-xl bg-[#0f172a]/40">
                <FaReply className="text-3xl text-gray-400 mx-auto mb-3" />
                <p className="text-gray-400">No replies yet. Be the first to respond!</p>
              </div>
            ) : (
              replies.map((reply, index) => (
                <div key={reply._id} className="border border-cyan-600 rounded-xl bg-[#0f172a]/40 p-4">
                  <div className="flex items-center gap-4 mb-3 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <FaUser />
                      {reply.author}
                    </div>
                    <div className="flex items-center gap-1">
                      <FaClock />
                      {formatDate(reply.createdAt)}
                    </div>
                    <span>#{index + 1}</span>
                  </div>
                  
                  <div className="text-white whitespace-pre-wrap mb-3">
                    {reply.body}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <button className="flex items-center gap-1 text-green-400 hover:text-green-300 transition">
                      <FaThumbsUp />
                      {reply.upvotes || 0}
                    </button>
                    <button className="flex items-center gap-1 text-red-400 hover:text-red-300 transition">
                      <FaThumbsDown />
                      {reply.downvotes || 0}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bottom Navigation */}
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