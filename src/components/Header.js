'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const savedToken = localStorage.getItem('accessToken')
    const savedUsername = localStorage.getItem('username')
    if (savedToken && savedUsername) {
      setIsLoggedIn(true)
      setUsername(savedUsername)
    }
  }, [])

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
      const { accessToken, user } = await window.Pi.authenticate(['username', 'payments', 'wallet_address'])

      const res = await fetch(`/api/auth/pi-login?accessToken=${encodeURIComponent(accessToken)}`, {
        method: 'GET',
        credentials: 'include',
      })
      if (!res.ok) throw new Error(`Login failed (${res.status})`)

      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('username', user.username)

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
    localStorage.removeItem('accessToken')
    localStorage.removeItem('username')
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
          <Link href="/try-your-luck" className="dropdown-link">Try Your Luck</Link>
          <Link href="/future" className="dropdown-link">The Future</Link>
          <Link href="/forums" className="dropdown-link">Forums</Link>
          <Link href="/help-support" className="dropdown-link">Help & Support</Link>
          <Link href="/how-we-got-started" className="dropdown-link">How We Got Started</Link>

          {/* Divider */}
          <div style={{ borderTop: '1px solid #ffffff', margin: '0.5rem 0' }} />

          {/* Login/Logout button at bottom */}
          {!isLoggedIn ? (
            <button
              className="login-button"
              onClick={handleLogin}
              disabled={loading}
              style={{ margin: '0 auto' }}
            >
              {loading ? 'Loading…' : 'Log In'}
            </button>
          ) : (
            <button
              className="logout-button"
              onClick={handleLogout}
              style={{ margin: '0 auto' }}
            >
              Log Out
            </button>
          )}
        </div>
      )}

      {/* Site Title */}
      <h1 className="site-title">Oh My Competitions</h1>

      {/* Spacer */}
      <div className="nav-spacer" />
    </header>
  )
}
