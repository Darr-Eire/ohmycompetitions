'use client'

import { useState } from 'react'

export default function PiLoginButton() {
  const [loading, setLoading] = useState(false)
  const scopes = ['username', 'payments']

  async function handleLogin() {
    setLoading(true)
    try {
      if (!window.Pi) throw new Error('Pi SDK not loaded')

      const { accessToken, user } = await window.Pi.authenticate(scopes)

      const loginRes = await fetch('/api/auth/pi-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken }),
      })

      if (!loginRes.ok) {
        const errorText = await loginRes.text()
        throw new Error(`Login API failed: ${errorText}`)
      }

      // Success: redirect to account or whatever page
      window.location.href = '/account'
    } catch (err) {
      console.error('🚨 Pi login failed:', err)
      alert('Login failed – check console.')
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
