// pages/admin/index.js

'use client';
import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div className="p-6 max-w-3xl mx-auto text-white">
      <h1 className="text-3xl font-bold mb-6 text-cyan-300">Admin Panel</h1>

      <div className="space-y-4">
        <Link href="/admin/competitions" className="block bg-[#0b1120] p-4 rounded-lg border border-cyan-400 hover:bg-cyan-900">
          Manage Competitions
        </Link>

        <Link href="/admin/audit-logs" className="block bg-[#0b1120] p-4 rounded-lg border border-green-400 hover:bg-green-900">
          View Audit Logs
        </Link>

        <Link href="/admin/users" className="block bg-[#0b1120] p-4 rounded-lg border border-yellow-400 hover:bg-yellow-900">
          Manage Users
        </Link>
      </div>
    </div>
  );
}
