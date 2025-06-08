'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminCompetitionsPage() {
  const router = useRouter();
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        const res = await fetch('/api/admin/competitions');
        const data = await res.json();

        if (!Array.isArray(data)) {
          console.error('Unexpected data shape:', data);
          setCompetitions([]);
        } else {
          setCompetitions(data);
        }
      } catch (err) {
        console.error('Failed to fetch competitions:', err);
        setCompetitions([]);
      }
      setLoading(false);
    };

    fetchCompetitions();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this competition?')) return;

    try {
      const res = await fetch(`/api/admin/competitions/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCompetitions(prev => prev.filter(c => c._id !== id));
      }
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  if (loading) {
    return <div className="text-white text-center py-10">Loading competitions...</div>;
  }

  return (
    <main className="p-8 max-w-5xl mx-auto text-white font-orbitron">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Competitions Admin</h1>
        <Link href="/admin/create-competition">
          <button className="btn-primary">+ Create New</button>
        </Link>
      </div>

      <table className="w-full text-sm text-white border-collapse">
        <thead className="bg-cyan-700 text-left">
          <tr>
            <th className="p-3">Title</th>
            <th className="p-3">Slug</th>
            <th className="p-3">Theme</th>
            <th className="p-3">Tickets</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {competitions.map(comp => (
            <tr key={comp._id} className="border-b border-cyan-800">
              <td className="p-3">{comp.title}</td>
              <td className="p-3">{comp.comp?.slug ?? '—'}</td>
              <td className="p-3">{comp.theme}</td>
              <td className="p-3">{comp.comp?.totalTickets?.toLocaleString() ?? '—'}</td>
              <td className="p-3 space-x-3">
                <button onClick={() => handleDelete(comp._id)} className="btn-danger">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
