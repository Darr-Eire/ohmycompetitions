'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'

export default function Header({ isLoggedIn, onLogin, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const buttonRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLinkClick = () => setMenuOpen(false)

  return (
    <header className="relative z-50 flex items-center px-4 bg-blue-600 text-white">
      {/* Left: Menu Button */}
      <button
        ref={buttonRef}
        className="menu-button"
        onClick={() => setMenuOpen(v => !v)}
        aria-label="Toggle menu"
      >
        Menu
      </button>

      {/* Center: App Title */}
      <div className="absolute left-1/2 transform -translate-x-1/2">
        <Link href="/" className="text-xl font-bold">
          OhMyCompetitions
        </Link>
      </div>

      {/* Spacer so login/logout sits at right edge */}
      <div className="flex-1" />

      {/* Right: Login / Logout */}
      {isLoggedIn ? (
        <button className="logout-button" onClick={onLogout}>
          Log Out
        </button>
      ) : (
        <button className="login-button" onClick={onLogin}>
          Log In With Pi
        </button>
      )}

      {/* Dropdown Menu */}
      {menuOpen && (
        <nav ref={menuRef} className="dropdown-menu">
          <Link href="/" onClick={handleLinkClick} className="dropdown-link">
            Home
          </Link>
          <Link href="/competitions" onClick={handleLinkClick} className="dropdown-link">
            All Competitions
          </Link>
          <Link href="/try-your-luck" onClick={handleLinkClick} className="dropdown-link">
            Try Your Luck
          </Link>
          <Link href="/forums" onClick={handleLinkClick} className="dropdown-link">
            Forums
          </Link>
          <Link href="/future" onClick={handleLinkClick} className="dropdown-link">
            The Future
          </Link>
          <Link href="/help-support" onClick={handleLinkClick} className="dropdown-link">
            Help & Support
          </Link>
          <Link href="/how-we-got-started" onClick={handleLinkClick} className="dropdown-link">
            How We Got Started
          </Link>
          <Link href="/partners" onClick={handleLinkClick} className="dropdown-link">
            Partners & Sponsors
          </Link>

          <hr className="my-2 border-white/50" />

          {isLoggedIn ? (
            <button
              className="logout-button dropdown-link block w-full text-left"
              onClick={() => {
                handleLinkClick()
                onLogout()
              }}
            >
              Log Out
            </button>
          ) : (
            <button
              className="login-button dropdown-link block w-full text-left"
              onClick={() => {
                handleLinkClick()
                onLogin()
              }}
            >
              Log In With Pi
            </button>
          )}
        </nav>
      )}
    </header>
  )
}

