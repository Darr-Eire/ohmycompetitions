'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, competitions: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch('/api/admin/stats');
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error('Failed to load stats', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-8 font-orbitron">
      <h1 className="text-4xl font-bold mb-8 text-cyan-300">Admin Dashboard</h1>

      <div className="space-y-4 mb-10">
        <Link href="/admin/competitions" className="block bg-[#0b1120] p-4 rounded-lg border border-cyan-400 hover:bg-cyan-900">
          Manage Competitions
        </Link>

        <Link href="/admin/users" className="block bg-[#0b1120] p-4 rounded-lg border border-yellow-400 hover:bg-yellow-900">
          Manage Users
        </Link>

        <Link href="/admin/audit-logs" className="block bg-[#0b1120] p-4 rounded-lg border border-green-400 hover:bg-green-900">
          View Audit Logs
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#0f172a] border border-cyan-400 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-2">Total Users</h2>
          <p className="text-3xl">{loading ? '...' : stats.users}</p>
        </div>

        <div className="bg-[#0f172a] border border-cyan-400 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-2">Total Competitions</h2>
          <p className="text-3xl">{loading ? '...' : stats.competitions}</p>
        </div>
      </div>
    </div>
  );
}
