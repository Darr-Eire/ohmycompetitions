// src/lib/usePiAuth.js
import { useState } from 'react'

export function usePiAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)

  async function signIn() {
    setLoading(true)
    try {
      // 1) Prompt Pi Browser for consent & payment scope
      const { accessToken } = await window.Pi.authenticate(
        ['username', 'wallet_address', 'payments'],
        (incomplete) => {
          // Clean up any unfinished U2A payments
          fetch('/api/payments/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(incomplete),
          })
        }
      )

      // 2) Verify token with your backend
      const res = await fetch('/api/pi/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (!res.ok) throw new Error('Token verification failed')
      const me = await res.json()

      // Save verified user info
      setUser(me)
    } catch (e) {
      console.error('Pi auth failed', e)
    } finally {
      setLoading(false)
    }
  }

  return { user, loading, signIn }
}
