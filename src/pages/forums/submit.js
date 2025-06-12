'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function SubmitVotePage() {
  const [choice, setChoice] = useState('')
  const [reason, setReason] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    const res = await fetch('/api/submit/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ choice, reason }),
    })

    const result = await res.json()
    if (res.ok) {
      alert('🗳️ Vote submitted successfully!')
      setChoice('')
      setReason('')
    } else {
      alert('❌ Error: ' + result.error)
    }
  }

  return (
    <main className="min-h-screen px-4 py-10 bg-[#0b1120] text-white font-orbitron">
      <div className="max-w-3xl mx-auto border border-cyan-400 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-[0_0_30px_#00fff055]">

        {/* Header Title */}
        <div className="text-center py-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-600 text-[#0f172a] py-3 px-6 rounded-2xl inline-block shadow-md">
            Submit Your Vote
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-semibold mb-1">Your Vote</label>
            <input
              type="text"
              value={choice}
              onChange={(e) => setChoice(e.target.value)}
              required
              className="w-full px-4 py-2 text-black bg-white rounded border border-blue-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500"
              placeholder="Enter your preferred prize or feature"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Why this choice?</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              className="w-full px-4 py-2 text-black bg-white rounded border border-blue-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500"
              rows={5}
              placeholder="Tell us why you want this to win!"
            />
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-gradient-to-r from-cyan-400 to-blue-600 text-[#0f172a] font-semibold px-6 py-2 rounded-2xl shadow-md hover:brightness-110 transition"
            >
              Submit Vote
            </button>
          </div>
        </form>

        <div className="text-center mt-6">
          <Link href="/forums">
            <button className="bg-gradient-to-r from-cyan-400 to-blue-600 text-[#0f172a] font-semibold px-6 py-2 rounded-2xl shadow-md hover:brightness-110 transition">
              Back to Forums
            </button>
          </Link>
        </div>
      </div>
    </main>
  )
}
