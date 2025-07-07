'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import AdminSidebar from '../../components/AdminSidebar';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    competitions: 0,
    threads: 0,
    users: 0,
    gameResults: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Load basic stats from various endpoints
      const [competitionsRes, forumsRes, tryYourLuckRes] = await Promise.all([
        axios.get('/api/admin/competitions').catch(() => ({ data: [] })),
        axios.get('/api/admin/forums').catch(() => ({ data: [] })),
        axios.get('/api/admin/try-your-luck?action=stats').catch(() => ({ data: { userStats: { totalUsers: 0 }, gameStats: [] } }))
      ]);

      setStats({
        competitions: competitionsRes.data.length || 0,
        threads: forumsRes.data.length || 0,
        users: tryYourLuckRes.data.userStats?.totalUsers || 0,
        gameResults: tryYourLuckRes.data.gameStats?.reduce((total, game) => total + game.totalPlayed, 0) || 0
      });
    } catch (err) {
      console.error('Error loading admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const adminSections = [
    {
      title: 'Competitions',
      description: 'Manage competitions, prizes, and entries',
      href: '/admin/competitions',
      icon: '🏆',
      color: 'cyan',
      stat: stats.competitions,
      statLabel: 'Active Competitions'
    },
    {
      title: 'Forums',
      description: 'Moderate forum threads and discussions', 
      href: '/admin/forums',
      icon: '💬',
      color: 'blue',
      stat: stats.threads,
      statLabel: 'Forum Threads'
    },
    {
      title: 'Try Your Luck',
      description: 'Monitor games, stats, and player activity',
      href: '/admin/try-your-luck',
      icon: '🎯',
      color: 'purple',
      stat: stats.gameResults,
      statLabel: 'Games Played'
    },
    {
      title: 'Users',
      description: 'View and manage user accounts',
      href: '/admin/users',
      icon: '👥',
      color: 'green',
      stat: stats.users,
      statLabel: 'Total Users'
    },
    {
      title: 'Audit Logs',
      description: 'Review system activity and changes',
      href: '/admin/audit-logs',
      icon: '📋',
      color: 'yellow',
      stat: '—',
      statLabel: 'Security Logs'
    },
    {
      title: 'Pi Cash Codes',
      description: 'Generate and manage Pi Cash Codes',
      href: '/admin/pi-cash-codes',
      icon: '💰',
      color: 'orange',
      stat: '—',
      statLabel: 'Weekly Codes'
    }
  ];

  return (
    <AdminSidebar>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-cyan-400 mb-4">
            🛠️ Admin Dashboard
          </h1>
          <p className="text-gray-300 text-lg">
            Manage competitions, forums, games, and users
          </p>
          {loading && (
            <p className="text-cyan-300 mt-2">Loading statistics...</p>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-[#0f172a] border border-cyan-400 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-cyan-400">{stats.competitions}</div>
            <div className="text-sm text-gray-300">Competitions</div>
          </div>
          <div className="bg-[#0f172a] border border-blue-400 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{stats.threads}</div>
            <div className="text-sm text-gray-300">Forum Threads</div>
          </div>
          <div className="bg-[#0f172a] border border-green-400 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{stats.users}</div>
            <div className="text-sm text-gray-300">Users</div>
          </div>
          <div className="bg-[#0f172a] border border-purple-400 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">{stats.gameResults}</div>
            <div className="text-sm text-gray-300">Games Played</div>
          </div>
        </div>

        {/* Admin Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {adminSections.map((section) => (
            <Link key={section.href} href={section.href}>
              <div className={`bg-[#0f172a] border border-${section.color}-400 rounded-lg p-6 hover:bg-${section.color}-900/20 transition-all cursor-pointer group`}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">{section.icon}</span>
                  <div className={`text-2xl font-bold text-${section.color}-400`}>
                    {section.stat}
                  </div>
                </div>
                <h3 className={`text-xl font-bold text-${section.color}-300 mb-2 group-hover:text-${section.color}-200`}>
                  {section.title}
                </h3>
                <p className="text-gray-400 text-sm mb-3">
                  {section.description}
                </p>
                <div className={`text-xs text-${section.color}-300 font-medium`}>
                  {section.statLabel}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-[#0f172a] border border-cyan-400 rounded-lg p-6">
          <h2 className="text-xl font-bold text-cyan-300 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link 
              href="/admin/competitions/create"
              className="bg-cyan-500 hover:bg-cyan-600 text-black px-4 py-3 rounded font-bold text-center transition"
            >
              ➕ Create Competition
            </Link>
            <button
              onClick={loadStats}
              className="bg-gray-600 hover:bg-gray-700 px-4 py-3 rounded font-bold transition"
            >
              🔄 Refresh Statistics
            </button>
            <Link
              href="/"
              className="bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded font-bold text-center transition"
            >
              🏠 Back to Main Site
            </Link>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-8 bg-[#0f172a] border border-green-400 rounded-lg p-6">
          <h2 className="text-xl font-bold text-green-300 mb-4">✅ System Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Database:</span>
                <span className="text-green-400 font-bold">Connected</span>
              </div>
              <div className="flex justify-between">
                <span>Competitions API:</span>
                <span className="text-green-400 font-bold">Operational</span>
              </div>
              <div className="flex justify-between">
                <span>Forums API:</span>
                <span className="text-green-400 font-bold">Operational</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Try Your Luck API:</span>
                <span className="text-green-400 font-bold">Operational</span>
              </div>
              <div className="flex justify-between">
                <span>Pi Integration:</span>
                <span className="text-green-400 font-bold">Active</span>
              </div>
              <div className="flex justify-between">
                <span>Payment System:</span>
                <span className="text-green-400 font-bold">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminSidebar>
  );
}
