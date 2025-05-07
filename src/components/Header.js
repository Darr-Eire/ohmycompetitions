'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { usePiAuth } from '@/contexts/PiAuthContext'

export default function Header() {
  const { piUser, loading, login, logout } = usePiAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const buttonRef = useRef(null)

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
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] border-b border-cyan-700 px-4 py-3 flex items-center shadow-md backdrop-blur-md">
      {/* Menu Button */}
      <button
        ref={buttonRef}
        onClick={() => setMenuOpen(v => !v)}
        aria-label="Toggle menu"
        className="neon-button text-white"
      >
       ☰
      </button>

      {/* Brand Title */}
      <div className="flex-1 text-center">
        <Link
          href="/"
          className="text-xl sm:text-2xl font-bold font-orbitron bg-gradient-to-r from-cyan-400 to-blue-600 text-transparent bg-clip-text drop-shadow"
        >
          OhMyCompetitions
        </Link>
      </div>

      {/* Auth Button */}
      {piUser ? (
        <button onClick={logout} className="neon-button text-white text-sm px-4 py-2">
          Log Out
        </button>
      ) : (
        <button
          onClick={login}
          disabled={loading}
          className="neon-button text-white text-sm px-4 py-2"
        >
          {loading ? 'Logging in…' : 'Log In with Pi'}
        </button>
      )}

      {/* Dropdown Menu */}
      {menuOpen && (
        <nav
          ref={menuRef}
          className="absolute top-full left-2 mt-3 w-56 rounded-lg shadow-xl backdrop-blur-md bg-[#0f172acc] border border-cyan-700 animate-fade-in"
        >
          <ul className="flex flex-col font-orbitron text-sm">
            {navItems.map(([label, href]) => (
              <li key={href}>
                <Link
                  href={href}
                  className="block w-full px-4 py-2 text-white hover:bg-cyan-600 hover:text-black transition"
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </Link>
              </li>
            ))}
            <li><hr className="border-cyan-700 my-1" /></li>
            <li>
              {piUser ? (
                <button
                  className="w-full text-left px-4 py-2 text-white hover:bg-cyan-600 hover:text-black transition"
                  onClick={() => {
                    setMenuOpen(false)
                    logout()
                  }}
                >
                  Log Out
                </button>
              ) : (
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    login()
                  }}
                  disabled={loading}
                  className="w-full text-left px-4 py-2 text-white hover:bg-cyan-600 hover:text-black transition"
                >
                  {loading ? 'Logging in…' : 'Log In with Pi'}
                </button>
              )}
            </li>
          </ul>
        </nav>
      )}
    </header>
  )
}
