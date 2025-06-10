'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { usePiAuth } from '../context/PiAuthContext';

const NAV_ITEMS = [
  ['Home', '/homepage'],
  ['My Account', '/account'],
  ['All Competitions', '/competitions'],
  ['Try Your Luck', '/try-your-luck'],
  ['Forums', '/forums'],
  ['The Future', '/future'],
  ['Help & Support', '/help-support'],
  ['How To Play', '/how-to-play'],
  ['How We Got Started', '/how-we-got-started'],
  ['Partners & Sponsors', '/partners'],
];

const COMPETITION_SUB_ITEMS = [
  ['Pi Cash Code', '/pi-cash-code'],
  ['Pi Lottery', '/pi-lottery'],
  ['Pi Battles', '/battles'],
  ['Featured', '/competitions/featured'],
  ['Travel', '/competitions/travel'],
  ['Daily', '/competitions/daily'],
  ['Free', '/ticket-purchase/pi-to-the-moon'],
  ['Pi Giveaways', '/competitions/pi'],
  ['Crypto Giveaways', '/competitions/crypto-giveaways'],
];

function countryCodeToFlagEmoji(code) {
  if (!code || code.length !== 2) return '';
  return code.toUpperCase().replace(/./g, char =>
    String.fromCodePoint(127397 + char.charCodeAt())
  );
}

export default function Header() {
  const { user, login, logout, sdkReady } = usePiAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [competitionsOpen, setCompetitionsOpen] = useState(false);

  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const toggleMenu = () => setMenuOpen(prev => !prev);
  const toggleCompetitions = () => setCompetitionsOpen(prev => !prev);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        !buttonRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
        setCompetitionsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogin = async () => {
    try {
      if (!window.Pi) {
        console.error('Pi SDK not loaded');
        return;
      }

      window.Pi.authenticate(['username', 'payments'], async function (authData, authError) {
        if (authError) {
          console.error('Authentication error:', authError);
          return;
        }

        const res = await fetch('/api/verify-pi-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken: authData.accessToken })
        });

        if (!res.ok) {
          console.error('Failed to verify Pi user');
          return;
        }

        const { user } = await res.json();
        localStorage.setItem('piUser', JSON.stringify(user));
        window.location.reload();
      });
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] border-b border-cyan-700 px-3 py-1.5 flex items-center shadow-md backdrop-blur-md">
      <button ref={buttonRef} onClick={toggleMenu} className="neon-button text-white text-xs px-2 py-1">
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
        </svg>
      </button>

      <div className="flex-1 text-center">
        <Link
          href="/homepage"
          className="text-lg sm:text-xl font-bold font-orbitron bg-gradient-to-r from-[#00ffd5] to-[#0077ff] text-transparent bg-clip-text drop-shadow"
        >
          OhMyCompetitions
        </Link>
      </div>

      {user ? (
  <div className="flex items-center gap-2">
    <span className="text-sm font-bold">
      👋 {user.username}
    </span>
    <button
      onClick={logout}
      className="neon-button text-xs px-2 py-1 bg-red-600 hover:bg-red-700"
    >
      Logout
    </button>
  </div>
) : (
  <button
    onClick={login}
    disabled={!sdkReady}
    className="neon-button text-xs px-2 py-1"
  >
    Login with Pi
  </button>
)}

      {menuOpen && (
        <nav
          ref={menuRef}
          className="absolute top-full left-2 mt-2 w-56 rounded-lg shadow-xl backdrop-blur-md bg-[#0f172a] border border-cyan-700 animate-fade-in z-50"
        >
          <ul className="flex flex-col font-orbitron text-xs">
            {NAV_ITEMS.map(([label, href]) => (
              label === 'All Competitions' ? (
                <li key={href}>
                  <button
                    onClick={toggleCompetitions}
                    className="block w-full text-left px-4 py-2 text-white hover:bg-cyan-600 hover:text-black transition"
                  >
                    All Competitions ▾
                  </button>
                  {competitionsOpen && (
                    <ul className="ml-4 border-l border-cyan-700">
                      {COMPETITION_SUB_ITEMS.map(([subLabel, subHref]) => (
                        <li key={subHref}>
                          <Link href={subHref} onClick={() => setMenuOpen(false)}>
                            <div className="px-4 py-2 text-white hover:bg-cyan-700">{subLabel}</div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ) : (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className="block w-full px-4 py-2 text-white hover:bg-cyan-600 hover:text-black transition"
                  >
                    {label}
                  </Link>
                </li>
              )
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
