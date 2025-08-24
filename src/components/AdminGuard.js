// src/components/AdminGuard.js
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminGuard({ children }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const u = localStorage.getItem('omc_admin_user');
        const p = localStorage.getItem('omc_admin_pass');

        if (!u || !p) {
          setAuthorized(false);
          setLoading(false);
          router.push('/admin/login');
          return;
        }

        const res = await fetch('/api/admin/verify', {
          headers: {
            'x-admin-user': u,
            'x-admin-pass': p,
          },
          cache: 'no-store',
        });

        if (!res.ok) {
          setAuthorized(false);
          router.push('/admin/login');
          return;
        }

        const data = await res.json();
        setAuthorized(Boolean(data?.success));
      } catch (err) {
        console.error('AdminGuard auth check failed:', err);
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
