'use client'

import Link from 'next/link'
import { useState } from 'react'
import { FaComments } from 'react-icons/fa'

export default function StartDiscussionPage() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    const res = await fetch('/api/submit/discussion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content }),
    })

    const result = await res.json()
    if (res.ok) {
      alert('✅ Post created!')
      setTitle('')
      setContent('')
    } else {
      alert('❌ Error: ' + result.error)
    }
  }

  return (
    <main className="min-h-screen px-4 py-10 bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white font-orbitron">
      <div className="max-w-3xl mx-auto border border-cyan-700 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-[0_0_30px_#00fff055]">

        {/* Header Title */}
        <div className="text-center mb-8">
          <h1 className="w-full text-lg sm:text-xl font-bold text-white px-4 py-3 rounded-xl font-orbitron shadow-[0_0_30px_#00fff055] bg-gradient-to-r from-[#0f172a]/70 via-[#1e293b]/70 to-[#0f172a]/70 backdrop-blur-md border border-cyan-400">
            <div className="flex justify-center items-center gap-2">
              <FaComments />
              Start a Discussion
            </div>
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-semibold mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2 bg-white bg-opacity-20 text-white rounded placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              placeholder="What's the topic?"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Message</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              className="w-full px-4 py-2 bg-white bg-opacity-20 text-white rounded placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              rows={5}
              placeholder="Share your thoughts or ask something..."
            />
          </div>

          {/* CTA Button */}
          <div className="text-center mt-6">
            <button
              type="submit"
   className="inline-block bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white font-semibold px-6 py-2 rounded-md shadow hover:brightness-110 transition border border-cyan-700">
              Post
            </button>
          </div>
        </form>

        {/* Back Button */}
        <div className="text-center mt-4">
          <Link href="/forums">
            <span className="inline-block bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white font-semibold px-6 py-2 rounded-md shadow hover:brightness-110 transition border border-cyan-700">
              Back to Forums
            </span>
          </Link>
        </div>
      </div>
    </main>
  )
}
