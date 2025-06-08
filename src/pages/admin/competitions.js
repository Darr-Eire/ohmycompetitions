'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminCompetitionsPage() {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCompetitions = async () => {
      try {
        const res = await fetch('/api/admin/competitions');
        if (!res.ok) throw new Error('Failed to load competitions');
        const data = await res.json();
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

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white p-8 flex items-center justify-center">
        <p className="text-xl font-bold">Loading competitions...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-black text-white p-8 flex items-center justify-center">
        <p className="text-red-400 text-xl font-bold">{error}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white p-8 font-orbitron">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-cyan-400">Admin Competitions</h1>
        <Link href="/admin/competitions/create" className="bg-cyan-500 text-black px-4 py-2 rounded font-bold">
          ➕ Create New
        </Link>
      </div>

      {competitions.length === 0 ? (
        <p>No competitions found.</p>
      ) : (
        <table className="w-full bg-[#0f172a] border border-cyan-400">
          <thead>
            <tr>
              <th className="border p-3">Title</th>
              <th className="border p-3">Prize</th>
              <th className="border p-3">Slug</th>
              <th className="border p-3">Theme</th>
              <th className="border p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {competitions.map((comp) => (
              <tr key={comp._id} className="text-center">
                <td className="border p-3">{comp.title}</td>
                <td className="border p-3">{comp.prize}</td>
                <td className="border p-3">{comp.comp?.slug || 'N/A'}</td>
                <td className="border p-3">{comp.theme}</td>
                <td className="border p-3 space-x-2">
                <Link href={`/admin/competitions/edit/${comp._id}`} className="bg-blue-400 px-2 py-1 rounded text-black">
  Edit
</Link>

                  <button
                    onClick={() => handleDelete(comp._id)}
                    className="bg-red-500 px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
