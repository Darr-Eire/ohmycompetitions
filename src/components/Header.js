'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { usePiAuth } from '../context/PiAuthContext';

export default function Header() {
  const { user, loginWithPi, logout } = usePiAuth();
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [panelTop, setPanelTop] = useState(0);

  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const headerRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ESC + simple focus trap
  useEffect(() => {
    if (!menuOpen) return;
    const panel = menuRef.current;
    const focusables = panel?.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
    const first = focusables?.[0];
    const last = focusables?.[focusables.length - 1];
    first?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
      if (e.key === 'Tab' && focusables?.length) {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  // Lock body scroll while open
  useEffect(() => {
    if (!menuOpen) return;
    const { overflow, paddingRight } = document.body.style;
    const sw = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (sw > 0) document.body.style.paddingRight = `${sw}px`;
    return () => {
      document.body.style.overflow = overflow || '';
      document.body.style.paddingRight = paddingRight || '';
    };
  }, [menuOpen]);

  // Measure header height
  useEffect(() => {
    const calcTop = () => {
      const h = headerRef.current?.getBoundingClientRect()?.height ?? 0;
      setPanelTop(Math.ceil(h));
    };
    calcTop();
    const ro = new ResizeObserver(calcTop);
    if (headerRef.current) ro.observe(headerRef.current);
    window.addEventListener('resize', calcTop);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', calcTop);
    };
  }, []);

  /* ---------- Data ---------- */
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

  const miniGames = [
    ['Try Your Luck', '/try-your-luck'],
  ];

  const navExtrasBase = [
    ['Forums', '/forums'],
    ['Results', '/competitions/results'],
    ['How To Play', '/how-to-play'],
    ['About Us', '/about-us'],
    ['Partners & Sponsors', '/partners'],
  ];
  const navExtras = [...navExtrasBase];

  const finalNavItems = [...navItems];
  if (user) finalNavItems.splice(1, 0, ['My Account', '/account']);

  const linkBase = 'block rounded outline-none focus:ring-2 focus:ring-cyan-500/60';
  const getLinkClass = (href, tone = '500') =>
    `${linkBase} text-[13px] px-2 py-1 transition ${
      normalize(router.asPath) === normalize(href) ||
      normalize(router.asPath).startsWith(normalize(href) + '/')
        ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-700'
        : `hover:bg-cyan-${tone}/10`
    }`;

  function normalize(p = '') {
    return (p || '/').replace(/[#?].*$/, '').replace(/\/+$/, '') || '/';
  }

  return (
    <header
      ref={headerRef}
      className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] border-b border-cyan-700 px-3 py-1.5 flex items-center shadow-md backdrop-blur-md"
    >
      <button
        ref={buttonRef}
        onClick={() => setMenuOpen((open) => !open)}
        className="neon-button text-white text-[12px] px-2 py-1"
        aria-haspopup="dialog"
        aria-expanded={menuOpen}
        aria-controls="omc-mega-menu"
      >
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
        </svg>
        <span className="sr-only">Open menu</span>
      </button>

      <div className="flex-1 text-center flex flex-col items-center">
        <Link
          href="/homepage"
          className="text-lg sm:text-xl font-bold font-orbitron bg-gradient-to-r from-cyan-400 to-blue-600 text-transparent bg-clip-text drop-shadow"
        >
          OhMyCompetitions
        </Link>
        {user && <span className="text-white text-[12px] mt-0.5">Welcome {user.username}</span>}
      </div>

      <div className="ml-auto flex items-center gap-2">
        {!user ? (
          <>
            <Link href="/signup" className="neon-button text-[12px] px-2 py-1.5">Sign Up</Link>
            <button
              onClick={async () => {
                try { await loginWithPi(); }
                catch (err) { console.error('❌ Pi Login failed:', err); alert('Pi login failed. Try again.'); }
              }}
              className="neon-button text-[12px] px-3 py-1.5"
            >
              Login
            </button>
          </>
        ) : (
          <button onClick={logout} className="neon-button text-[12px] px-2 py-1">Log Out</button>
        )}
      </div>

      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/10"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {menuOpen && (
        <nav
          id="omc-mega-menu"
          ref={menuRef}
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className="fixed left-1/2 -translate-x-1/2 z-50 w-[min(92vw,1120px)] rounded-2xl border border-cyan-700 bg-[#0f172a] shadow-2xl px-3 pb-3 pt-2 overflow-hidden"
          style={{
            top: panelTop + 0,
            height: `calc(100vh - ${panelTop + 12}px)`,
          }}
          tabIndex={-1}
        >
          <div className="h-full grid grid-cols-1 md:grid-cols-3 gap-1 font-orbitron text-[13px] leading-tight">

            {/* Column 1: Main (no title) */}
            <Section title="">
              <ul className="space-y-1">
                {finalNavItems.map(([label, href]) => (
                  <li key={href}>
                    <Link href={href} className={getLinkClass(href, '500')} onClick={() => setMenuOpen(false)}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </Section>

            {/* Column 2: Competitions + Mini Games */}
            <div className="flex flex-col gap-1">
              <Section title="Competitions">
                {(() => {
                  const launch = competitionCategories.find(([label]) => label === 'Launch Week');
                  const rest = competitionCategories.filter(([label]) => label !== 'Launch Week');

                  return (
                    <>
                      {launch && (
                        <div className="mb-1">
                          <Link
                            href={launch[1]}
                            className={`${getLinkClass(launch[1], '700')} text-[13px] sm:text-[14px]`}
                            onClick={() => setMenuOpen(false)}
                            title={launch[0]}
                          >
                            {launch[0]}
                          </Link>
                        </div>
                      )}

                      <ul className="grid grid-cols-2 gap-1">
                        {rest.map(([label, href]) => (
                          <li key={href}>
                            <Link
                              href={href}
                              className={`${getLinkClass(href, '700')} text-[12px] sm:text-[13px]`}
                              onClick={() => setMenuOpen(false)}
                              title={label}
                            >
                              {label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </>
                  );
                })()}
              </Section>

              <Section title="Mini Games">
                <ul className="space-y-1">
                  {miniGames.map(([label, href]) => (
                    <li key={href}>
                      <Link href={href} className={getLinkClass(href, '500')} onClick={() => setMenuOpen(false)}>
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </Section>
            </div>

            {/* Column 3: More */}
            <Section title="More" className="flex flex-col">
              <ul className="space-y-1 flex-1">
                {navExtras.map(([label, href]) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className={getLinkClass(href, '500')}
                      onClick={() => setMenuOpen(false)}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
                {user && (
                  <li className="pt-1">
                    <button
                      onClick={() => { logout(); setMenuOpen(false); }}
                      className="w-full text-left px-2 py-1 rounded text-red-300 hover:bg-red-500/10 outline-none focus:ring-2 focus:ring-red-500/40 text-[12px]"
                    >
                      Log Out
                    </button>
                  </li>
                )}
              </ul>

              <div className="pt-2 mt-2 border-t border-cyan-800 text-[12px] text-white/50 text-center">
                <Link href="/help-support" className="hover:text-cyan-300 transition-colors" onClick={() => setMenuOpen(false)}>
                  Help &amp; Support
                </Link>
                <span className="mx-2 opacity-50">|</span>
                <Link href="/terms" className="hover:text-cyan-300 transition-colors" onClick={() => setMenuOpen(false)}>
                  Terms &amp; Conditions
                </Link>
              </div>
            </Section>
          </div>
        </nav>
      )}
    </header>
  );
}

function Section({ title, children, className = '' }) {
  return (
    <section className={`rounded-xl border border-cyan-800 p-2 ${className}`}>
      {title && (
        <h4 className="text-cyan-300 text-[12px] font-semibold text-center w-full border-b border-cyan-300 pb-1 mb-3">
          {title}
        </h4>
      )}
      {children}
    </section>
  );
}
