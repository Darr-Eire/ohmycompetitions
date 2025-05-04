// src/components/Header.js
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
    <header className="relative z-50">
      {/* left controls and menu button */}
      <div className="flex items-center px-4 bg-blue-600 text-white">
        <button
          ref={buttonRef}
          className="menu-button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          Menu
        </button>

        {/* spacer */}
        <div className="flex-1" />
      </div>

      {/* centered brand */}
      <div className="absolute left-1/2 transform -translate-x-1/2 top-1/2 -translate-y-1/2 pointer-events-none">
  <span className="brand-title">OhMyCompetitions</span>
</div>

      {/* right controls */}
      <div className="flex items-center px-4 bg-blue-600 text-white">
        {isLoggedIn ? (
          <button className="logout-button" onClick={onLogout}>
            Log Out
          </button>
        ) : (
          <button className="login-button" onClick={onLogin}>
            Log In With Pi
          </button>
        )}
      </div>

      {/* dropdown nav */}
      {menuOpen && (
        <nav ref={menuRef} className="dropdown-menu">
          {/* ...links... */}
        </nav>
      )}
    </header>
  )
}


