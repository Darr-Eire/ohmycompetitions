'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  // Close menu if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <header>
      <div className="relative">
        <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)}>
          Menu
        </button>

        {menuOpen && (
          <div className="dropdown-menu" ref={menuRef}>
            <Link href="/" className="dropdown-link">Home</Link>
            <Link href="/competitions" className="dropdown-link">All Competitions</Link>
          </div>
        )}
      </div>

      <h1 className="site-title">Oh My Competitions</h1>

      <div className="nav-spacer" />
    </header>
  )
}
