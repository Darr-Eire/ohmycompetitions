'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)

  const menuRef = useRef()

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
        credentials: 'include'
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

  // Close the menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) {
      document.addEventListener('click', handleClickOutside)
    }
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [menuOpen])

  return (
    <header>
      {/* Menu Button and Dropdown */}
      <div ref={menuRef} className="relative">
        <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)}>
          Menu
        </button>

        {menuOpen && (
          <div className="dropdown-menu">
            <Link href="/" className="dropdown-link" onClick={() => setMenuOpen(false)}>
              Home
            </Link>
            <Link href="/competitions" className="dropdown-link" onClick={() => setMenuOpen(false)}>
              All Competitions
            </Link>
          </div>
        )}
      </div>

      {/* Site Title */}
      <h1 className="site-title">Oh My Competitions</h1>

      {/* Spacer */}
      <div className="nav-spacer" />

      {/* Login/Logout Buttons */}
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

