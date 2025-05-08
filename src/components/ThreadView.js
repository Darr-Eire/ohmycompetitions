'use client'

import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Picker } from 'emoji-mart'
import 'emoji-mart/css/emoji-mart.css'

export default function ThreadView({ thread, isAdmin = false }) {
  const [upvotes, setUpvotes] = useState(thread.upvotes?.length || 0)
  const [hasUpvoted, setHasUpvoted] = useState(false)
  const [replies, setReplies] = useState([])
  const [newReply, setNewReply] = useState('')
  const [loading, setLoading] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  useEffect(() => {
    fetch(`/api/forums/replies?threadId=${thread._id}`)
      .then((res) => res.json())
      .then(setReplies)
  }, [thread._id])

  const toggleUpvote = async () => {
    const res = await fetch('/api/forums/upvote', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ threadId: thread._id }),
    })

    const data = await res.json()
    if (res.ok) {
      setUpvotes(data.upvotes)
      setHasUpvoted(!hasUpvoted)
    }
  }

  const postReply = async () => {
    if (!newReply.trim()) return
    setLoading(true)

    const res = await fetch('/api/forums/reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ threadId: thread._id, body: newReply }),
    })

    if (res.ok) {
      const added = await res.json()
      setReplies((prev) => [...prev, added.reply])
      setNewReply('')
    }

    setLoading(false)
  }

  const handleEmojiSelect = (emoji) => {
    setNewReply((prev) => prev + emoji.native)
    setShowEmojiPicker(false)
  }

  const deleteReply = async (id) => {
    if (!confirm('Delete this reply?')) return
    await fetch(`/api/forums/reply/${id}`, { method: 'DELETE' })
    setReplies((prev) => prev.filter((r) => r._id !== id))
  }

  const deleteThread = async () => {
    if (!confirm('Delete this thread?')) return
    await fetch(`/api/forums/thread/${thread._id}`, { method: 'DELETE' })
    window.location.href = '/forums'
  }

  return (
    <div className="bg-white bg-opacity-10 p-6 rounded-2xl text-white space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">{thread.title}</h2>
        {isAdmin && (
          <button onClick={deleteThread} className="text-red-400 text-sm hover:underline">
            🗑 Delete Thread
          </button>
        )}
      </div>

      {thread.body && (
        <ReactMarkdown remarkPlugins={[remarkGfm]} className="prose prose-invert text-white">
          {thread.body}
        </ReactMarkdown>
      )}

      <div className="text-sm text-gray-300">
        🗂 {thread.category} • {new Date(thread.createdAt).toLocaleString()}
      </div>

      <button
        onClick={toggleUpvote}
        className={`mt-2 px-4 py-1 rounded-full ${
          hasUpvoted ? 'bg-blue-600' : 'bg-gray-700'
        } hover:bg-blue-500`}
      >
        🔼 {hasUpvoted ? 'Upvoted' : 'Upvote'} ({upvotes})
      </button>

      {/* Replies */}
      <div className="mt-6">
        <h3 className="text-lg font-bold mb-2">💬 Replies</h3>

        <div className="space-y-3">
          {replies.map((reply) => (
            <div key={reply._id} className="bg-white bg-opacity-5 p-3 rounded relative">
              <div className="text-sm text-gray-400">
                {new Date(reply.createdAt).toLocaleString()}
              </div>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{reply.body}</ReactMarkdown>
              {isAdmin && (
                <button
                  onClick={() => deleteReply(reply._id)}
                  className="absolute top-2 right-3 text-xs text-red-300 hover:underline"
                >
                  🗑
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Reply Input */}
      <div className="mt-6 space-y-2">
        <textarea
          value={newReply}
          onChange={(e) => setNewReply(e.target.value)}
          placeholder="Write your reply..."
          className="w-full bg-white bg-opacity-20 text-white p-2 rounded h-24"
        />
        <div className="flex gap-2 items-center">
          <button
            onClick={postReply}
            disabled={loading}
            className="btn-gradient px-4 py-2 rounded-full"
          >
            {loading ? 'Posting...' : 'Reply'}
          </button>
          <button
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            className="text-white bg-white bg-opacity-10 px-3 py-1 rounded hover:bg-opacity-20"
          >
            😀 Emoji
          </button>
        </div>

        {showEmojiPicker && (
          <div className="mt-2">
            <Picker onSelect={handleEmojiSelect} theme="dark" />
          </div>
        )}
      </div>
    </div>
  )
}
