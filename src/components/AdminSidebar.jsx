'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const adminRoutes = [
  {
    category: 'Dashboard',
    items: [
      { name: 'Overview', href: '/admin', icon: '📊', description: 'Main dashboard' },
      { name: 'Referrals Top', href: '/admin/referrals-top', icon: '🏅', description: 'Top referrers' },
      { name: 'Competitions Health', href: '/admin/competitions-health', icon: '🩺', description: 'Capacity & sales' },
    ]
  },
  {
    category: 'Competition Management',
    items: [
      { name: 'All Competitions', href: '/admin/competitions', icon: '🏆', description: 'Manage competitions' },
      { name: 'Create Competition', href: '/admin/competitions/create', icon: '➕', description: 'Add new competition' },
      { name: 'Vouchers', href: '/admin/vouchers', icon: '🎫', description: 'Manage vouchers' },
      { name: 'Cancel & Refund', href: '/admin/competitions/cancel-refund', icon: '↩️', description: 'Cancel competition and refund' },
    ]
  },
  {
    category: 'Community',
    items: [
      { name: 'Forum Management', href: '/admin/forums', icon: '💬', description: 'Moderate forums' },
      { name: 'User Management', href: '/admin/users', icon: '👥', description: 'Manage users' },
      { name: 'Weekly Referral Rewards', href: '/admin/referrals/weekly-rewards-ui', icon: '🏆', description: 'Process weekly referral rewards' },
    ]
  },
  {
    category: 'Games & Activities',
    items: [
      { name: 'Try Your Skill', href: '/admin/try-your-skill', icon: '🎯', description: 'Game management' },
    ]
  },
  {
    category: 'System',
    items: [
      { name: 'Audit Logs', href: '/admin/audit-logs', icon: '📋', description: 'System logs' },
      { name: 'Admin Logs', href: '/admin/logs', icon: '📝', description: 'Admin activity logs' },
    ]
  },
  {
    category: 'Quick Actions',
    items: [
      { name: 'Main Site', href: '/', icon: '🏠', description: 'Back to website', external: true },
      { name: 'Admin Login', href: '/admin/login', icon: '🔐', description: 'Re-authenticate' },
      { name: 'Logout', href: '#', icon: '🚪', description: 'Sign out of admin', action: 'logout' },
    ]
  }
];

