'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'

export default function Header({ isLoggedIn, onLogin, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const buttonRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLinkClick = () => {
    setMenuOpen(false)
  }

  return (
    <header className="relative z-50 flex items-center px-4 bg-blue-600 text-white">
      {/* Menu Button */}
      <button
        ref={buttonRef}
        className="menu-button"
        onClick={() => setMenuOpen(prev => !prev)}
        aria-label="Toggle menu"
      >
        Menu
      </button>

      <div className="nav-spacer flex-1" />

      {/* Login/Logout Button */}
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
        <nav
          ref={menuRef}
          className="dropdown-menu absolute top-full left-0 mt-2 bg-blue-600 rounded-lg shadow-lg p-4 w-48 space-y-2 z-50"
        >
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

          <hr className="my-2 border-white/50" />

          {isLoggedIn ? (
            <button
              className="logout-button dropdown-link"
              onClick={() => {
                handleLinkClick()
                onLogout()
              }}
            >
              Log Out
            </button>
          ) : (
            <button
              className="login-button dropdown-link"
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