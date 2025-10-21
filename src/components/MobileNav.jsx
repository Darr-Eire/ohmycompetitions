// ============================================================================
// FILE: src/components/MobileNav.jsx
// Purpose: Footer-aware auto-hide mobile nav with active-state + safe-area
// ============================================================================
'use client';
import { FaGamepad } from 'react-icons/fa';


import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';

const NAV_HEIGHT = 56; // keep in sync with CSS --nav-h

/* Inline icons (lightweight) */
const IconHome = (props) => (
  <svg className="mobile-nav__icon" viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
      stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconLive = (props) => (
  <svg className="mobile-nav__icon" viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M7 12a5 5 0 0 1 0-7M17 12a5 5 0 0 0 0-7M3 12a9 9 0 0 1 0-13M21 12a9 9 0 0 0 0-13"
      stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);
const IconTrophy = (props) => (
  <svg className="mobile-nav__icon" viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M7 7V4h10v3a4 4 0 0 0 4 4h0a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5h0a4 4 0 0 0 4-4Z"
      stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 20h6M10 16v2m4-2v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);
const IconUser = (props) => (
  <svg className="mobile-nav__icon" viewBox="0 0 24 24" fill="none" {...props}>
    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.6" />
    <path d="M4 20c1.8-3.3 5-5 8-5s6.2 1.7 8 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export default function MobileNav() {
  const router = useRouter();
  const { pathname = '/' } = router;

  // Hide nav on homepage/index per your requirement
  if (pathname === '/' || pathname === '/index') return null;

  const items = useMemo(
    () => [
      { href: '/homepage', label: 'Home', Icon: IconHome, match: (p) => p === '/homepage' },
      { href: '/competitions/live-now', label: 'Live', Icon: IconLive, match: (p) => p.startsWith('/competitions/live-now') },
{
  href: '/try-your-skill',
  label: 'Mini Game',
  Icon: FaGamepad,
  match: (p) => p.startsWith('/try-your-skill'),
},
],
    []
  );

  const isActive = (href, match) => {
    const p = (pathname || '/').replace(/[?#].*$/, '').replace(/\/+$/, '') || '/';
    return typeof match === 'function' ? match(p) : p === href || p.startsWith(href + '/');
  };

  // Footer-aware hide
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const footer = document.getElementById('site-footer');
    if (!footer) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        setHidden(!!e?.isIntersecting);
      },
      {
        root: null,
        // Start hiding a touch before the nav would collide with the footer
        rootMargin: `0px 0px ${-(NAV_HEIGHT + 12)}px 0px`,
        threshold: [0, 0.01],
      }
    );

    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  return (
    <nav role="navigation" aria-label="Primary" className={`mobile-nav ${hidden ? 'mobile-nav--hidden' : ''}`}>
      <div className="mobile-nav__row">
        {items.map(({ href, label, Icon, match }) => {
          const active = isActive(href, match);
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
              className={`mobile-nav__link ${active ? 'is-active' : ''}`}
            >
              <Icon aria-hidden />
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
