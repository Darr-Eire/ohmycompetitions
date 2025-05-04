// src/components/Header.js
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

  const navItems = [
    ['Home', '/'],
    ['All Competitions', '/competitions'],
    ['Try Your Luck', '/try-your-luck'],
    ['Forums', '/forums'],
    ['The Future', '/future'],
    ['Help & Support', '/help-support'],
    ['How We Got Started', '/how-we-got-started'],
    ['Partners & Sponsors', '/partners'],
  ]

  return (
    <header className="relative bg-blue-600 text-white px-4 py-3 flex items-center">
      {/* Left: Menu Toggle */}
      <button
        ref={buttonRef}
        className="menu-button text-xl"
        onClick={() => setMenuOpen(v => !v)}
        aria-label="Toggle menu"
      >
        ☰
      </button>

      {/* Center: Logo */}
      <div className="flex-1 text-center">
        <Link href="/" className="brand-title text-2xl font-bold">
          OMC
        </Link>
      </div>

      {/* Right: Login / Logout */}
      {isLoggedIn ? (
        <button
          className="logout-button bg-transparent border border-white rounded px-3 py-1 hover:bg-white hover:text-blue-600 transition"
          onClick={onLogout}
        >
          Log Out
        </button>
      ) : (
        <button
          className="login-button bg-white text-blue-600 rounded px-3 py-1 hover:bg-white/90 transition"
          onClick={onLogin}
        >
          Log In With Pi
        </button>
      )}

      {/* Dropdown */}
      {menuOpen && (
        <nav
          ref={menuRef}
          className="dropdown-menu absolute top-full left-0 mt-1 bg-blue-600 border border-white rounded shadow-lg w-48"
        >
          {navItems.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="dropdown-link block px-4 py-2 hover:bg-white/20"
              onClick={handleLinkClick}
            >
              {label}
            </Link>
          ))}

          <hr className="border-white/50 my-1" />

          {isLoggedIn ? (
            <button
              className="dropdown-link block w-full text-left px-4 py-2 hover:bg-white/20"
              onClick={() => { handleLinkClick(); onLogout() }}
            >
              Log Out
            </button>
          ) : (
            <button
              className="dropdown-link block w-full text-left px-4 py-2 hover:bg-white/20"
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
