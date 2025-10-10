'use client'

import Link from 'next/link'
import { useState } from 'react'
import { FaVoteYea, FaArrowLeft } from 'react-icons/fa'

export default function SubmitPage() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [type, setType] = useState('vote')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      alert('Please fill in both title and description')
      return
    }

    setSubmitting(true)
    try {
      const endpoint = type === 'vote' ? '/api/submit/vote' : '/api/submit/celebration'
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content })
      })

      if (res.ok) {
        alert('✅ Submission successful!')
        setTitle('')
        setContent('')
      } else {
        const error = await res.json()
        alert('❌ Error: ' + error.error)
      }
    } catch (err) {
      alert('❌ Failed to submit')
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
              <FaVoteYea />
              Forum Submission
            </div>
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-semibold mb-2 text-cyan-300">Submission Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-2 bg-white bg-opacity-20 text-white rounded focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              <option value="vote">Vote Proposal</option>
              <option value="celebration">Celebration Story</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-2 text-cyan-300">
              {type === 'vote' ? 'Vote Topic' : 'Celebration Title'}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2 bg-white bg-opacity-20 text-white rounded placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              placeholder={type === 'vote' ? 'What should we vote on?' : 'What are you celebrating?'}
            />
          </div>

          <div>
            <label className="block font-semibold mb-2 text-cyan-300">Details</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              className="w-full px-4 py-2 bg-white bg-opacity-20 text-white rounded placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-cyan-400 h-40"
              rows={8}
              placeholder={
                type === 'vote' 
                  ? 'Describe the voting options and details...'
                  : 'Share your celebration story...'
              }
            />
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              disabled={submitting}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold px-8 py-3 rounded-full transition disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>

        {/* Navigation */}
        <div className="flex justify-center gap-4 mt-8">
          <Link href="/forums">
            <button className="flex items-center gap-2 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold px-6 py-2 rounded-full transition">
              <FaArrowLeft />
              Back to Forums
            </button>
          </Link>
        </div>
      </div>
    </main>
  )
}
