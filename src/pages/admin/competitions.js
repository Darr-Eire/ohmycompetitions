'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminSidebar from '../../components/AdminSidebar';
import AdminGuard from '../../components/AdminGuard';

export default function AdminCompetitionsPage() {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCompetitions = async () => {
      try {
        const res = await fetch('/api/admin/competitions');
        if (!res.ok) throw new Error('Failed to load competitions');
        const data = await res.json();
        console.log('Loaded competitions:', data); // Debug log
        setCompetitions(data);
      } catch (err) {
        console.error('Error loading competitions:', err);
        setError('Failed to load competitions');
      } finally {
        setLoading(false);
      }
    };

    loadCompetitions();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this competition?')) return;
    try {
      const res = await fetch('/api/admin/competitions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Failed to delete competition');
      setCompetitions(prev => prev.filter((comp) => comp._id !== id));
    } catch (err) {
      console.error('Error deleting competition:', err);
      alert('Failed to delete.');
    }
  };

  return (
    <AdminGuard>
    <AdminSidebar>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-cyan-400">🏆 Competition Management</h1>
            <p className="text-gray-400 mt-1">Manage all competitions, prizes and entries</p>
          </div>
          <Link 
            href="/admin/competitions/create"
            className="bg-cyan-500 hover:bg-cyan-600 text-black px-4 py-2 rounded-lg font-bold transition flex items-center gap-2"
          >
            ➕ Create New Competition
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#0f172a] border border-cyan-400 rounded-lg p-4">
            <div className="text-2xl font-bold text-cyan-400">{competitions.length}</div>
            <div className="text-sm text-gray-300">Total Competitions</div>
          </div>
          <div className="bg-[#0f172a] border border-green-400 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-400">
              {competitions.filter(c => c.comp?.status === 'active').length}
            </div>
            <div className="text-sm text-gray-300">Active</div>
          </div>
          <div className="bg-[#0f172a] border border-yellow-400 rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-400">
              {competitions.filter(c => c.comp?.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-300">Pending</div>
          </div>
          <div className="bg-[#0f172a] border border-red-400 rounded-lg p-4">
            <div className="text-2xl font-bold text-red-400">
              {competitions.filter(c => c.comp?.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-300">Completed</div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-400 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading competitions...</p>
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 text-center">
            <h3 className="text-red-400 font-bold mb-2">Error Loading Competitions</h3>
            <p className="text-gray-300">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="bg-[#0f172a] border border-cyan-400 rounded-lg p-6">
            <h2 className="text-xl font-bold text-cyan-300 mb-4">Competition List</h2>
            
            {competitions.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🏆</div>
                <h3 className="text-lg font-bold text-gray-300 mb-2">No Competitions Yet</h3>
                <p className="text-gray-400 mb-4">Create your first competition to get started!</p>
                <Link 
                  href="/admin/competitions/create"
                  className="bg-cyan-500 hover:bg-cyan-600 text-black px-6 py-2 rounded-lg font-bold transition"
                >
                  Create Competition
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-cyan-400/30">
                      <th className="pb-3 text-cyan-300 font-semibold">Title</th>
                      <th className="pb-3 text-cyan-300 font-semibold">Prize</th>
                      <th className="pb-3 text-cyan-300 font-semibold">Theme</th>
                      <th className="pb-3 text-cyan-300 font-semibold">Status</th>
                      <th className="pb-3 text-cyan-300 font-semibold">Tickets</th>
                      <th className="pb-3 text-cyan-300 font-semibold">Entry Fee</th>
                      <th className="pb-3 text-cyan-300 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="space-y-2">
                    {competitions.map((comp, index) => (
                      <tr key={comp._id || index} className="border-b border-gray-700">
                        <td className="py-3">
                          <div className="font-medium text-white">{comp.title}</div>
                          <div className="text-xs text-gray-400">{comp.comp?.slug || comp.slug}</div>
                        </td>
                        <td className="py-3 text-gray-300">{comp.prize}</td>
                        <td className="py-3">
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                            {comp.theme || 'general'}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            comp.comp?.status === 'active' ? 'bg-green-500/20 text-green-400' :
                            comp.comp?.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                            comp.comp?.status === 'completed' ? 'bg-red-500/20 text-red-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {comp.comp?.status || 'Unknown'}
                          </span>
                        </td>
                        <td className="py-3 text-gray-300">
                          <div className="text-sm">
                            <div>{comp.comp?.ticketsSold || 0} / {comp.comp?.totalTickets || 'N/A'}</div>
                            <div className="text-xs text-gray-500">
                              {comp.comp?.totalTickets ? Math.round((comp.comp?.ticketsSold || 0) / comp.comp?.totalTickets * 100) : 0}% sold
                            </div>
                          </div>
                        </td>
                        <td className="py-3 text-gray-300">
                          {comp.comp?.entryFee ? `${comp.comp.entryFee} π` : 'Free'}
                        </td>
                        <td className="py-3"><td className="py-3">
  <div className="flex flex-wrap gap-2">
    <Link
      href={`/admin/competitions/edit/${comp._id}`}
      className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs hover:bg-blue-500/30 transition"
    >
      Edit
    </Link>
    <Link
      href={`/admin/competitions/${comp._id}`}
      className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs hover:bg-green-500/30 transition"
    >
      🏆 Winners
    </Link>
    <button
      onClick={() => handleDelete(comp._id)}
      className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs hover:bg-red-500/30 transition"
    >
      Delete
    </button>
  </div>
</td>

                          <div className="flex gap-2">
                            <Link
                              href={`/admin/competitions/edit/${comp._id}`}
                              className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs hover:bg-blue-500/30 transition"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDelete(comp._id)}
                              className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs hover:bg-red-500/30 transition"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminSidebar>
    </AdminGuard>
  );
}
