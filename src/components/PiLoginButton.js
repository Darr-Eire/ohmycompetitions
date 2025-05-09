'use client'

import { useState } from 'react'

export default function PiLoginButton() {
  const [loading, setLoading] = useState(false)
  const scopes = ['username', 'payments']

  async function handleLogin() {
    setLoading(true)
    try {
      if (!window.Pi || typeof window.Pi.authenticate !== 'function') {
        throw new Error('Pi SDK is not loaded in the browser')
      }

      const { accessToken } = await window.Pi.authenticate(scopes)

      const loginRes = await fetch('/api/auth/pi-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken }),
      })

      if (!loginRes.ok) {
        const text = await loginRes.text()
        throw new Error(`Login API failed: ${text}`)
      }

      window.location.href = '/account'
    } catch (err) {
      let message = 'Unknown error'
      if (err?.message) message = err.message
      else if (typeof err === 'string') message = err
      alert(`🚨 Login failed:\n${message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleLogin}
      disabled={loading}
      className="neon-button text-white text-sm px-4 py-2"
    >
      {loading ? 'Logging in…' : 'Login with Pi'}
    </button>
  )
}
