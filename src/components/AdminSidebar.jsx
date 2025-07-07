'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const adminRoutes = [
  {
    category: 'Dashboard',
    items: [
      { name: 'Overview', href: '/admin', icon: '📊', description: 'Main dashboard' },
    ]
  },
  {
    category: 'Competition Management',
    items: [
      { name: 'All Competitions', href: '/admin/competitions', icon: '🏆', description: 'Manage competitions' },
      { name: 'Create Competition', href: '/admin/competitions/create', icon: '➕', description: 'Add new competition' },
      { name: 'Seed Competitions', href: '/admin/seed-competitions', icon: '🌱', description: 'Add predefined competitions' },
    ]
  },
  {
    category: 'Community',
    items: [
      { name: 'Forum Management', href: '/admin/forums', icon: '💬', description: 'Moderate forums' },
      { name: 'User Management', href: '/admin/users', icon: '👥', description: 'Manage users' },
    ]
  },
  {
    category: 'Games & Activities',
    items: [
      { name: 'Try Your Luck', href: '/admin/try-your-luck', icon: '🎯', description: 'Game management' },
    ]
  },
  {
    category: 'System',
    items: [
      { name: 'Audit Logs', href: '/admin/audit-logs', icon: '📋', description: 'System logs' },
    ]
  },
  {
    category: 'Quick Actions',
    items: [
      { name: 'Main Site', href: '/', icon: '🏠', description: 'Back to website', external: true },
      { name: 'Admin Login', href: '/admin/login', icon: '🔐', description: 'Re-authenticate' },
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

  // Set current time only on client side to avoid hydration mismatch
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString());
    };
    
    updateTime(); // Set initial time
    const interval = setInterval(updateTime, 1000); // Update every second
    
    return () => clearInterval(interval);
  }, []);

  // Load admin stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        const [compsRes, forumsRes, tryLuckRes] = await Promise.all([
          fetch('/api/admin/competitions').catch(() => ({ ok: false })),
          fetch('/api/admin/forums').catch(() => ({ ok: false })),
          fetch('/api/admin/try-your-luck?action=stats').catch(() => ({ ok: false }))
        ]);

        // Read each response only once to avoid "body stream already read" error
        const compsData = compsRes.ok ? await compsRes.json() : [];
        const forumsData = forumsRes.ok ? await forumsRes.json() : [];
        const tryLuckData = tryLuckRes.ok ? await tryLuckRes.json() : {};

        const stats = {
          competitions: compsData.length || 0,
          threads: forumsData.length || 0,
          users: tryLuckData.userStats?.totalUsers || 0,
          games: tryLuckData.gameStats?.reduce((total, game) => total + (game.totalPlayed || 0), 0) || 0
        };

        setAdminStats(stats);
      } catch (error) {
        console.error('Failed to load admin stats:', error);
      }
    };

    loadStats();
  }, []);

  const isActiveRoute = (href) => {
    if (href === '/admin' && router.pathname === '/admin') return true;
    if (href !== '/admin' && router.pathname.startsWith(href)) return true;
    return false;
  };

  const getStatForRoute = (href) => {
    switch (href) {
      case '/admin/competitions': return adminStats.competitions;
      case '/admin/forums': return adminStats.threads;
      case '/admin/users': return adminStats.users;
      case '/admin/try-your-luck': return adminStats.games;
      default: return null;
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
                {adminRoutes
                  .flatMap(cat => cat.items)
                  .find(item => isActiveRoute(item.href))?.name || 'Admin Dashboard'}
              </h2>
              <p className="text-sm text-gray-400">
                {adminRoutes
                  .flatMap(cat => cat.items)
                  .find(item => isActiveRoute(item.href))?.description || 'Manage your platform'}
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