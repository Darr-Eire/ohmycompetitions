// src/components/AdminGuard.js
'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

/**
 * AdminGuard
 * - Wraps admin-only pages.
 * - Reads admin creds from localStorage (omc_admin_user / omc_admin_pass).
 * - Verifies via /api/admin/verify (which calls requireAdmin on the server).
 * - Redirects to /admin/login when unauthorized.
 */
export default function AdminGuard({ children }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const redirectedRef = useRef(false);

  useEffect(() => {
    let alive = true;

    async function checkAuth() {
      try {
        if (typeof window === 'undefined') return;

        const u = window.localStorage.getItem('omc_admin_user');
        const p = window.localStorage.getItem('omc_admin_pass');

        if (!u || !p) {
          if (!redirectedRef.current) {
            redirectedRef.current = true;
            setAuthorized(false);
            setLoading(false);
            router.push('/admin/login');
          }
          return;
        }

        const res = await axios.get('/api/admin/verify', {
          headers: { 'x-admin-user': u, 'x-admin-pass': p },
          // bust any edge cache
          params: { ts: Date.now() },
        });

        if (!alive) return;

        if (res.data?.success) {
          setAuthorized(true);
        } else {
          if (!redirectedRef.current) {
            redirectedRef.current = true;
            setAuthorized(false);
            router.push('/admin/login');
          }
        }
      } catch (err) {
        console.error('AdminGuard verify error:', err?.message || err);
        if (!redirectedRef.current) {
          redirectedRef.current = true;
          setAuthorized(false);
          router.push('/admin/login');
        }
      } finally {
        if (alive) setLoading(false);
      }
    }

    checkAuth();
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
    return (
      <div className="flex h-screen items-center justify-center text-red-500">
        Access denied
      </div>
    );
  }

  return <>{children}</>;
}
