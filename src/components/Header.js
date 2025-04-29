'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'

export default function Header({ isLoggedIn, onLogin, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const buttonRef = useRef(null)

  // Close menu if clicked outside (but ignore Menu button itself)
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

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [menuOpen])

  // Helper to close when clicking a link
  const handleLinkClick = () => {
    setMenuOpen(false)
  }

  return (
    <header className="relative z-50">
      {/* Menu Button */}
      <button
        ref={buttonRef}
        className="menu-button"
        onClick={() => setMenuOpen((prev) => !prev)}
        aria-label="Toggle menu"
      >
        Menu
      </button>

      <div className="nav-spacer" />

      {/* Login/Logout Button */}
      {isLoggedIn ? (
        <button className="logout-button" onClick={onLogout}>
          Log Out
        </button>
      ) : (
        <button className="login-button" onClick={onLogin}>
          Log In
        </button>
      )}

      {/* Dropdown Menu */}
      {menuOpen && (
        <nav
          ref={menuRef}
          className="dropdown-menu dropdown-menu-animate absolute top-full left-0 mt-2 bg-blue-600 rounded-lg shadow-lg p-4 w-48 space-y-2 z-50"
        >
          <Link href="/" className="dropdown-link" onClick={handleLinkClick}>Home</Link>
          <Link href="/competitions" className="dropdown-link" onClick={handleLinkClick}>All Competitions</Link>
          <Link href="/try-your-luck" className="dropdown-link" onClick={handleLinkClick}>Try Your Luck</Link>
          <Link href="/forums" className="dropdown-link" onClick={handleLinkClick}>Forums</Link>
          <Link href="/future" className="dropdown-link" onClick={handleLinkClick}>The Future</Link>
          <Link href="/help-support" className="dropdown-link" onClick={handleLinkClick}>Help & Support</Link>
          <Link href="/how-we-got-started" className="dropdown-link" onClick={handleLinkClick}>How We Got Started</Link>
          <hr className="my-2 border-white/50" />
          {isLoggedIn ? (
            <button className="logout-button dropdown-link" onClick={() => { handleLinkClick(); onLogout(); }}>
              Log Out
            </button>
          ) : (
            <button className="login-button dropdown-link" onClick={() => { handleLinkClick(); onLogin(); }}>
              Log In
            </button>
          )}
        </nav>
      )}
    </header>
  )
}
