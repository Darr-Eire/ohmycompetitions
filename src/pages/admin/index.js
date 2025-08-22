'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import AdminSidebar from '../../components/AdminSidebar';
import AdminGuard from '../../components/AdminGuard';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    competitions: 0,
    threads: 0,
    users: 0,
    gameResults: 0,
    vouchersActive: 0,
  });
  const [loading, setLoading] = useState(true);

  // NEW: data for added widgets
  const [activityFeed, setActivityFeed] = useState([]);
  const [topReferrals, setTopReferrals] = useState([]);
  const [competitionHealth, setCompetitionHealth] = useState([]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);

      const [
        competitionsRes,
        forumsRes,
        tryYourLuckRes,
        voucherStatsRes,
        activityRes,
        referralsRes,
        healthRes,
      ] = await Promise.all([
        axios.get('/api/admin/competitions').catch(() => ({ data: [] })),
        axios.get('/api/admin/forums').catch(() => ({ data: [] })),
        axios
          .get('/api/admin/try-your-luck?action=stats')
          .catch(() => ({ data: { userStats: { totalUsers: 0 }, gameStats: [] } })),
        axios
          .get('/api/admin/voucher-stats', { headers: { 'x-admin': 'true' } })
          .catch(() => ({ data: { active: 0 } })),
        // NEW endpoints (safe fallbacks)
        axios.get('/api/admin/activity').catch(() => ({ data: [] })),
        axios.get('/api/admin/referrals/top').catch(() => ({ data: [] })),
        axios.get('/api/admin/competitions/health').catch(() => ({ data: [] })),
      ]);

      setStats({
        competitions: competitionsRes.data.length || 0,
        threads: forumsRes.data.length || 0,
        users: tryYourLuckRes.data.userStats?.totalUsers || 0,
        gameResults:
          tryYourLuckRes.data.gameStats?.reduce((total, game) => total + game.totalPlayed, 0) || 0,
        vouchersActive: voucherStatsRes.data?.active || 0,
      });

      setActivityFeed(activityRes.data || []);
      setTopReferrals(referralsRes.data || []);
      setCompetitionHealth(healthRes.data || []);
    } catch (err) {
      console.error('Error loading admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const Tile = ({ icon, value, label, border }) => (
    <div className={`bg-[#0f172a] border border-${border}-400 rounded-xl p-6 text-center shadow-sm`}>
      <div className="text-4xl mb-2">{icon}</div>
      <div className={`text-3xl font-bold text-${border}-400`}>{value}</div>
      <div className="text-sm text-white/60">{label}</div>
    </div>
  );

  const adminSections = [
    {
      title: 'Competitions',
      description: 'Manage competitions, prizes and entries',
      href: '/admin/competitions',
      icon: '🏆',
      color: 'cyan',
      stat: stats.competitions,
      statLabel: 'Active Competitions',
    },
    {
      title: 'Ticket Vouchers',
      description: 'Generate codes & grant tickets',
      href: '/admin/vouchers',
      icon: '🎟️',
      color: 'pink',
      stat: stats.vouchersActive,
      statLabel: 'Active Vouchers',
    },
    {
      title: 'Forums',
      description: 'Moderate forum threads and discussions',
      href: '/admin/forums',
      icon: '💬',
      color: 'blue',
      stat: stats.threads,
      statLabel: 'Forum Threads',
    },
    {
      title: 'Try Your Luck',
      description: 'Monitor games, stats and player activity',
      href: '/admin/try-your-luck',
      icon: '🎯',
      color: 'purple',
      stat: stats.gameResults,
      statLabel: 'Games Played',
    },
    {
      title: 'Users',
      description: 'View and manage user accounts',
      href: '/admin/users',
      icon: '👥',
      color: 'green',
      stat: stats.users,
      statLabel: 'Total Users',
    },
    {
      title: 'Audit Logs',
      description: 'Review system activity and changes',
      href: '/admin/audit-logs',
      icon: '📋',
      color: 'yellow',
      stat: '—',
      statLabel: 'Security Logs',
    },
    {
      title: 'Pi Cash Codes',
      description: 'Generate and manage Pi Cash Codes',
      href: '/admin/pi-cash-codes',
      icon: '💰',
      color: 'orange',
      stat: '—',
      statLabel: 'Weekly Codes',
    },
  ];

  return (
    <AdminGuard>
      <AdminSidebar>
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="text-center my-10">
            <h1 className="text-4xl font-bold text-cyan-400 mb-2">🛠️ Admin Dashboard</h1>
            <p className="text-white/70">Manage competitions, users, games & forums</p>
            {loading && <p className="text-cyan-300 mt-2">Loading statistics...</p>}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            <Tile icon="🏆" value={stats.competitions} label="Competitions" border="cyan" />
            <Tile icon="💬" value={stats.threads} label="Forum Threads" border="blue" />
            <Tile icon="👥" value={stats.users} label="Users" border="green" />
            <Tile icon="🎯" value={stats.gameResults} label="Games Played" border="purple" />
          </div>

          {/* Sections Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {adminSections.map((section) => (
              <Link key={section.href} href={section.href}>
                <div
                  className={`bg-[#0f172a] border border-${section.color}-500 hover:border-${section.color}-300 p-5 rounded-xl transition duration-150 group`}
                >
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-3xl">{section.icon}</div>
                    <div className={`text-2xl font-bold text-${section.color}-400`}>{section.stat}</div>
                  </div>
                  <h3
                    className={`text-lg font-semibold text-${section.color}-300 group-hover:text-${section.color}-200`}
                  >
                    {section.title}
                  </h3>
                  <p className="text-white/60 text-sm mt-1">{section.description}</p>
                  <div className={`text-xs mt-2 text-${section.color}-300 font-medium`}>
                    {section.statLabel}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Quick Actions (kept) */}
          <div className="bg-[#0f172a] border border-cyan-500 rounded-xl p-6 mb-10">
            <h2 className="text-xl font-bold text-cyan-300 mb-4">🚀 Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                href="/admin/competitions/create"
                className="bg-cyan-500 hover:bg-cyan-600 text-black px-4 py-3 rounded font-semibold text-center"
              >
                ➕ Create Competition
              </Link>
              <button
                onClick={loadStats}
                className="bg-gray-600 hover:bg-gray-700 px-4 py-3 rounded font-semibold"
              >
                🔄 Refresh Statistics
              </button>
              <Link
                href="/"
                className="bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded font-semibold text-center"
              >
                🏠 Back to Site
              </Link>
              <Link
                href="/admin/vouchers"
                className="bg-pink-500 hover:bg-pink-600 text-black px-4 py-3 rounded font-semibold text-center"
              >
                🎟️ Manager Vouchers
              </Link>
            </div>
          </div>


          {/* NEW: Referral Leaderboard */}
          <div className="bg-[#0f172a] border border-pink-500 rounded-xl p-6 mb-10">
            <h2 className="text-xl font-bold text-pink-300 mb-4">🏅 Top Referrers</h2>
            {topReferrals.length === 0 ? (
              <p className="text-white/60">No referral data yet.</p>
            ) : (
              <ul className="divide-y divide-white/10">
                {topReferrals.slice(0, 8).map((r, i) => (
                  <li key={i} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">
                        {i === 0 ? '👑' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                      </span>
                      <div>
                        <div className="text-white font-semibold">{r.username || 'Unknown'}</div>
                        <div className="text-xs text-white/60">{r.referrals} referrals</div>
                      </div>
                    </div>
                    <Link
                      href={`/admin/users/${r.userId || ''}`}
                      className="text-cyan-300 hover:underline text-sm"
                    >
                      View Profile
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* NEW: Recent Activity */}
          <div className="bg-[#0f172a] border border-cyan-400 rounded-xl p-6 mb-10">
            <h2 className="text-xl font-bold text-cyan-300 mb-4">📜 Recent Activity</h2>
            {activityFeed.length === 0 ? (
              <p className="text-white/60">No recent activity.</p>
            ) : (
              <ul className="space-y-3 text-sm">
                {activityFeed.slice(0, 15).map((entry, i) => (
                  <li
                    key={i}
                    className="bg-white/5 border border-white/10 p-3 rounded flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span>{iconForActivity(entry.type)}</span>
                      <div>
                        <div className="text-white font-semibold">{entry.message}</div>
                        <div className="text-gray-400">
                          {new Date(entry.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    {entry.href ? (
                      <Link href={entry.href} className="text-cyan-300 hover:underline">
                        View
                      </Link>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* NEW: Competition Health */}
          <div className="bg-[#0f172a] border border-orange-500 rounded-xl p-6 mb-12">
            <h2 className="text-xl font-bold text-orange-300 mb-4">📊 Competition Health</h2>
            {competitionHealth.length === 0 ? (
              <p className="text-white/60">No health alerts.</p>
            ) : (
              <div className="space-y-4">
                {competitionHealth.map((c, i) => (
                  <div key={i} className="bg-white/5 rounded p-4 border border-orange-300">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                      <span className="text-lg font-bold text-white">{c.title}</span>
                      <div className="flex items-center gap-2">
                        <HealthPill label={c.status || 'Active'} tone="green" />
                        {c.warning && <HealthPill label={c.warning} tone="yellow" />}
                        {c.critical && <HealthPill label={c.critical} tone="red" />}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-white/80">
                      <div>Tickets: {c.ticketsSold} / {c.totalTickets}</div>
                      <div>Ends: {c.endsAt ? new Date(c.endsAt).toLocaleString() : '—'}</div>
                      <div>Sell-through: {pct(c.ticketsSold, c.totalTickets)}%</div>
                    </div>
                    <div className="mt-3">
                      <Link
                        href={`/admin/competitions/${c.id}`}
                        className="text-cyan-300 hover:underline text-sm"
                      >
                        Manage
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* System Status (kept) */}
          <div className="bg-[#0f172a] border border-green-500 rounded-xl p-6">
            <h2 className="text-xl font-bold text-green-300 mb-4">✅ System Status</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-white/80">
              <div>
                <p className="flex justify-between py-1">
                  <span>Database:</span>
                  <span className="text-green-400 font-bold">Connected</span>
                </p>
                <p className="flex justify-between py-1">
                  <span>Competitions API:</span>
                  <span className="text-green-400 font-bold">Operational</span>
                </p>
                <p className="flex justify-between py-1">
                  <span>Forums API:</span>
                  <span className="text-green-400 font-bold">Operational</span>
                </p>
              </div>
              <div>
                <p className="flex justify-between py-1">
                  <span>Try Your Luck API:</span>
                  <span className="text-green-400 font-bold">Operational</span>
                </p>
                <p className="flex justify-between py-1">
                  <span>Pi Integration:</span>
                  <span className="text-green-400 font-bold">Active</span>
                </p>
                <p className="flex justify-between py-1">
                  <span>Payment System:</span>
                  <span className="text-green-400 font-bold">Active</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </AdminSidebar>
    </AdminGuard>
  );
}

/* ---------- helpers (UI) ---------- */

function ToolButton({ icon, label, href }) {
  return (
    <Link
      href={href}
      className="bg-[#1e293b] hover:bg-cyan-800/20 border border-white/10 rounded-lg p-4 flex items-center gap-3 transition"
    >
      <span className="text-xl">{icon}</span>
      <span className="text-white font-medium">{label}</span>
    </Link>
  );
}

function HealthPill({ label, tone = 'yellow' }) {
  const tones = {
    green: 'bg-green-500/15 text-green-300 border-green-400',
    yellow: 'bg-yellow-500/15 text-yellow-300 border-yellow-400',
    red: 'bg-red-500/15 text-red-300 border-red-400',
  };
  return (
    <span className={`text-xs px-2 py-1 rounded-full border ${tones[tone] || tones.yellow}`}>
      {label}
    </span>
  );
}

function pct(a, b) {
  if (!b) return 0;
  return Math.round(((a || 0) / b) * 100);
}

function iconForActivity(type) {
  switch (type) {
    case 'winner': return '🏆';
    case 'voucher': return '🎟️';
    case 'payment': return '💸';
    case 'signup': return '🆕';
    case 'login': return '🔐';
    case 'game': return '🎯';
    case 'error': return '🚨';
    default: return '📌';
  }
}