export default function AdminSidebar({ children }) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentTime, setCurrentTime] = useState('');
  const [adminStats, setAdminStats] = useState({
    competitions: 0,
    users: 0,
    threads: 0,
    games: 0
  });

  // current time (client-only)
  useEffect(() => {
    const updateTime = () => setCurrentTime(new Date().toLocaleTimeString());
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Load admin stats with headers so protected APIs work
  const loadStats = useCallback(async () => {
    try {
      const u = typeof window !== 'undefined' ? localStorage.getItem('omc_admin_user') : null;
      const p = typeof window !== 'undefined' ? localStorage.getItem('omc_admin_pass') : null;
     const opts = { cache: 'no-store', credentials: 'include' };
// ...
const [compsRes, forumsRes, trySkillRes] = await Promise.all([
  fetch('/api/admin/competitions', opts).catch(() => ({ ok: false })),
  fetch('/api/admin/forums', opts).catch(() => ({ ok: false })),
  fetch('/api/admin/try-your-skill?action=stats', opts).catch(() => ({ ok: false })),
]);


      const compsData = compsRes.ok ? await compsRes.json() : [];
      const forumsData = forumsRes.ok ? await forumsRes.json() : [];
      const trySkillData = trySkillRes.ok ? await trySkillRes.json() : {};

      setAdminStats({
        competitions: Array.isArray(compsData) ? compsData.length : (compsData?.items?.length ?? 0),
        threads: Array.isArray(forumsData) ? forumsData.length : (forumsData?.items?.length ?? 0),
        users: trySkillData?.userStats?.totalUsers || 0,
        games: (Array.isArray(trySkillData?.gameStats)
          ? trySkillData.gameStats.reduce((t, g) => t + (g.totalPlayed || 0), 0)
          : 0),
      });
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Active route check (handles nested routes)
  const isActiveRoute = (href) => {
    if (!router?.pathname) return false;
    if (href === '/admin') return router.pathname === '/admin';
    return router.pathname.startsWith(href);
  };

  const getStatForRoute = (href) => {
    switch (href) {
      case '/admin/competitions': return adminStats.competitions;
      case '/admin/forums': return adminStats.threads;
      case '/admin/users': return adminStats.users;
      case '/admin/try-your-skill': return adminStats.games;
      default: return null;
    }
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      // clear both new + legacy keys
      localStorage.removeItem('omc_admin_user');
      localStorage.removeItem('omc_admin_pass');
      localStorage.removeItem('adminUser');
      router.push('/admin/login');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-orbitron flex">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-80' : 'w-16'} transition-all duration-300 bg-[#0f172a] border-r border-cyan-400 flex flex-col`}>
        {/* Header */}
        <div className="p-4 border-b border-cyan-400">
          <div className="flex items-center justify-between">
            {isSidebarOpen && (
              <div>
                <h1 className="text-xl font-bold text-cyan-400">🛠️ Admin Panel</h1>
                <p className="text-xs text-gray-400">Management Dashboard</p>
              </div>
            )}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 transition text-cyan-400"
              aria-label="Toggle sidebar"
            >
              {isSidebarOpen ? '◀' : '▶'}
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        {isSidebarOpen && (
          <div className="p-4 border-b border-cyan-400/30">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-cyan-500/10 p-2 rounded text-center">
                <div className="text-cyan-400 font-bold">{adminStats.competitions}</div>
                <div className="text-gray-400">Competitions</div>
              </div>
              <div className="bg-blue-500/10 p-2 rounded text-center">
                <div className="text-blue-400 font-bold">{adminStats.threads}</div>
                <div className="text-gray-400">Threads</div>
              </div>
              <div className="bg-green-500/10 p-2 rounded text-center">
                <div className="text-green-400 font-bold">{adminStats.users}</div>
                <div className="text-gray-400">Users</div>
              </div>
              <div className="bg-purple-500/10 p-2 rounded text-center">
                <div className="text-purple-400 font-bold">{adminStats.games}</div>
                <div className="text-gray-400">Games</div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto">
          {adminRoutes.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-6">
              {isSidebarOpen && (
                <h3 className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {category.category}
                </h3>
              )}

              <nav className="space-y-1">
                {category.items.map((item) => {
                  const isActive = isActiveRoute(item.href);
                  const stat = getStatForRoute(item.href);

                  // Logout action
                  if (item.action === 'logout') {
                    return (
                      <button
                        key={item.name}
                        onClick={handleLogout}
                        className="mx-2 rounded-lg flex items-center px-3 py-2 text-sm transition-all text-gray-300 hover:bg-red-500/20 hover:text-red-300 w-full text-left"
                      >
                        <span className="text-lg mr-3">{item.icon}</span>
                        {isSidebarOpen && (
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{item.name}</span>
                            </div>
                            <p className="text-xs mt-1 text-gray-400">{item.description}</p>
                          </div>
                        )}
                      </button>
                    );
                  }

                  // External link? Use <a>
                  if (item.external) {
                    return (
                      <a
                        key={item.href}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`
                          mx-2 rounded-lg flex items-center px-3 py-2 text-sm transition-all
                          ${isActive 
                            ? 'bg-cyan-500 text-black font-bold shadow-lg' 
                            : 'text-gray-300 hover:bg-cyan-500/20 hover:text-cyan-300'
                          }
                        `}
                      >
                        <span className="text-lg mr-3">{item.icon}</span>
                        {isSidebarOpen && (
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{item.name}</span>
                            </div>
                            <p className={`text-xs mt-1 ${isActive ? 'text-black/70' : 'text-gray-400'}`}>
                              {item.description}
                            </p>
                          </div>
                        )}
                      </a>
                    );
                  }

                  // Internal link
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`
                        mx-2 rounded-lg flex items-center px-3 py-2 text-sm transition-all
                        ${isActive 
                          ? 'bg-cyan-500 text-black font-bold shadow-lg' 
                          : 'text-gray-300 hover:bg-cyan-500/20 hover:text-cyan-300'
                        }
                      `}
                    >
                      <span className="text-lg mr-3">{item.icon}</span>
                      {isSidebarOpen && (
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{item.name}</span>
                            {stat !== null && (
                              <span className={`
                                text-xs px-2 py-1 rounded-full
                                ${isActive ? 'bg-black/20 text-black' : 'bg-cyan-500/20 text-cyan-400'}
                              `}>
                                {stat}
                              </span>
                            )}
                          </div>
                          <p className={`text-xs mt-1 ${isActive ? 'text-black/70' : 'text-gray-400'}`}>
                            {item.description}
                          </p>
                        </div>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Footer */}
        {isSidebarOpen && (
          <div className="p-4 border-t border-cyan-400/30">
            <div className="text-xs text-gray-400 text-center">
              <div className="mb-2">🚀 OhMyCompetitions</div>
              <div className="text-[10px]">Admin Panel v1.0</div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <div className="bg-[#0f172a] border-b border-cyan-400 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-cyan-300">
                {adminRoutes.flatMap(cat => cat.items).find(item => isActiveRoute(item.href))?.name || 'Admin Dashboard'}
              </h2>
              <p className="text-sm text-gray-400">
                {adminRoutes.flatMap(cat => cat.items).find(item => isActiveRoute(item.href))?.description || 'Manage your platform'}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-xs text-gray-400">
                {currentTime && `Last updated: ${currentTime}`}
              </div>
              <Link
                href="/admin/login"
                className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-xs hover:bg-red-500/30 transition"
              >
                🔐 Re-auth
              </Link>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 p-6 bg-black overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
