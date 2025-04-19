'use client'

import { useEffect, useState } from 'react'

export default function AccountPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('pi_access_token')
    if (!token) {
      console.warn('No access token found')
      setLoading(false)
      return
    }

    fetch('https://api.minepi.com/v2/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Unauthorized')
        return res.json()
      })
      .then((data) => {
        console.log('✅ Pi user verified:', data)
        setUser(data)
      })
      .catch((err) => {
        console.error('❌ Failed to verify user', err)
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-6 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">My Pi Account</h1>
      {loading ? (
        <p>Loading...</p>
      ) : user ? (
        <div>
          <p>👤 Username: <strong>{user.username}</strong></p>
          <p>🆔 UID: <code>{user.uid}</code></p>
        </div>
      ) : (
        <p>No user session found. Please log in with Pi.</p>
      )}
    </div>
  )
}
