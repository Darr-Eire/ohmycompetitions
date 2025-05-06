'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { usePiAuth } from '@/contexts/PiAuthContext'

export default function Header() {
  const { piUser, loading, login, logout } = usePiAuth()
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
      {/* Menu toggle */}
      <button
        ref={buttonRef}
        onClick={() => setMenuOpen(v => !v)}
        aria-label="Toggle menu"
        className="bg-blue-600 text-white rounded px-2 py-2 text-2xl hover:bg-blue-700 transition drop-shadow"
      >
        ☰
      </button>

      {/* Brand */}
      <div className="flex-1 text-center">
        <Link
          href="/"
          className="brand-title inline-block text-2xl font-bold bg-white/60 backdrop-blur px-2 py-1 rounded text-blue-600 drop-shadow"
        >
          OhMyCompetitions
        </Link>
      </div>

      {/* Auth button */}
      {piUser ? (
        <button
          onClick={logout}
          className="bg-white/60 backdrop-blur text-blue-600 rounded px-3 py-1 hover:bg-white/80 transition drop-shadow"
        >
          Log Out
        </button>
      ) : (
        <button
          onClick={login}
          disabled={loading}
          className="bg-white/60 backdrop-blur text-blue-600 rounded px-3 py-1 hover:bg-white/80 transition drop-shadow"
        >
          {loading ? 'Logging in…' : 'Log In with Pi'}
        </button>
      )}

      {/* Dropdown menu */}
      {menuOpen && (
        <nav
          ref={menuRef}
          className="absolute top-full left-0 mt-1 bg-blue-500 backdrop-blur border border-blue-600 rounded shadow-lg w-48"
        >
          {navItems.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="block px-4 py-2 text-white hover:bg-blue-600 transition"
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          ))}

          <hr className="border-blue-600 my-1" />

          {piUser ? (
            <button
              className="block w-full text-left px-4 py-2 text-white hover:bg-blue-600 transition"
              onClick={() => { setMenuOpen(false); logout() }}
            >
              Log Out
            </button>
          ) : (
            <button
              onClick={() => { setMenuOpen(false); login() }}
              disabled={loading}
              className="block w-full text-left px-4 py-2 text-white hover:bg-blue-600 transition"
            >
              {loading ? 'Logging in…' : 'Log In with Pi'}
            </button>
          )}
        </nav>
      )}
    </header>
  )
}
