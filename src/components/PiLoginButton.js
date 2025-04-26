// src/components/PiLoginButton.js
'use client'
import { useEffect, useState } from 'react'

export default function PiLoginButton({ apiBaseUrl = '/api' }) {
  const [sdkReady, setSdkReady] = useState(false)
  const [loading, setLoading] = useState(false)

  // Poll for window.Pi
  useEffect(() => {
    if (window.Pi?.authenticate) {
      setSdkReady(true)
      return
    }
    const interval = setInterval(() => {
      if (window.Pi?.authenticate) {
        setSdkReady(true)
        clearInterval(interval)
      }
    }, 100)
    return () => clearInterval(interval)
  }, [])

  const handleLogin = async () => {
    setLoading(true)
    try {
      const scopes = ['username', 'wallet_address']
      const auth = await Pi.authenticate(scopes)
      const res = await fetch(`${apiBaseUrl}/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: auth.accessToken }),
      })
      if (!res.ok) throw new Error(`Login API failed: ${res.status}`)
      alert('Logged in!')
    } catch (err) {
      console.error(err)
      alert(`Login failed: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (!sdkReady) {
    return <button disabled>Loading Pi SDK…</button>
  }

  return (
    <button onClick={handleLogin} disabled={loading}>
      {loading ? 'Logging in…' : 'Login with Pi'}
    </button>
  )
}
