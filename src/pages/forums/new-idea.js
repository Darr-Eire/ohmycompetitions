'use client'

import Link from 'next/link'
import { useState } from 'react'
import { FaLightbulb, FaArrowLeft } from 'react-icons/fa'

export default function NewIdeaPage() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      alert('Please fill in both title and description')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/submit/idea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content })
      })

      if (res.ok) {
        alert('✅ Idea submitted successfully!')
        setTitle('')
        setContent('')
      } else {
        const error = await res.json()
        alert('❌ Error: ' + error.error)
      }
    } catch (err) {
      alert('❌ Failed to submit idea')
    }
    setSubmitting(false)
  }

  return (
    <main className="min-h-screen px-4 py-10 bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white font-orbitron">
      <div className="max-w-3xl mx-auto border border-cyan-700 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-[0_0_30px_#00fff055]">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="w-full text-lg sm:text-xl font-bold text-white px-4 py-3 rounded-xl font-orbitron shadow-[0_0_30px_#00fff055] bg-gradient-to-r from-[#0f172a]/70 via-[#1e293b]/70 to-[#0f172a]/70 backdrop-blur-md border border-cyan-400">
            <div className="flex justify-center items-center gap-2">
              <FaLightbulb />
              Share Your Idea
            </div>
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-semibold mb-2 text-cyan-300">Idea Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2 bg-white bg-opacity-20 text-white rounded placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              placeholder="What's your brilliant idea?"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2 text-cyan-300">Description</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              className="w-full px-4 py-2 bg-white bg-opacity-20 text-white rounded placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-cyan-400 h-40"
              rows={8}
              placeholder="Describe your idea in detail. How would it work? What benefits would it bring to the platform?"
            />
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              disabled={submitting}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold px-8 py-3 rounded-full transition disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Idea'}
            </button>
          </div>
        </form>

        {/* Navigation */}
        <div className="flex justify-center gap-4 mt-8">
          <Link href="/forums/ideas">
            <button className="flex items-center gap-2 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold px-6 py-2 rounded-full transition">
              <FaArrowLeft />
              Back to Ideas
            </button>
          </Link>
          
          <Link href="/forums">
            <button className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-bold px-6 py-2 rounded-full transition">
              Forums Home
            </button>
          </Link>
        </div>
      </div>
    </main>
  )
}
