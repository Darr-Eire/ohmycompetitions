'use client';

import Link from 'next/link';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/router';
import { usePiAuth } from '../context/PiAuthContext';
import { useSafeTranslation } from '../hooks/useSafeTranslation';
import NotificationsBell from './NotificationsBell';

export default function Header() {
  const { user, login, logout, loading, sdkReady, error } = usePiAuth();
  const { t, ready } = useSafeTranslation();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [menuOpen, setMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const sidebarRef = useRef(null);

  // NEW: local state for collapsible "Competitions" dropdown
  const [isCompOpen, setIsCompOpen] = useState(true);

  // Buttons match app + mobile nav
  const BTN_BASE =
    'inline-flex items-center justify-center rounded-md text-sm font-bold px-3 py-2 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/40 active:scale-[0.99]';
  const BTN_GRADIENT =
    'bg-gradient-to-r from-[#00ffd5] via-[#00ccff] to-[#0077ff] text-black shadow-[0_0_14px_rgba(0,255,255,0.25)] hover:shadow-[0_0_18px_rgba(0,255,255,0.35)]';
  const BTN_DISABLED = 'opacity-60 cursor-not-allowed shadow-none hover:shadow-none';

  // Close sidebar on outside click / Esc
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        if (!isLoggingIn) setShowLoginModal(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isLoggingIn]);

  // Lock body scroll when overlays open
  useEffect(() => {
    document.body.style.overflow = menuOpen || showLoginModal ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen, showLoginModal]);

  const safeT = (key, fallback = key) => (!mounted || !ready ? fallback : t(key));

  // ───────────────────────── Nav data (updated) ─────────────────────────
  // Removed: Pi Daily / Tech & Gadgets / Launch Week etc.
  // Only two entries under a single dropdown: Live Now + Active (all comps)
  const competitionMenu = [
    [safeT('live_now', 'Live Now'), '/competitions/live-now'],
    [safeT('all_competitions', 'Active Competitions'), '/competitions/active'],
  ];

  const navItems = [[safeT('home', 'Home'), '/homepage']];
  const miniGames = [[safeT('try_your_skill', 'Try Your Skill'), '/try-your-skill', safeT('coming_soon', 'Coming Soon')]];
  const navExtras = [
    [safeT('forums', 'Forums'), '/forums'],
    [safeT('results', 'Results'), '/competitions/results'],
    [safeT('how_it_works', 'How It Works'), '/how-to-play'],
    [safeT('about_us', 'About Us'), '/about-us'],
    [safeT('partners_sponsors', 'Partners & Sponsors'), '/partners'],
  ];
  const finalNavItems = useMemo(() => {
    const arr = [...navItems];
    if (user) arr.splice(1, 0, [safeT('my_account', 'My Account'), '/account']);
    return arr;
  }, [user, mounted, ready]);

  // Helpers
  const normalize = (p = '') => (p || '/').replace(/[#?].*$/, '').replace(/\/+$/, '') || '/';
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
  const DISABLED_ROUTES = new Set(['/pi-cash-code', '/stages']);
  const Item = ({ tuple }) => {
    const [label, href, note] = tuple;
    const isComingSoon = !!note?.toLowerCase().includes('coming soon');
    const isDisabled = DISABLED_ROUTES.has(href) || isComingSoon;
    if (isDisabled) {
      return (
        <div
          className="block rounded px-3 py-2 text-sm font-medium text-white/60 cursor-not-allowed border border-white/10 bg-white/[0.04]"
          aria-disabled="true"
          title={note || safeT('coming_soon', 'Coming Soon')}
        >
          <span className="relative z-10 inline-flex items-center gap-2">
            <span>{label}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-yellow-400/20 text-yellow-200 border border-yellow-400/30">
              {note || safeT('coming_soon', 'Coming Soon')}
            </span>
          </span>
        </div>
      );
    }
    return (
      <Link href={href} className={getLinkClass(href)} onClick={() => setMenuOpen(false)}>
        <span className="relative z-10 flex items-center gap-2">
          <span>{label}</span>
          {isComingSoon && (
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-yellow-400/20 text-yellow-200 border border-yellow-400/30">
              {note}
            </span>
          )}
        </span>
        <span className="absolute inset-0 bg-cyan-500/10 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
      </Link>
    );
  };

  return (
    <>
      {/* Glass header bar with safe-area top; matches mobile nav look */}
      <header
        className="
          fixed top-0 left-0 right-0 z-50
          px-3 py-2 pt-[calc(env(safe-area-inset-top)+8px)]
          bg-[rgba(7,20,38,0.72)] backdrop-blur-xl
          border-b border-white/10
          shadow-[0_-1px_0_0_rgba(255,255,255,0.04)_inset,0_8px_24px_rgba(0,0,0,0.25)]
        "
        style={{ WebkitBackdropFilter: 'blur(20px)' }}
      >
        <div className="container">
          {/* 3-col grid keeps title centered */}
          <div className="grid grid-cols-3 items-center">
            {/* Left: Menu button (gradient pill) */}
            <div className="justify-self-start">
              <button
                onClick={() => setMenuOpen(true)}
                className={`${BTN_BASE} ${BTN_GRADIENT} px-2 py-1 rounded-lg`}
                aria-label={safeT('open_menu', 'Open menu')}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
                </svg>
              </button>
            </div>

            {/* Middle: Title + Welcome (sizes stable via clamp + reserved space) */}
            <div className="justify-self-center text-center leading-tight">
              <Link href="/homepage" className="block">
                <span
                  className="
                    font-bold font-orbitron
                    bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent
                    drop-shadow whitespace-nowrap tracking-wide
                    text-[clamp(20px,4.8vw,28px)]
                    leading-[1.1]
                  "
                >
                  Oh My Competitions
                </span>
              </Link>
              <div
                className="
                  mt-0.5 font-orbitron text-cyan-300
                  text-[clamp(12px,3.4vw,14px)]
                  leading-snug min-h-[1.25rem]
                "
                aria-live="polite"
              >
                {user ? (
                  <>
                    {(t?.('welcome', 'Welcome') || 'Welcome')}{' '}
                    <span className="text-cyan-300">{user.username}</span>
                  </>
                ) : (
                  <span className="opacity-0 select-none">placeholder</span>
                )}
              </div>
            </div>

            {/* Right: Auth button (gradient pill) */}
            <div className="justify-self-end flex items-center gap-2">
              {!user ? (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className={`${BTN_BASE} ${BTN_GRADIENT} text-xs rounded-lg`}
                  aria-haspopup="dialog"
                  aria-expanded={showLoginModal ? 'true' : 'false'}
                >
                  {safeT('login', 'Login')}
                </button>
              ) : (
                <button onClick={logout} className={`${BTN_BASE} ${BTN_GRADIENT} text-xs rounded-lg`}>
                  {safeT('logout', 'Logout')}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Dim overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-gradient-to-b from-[#0f172a] to-[#1a2a3a] border-r border-white/10 shadow-[0_0_25px_rgba(0,255,255,0.15)] transform transition-transform duration-300 ease-out overflow-y-auto custom-scroll ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/[0.02] backdrop-blur">
          <span className="text-cyan-300 font-orbitron text-lg">{safeT('menu', 'Menu')}</span>

          <div className="flex items-center gap-2">
            {user && <NotificationsBell username={user.username} />}

            <button
              onClick={() => setMenuOpen(false)}
              className={`${BTN_BASE} ${BTN_GRADIENT} h-8 px-2 rounded-md`}
              aria-label={safeT('close_menu', 'Close menu')}
              title={safeT('close_menu', 'Close menu')}
            >
              ✕
            </button>
          </div>
        </div>

        <nav className="p-4 space-y-6">
          <div>
            {finalNavItems.map((tuple) => (
              <Item key={tuple[1]} tuple={tuple} />
            ))}
          </div>

          {/* Collapsible Competitions dropdown */}
          <div>
            <button
              onClick={() => setIsCompOpen((v) => !v)}
              className="w-full flex items-center justify-between px-3 py-2 text-sm font-bold rounded border border-white/10 bg-white/[0.04] hover:bg-white/[0.07] text-cyan-200"
              aria-expanded={isCompOpen}
              aria-controls="comp-menu"
            >
              <span className="inline-flex items-center gap-2">
                {/* trophy icon */}
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 21h8" />
                  <path d="M12 17v4" />
                  <path d="M7 4h10v4a5 5 0 0 1-10 0V4Z" />
                  <path d="M17 8h1a3 3 0 0 0 3-3V4h-4" />
                  <path d="M7 8H6a3 3 0 0 1-3-3V4h4" />
                </svg>
                {safeT('competitions', 'Competitions')}
              </span>
              <svg
                className={`w-4 h-4 transition-transform ${isCompOpen ? 'rotate-180' : ''}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            <div id="comp-menu" className={`${isCompOpen ? 'mt-2' : 'h-0 overflow-hidden'} transition-[max-height]`}>
              <div className="pl-2 space-y-1">
                {competitionMenu.map((tuple) => (
                  <Item key={tuple[1]} tuple={tuple} />
                ))}
              </div>
            </div>
          </div>

          <Section title={safeT('mini_games', 'Mini Games')}>
            {miniGames.map((tuple) => (
              <Item key={tuple[1]} tuple={tuple} />
            ))}
          </Section>

          <Section title={safeT('more', 'More')}>
            {navExtras.map((tuple) => (
              <Item key={tuple[1]} tuple={tuple} />
            ))}
            {user && (
              <button
                onClick={() => {
                  logout();
                  setMenuOpen(false);
                }}
                className="block w-full rounded px-3 py-2 mt-2 text-sm text-red-300 hover:bg-red-500/10 hover:shadow-[0_0_10px_rgba(255,0,0,0.3)]"
              >
                {safeT('logout', 'Logout')}
              </button>
            )}
          </Section>
        </nav>
      </aside>

      {/* Auth Modal */}
      {showLoginModal && (
        <>
          {/* Backdrop */}
          <div
            className={`fixed inset-0 z-50 bg-black/70 backdrop-blur-sm transition-opacity ${isLoggingIn ? 'cursor-wait' : ''}`}
            onClick={() => { if (!isLoggingIn) setShowLoginModal(false); }}
            aria-hidden="true"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Login dialog"
              aria-busy={isLoggingIn ? 'true' : 'false'}
              className="w-full max-w-sm rounded-2xl border border-cyan-500/50 bg-[#0b1220] p-6 shadow-[0_0_40px_#22d3ee40] text-center"
            >
              {/* Heading */}
              <h2 className="font-orbitron text-lg font-bold text-cyan-300">
                {safeT('welcome', 'Welcome to OMC!')}{' '}
                <span className="text-xs text-cyan-500">(Oh My Competitions)</span>
              </h2>

              {/* Sign up block */}
              <div className="mt-4 flex flex-col gap-1.5">
                <Link
                  href="/signup"
                  onClick={() => { if (!isLoggingIn) setShowLoginModal(false); }}
                  tabIndex={isLoggingIn ? -1 : 0}
                  aria-disabled={isLoggingIn}
                  className={[
                    'neon-button',
                    'w-full px-3 py-2 text-sm font-semibold rounded-lg',
                    'bg-white/5 border border-cyan-400/50 text-cyan-200',
                    'hover:bg-cyan-400/10 hover:border-cyan-400',
                    'focus:outline-none focus:ring-2 focus:ring-cyan-400/60 focus:ring-offset-0',
                    isLoggingIn ? 'pointer-events-none opacity-60' : ''
                  ].join(' ')}
                >
                  {safeT('sign_up_now', 'Sign Up Now')}
                </Link>
                <p className="text-xs italic text-cyan-400">
                  {safeT('create_account', 'Create your free OMC account and start competing today!')}
                </p>
              </div>

              {/* Pi login block */}
              <div className="mt-4 flex flex-col gap-1.5">
                <button
                  onClick={async () => {
                    if (loading) return;
                    if (!sdkReady) {
                      try {
                        if (typeof window !== 'undefined' && typeof window.__readyPi === 'function') {
                          await window.__readyPi();
                        } else {
                          alert('Loading Pi SDK… Please try again in a moment (open in Pi Browser).');
                          return;
                        }
                      } catch {
                        alert('Pi SDK not ready yet. Please try again in a moment.');
                        return;
                      }
                    }
                    setIsLoggingIn(true);
                    try {
                      await login();
                      setShowLoginModal(false);
                    } catch (err) {
                      console.error('❌ Pi Login failed:', err);
                      alert(err?.message || 'Pi login failed. Please try again.');
                    } finally {
                      setIsLoggingIn(false);
                    }
                  }}
                  disabled={loading || !sdkReady}
                  title={
                    loading
                      ? 'Authorizing…'
                      : !sdkReady
                      ? 'Loading Pi SDK… Open in Pi Browser'
                      : 'Login with Pi'
                  }
                  className={[
                    'neon-button',
                    'w-full px-3 py-2 text-sm font-extrabold rounded-lg',
                    'bg-gradient-to-r from-[#00ffd5] to-[#0077ff] text-black',
                    'shadow-[0_8px_24px_#22d3ee55]',
                    'hover:brightness-110 active:brightness-110',
                    'focus:outline-none focus:ring-2 focus:ring-cyan-300/70',
                    'disabled:opacity-60 disabled:cursor-not-allowed'
                  ].join(' ')}
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="4" />
                        <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                      </svg>
                      {safeT('logging_in', 'Logging in...')}
                    </span>
                  ) : !sdkReady ? (
                    safeT('loading_sdk', 'Loading Pi SDK…')
                  ) : (
                    safeT('login', 'Login')
                  )}
                </button>

                {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}

                <p className="text-xs italic text-cyan-400">
                  {safeT('login_auto', 'Login will automatically log you in with Pi Auth.')}
                </p>
              </div>

              {/* Cancel */}
              <button
                onClick={() => { if (!isLoggingIn) setShowLoginModal(false); }}
                disabled={isLoggingIn}
                aria-disabled={isLoggingIn}
                className={`mt-3 text-xs ${
                  isLoggingIn
                    ? 'text-gray-500'
                    : 'text-gray-400 hover:text-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300/60 rounded'
                }`}
              >
                {safeT('cancel', 'Cancel')}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Scrollbar Styles */}
      <style jsx>{`
        .custom-scroll::-webkit-scrollbar { width: 6px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(0, 255, 255, 0.4); border-radius: 10px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: rgba(0, 255, 255, 0.6); }
        .neon-glow { box-shadow: 0 0 20px rgba(0, 255, 255, 0.3); }
      `}</style>
    </>
  );
}
