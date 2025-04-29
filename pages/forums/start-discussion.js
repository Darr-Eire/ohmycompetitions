// pages/forums/start-discussion.js
'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function StartDiscussionPage() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    // 🧠 You can connect this to Supabase/Postgres later
    alert('✅ Post created!\nTitle: ' + title + '\nContent: ' + content)
    setTitle('')
    setContent('')
  }

  return (
    <main className="page">
      <div className="competition-card max-w-2xl w-full">
        <div className="competition-top-banner">💬 Start a Discussion</div>

        <div className="p-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-semibold mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-2 rounded border border-blue-300"
                placeholder="What's the topic?"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Message</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                className="w-full px-4 py-2 rounded border border-blue-300"
                rows={5}
                placeholder="Share your thoughts or ask something..."
              />
            </div>

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded"
            >
              Post
            </button>
          </form>

          <div className="text-center mt-4">
            <Link href="/forums">
              <button className="text-blue-600 underline">← Back to Forums</button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
