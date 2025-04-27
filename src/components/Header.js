// src/components/Header.js
'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Header({ isLoggedIn, onLogin, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false)

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

      {/* spacer */}
      <div className="nav-spacer" />

      {/* always show login/logout in top right */}
      {isLoggedIn ? (
        <button
          className="logout-button"
          onClick={onLogout}
        >
          Log Out
        </button>
      ) : (
        <button
          className="login-button"
          onClick={onLogin}
        >
          Log In
        </button>
      )}

      {/* slide‐out menu */}
      {menuOpen && (
        <nav className="dropdown-menu">
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
