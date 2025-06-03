'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';

export default function Header() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [competitionsOpen, setCompetitionsOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const toggleMenu = () => setMenuOpen(open => !open);
  const toggleCompetitions = () => setCompetitionsOpen(open => !open);

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
        setCompetitionsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    ['Home', '/homepage'],
    ['All Competitions', '/competitions'], // dropdown will hook here
    ['Try Your Luck', '/try-your-luck'],
    ['Forums', '/forums'],
    ['The Future', '/future'],
    ['Help & Support', '/help-support'],
    ['How To Play', '/how-to-play'],
    ['How We Got Started', '/how-we-got-started'],
    ['Partners & Sponsors', '/partners'],
  ];

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
          className="text-lg sm:text-xl font-bold font-orbitron bg-gradient-to-r from-cyan-400 to-blue-600 text-transparent bg-clip-text drop-shadow"
        >
          OhMyCompetitions
        </Link>
      </div>

      {status === 'loading' ? (
        <p className="text-white text-xs">Checking session…</p>
      ) : session ? (
        <div className="text-white text-xs flex items-center gap-2">
          <span>👋 {session.user?.username}</span>
          <button onClick={() => signOut()} className="neon-button text-xs px-2 py-1">
            Log Out
          </button>
        </div>
      ) : (
        <Link href="/login">
          <button className="neon-button text-xs px-2 py-1">Log in</button>
        </Link>
      )}

      {menuOpen && (
        <nav ref={menuRef} className="absolute top-full left-2 mt-2 w-56 rounded-lg shadow-xl backdrop-blur-md bg-[#0f172a]
 border border-cyan-700 animate-fade-in">
          <ul className="flex flex-col font-orbitron text-xs">

            {/* Main Nav Items */}
            {navItems.map(([label, href]) => (
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
    <li><Link href="/pi-cash-code" onClick={() => setMenuOpen(false)}><div className="px-4 py-2">Pi Cash Code</div></Link></li>
    <li><Link href="/pi-lottery" onClick={() => setMenuOpen(false)}><div className="px-4 py-2">Pi Lottery</div></Link></li>
    <li><Link href="/competitions/featured" onClick={() => setMenuOpen(false)}><div className="px-4 py-2">Featured</div></Link></li>
    <li><Link href="/competitions/travel" onClick={() => setMenuOpen(false)}><div className="px-4 py-2">Travel</div></Link></li>
    <li><Link href="/competitions/pi" onClick={() => setMenuOpen(false)}><div className="px-4 py-2">Pi Giveaways</div></Link></li>
    <li><Link href="/competitions/crypto-giveaways" onClick={() => setMenuOpen(false)}><div className="px-4 py-2">Crypto Giveaways</div></Link></li>
    <li><Link href="/competitions/daily" onClick={() => setMenuOpen(false)}><div className="px-4 py-2">Daily Giveaways</div></Link></li>
    <li><Link href="/ticket-purchase/pi-to-the-moon" onClick={() => setMenuOpen(false)}><div className="px-4 py-2">Free Giveaways</div></Link></li>
  </ul>


                  )}
                </li>
              ) : (
                <li key={href}>
                  <Link
                    href={href}
                    className="block w-full px-4 py-2 text-white hover:bg-cyan-600 hover:text-black transition"
                    onClick={() => setMenuOpen(false)}
                  >
                    {label}
                  </Link>
                </li>
              )
            ))}

            <li><hr className="border-cyan-700 my-1" /></li>

            {session && (
              <li>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    signOut();
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
