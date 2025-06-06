'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePiAuth } from '@/context/PiAuthContext';

const NAV_ITEMS = [
  ['Home', '/homepage'],
  ['All Competitions', '/competitions'],
  ['Pi Battles', '/battles'],
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
  ['Featured', '/competitions/featured'],
  ['Travel', '/competitions/travel'],
  ['Pi Giveaways', '/competitions/pi'],
  ['Crypto Giveaways', '/competitions/crypto-giveaways'],
  ['Daily Giveaways', '/competitions/daily'],
  ['Free Giveaways', '/ticket-purchase/pi-to-the-moon'],
];

// Country code to flag emoji
function countryCodeToFlagEmoji(code) {
  return code
    .toUpperCase()
    .replace(/./g, char => String.fromCodePoint(127397 + char.charCodeAt()));
}

export default function Header() {
  const { user, login, loading } = usePiAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [competitionsOpen, setCompetitionsOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const toggleMenu = () => setMenuOpen(prev => !prev);
  const toggleCompetitions = () => setCompetitionsOpen(prev => !prev);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target) && !buttonRef.current.contains(e.target)) {
        setMenuOpen(false);
        setCompetitionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] border-b border-cyan-700 px-3 py-1.5 flex items-center shadow-[0_4px_30px_rgba(0,255,255,0.4)] backdrop-blur-md">
      
      <button ref={buttonRef} onClick={toggleMenu} className="neon-button text-white text-xs px-2 py-1">
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
        </svg>
      </button>

      <div className="flex-1 text-center">
        <Link href="/homepage" className="text-lg sm:text-xl font-bold font-orbitron bg-gradient-to-r from-[#00ffd5] to-[#0077ff] text-transparent bg-clip-text drop-shadow">
          OhMyCompetitions
        </Link>
      </div>

      <div className="text-white text-sm flex items-center gap-2">
        {loading ? (
          <span>Loading...</span>
        ) : user ? (
          <span className="text-lg font-bold">
            {user.username} {user.country && countryCodeToFlagEmoji(user.country)}
          </span>
        ) : (
          <button onClick={login} className="neon-button text-sm px-3 py-1">
            Log in with Pi
          </button>
        )}
      </div>

      {menuOpen && (
        <nav ref={menuRef} className="absolute top-full left-2 mt-2 w-56 rounded-lg shadow-xl backdrop-blur-md bg-[#0f172a] border border-cyan-700 animate-fade-in">
          <ul className="flex flex-col font-orbitron text-xs">
            {NAV_ITEMS.map(([label, href]) => (
              label === 'All Competitions' ? (
                <li key={href}>
                  <button onClick={toggleCompetitions} className="block w-full text-left px-4 py-2 text-white hover:bg-cyan-600 hover:text-black transition">
                    All Competitions ▾
                  </button>
                  {competitionsOpen && (
                    <ul className="ml-4 border-l border-cyan-700">
                      {COMPETITION_SUB_ITEMS.map(([subLabel, subHref]) => (
                        <li key={subHref}>
                          <Link href={subHref} onClick={() => setMenuOpen(false)}>
                            <div className="px-4 py-2">{subLabel}</div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ) : (
                <li key={href}>
                  <Link href={href} onClick={() => setMenuOpen(false)} className="block w-full px-4 py-2 text-white hover:bg-cyan-600 hover:text-black transition">
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
