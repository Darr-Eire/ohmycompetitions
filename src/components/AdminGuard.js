// src/components/AdminGuard.js
'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';

/**
 * AdminGuard
 * - Verifies admin session via /api/admin/whoami (cookie-based).
 * - Redirects to /admin/login?next=<currentPath> if unauthorized.
 * - No localStorage, no header creds.
 */
export default function AdminGuard({ children }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const redirectedRef = useRef(false);

  useEffect(() => {
    let alive = true;

    async function verify() {
      try {
        // hit whoami to validate the signed cookie
        const res = await fetch('/api/admin/whoami', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Cache-Control': 'no-cache' },
        });

        const data = await res.json().catch(() => ({}));
        if (!alive) return;

        if (data?.sessionValid && data?.session?.role === 'admin') {
          setAuthorized(true);
        } else {
          // prevent multiple redirects
          if (!redirectedRef.current) {
            redirectedRef.current = true;
            const next = encodeURIComponent(router.asPath || '/admin/competitions');
            router.replace(`/admin/login?next=${next}`);
          }
        }
      } catch (err) {
        console.error('AdminGuard error:', err);
        if (!redirectedRef.current) {
          redirectedRef.current = true;
          const next = encodeURIComponent(router.asPath || '/admin/competitions');
          router.replace(`/admin/login?next=${next}`);
        }
      } finally {
        if (alive) setLoading(false);
      }
    }

    verify();
    return () => { alive = false; };
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-cyan-300">
        Checking admin access...
      </div>
    );
  }

  if (!authorized) {
    // brief fallback UI while redirecting (should be momentary)
    return (
      <div className="flex h-screen items-center justify-center text-red-500">
        Redirecting to admin login…
      </div>
    );
  }

  return <>{children}</>;
}
