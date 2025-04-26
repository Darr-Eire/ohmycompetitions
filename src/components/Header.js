// src/components/header.js
'use client'

import { useState } from 'react'

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername]     = useState('')
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState(null)

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

      setUsername(user.username)
      setIsLoggedIn(true)
    } catch (e) {
      console.error(e)
      setError(e.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    setIsLoggedIn(false)
    setUsername('')
  }

  return (
    <header>
      <button className="menu-button">Menu</button>

      {/* Site title */}
      <h1 className="site-title">Oh My Competitions</h1>

      <div className="nav-spacer" />

      {!isLoggedIn ? (
        <button
          className="login-button"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? 'Loading…' : error ?? 'Log In'}
        </button>
      ) : (
        <>
          <span className="welcome-text">Welcome, {username}!</span>
          <button className="logout-button" onClick={handleLogout}>
            Log Out
          </button>
        </>
      )}
    </header>
  )
}
