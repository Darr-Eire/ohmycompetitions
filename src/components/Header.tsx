'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

export default function Header() {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="relative w-full bg-gradient-to-r from-blue-500 to-blue-800 text-white shadow-md px-4 py-3 flex items-center justify-between z-50">
      {/* Menu icon and dropdown */}
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="text-white focus:outline-none"
          aria-label="Toggle Menu"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Dropdown */}
        {open && (
          <div
            ref={menuRef}
            className="absolute left-0 top-9 w-60 bg-blue-600 border border-blue-400 rounded-lg shadow-lg p-4 flex flex-col gap-3 text-white"
          >
            <Link href="/" onClick={() => setOpen(false)} className="hover:text-gray-200">
              🏠 Home
            </Link>
            <Link href="/competitions" onClick={() => setOpen(false)} className="hover:text-gray-200">
              🎯 All Competitions
            </Link>
            <Link href="/try-your-luck" onClick={() => setOpen(false)} className="hover:text-gray-200">
              🎰 Try Your Luck
            </Link>
            <Link href="/future" onClick={() => setOpen(false)} className="hover:text-gray-200">
              🚀 The Future
            </Link>
            <Link href="/forums" onClick={() => setOpen(false)} className="hover:text-gray-200">
              💬 Forums
            </Link>
            <Link href="/help" onClick={() => setOpen(false)} className="hover:text-gray-200">
              🆘 Help / Support
            </Link>
            <Link href="/about" onClick={() => setOpen(false)} className="hover:text-gray-200">
              📖 How We Got Started
            </Link>

            <hr className="border-blue-300" />

            <button
              onClick={() => {
                alert('Login with Pi clicked')
                setOpen(false)
              }}
              className="w-full bg-white text-blue-700 font-semibold py-2 rounded hover:bg-blue-100 transition"
            >
              Login with Pi
            </button>
          </div>
        )}
      </div>

      {/* Title */}
      <Link href="/" className="absolute left-1/2 -translate-x-1/2">
        <h1 className="text-xl md:text-2xl font-bold whitespace-nowrap">
          OhMyCompetitions
        </h1>
      </Link>

      {/* Right spacer */}
      <div className="w-6 h-6" />
    </header>
  )
}
