'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { signIn, signOut, useSession } from 'next-auth/react'

export default function Header() {
  const { data: session, status } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const buttonRef = useRef(null)

  const toggleMenu = () => setMenuOpen(open => !open)

  useEffect(() => {
    function handleClickOutside(e) {
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
    ['My Account', '/account'],
    ['All Competitions', '/competitions'],
    ['Try Your Luck', '/try-your-luck'],
    ['Forums', '/forums'],
    ['The Future', '/future'],
    ['Help & Support', '/help-support'],
    ['How We Got Started', '/how-we-got-started'],
    ['Partners & Sponsors', '/partners'],
  ]

  return (
    <header className="
      fixed top-0 left-0 right-0 z-50
      bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a]
      border-b border-cyan-700
      px-4 py-3 flex items-center
      shadow-md backdrop-blur-md
    ">
      {/* Menu Button */}
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        className="neon-button text-white text-sm px-4 py-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
        </svg>
      </button>

      {/* Brand */}
      <div className="flex-1 text-center">
        <Link href="/" className="text-xl sm:text-2xl font-bold font-orbitron bg-gradient-to-r from-cyan-400 to-blue-600 text-transparent bg-clip-text drop-shadow">
          OhMyCompetitions
        </Link>
      </div>

      {/* Top Right Auth Button */}
      {status === 'loading' ? (
        <p className="text-white text-sm">Checking session…</p>
      ) : session ? (
        <div className="text-white text-sm flex items-center gap-2">
          <span>👋 {session.user.username}</span>
          <button onClick={() => signOut()} className="neon-button px-3 py-1">Log Out</button>
        </div>
      ) : (
        <button onClick={() => signIn()} className="neon-button text-white text-sm px-4 py-2">Log In</button>
      )}

      {/* Dropdown Menu */}
      {menuOpen && (
        <nav ref={menuRef} className="absolute top-full left-2 mt-3 w-56 rounded-lg shadow-xl backdrop-blur-md bg-[#0f172acc] border border-cyan-700 animate-fade-in">
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
              {session ? (
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    signOut()
                  }}
                  className="w-full text-left px-4 py-2 text-white hover:bg-cyan-600 hover:text-black transition"
                >
                  Log Out
                </button>
              ) : (
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    signIn()
                  }}
                  className="w-full text-left px-4 py-2 text-white hover:bg-cyan-600 hover:text-black transition"
                >
                  Log In with Pi
                </button>
              )}
            </li>
          </ul>
        </nav>
      )}
    </header>
  )
}
