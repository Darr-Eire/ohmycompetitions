// lib/usePiAuth.js
import { useState } from 'react'

export function usePiAuth() {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(false)

  async function signIn() {
    setLoading(true)
    try {
      // 1) ask Pi Browser for consent & get token + basic user info
      const authRes = await window.Pi.authenticate(
        ["username", "wallet_address", "payments"],
        (incomplete) => {
          // if there’s an unfinished U2A, send it to your server
          fetch("/api/payments/complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(incomplete),
          })
        }
      )

      setToken(authRes.accessToken)
      // 2) verify on your server via /api/pi/me
      const r = await fetch("/api/pi/me", {
        headers: { Authorization: `Bearer ${authRes.accessToken}` }
      })
      const me = await r.json()
      setUser(me)
    } catch (e) {
      console.error("Pi auth failed", e)
    } finally {
      setLoading(false)
    }
  }

  return { user, token, loading, signIn }
}
