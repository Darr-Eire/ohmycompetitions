'use client'

import { useState } from 'react'

export default function ForumThreadForm({ onPosted }) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [category, setCategory] = useState('General')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async () => {
    if (!title) return setMessage('Title is required.')

    setLoading(true)
    const res = await fetch('/api/forums/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body, category }),
    })

    const result = await res.json()
    setLoading(false)

    if (res.ok) {
      setMessage('✅ Posted!')
      setTitle('')
      setBody('')
      if (onPosted) onPosted()
    } else {
      setMessage(`❌ ${result.error || 'Failed to post'}`)
    }
  }

  return (
    <div className="bg-white bg-opacity-10 rounded-2xl p-6 shadow-lg text-white space-y-4">
      <h2 className="text-xl font-bold">📝 Start a Discussion</h2>

      <input
        type="text"
        placeholder="Thread title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full bg-white bg-opacity-20 px-3 py-2 rounded"
      />

      <textarea
        placeholder="Details (optional)"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="w-full bg-white bg-opacity-20 px-3 py-2 rounded h-28"
      />

      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="w-full bg-white bg-opacity-20 px-3 py-2 rounded"
      >
        <option value="General">General</option>
        <option value="Vote">Vote</option>
        <option value="Ideas">Post an Idea</option>
        <option value="Celebrate">Celebrate</option>
      </select>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="btn-gradient px-6 py-2 rounded-full"
      >
        {loading ? 'Posting...' : 'Post Thread'}
      </button>

      {message && <p className="text-sm text-yellow-300">{message}</p>}
    </div>
  )
}
