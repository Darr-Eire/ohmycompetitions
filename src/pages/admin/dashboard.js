// file: src/pages/admin/index.js (or wherever you mount this)
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

/* --------------------------- auth header helpers --------------------------- */
function getStoredAdminPair() {
  try {
    const raw = localStorage.getItem('adminUser'); // JSON: { username, password, ... }
    const obj = raw ? JSON.parse(raw) : null;
    const u =
      obj?.username ??
      localStorage.getItem('omc_admin_user') ??
      localStorage.getItem('adminUser'); // fallback to plain string if someone stored it raw
    const p =
      obj?.password ??
      localStorage.getItem('omc_admin_pass') ??
      localStorage.getItem('adminPass');
    return { u: (u || '').trim(), p: (p || '').trim() };
  } catch {
    return { u: '', p: '' };
  }
}
function basicAuthHeader(u, p) {
  if (!u || !p) return {};
  const token = typeof window !== 'undefined' ? btoa(`${u}:${p}`) : '';
  return token ? { Authorization: `Basic ${token}` } : {};
}
function adminHeadersCompat() {
  const { u, p } = getStoredAdminPair();
  return {
    ...basicAuthHeader(u, p), // for routes using Basic Auth
    'x-admin-user': u,        // for routes using requireAdmin(req)
    'x-admin-pass': p,
  };
}

export default function AdminDashboard() {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const router = useRouter();
  const pathname = usePathname();

  const authHeaders = useMemo(() => adminHeadersCompat(), []);

  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        const { u, p } = getStoredAdminPair();
        if (!u || !p) throw new Error('Missing admin credentials');

        const res = await fetch('/api/admin/competitions', {
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders,
          },
          credentials: 'include',
          cache: 'no-store',
        });

        const data = await res.json().catch(() => []);
        if (!res.ok) {
          const msg = (data && (data.message || data.error)) || 'Unauthorized';
          throw new Error(msg);
        }

        // Accept array or {competitions:[]}
        const list = Array.isArray(data) ? data : data.competitions || [];
        setCompetitions(list);
      } catch (err) {
        console.error('❌ Error loading competitions:', err);
        setError(err.message || 'Failed to load competitions');

        // Redirect to login if we have an admin area
        if (pathname !== '/admin/login') {
          router.push('/admin/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCompetitions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this competition?')) return;

    try {
      const res = await fetch(`/api/admin/competitions/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        credentials: 'include',
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data.message || 'Failed to delete';
        throw new Error(msg);
      }

      setCompetitions((prev) => prev.filter((c) => String(c._id) !== String(id)));
    } catch (err) {
      console.error('❌ Delete failed:', err);
      alert(`Failed to delete competition: ${err.message}`);
    }
  };

  if (loading) return <p className="text-center text-white">Loading competitions...</p>;
  if (error)
    return (
      <div className="max-w-3xl mx-auto p-6">
        <p className="text-center text-red-400 font-medium">{error}</p>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto p-8 text-white">
      <h1 className="text-3xl font-bold mb-6 text-cyan-400">Admin Competitions Dashboard</h1>

      <Link
        href="/admin/competitions/create"
        className="mb-4 inline-block bg-cyan-500 px-4 py-2 rounded font-bold text-black hover:bg-cyan-400"
      >
        ➕ Add New Competition
      </Link>

      <div className="overflow-x-auto rounded border border-cyan-400">
        <table className="w-full border-collapse bg-[#111827]">
          <thead className="bg-[#0f172a]">
            <tr>
              <th className="p-3 border border-cyan-400/40 text-left">Title</th>
              <th className="p-3 border border-cyan-400/40 text-left">Prize</th>
              <th className="p-3 border border-cyan-400/40 text-left">Slug</th>
              <th className="p-3 border border-cyan-400/40 text-left">Theme</th>
              <th className="p-3 border border-cyan-400/40 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {competitions.map((comp) => (
              <tr key={comp._id} className="border-t border-cyan-400/20">
                <td className="p-3">{comp.title || comp?.comp?.title || 'Untitled'}</td>
                <td className="p-3">{comp.prize ?? comp?.comp?.prize ?? '—'}</td>
                <td className="p-3">{comp?.comp?.slug || comp.slug || 'N/A'}</td>
                <td className="p-3">{comp.theme || comp?.comp?.theme || '—'}</td>
                <td className="p-3 space-x-2">
                  <Link
                    href={`/admin/competitions/${comp._id}`}
                    className="inline-block bg-cyan-500 px-2 py-1 rounded text-black hover:bg-cyan-400"
                  >
                    View
                  </Link>
                  <Link
                    href={`/admin/competitions/edit/${comp._id}`}
                    className="inline-block bg-blue-400 px-2 py-1 rounded text-black hover:bg-blue-300"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(comp._id)}
                    className="inline-block bg-red-500 px-2 py-1 rounded hover:bg-red-400"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {competitions.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-400">
                  No competitions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
