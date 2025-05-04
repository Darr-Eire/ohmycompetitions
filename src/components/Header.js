'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'

export default function Header({ isLoggedIn, onLogin, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef   = useRef(null)
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
    <header>
      {/* Left: Menu Toggle */}
      <button
        ref={buttonRef}
        className="menu-button"
        onClick={() => setMenuOpen(v => !v)}
        aria-label="Toggle menu"
      >
        ☰
      </button>

      {/* Center: Logo */}
      <span className="brand-title nav-spacer">
        <Link href="/">OhMyCompetitions</Link>
      </span>

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

      {/* Dropdown */}
      {menuOpen && (
        <nav ref={menuRef} className="dropdown-menu">
          {[
            ['Home', '/'],
            ['All Competitions', '/competitions'],
            ['Try Your Luck', '/try-your-luck'],
            ['Forums', '/forums'],
            ['The Future', '/future'],
            ['Help & Support', '/help-support'],
            ['How We Got Started', '/how-we-got-started'],
            ['Partners & Sponsors', '/partners'],
          ].map(([label, href]) => (
            <Link
              key={href}
              href={href}
              onClick={handleLinkClick}
              className="dropdown-link"
            >
              {label}
            </Link>
          ))}

          <hr className="my-2 border-white/50" />

          {isLoggedIn ? (
            <button
              className="logout-button dropdown-link block w-full text-left"
              onClick={() => { handleLinkClick(); onLogout() }}
            >
              Log Out
            </button>
          ) : (
            <button
              className="login-button dropdown-link block w-full text-left"
              onClick={() => { handleLinkClick(); onLogin() }}
            >
              Log In With Pi
            </button>
          )}
        </nav>
      )}
    </header>
  )
}
