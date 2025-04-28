// src/components/Header.js
'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'

export default function Header({ isLoggedIn, onLogin, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  return (
    <header>
      <button
        className="menu-button"
        onClick={() => setMenuOpen(open => !open)}
        aria-label="Toggle menu"
      >
        Menu
      </button>
      <h1 className="site-title">
        <Link href="/">Oh My Competitions</Link>
      </h1>
      <div className="nav-spacer" />
      {isLoggedIn ? (
        <button className="logout-button" onClick={onLogout}>
          Log Out
        </button>
      ) : (
        <button className="login-button" onClick={onLogin}>
          Log In
        </button>
      )}

      {menuOpen && (
        <nav ref={menuRef} className="dropdown-menu">
          <Link href="/" className="dropdown-link">Home</Link>
          <Link href="/competitions" className="dropdown-link">All Competitions</Link>
          <Link href="/try-your-luck" className="dropdown-link">Try Your Luck</Link>
          <Link href="/future" className="dropdown-link">The Future</Link>
          <Link href="/forums" className="dropdown-link">Forums</Link>
          <Link href="/help-support" className="dropdown-link">Help & Support</Link>
          <Link href="/how-we-got-started" className="dropdown-link">
            How We Got Started
          </Link>
          <hr className="my-2 border-white/50" />
          {isLoggedIn ? (
            <button className="logout-button dropdown-link" onClick={onLogout}>
              Log Out
            </button>
          ) : (
            <button className="login-button dropdown-link" onClick={onLogin}>
              Log In
            </button>
          )}
        </nav>
      )}
    </header>
  )
}

