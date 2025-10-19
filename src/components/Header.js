'use client';

import Link from 'next/link';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/router';
import { usePiAuth } from '../context/PiAuthContext';
import { useSafeTranslation } from '../hooks/useSafeTranslation';
import NotificationsBell from './NotificationsBell';
import LanguageSwitcher from './LanguageSwitcher';

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

  /* ───────────────────────────── Shared button styles ───────────────────────────── */
  const BTN_BASE =
    'inline-flex items-center justify-center rounded-md text-sm font-bold px-3 py-2 ' +
    'transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/40 active:scale-[0.99]';

  // Matches your header gradient bar: from-[#00ffd5] via-[#00ccff] to-[#0077ff]
  const BTN_GRADIENT =
    'bg-gradient-to-r from-[#00ffd5] via-[#00ccff] to-[#0077ff] text-black ' +
    'shadow-[0_0_14px_rgba(0,255,255,0.25)] hover:shadow-[0_0_18px_rgba(0,255,255,0.35)]';

  const BTN_DISABLED = 'opacity-60 cursor-not-allowed shadow-none hover:shadow-none';

  /* ───────────────────────────── Sidebar interactions ───────────────────────────── */
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

  useEffect(() => {
    document.body.style.overflow = menuOpen || showLoginModal ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen, showLoginModal]);

  const safeT = (key, fallback = key) => (!mounted || !ready ? fallback : t(key));

  /* ───────────────────────────── Nav data (tuples) ───────────────────────────── */
  const competitionCategories = [
    [safeT('live_now', 'Live Now'), '/competitions/live-now'],
    [safeT('launch_week', 'Launch Week'), '/competitions/launch-week'],
    [safeT('tech_gadgets', 'Tech/Gadgets'), '/competitions/tech&gadgets'],
    [safeT('daily_weekly', 'Daily/Weekly'), '/competitions/daily'],
    [safeT('pi_giveaways', 'Pi Giveaways'), '/competitions/pi'],
    // These two will be rendered as non-clickable (disabled) below:
    [safeT('pi_stages', 'Pi Stages'), '/stages', safeT('coming_soon', 'Coming Soon')],
    [safeT('pi_cash_code', 'Pi Cash Code'), '/pi-cash-code', safeT('coming_soon', 'Coming Soon')],
  ];

  const navItems = [[safeT('home', 'Home'), '/homepage']];
  const miniGames = [[safeT('try_your_luck', 'Try Your Luck'), '/try-your-luck', safeT('coming_soon', 'Coming Soon')]];
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

  /* ───────────────────────────── Helpers ───────────────────────────── */
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

  // Non-clickable routes set
  const DISABLED_ROUTES = new Set(['/pi-cash-code', '/stages']);

  const Item = ({ tuple }) => {
    const [label, href, note] = tuple;
    const isComingSoon = !!note?.toLowerCase().includes('coming soon');
    const isDisabled = DISABLED_ROUTES.has(href) || isComingSoon;

    if (isDisabled) {
      // Render a disabled row (no Link)
      return (
        <div
          className="block rounded px-3 py-2 text-sm font-medium text-white/60 cursor-not-allowed
                     border border-white/10 bg-white/[0.04]"
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

    // Clickable nav item
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

  /* ───────────────────────────── Render ───────────────────────────── */
  return (
    <>
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-3 py-2 flex items-center justify-between shadow-md backdrop-blur-md bg-[#0f172a] border-b border-cyan-700">
        {/* Menu Button (gradient + black text) */}
        <button
          onClick={() => setMenuOpen(true)}
          className={`${BTN_BASE} ${BTN_GRADIENT} px-2 py-1`}
          aria-label={safeT('open_menu', 'Open menu')}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor" /* inherits black from text color */
            strokeWidth="2"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
          </svg>
        </button>

        {/* Logo + welcome (always show title) */}
        <div className="flex flex-col items-center text-center leading-tight">
          <Link href="/homepage" className="block">
            <span className="text-lg sm:text-xl font-bold font-orbitron bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent drop-shadow">
              OMC
            </span>
          </Link>

          {user ? (
            <div className="text-cyan-300 text-sm font-orbitron mt-0.5">
              {t?.('welcome', 'Welcome') || 'Welcome'} <span className="text-cyan-300">{user.username}</span>
            </div>
          ) : (
            <div className="text-xs mt-0.5 opacity-0 select-none" aria-hidden="true">
              placeholder
            </div>
          )}
        </div>

        {/* Language + auth + notifications */}
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          {user && <NotificationsBell username={user.username} />}
          <div className="flex flex-col gap-1 items-end">
            {!user ? (
              <button
                onClick={() => setShowLoginModal(true)}
                className={`${BTN_BASE} ${BTN_GRADIENT} text-xs`}
                aria-haspopup="dialog"
                aria-expanded={showLoginModal ? 'true' : 'false'}
              >
                {safeT('login', 'Login')}
              </button>
            ) : (
              <button onClick={logout} className={`${BTN_BASE} ${BTN_GRADIENT} text-xs`}>
                {safeT('logout', 'Logout')}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Overlay for Menu */}
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
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-gradient-to-b from-[#0f172a] to-[#1a2a3a] border-r border-cyan-700 shadow-[0_0_25px_rgba(0,255,255,0.15)] transform transition-transform duration-300 ease-out overflow-y-auto custom-scroll ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-cyan-700">
          <span className="text-cyan-300 font-orbitron text-lg">{safeT('menu', 'Menu')}</span>
          <button
            onClick={() => setMenuOpen(false)}
            className={`${BTN_BASE} ${BTN_GRADIENT} px-2 py-1`}
            aria-label={safeT('close_menu', 'Close menu')}
          >
            ✕
          </button>
        </div>

        <nav className="p-4 space-y-6">
          <div>
            {finalNavItems.map((tuple) => (
              <Item key={tuple[1]} tuple={tuple} />
            ))}
          </div>

          <Section title={safeT('competitions', 'Competitions')}>
            {competitionCategories.map((tuple) => (
              <Item key={tuple[1]} tuple={tuple} />
            ))}
          </Section>

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

      {/* Auth Choice Modal */}
      {showLoginModal && (
        <>
          <div
            className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-50 ${isLoggingIn ? 'cursor-wait' : ''}`}
            onClick={() => {
              if (!isLoggingIn) setShowLoginModal(false);
            }}
            aria-hidden="true"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="bg-[#0f172a] border border-cyan-700 rounded-lg shadow-lg p-6 w-80 flex flex-col gap-4 text-center neon-glow animate-fade-in"
              aria-busy={isLoggingIn ? 'true' : 'false'}
              aria-live="polite"
              role="dialog"
              aria-modal="true"
              aria-label="Login dialog"
            >
              <h2 className="text-cyan-300 font-orbitron text-lg">
                {safeT('welcome', 'Welcome to OMC!')}{' '}
                <span className="text-xs text-cyan-500">(Oh My Competitions)</span>
              </h2>

              {/* Sign Up */}
              <div className="flex flex-col gap-1">
                <Link
                  href="/signup"
                  className={`neon-button px-3 py-2 text-sm w-full ${isLoggingIn ? 'pointer-events-none opacity-60' : ''}`}
                  onClick={() => {
                    if (!isLoggingIn) setShowLoginModal(false);
                  }}
                  tabIndex={isLoggingIn ? -1 : 0}
                  aria-disabled={isLoggingIn}
                >
                  {safeT('sign_up_now', 'Sign Up Now')}
                </Link>
                <p className="text-cyan-400 text-xs italic">
                  {safeT('create_account', 'Create your free OMC account and start competing today!')}
                </p>
              </div>

              {/* Login with Pi */}
              <div className="flex flex-col gap-1">
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
                  className="neon-button px-3 py-2 text-sm w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={loading || !sdkReady}
                  title={
                    loading
                      ? 'Authorizing…'
                      : !sdkReady
                      ? 'Loading Pi SDK… Open in Pi Browser'
                      : 'Login with Pi'
                  }
                >
                  {loading ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="4" />
                        <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                      </svg>
                      {safeT('logging_in', 'Logging in...')}
                    </>
                  ) : !sdkReady ? (
                    safeT('loading_sdk', 'Loading Pi SDK…')
                  ) : (
                    safeT('login', 'Login')
                  )}
                </button>
                {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
                <p className="text-cyan-400 text-xs italic">
                  {safeT('login_auto', 'Login will automatically log you in with Pi Auth.')}
                </p>
              </div>

              <button
                onClick={() => {
                  if (!isLoggingIn) setShowLoginModal(false);
                }}
                className={`text-xs ${isLoggingIn ? 'text-gray-500' : 'text-gray-400 hover:text-cyan-300'} mt-2`}
                disabled={isLoggingIn}
                aria-disabled={isLoggingIn}
              >
                {safeT('cancel', 'Cancel')}
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
