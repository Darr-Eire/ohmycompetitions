'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'

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

  async function handlePiLogin() {
    try {
      const { accessToken } = await window.Pi.authenticate(['username', 'payments'])

      const res = await fetch('/api/auth/pi-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken }),
      })

      if (!res.ok) throw new Error('Login failed')

      window.location.href = '/account'
    } catch (err) {
      console.error('Pi login error:', err)
      alert('Login failed. See console.')
    }
  }

  const navItems = [
    ['Home', '/'],
    ['My Account', '/account'],
    ['The Pi Cash Code', '/competition'],
    ['All Competitions', '/competitions'],
    ['Try Your Luck', '/try-your-luck'],
    ['Forums', '/forums'],
    ['The Future', '/future'],
    ['Help & Support', '/help-support'],
    ['How We Got Started', '/how-we-got-started'],
    ['Partners & Sponsors', '/partners'],
  ]

  if (session) {
    navItems.push(['Pi Code', '/competition'])
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] border-b border-cyan-700 px-3 py-1.5 flex items-center shadow-md backdrop-blur-md">
      <button ref={buttonRef} onClick={toggleMenu} className="neon-button text-white text-xs px-2 py-1">
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
        </svg>
      </button>

      <div className="flex-1 text-center">
        <Link
          href="/"
          className="text-lg sm:text-xl font-bold font-orbitron bg-gradient-to-r from-cyan-400 to-blue-600 text-transparent bg-clip-text drop-shadow"
        >
          OhMyCompetitions
        </Link>
      </div>

      {status === 'loading' ? (
        <p className="text-white text-xs">Checking session…</p>
      ) : session ? (
        <div className="text-white text-xs flex items-center gap-2">
          <span>👋 {session.user.username}</span>
          <button onClick={() => signOut()} className="neon-button text-xs px-2 py-1">
            Log Out
          </button>
        </div>
      ) : (
        <button onClick={handlePiLogin} className="neon-button text-white text-xs px-2 py-1">
          Login with Pi
        </button>
      )}

      {menuOpen && (
        <nav ref={menuRef} className="absolute top-full left-2 mt-2 w-48 rounded-lg shadow-xl backdrop-blur-md bg-[#0f172acc] border border-cyan-700 animate-fade-in">
          <ul className="flex flex-col font-orbitron text-xs">
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
                  className="w-full text-left text-xs px-4 py-2 text-white hover:bg-cyan-600 hover:text-black transition"
                >
                  Log Out
                </button>
              ) : (
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    handlePiLogin()
                  }}
                  className="w-full text-left text-xs px-4 py-2 text-white hover:bg-cyan-600 hover:text-black transition"
                >
                  Login with Pi
                </button>
              )}
            </li>
          </ul>
        </nav>
      )}
    </header>
  )
}
