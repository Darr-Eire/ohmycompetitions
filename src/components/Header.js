'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';

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
  ['Daily ', '/competitions/daily'],
  ['Free', '/ticket-purchase/pi-to-the-moon'],
  ['Pi Giveaways', '/competitions/pi'],
  ['Crypto Giveaways', '/competitions/crypto-giveaways'],
];

function countryCodeToFlagEmoji(code) {
  return code
    .toUpperCase()
    .replace(/./g, char => String.fromCodePoint(127397 + char.charCodeAt()));
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [competitionsOpen, setCompetitionsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [sdkReady, setSdkReady] = useState(false);

  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('piUser');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://sdk.minepi.com/pi-sdk.js';
    script.async = true;
    script.onload = () => {
      if (window.Pi) {
        window.Pi.init({ version: '2.0' });
        setSdkReady(true);
      }
    };
    document.body.appendChild(script);
  }, []);

  const handleLogin = async () => {
    try {
      localStorage.removeItem('piUser');
      if (window.Pi?.logout) await window.Pi.logout();
      document.cookie = 'pi.accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';

      const result = await window.Pi.authenticate(['username', 'payments']);
      const res = await fetch('/api/auth/pi-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: result.accessToken }),
      });

      if (!res.ok) throw new Error('Pi Login API failed');

      const data = await res.json();
      localStorage.setItem('piUser', JSON.stringify(data.user));
      setUser(data.user);
    } catch (err) {
      console.error('Pi login failed:', err);
      alert('Pi login failed. Check console.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('piUser');
    document.cookie = 'pi.accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
    window.Pi?.logout?.();
    setUser(null);
    alert('🔁 Pi session cleared. Please login again.');
  };

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

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] border-b border-cyan-700 px-3 py-1.5 flex items-center shadow-md backdrop-blur-md">
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
        {user ? (
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold">
              👋 {user.username} {user.country ? countryCodeToFlagEmoji(user.country) : ''}
            </span>
            <button onClick={handleLogout} className="neon-button text-xs px-2 py-1 bg-red-600 hover:bg-red-700">
              Logout
            </button>
          </div>
        ) : (
          <button onClick={handleLogin} disabled={!sdkReady} className="neon-button text-xs px-2 py-1">
            Login with Pi
          </button>
        )}
      </div>

      {menuOpen && (
        <nav ref={menuRef} className="absolute top-full left-2 mt-2 w-56 rounded-lg shadow-xl backdrop-blur-md bg-[#0f172a] border border-cyan-700 animate-fade-in z-50">
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
                            <div className="px-4 py-2 text-white hover:bg-cyan-700">{subLabel}</div>
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