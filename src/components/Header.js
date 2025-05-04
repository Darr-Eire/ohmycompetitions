// =============================================================================
// src/components/Header.js
// =============================================================================
'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'

export default function Header({ isLoggedIn, onLogin, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef   = useRef(null)
  const buttonRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = e => {
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
    <header className="relative bg-transparent px-4 py-3 flex items-center z-20">
      {/* ======================================================================= */}
      {/* Menu toggle                                                           */}
      {/* ======================================================================= */}
      <button
        ref={buttonRef}
        onClick={() => setMenuOpen(v => !v)}
        aria-label="Toggle menu"
        className="
          menu-button
          bg-blue-600            /* blue background */
          text-white             /* white text */
          rounded
          px-3 py-1
          hover:bg-blue-700
          transition
          drop-shadow
        "
      >
        ☰ Menu
      </button>

      {/* ======================================================================= */}
      {/* Logo                                                                  */}
      {/* ======================================================================= */}
      <div className="flex-1 text-center">
        <Link
          href="/"
          className="brand-title inline-block text-2xl font-bold bg-white/60 backdrop-blur px-2 py-1 rounded text-blue-600 drop-shadow"
        >
          OhMyCompetitions
        </Link>
      </div>

      {/* ======================================================================= */}
      {/* Login / Logout                                                        */}
      {/* ======================================================================= */}
      {isLoggedIn ? (
        <button
          onClick={onLogout}
          className="
            logout-button
            bg-white/60 backdrop-blur
            text-blue-600
            rounded px-3 py-1
            hover:bg-white/80
            transition drop-shadow
          "
        >
          Log Out
        </button>
      ) : (
        <button
          onClick={onLogin}
          className="
            login-button
            bg-white/60 backdrop-blur
            text-blue-600
            rounded px-3 py-1
            hover:bg-white/80
            transition drop-shadow
          "
        >
          Log In With Pi
        </button>
      )}

      {/* ======================================================================= */}
      {/* Dropdown Menu                                                         */}
      {/* ======================================================================= */}
      {menuOpen && (
        <nav
          ref={menuRef}
          className="
            dropdown-menu
            absolute top-full left-0 mt-1
            bg-blue-500 backdrop-blur
            border border-blue-600
            rounded shadow-lg w-48
          "
        >
          {navItems.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="
                dropdown-link
                block px-4 py-2
                text-white
                hover:bg-blue-600
                transition
              "
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          ))}

          <hr className="border-blue-600 my-1" />

          {isLoggedIn ? (
            <button
              className="
                dropdown-link
                block w-full text-left px-4 py-2
                text-white
                hover:bg-blue-600
                transition
              "
              onClick={() => { setMenuOpen(false); onLogout() }}
            >
              Log Out
            </button>
          ) : (
            <button
              className="
                dropdown-link
                block w-full text-left px-4 py-2
                text-white
                hover:bg-blue-600
                transition
              "
              onClick={() => { setMenuOpen(false); onLogin() }}
            >
              Log In With Pi
            </button>
          )}
        </nav>
      )}
    </header>
  )
}
