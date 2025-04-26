'use client'

import { useState } from 'react'
import { useRouter } from 'next/router'

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

      // Stay here, just show success
      alert(`Welcome, ${user.username}!`)
    } catch (e) {
      console.error(e)
      setError(e.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-xl mb-4">Oh My Competitions</h1>
      <button
        onClick={handleLogin}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        {loading ? 'Loading…' : error ?? 'Login with Pi Network'}
      </button>
    </div>
  )
}
