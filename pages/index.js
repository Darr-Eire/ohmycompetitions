'use client'

import { useState } from 'react'
import { useRouter } from 'next/router'
import CompetitionCard from '../src/components/CompetitionCard'

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const router = useRouter()

  const handleLogin = async () => {
    setError(null)
    setLoading(true)

    if (typeof window.Pi?.authenticate !== 'function') {
      setError('Pi SDK not available. Open in Pi Browser.')
      setLoading(false)
      return
    }

    try {
      const { accessToken, user } = await window.Pi.authenticate(
        ['username', 'wallet_address']
      )

      const res = await fetch(
        `/api/auth/pi-login?accessToken=${encodeURIComponent(accessToken)}`,
        { method: 'GET', credentials: 'include' }
      )
      if (!res.ok) throw new Error(`Login failed (${res.status})`)

      alert(`Welcome, ${user.username}!`)
    } catch (e) {
      console.error(e)
      setError(e.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page p-6">
      <h1 className="text-xl mb-6">Oh My Competitions</h1>

      {/* Pi Login Button */}
      <button
        onClick={handleLogin}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded mb-8"
      >
        {loading ? 'Loading…' : error ?? 'Login with Pi Network'}
      </button>

      {/* Competition Card */}
      <CompetitionCard
        title="Everyday Pioneer"
        prize="1,000 PI Giveaways"
        fee="0.314 PI"
        onEnter={() => {
          // Example: redirect to entry page
          router.push('/competitions/everyday-pioneer')
        }}
      />
    </div>
  )
}
