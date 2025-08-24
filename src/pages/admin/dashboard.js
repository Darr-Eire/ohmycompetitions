// src/pages/admin/dashboard.js
'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminDashboard() {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const redirectingRef = useRef(false);
  const router = useRouter();

  const goLogin = useCallback(() => {
    if (redirectingRef.current) return;
    redirectingRef.current = true;
    router.push('/admin/login');
  }, [router]);

  const fetchCompetitions = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const u = typeof window !== 'undefined' ? localStorage.getItem('omc_admin_user') : null;
      const p = typeof window !== 'undefined' ? localStorage.getItem('omc_admin_pass') : null;
      if (!u || !p) {
        goLogin();
        return;
      }

      const res = await fetch('/api/admin/competitions', {
        headers: {
          'x-admin-user': u,
          'x-admin-pass': p,
        },
        cache: 'no-store',
      });

      if (res.status === 401 || res.status === 403) {
        goLogin();
        return;
      }
      if (!res.ok) throw new Error(`Failed to load (${res.status})`);

      const data = await res.json();
      setCompetitions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('❌ Error loading competitions:', err);
      setError('Failed to load competitions.');
    } finally {
      setLoading(false);
    }
  }, [goLogin]);

  useEffect(() => {
    fetchCompetitions();
  }, [fetchCompetitions]);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this competition?')) return;

    const u = localStorage.getItem('omc_admin_user');
    const p = localStorage.getItem('omc_admin_pass');
    if (!u || !p) {
      goLogin();
      return;
    }

    // optimistic update
    const prev = competitions;
    setDeletingId(id);
    setCompetitions((cur) => cur.filter((c) => c._id !== id));

    try {
      const res = await fetch(`/api/admin/competitions/${id}`, {
        method: 'DELETE',
        headers: {
          'x-admin-user': u,
          'x-admin-pass': p,
        },
        cache: 'no-store',
      });

      if (res.status === 401 || res.status === 403) {
        goLogin();
        return;
      }
      if (!res.ok) throw new Error(`Delete failed (${res.status})`);
    } catch (err) {
      console.error('❌ Delete failed:', err);
      alert('Failed to delete competition.');
      // rollback
      setCompetitions(prev);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <p className="text-center text-white">Loading competitions...</p>;
  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <p className="mb-4 text-red-500">{error}</p>
        <button
          onClick={fetchCompetitions}
          className="bg-cyan-500 px-4 py-2 rounded font-bold text-black"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8 text-white">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-cyan-400">Admin Competitions Dashboard</h1>
        <div className="flex gap-2">
          <button
            onClick={fetchCompetitions}
            className="bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded"
            title="Refresh"
          >
            ⟳ Refresh
          </button>
          <Link
            href="/admin/competitions/create"
            className="bg-cyan-500 px-4 py-2 rounded font-bold text-black"
          >
            ➕ Add New Competition
          </Link>
        </div>
      </div>

      {competitions.length === 0 ? (
        <div className="mt-6 rounded-lg border border-cyan-400 bg-[#0f172a] p-8 text-center">
          <p className="text-gray-300 mb-4">No competitions found.</p>
          <Link
            href="/admin/competitions/create"
            className="inline-block bg-cyan-500 px-4 py-2 rounded font-bold text-black"
          >
            Create your first competition
          </Link>
        </div>
      ) : (
        <table className="w-full border-collapse bg-[#111827] border border-cyan-400">
          <thead className="bg-[#0f172a]">
            <tr>
              <th className="p-3 border">Title</th>
              <th className="p-3 border">Prize</th>
              <th className="p-3 border">Slug</th>
              <th className="p-3 border">Theme</th>
              <th className="p-3 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {competitions.map((comp) => (
              <tr key={comp._id} className="text-center">
                <td className="p-3 border">{comp.title}</td>
                <td className="p-3 border">{comp.prize}</td>
                <td className="p-3 border">{comp?.comp?.slug || 'N/A'}</td>
                <td className="p-3 border">{comp.theme}</td>
                <td className="p-3 border space-x-2">
                  <Link
                    href={`/admin/competitions/edit/${comp._id}`}
                    className="bg-blue-400 px-2 py-1 rounded text-black"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(comp._id)}
                    className={`px-2 py-1 rounded ${deletingId === comp._id ? 'bg-red-400 cursor-wait' : 'bg-red-500'}`}
                    disabled={deletingId === comp._id}
                    title={deletingId === comp._id ? 'Deleting…' : 'Delete'}
                  >
                    {deletingId === comp._id ? 'Deleting…' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
