'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewCompetition() {
  const [form, setForm] = useState({
    title: '',
    prize: '',
    entryFee: '',
    slug: ''
  })
  const router = useRouter()

  async function handleSubmit(e) {
    e.preventDefault()
    const res = await fetch('/api/competitions/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    if (res.ok) {
      router.push('/competitions')
    } else {
      const error = await res.json()
      alert(`Create failed: ${error.error || res.statusText}`)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto space-y-4 p-4 bg-white rounded shadow"
    >
      <h1 className="text-xl font-semibold text-center">
        🆕 Create New Competition
      </h1>

      <input
        placeholder="Title"
        value={form.title}
        onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
        required
        className="w-full border p-2 rounded"
      />

      <input
        placeholder="Prize"
        value={form.prize}
        onChange={e => setForm(f => ({ ...f, prize: e.target.value }))}
        className="w-full border p-2 rounded"
      />

      <input
        placeholder="Entry Fee (number)"
        type="number"
        value={form.entryFee}
        onChange={e => setForm(f => ({ ...f, entryFee: +e.target.value }))}
        className="w-full border p-2 rounded"
      />

      <input
        placeholder="Slug (url-safe)"
        value={form.slug}
        onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
        required
        className="w-full border p-2 rounded"
      />

      <button
        type="submit"
        className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Create Competition
      </button>
    </form>
  )
}
