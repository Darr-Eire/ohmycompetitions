'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { usePiAuth } from '../context/PiAuthContext';

export default function Header() {
  const { user, loginWithPi, logout } = usePiAuth();
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const sidebarRef = useRef(null);

  // Close when clicking outside sidebar
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ESC close for menu + modal
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        setShowLoginModal(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // Lock background scroll when menu or modal is open
  useEffect(() => {
    if (menuOpen || showLoginModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen, showLoginModal]);

  // Nav data
  const competitionCategories = [
    ['Launch Week', '/competitions/launch-week'],
    ['Pi Competitions', '/competitions/pi'],
    ['Pi Stages', '/battles'],
    ['Pi Cash Code', '/pi-cash-code'],
    ['Live Now', '/competitions/live-now'],
    ['Featured', '/competitions/featured'],
    ['Daily', '/competitions/daily'],
  ];
  const navItems = [['Home', '/homepage']];
  const miniGames = [['Try Your Luck', '/try-your-luck']];
  const navExtras = [
    ['Forums', '/forums'],
    ['Results', '/competitions/results'],
    ['How To Play', '/how-to-play'],
    ['About Us', '/about-us'],
    ['Partners & Sponsors', '/partners'],
  ];
  const finalNavItems = [...navItems];
  if (user) finalNavItems.splice(1, 0, ['My Account', '/account']);

  const normalize = (p = '') =>
    (p || '/').replace(/[#?].*$/, '').replace(/\/+$/, '') || '/';

  const linkBase =
    'block rounded px-3 py-2 text-sm font-medium transition-all duration-200 relative overflow-hidden group';
  const getLinkClass = (href) => {
    const active =
      normalize(router.asPath) === normalize(href) ||
      normalize(router.asPath).startsWith(normalize(href) + '/');
    return `${linkBase} ${
      active
        ? 'text-cyan-300 bg-cyan-500/20 shadow-[0_0_10px_rgba(0,255,255,0.4)]'
        : 'text-white hover:text-cyan-300'
    }`;
  };

  const Section = ({ title, children }) => (
    <div>
      {title && (
        <h4 className="text-cyan-300 text-xs uppercase tracking-wider mb-2 font-bold border-l-4 border-cyan-400 pl-2">
          {title}
        </h4>
      )}
      {children}
    </div>
  );

  return (
    <>
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-3 py-2 flex items-center justify-between shadow-md backdrop-blur-md bg-gradient-to-r from-[#0f172a] via-[#1a2535] to-[#0f172a] border-b border-cyan-700">
        {/* Menu Button */}
        <button
          onClick={() => setMenuOpen(true)}
          className="neon-button text-white px-2 py-1 hover:scale-105 transition-transform"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
          </svg>
        </button>

        {/* Logo */}
     <div className="flex flex-col items-center text-center">
  {/* Site Title */}
  <Link
    href="/homepage"
    className="text-lg sm:text-xl font-bold font-orbitron bg-gradient-to-r from-cyan-400 to-blue-600 text-transparent bg-clip-text drop-shadow"
  >
    Oh My Competitions
  </Link>

  {/* Welcome + Username */}
  {user && (
    <div className="text-cyan-300 text-sm font-orbitron mt-0.5">
      Welcome <span className="text-cyan-300">{user.username}</span>
    </div>
  )}
</div>


        {/* Auth Button */}
        <div className="flex flex-col gap-1 items-end">
          {!user ? (
            <button
              onClick={() => setShowLoginModal(true)}
              className="neon-button text-xs px-2 py-1 w-fit"
            >
              Login
            </button>
          ) : (
            <button
              onClick={logout}
              className="neon-button text-xs px-2 py-1 w-fit"
            >
              Log Out
            </button>
          )}
        </div>
      </header>

      {/* Overlay for Menu */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-gradient-to-b from-[#0f172a] to-[#1a2a3a] border-r border-cyan-700 shadow-[0_0_25px_rgba(0,255,255,0.15)] transform transition-transform duration-300 ease-out overflow-y-auto custom-scroll ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-cyan-700">
          <span className="text-cyan-300 font-orbitron text-lg">Menu</span>
          <button
            onClick={() => setMenuOpen(false)}
            className="text-white hover:text-cyan-300 hover:scale-110 transition-transform"
          >
            ✕
          </button>
        </div>

        <nav className="p-4 space-y-6">
          <Section>
            {finalNavItems.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className={getLinkClass(href)}
                onClick={() => setMenuOpen(false)}
              >
                <span className="relative z-10">{label}</span>
                <span className="absolute inset-0 bg-cyan-500/10 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
              </Link>
            ))}
          </Section>

          <Section title="Competitions">
            {competitionCategories.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className={getLinkClass(href)}
                onClick={() => setMenuOpen(false)}
              >
                <span className="relative z-10">{label}</span>
                <span className="absolute inset-0 bg-cyan-500/10 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
              </Link>
            ))}
          </Section>

          <Section title="Mini Games">
            {miniGames.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className={getLinkClass(href)}
                onClick={() => setMenuOpen(false)}
              >
                <span className="relative z-10">{label}</span>
                <span className="absolute inset-0 bg-cyan-500/10 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
              </Link>
            ))}
          </Section>

          <Section title="More">
            {navExtras.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className={getLinkClass(href)}
                onClick={() => setMenuOpen(false)}
              >
                <span className="relative z-10">{label}</span>
                <span className="absolute inset-0 bg-cyan-500/10 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
              </Link>
            ))}
            {user && (
              <button
                onClick={() => {
                  logout();
                  setMenuOpen(false);
                }}
                className="block w-full rounded px-3 py-2 mt-2 text-sm text-red-300 hover:bg-red-500/10 hover:shadow-[0_0_10px_rgba(255,0,0,0.3)]"
              >
                Log Out
              </button>
            )}
          </Section>
        </nav>
      </aside>

{/* Auth Choice Modal */}
{showLoginModal && (
  <>
    {/* Dark overlay */}
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
      onClick={() => setShowLoginModal(false)}
    />

    {/* Centered modal */}
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="bg-[#0f172a] border border-cyan-700 rounded-lg shadow-lg p-6 w-80 flex flex-col gap-4 text-center neon-glow animate-fade-in">
        <h2 className="text-cyan-300 font-orbitron text-lg">
          Welcome to OMC <span className="text-xs text-cyan-500">(Oh My Competitions)</span>
        </h2>
    

        {/* Sign Up */}
    {/* Sign Up */}
<div className="flex flex-col gap-1">
  <Link
    href="/signup"
    className="neon-button px-3 py-2 text-sm w-full"
    onClick={() => setShowLoginModal(false)} // closes popup
  >
    Sign Up Now
  </Link>
  <p className="text-cyan-400 text-xs italic">
    Create your free OMC account and start competing today!
  </p>
</div>

{/* Login */}
<div className="flex flex-col gap-1">
  <button
    onClick={async () => {
      try {
        await loginWithPi();
        setShowLoginModal(false); // closes popup
      } catch (err) {
        console.error('❌ Pi Login failed:', err);
        alert('Pi login failed. Try again.');
      }
    }}
    className="neon-button px-3 py-2 text-sm w-full"
  >
    Login
  </button>
  <p className="text-cyan-400 text-xs italic">
    Login will automatically log you in with Pi Auth.
  </p>
</div>


        {/* Cancel */}
        <button
          onClick={() => setShowLoginModal(false)}
          className="text-xs text-gray-400 hover:text-cyan-300 mt-2"
        >
          Cancel
        </button>
      </div>
    </div>
  </>
)}



      {/* Scrollbar Styles */}
      <style jsx>{`
        .custom-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: rgba(0, 255, 255, 0.4);
          border-radius: 10px;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 255, 255, 0.6);
        }
        .neon-glow {
          box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
        }
      `}</style>
    </>
  );
}
