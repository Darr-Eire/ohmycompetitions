'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.menu-button') && !e.target.closest('.dropdown-menu')) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [])

  const handleLogin = async () => {
    setError(null)
    setLoading(true)

    if (typeof window.Pi?.authenticate !== 'function') {
      setError('Pi SDK not available. Open in Pi Browser.')
      setLoading(false)
      return
    }

    try {
      const { accessToken, user } = await window.Pi.authenticate(['username', 'wallet_address'])

      const res = await fetch(`/api/auth/pi-login?accessToken=${encodeURIComponent(accessToken)}`, {
        method: 'GET',
        credentials: 'include',
      })
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
      {/* Menu button */}
      <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)}>Menu</button>

      {/* Dropdown menu */}
      {menuOpen && (
        <div className="dropdown-menu">
          <Link href="/" className="dropdown-link">Home</Link>
          <Link href="/competitions" className="dropdown-link">All Competitions</Link>
        </div>
      )}

      {/* Site Title */}
      <h1 className="site-title">Oh My Competitions</h1>

      {/* Spacer */}
      <div className="nav-spacer" />

      {/* Login/Logout */}
      {!isLoggedIn ? (
        <button
          className="login-button"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? 'Loading…' : 'Log In'}
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
