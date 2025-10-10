'use client'

import Link from 'next/link'
import { useState } from 'react'
import { FaTrophy } from 'react-icons/fa'

export default function CelebratePage() {
  const [name, setName] = useState('')
  const [story, setStory] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    const res = await fetch('/api/submit/celebration', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, story }),
    })

    const result = await res.json()
    if (res.ok) {
      alert('🎉 Celebration submitted!')
      setName('')
      setStory('')
    } else {
      alert('❌ Error: ' + result.error)
    }
  }

  return (
    <main className="min-h-screen px-4 py-10 bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white font-orbitron">
      <div className="max-w-3xl mx-auto border border-cyan-700 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-[0_0_30px_#00fff055]">

        {/* Header Title with Glass Effect */}
        <div className="text-center mb-8">
          <h1 className="w-full text-lg sm:text-xl font-bold text-white px-4 py-3 rounded-xl font-orbitron shadow-[0_0_30px_#00fff055] bg-gradient-to-r from-[#0f172a]/70 via-[#1e293b]/70 to-[#0f172a]/70 backdrop-blur-md border border-cyan-400">
            <div className="flex justify-center items-center gap-2">
              <FaTrophy />
              Share Your Win!
            </div>
          </h1>
        </div>

        {/* Intro Text */}
        <p className="text-white text-sm sm:text-base text-center mb-8">
          Tell us how you won, what it meant to you, or give a shoutout to a fellow winner!
        </p>

        {/* Input Section */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-semibold mb-1">Your Name or Pi Username</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 bg-white bg-opacity-20 text-white rounded placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              placeholder="e.g. @PiWinner123"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Winning Story</label>
            <textarea
              value={story}
              onChange={(e) => setStory(e.target.value)}
              required
              className="w-full px-4 py-2 bg-white bg-opacity-20 text-white rounded placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              rows={5}
              placeholder="Describe your win or celebrate someone else's success!"
            />
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white font-semibold px-6 py-2 rounded-md shadow hover:brightness-110 transition border border-cyan-700"
            >
              Submit Celebration
            </button>
          </div>
        </form>

        {/* Back Button */}
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
