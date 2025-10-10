'use client';
import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminGuard from '../../components/AdminGuard';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/users').then(res => res.json()).then(data => {
      setUsers(data);
      setLoading(false);
    });
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete user?')) return;
    await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    setUsers(users.filter(u => u._id !== id));
  };

  return (
    <AdminGuard>
    <AdminSidebar>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-cyan-400">👥 User Management</h1>
          <p className="text-gray-400 mt-1">Manage user accounts and permissions</p>
        </div>
        
        <div className="bg-[#0f172a] border border-cyan-400 rounded-lg p-8 text-center">
          <div className="text-4xl mb-4">👥</div>
          <h2 className="text-xl font-bold text-cyan-300 mb-2">User Management</h2>
          <p className="text-gray-400 mb-6">
            User management interface will be implemented here. This will include user listings, 
            role management, account status controls and user activity monitoring.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-cyan-500/10 p-4 rounded-lg">
              <div className="text-cyan-400 font-bold text-2xl">0</div>
              <div className="text-gray-400 text-sm">Total Users</div>
            </div>
            <div className="bg-green-500/10 p-4 rounded-lg">
              <div className="text-green-400 font-bold text-2xl">0</div>
              <div className="text-gray-400 text-sm">Active Users</div>
            </div>
            <div className="bg-yellow-500/10 p-4 rounded-lg">
              <div className="text-yellow-400 font-bold text-2xl">0</div>
              <div className="text-gray-400 text-sm">Admin Users</div>
            </div>
          </div>
          
          <p className="text-xs text-gray-500">
            This section is under development. User management features coming soon.
          </p>
        </div>
      </div>
    </AdminSidebar>
    </AdminGuard>
  );
}
