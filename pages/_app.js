import { useState } from 'react'

export function usePiAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)

  async function signIn() {
    setLoading(true)
    try {
      // 2a) Pi Browser prompt
      const { accessToken } = await window.Pi.authenticate(
        ["username","wallet_address","payments"],
        (incomplete) => {
          // clean up any unfinished U2A
          fetch("/api/payments/complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(incomplete),
          })
        }
      )
      // 2b) server-verify via /api/pi/me
      const res = await fetch("/api/pi/me", {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      const me = await res.json()
      setUser(me)
    } catch (e) {
      console.error("Pi auth failed", e)
    } finally {
      setLoading(false)
    }
  }

  return { user, loading, signIn }
}
