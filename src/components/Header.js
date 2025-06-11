'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { usePiAuth } from 'context/PiAuthContext';

export default function Header() {
  const { user, login, logout } = usePiAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const toggleMenu = () => setMenuOpen(open => !open);

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    ['Home', '/homepage'],
    ['Pi Lottery', '/lottery'],
    ['All Competitions', '/competitions'],
    ['Try Your Luck', '/try-your-luck'],
    ['Forums', '/forums'],
    ['The Future', '/future'],
    ['Help & Support', '/help-support'],
    ['How We Got Started', '/how-we-got-started'],
    ['Partners & Sponsors', '/partners'],
  ];

  if (user) {
    navItems.push(['Pi Code', '/competition']);
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] border-b border-cyan-700 px-3 py-1.5 flex items-center shadow-md backdrop-blur-md">
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        className="neon-button text-white text-xs px-2 py-1"
      >
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
        </svg>
      </button>

      <div className="flex-1 text-center">
        <Link
          href="/homepage"
          className="text-lg sm:text-xl font-bold font-orbitron bg-gradient-to-r from-cyan-400 to-blue-600 text-transparent bg-clip-text drop-shadow"
        >
          OhMyCompetitions
        </Link>
      </div>

      <div className="ml-auto flex items-center">
        {!user ? (
          <button
            onClick={() => login().catch(err => console.error('❌ Login failed:', err))}
            className="neon-button text-xs px-4 py-2"
          >
            Login with Pi
          </button>
        ) : (
          <div className="text-white text-xs flex items-center gap-2">
            <span>👋 {user.username}</span>
            <button
              onClick={logout}
              className="neon-button text-xs px-2 py-1"
            >
              Log Out
            </button>
          </div>
        )}
      </div>

      {menuOpen && (
        <nav
          ref={menuRef}
          className="absolute top-full left-2 mt-2 w-48 rounded-lg shadow-xl backdrop-blur-md bg-[#0f172acc] border border-cyan-700 animate-fade-in"
        >
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
            {user && (
              <li>
                <button
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  className="w-full text-left text-xs px-4 py-2 text-white hover:bg-cyan-600 hover:text-black transition"
                >
                  Log Out
                </button>
              </li>
            )}
          </ul>
        </nav>
      )}
    </header>
  );
}
