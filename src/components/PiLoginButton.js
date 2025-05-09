import { useState } from 'react'

export default function PiLoginButton() {
  const [loading, setLoading] = useState(false)
  const scopes = ['username', 'payments']

  async function handleLogin() {
    setLoading(true)
    try {
      const { accessToken } = await window.Pi.authenticate(scopes)

      const loginRes = await fetch('/api/auth/pi-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken }),
      })

      if (!loginRes.ok) throw new Error('Pi login failed')

      // Redirect to /account after login success
      window.location.href = '/account'
    } catch (err) {
      console.error('🚨 Pi login failed:', err)
      alert('Login error – check console')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={handleLogin} disabled={loading} className="neon-button text-white text-sm px-4 py-2">
      {loading ? 'Logging in…' : 'Login with Pi'}
    </button>
  )
}
