'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function AdminGuard({ children }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!router?.isReady) return; // wait for router to be ready

    const checkAuth = () => {
      try {
        // 1) Primary: role-based admin session (your existing flow)
        const adminUserRaw = localStorage.getItem('adminUser');
        let adminUser = null;

        if (adminUserRaw) {
          try {
            adminUser = JSON.parse(adminUserRaw);
          } catch {
            // If stored accidentally as a plain string, clear it
            localStorage.removeItem('adminUser');
          }
        }

        const hasRoleAdmin = !!(adminUser && adminUser.role === 'admin');

        // 2) Secondary: header creds for API gate (from adminClient.js)
        const headerUser = localStorage.getItem('omc_admin_user');
        const headerPass = localStorage.getItem('omc_admin_pass');
        const hasHeaderCreds = !!(headerUser && headerPass);

        // Consider authenticated if either condition passes
        const ok = hasRoleAdmin || hasHeaderCreds;

        if (!ok) {
          // Not authenticated -> redirect to login unless we're already there
          if (router.pathname !== '/admin/login') {
            router.push('/admin/login');
          }
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('❌ Error checking admin auth:', error);
        localStorage.removeItem('adminUser');
        // Do not remove omc_admin_* automatically; user may be using header-only auth
        if (router.pathname !== '/admin/login') {
          router.push('/admin/login');
        }
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
    // Re-run if path changes (prevents flicker when navigating directly to /admin/*)
  }, [router?.isReady, router?.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b1120] text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-cyan-300">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If not authenticated and not on login, show a friendly guard while redirecting
  if (!isAuthenticated && router.pathname !== '/admin/login') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b1120] text-white">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">🔒 Access Denied</div>
          <p className="text-gray-300">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return children;
}
