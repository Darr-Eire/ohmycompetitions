'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function AdminGuard({ children }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      try {
        // Check for admin user in localStorage
        const adminUser = localStorage.getItem('adminUser');
        
        if (!adminUser) {
          console.log('No admin user found in localStorage');
          router.push('/admin/login');
          return;
        }

        const user = JSON.parse(adminUser);
        
        // Verify the user has admin role
        if (!user || user.role !== 'admin') {
          console.log('User is not admin:', user);
          localStorage.removeItem('adminUser'); // Clear invalid session
          router.push('/admin/login');
          return;
        }

        console.log('Admin authenticated:', user.email);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error checking admin auth:', error);
        localStorage.removeItem('adminUser'); // Clear corrupt data
        router.push('/admin/login');
      } finally {
        setLoading(false);
      }
    };

    // Don't redirect if we're already on the login page
    if (router.pathname === '/admin/login') {
      setLoading(false);
      setIsAuthenticated(true); // Allow access to login page
      return;
    }

    checkAuth();
  }, [router]);

  // Loading state
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

  // Not authenticated and not on login page
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
