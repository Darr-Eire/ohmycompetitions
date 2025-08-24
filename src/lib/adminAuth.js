// src/components/AdminGuard.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

/**
 * AdminGuard
 * - Wraps admin-only pages
 * - Calls /api/admin/verify to check credentials
 * - Redirects or blocks access if invalid
 */
export default function AdminGuard({ children }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        // Get stored admin creds from localStorage
        const u = localStorage.getItem('omc_admin_user');
        const p = localStorage.getItem('omc_admin_pass');

        if (!u || !p) {
          setAuthorized(false);
          setLoading(false);
          router.push('/admin/login'); // redirect if missing
          return;
        }

        // Call backend verification
        const res = await axios.get('/api/admin/verify', {
          headers: {
            'x-admin-user': u,
            'x-admin-pass': p,
          },
        });

        if (res.data?.success) {
          setAuthorized(true);
        } else {
          setAuthorized(false);
          router.push('/admin/login');
        }
      } catch (err) {
        console.error('AdminGuard error:', err);
        setAuthorized(false);
        router.push('/admin/login');
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
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
