'use client'

import Link from 'next/link'
import { useState } from 'react'
import { FaLightbulb } from 'react-icons/fa'

export default function NewIdeaPage() {
  const [idea, setIdea] = useState('')
  const [reason, setReason] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    const res = await fetch('/api/submit/idea', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idea, reason }),
    })

    const result = await res.json()
    if (res.ok) {
      alert('✅ Idea submitted!')
      setIdea('')
      setReason('')
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
              <FaLightbulb />
              Share a New Idea
            </div>
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-semibold mb-1">Your Idea</label>
            <input
              type="text"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              required
              className="w-full px-4 py-2 bg-white bg-opacity-20 text-white rounded placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              placeholder="What's your idea?"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Why is this a good idea?</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              className="w-full px-4 py-2 bg-white bg-opacity-20 text-white rounded placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              rows={5}
              placeholder="Tell us why you think this idea is awesome..."
            />
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              className="inline-block bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white font-semibold px-6 py-2 rounded-md shadow hover:brightness-110 transition border border-cyan-700"
            >
              Submit Idea
            </button>
          </div>
        </form>

        <div className="text-center mt-6">
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
