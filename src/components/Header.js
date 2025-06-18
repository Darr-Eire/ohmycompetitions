'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { usePiAuth } from '../context/PiAuthContext';

export default function Header() {
  const { user, loginWithPi, logout } = usePiAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [compDropdownOpen, setCompDropdownOpen] = useState(false);

  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
        setCompDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
const competitionCategories = [
   ['Pi Giveaways', '/competitions/pi'],
  ['Pi Cash Code', '/pi-cash-code'],
   ['Pi Lottery', '/lottery'],
  ['Pi Battles', '/competitions/pibattles'],
  ['Featured', '/competitions/featured'],
  ['Travel', '/competitions/travel'],
  ['Crypto', '/competitions/crypto-giveaways'],
  ['Daily', '/competitions/daily'],

];


  const navItems = [
    ['Home', '/homepage'],
     ['My Account', '/account'],
   
  ];

  const navExtras = [
    ['Try Your Luck', '/try-your-luck'],
    ['Forums', '/forums'],
    ['The Future', '/future'],
    ['Help & Support', '/help-support'],
    ['How We Got Started', '/how-we-got-started'],
    ['Partners & Sponsors', '/partners'],
  ];

  if (user) navExtras.push(['Pi Code', '/competition']);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] border-b border-cyan-700 px-3 py-1.5 flex items-center shadow-md backdrop-blur-md">
      <button
        ref={buttonRef}
        onClick={() => setMenuOpen(open => !open)}
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
            onClick={async () => {
              try {
                await loginWithPi();
              } catch (err) {
                console.error('❌ Pi Login failed:', err);
                alert('Pi login failed. Try again.');
              }
            }}
            className="neon-button text-xs px-4 py-2"
          >
            Login with Pi
          </button>
        ) : (
          <div className="text-white text-xs flex items-center gap-2">
            <span>👋 {user.username}</span>
            <button onClick={logout} className="neon-button text-xs px-2 py-1">
              Log Out
            </button>
          </div>
        )}
      </div>

      {menuOpen && (
        <nav
          ref={menuRef}
          className="absolute top-full left-2 mt-2 w-60 rounded-lg shadow-xl backdrop-blur-md bg-[#0f172acc] border border-cyan-700 animate-fade-in max-h-[80vh] overflow-y-auto"
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

            {/* Dropdown under Pi Lottery */}
            <li>
              <button
                onClick={() => setCompDropdownOpen(prev => !prev)}
                className="w-full text-left px-4 py-2 text-white hover:bg-cyan-600 hover:text-black transition"
              >
                All Competitions ▾
              </button>
            </li>

            {compDropdownOpen &&
              competitionCategories.map(([label, href]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="block w-full pl-6 pr-4 py-2 text-white hover:bg-cyan-700 hover:text-black transition"
                    onClick={() => {
                      setMenuOpen(false);
                      setCompDropdownOpen(false);
                    }}
                  >
                    {label}
                  </Link>
                </li>
              ))}

            {navExtras.map(([label, href]) => (
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
                    setCompDropdownOpen(false);
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
