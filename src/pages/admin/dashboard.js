'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminDashboard() {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        const res = await fetch('/api/admin/competitions');
        if (!res.ok) throw new Error('Unauthorized');
        const data = await res.json();
        setCompetitions(data);
      } catch (err) {
        console.error(err);
        router.push('/'); // redirect if not admin
      } finally {
        setLoading(false);
      }
    };
    fetchCompetitions();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this competition?')) return;
    try {
      const res = await fetch(`/api/admin/competitions/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCompetitions(competitions.filter(c => c._id !== id));
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete.');
    }
  };

  if (loading) return <p className="text-center text-white">Loading...</p>;

  return (
    <div className="max-w-6xl mx-auto p-8 text-white">
      <h1 className="text-3xl font-bold mb-6">Admin Competitions Dashboard</h1>

      <Link href="/admin/competitions/create" className="mb-4 inline-block bg-cyan-500 px-4 py-2 rounded font-bold text-black">➕ Add New Competition</Link>

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
              <td className="p-3 border">{comp.comp.slug}</td>
              <td className="p-3 border">{comp.theme}</td>
              <td className="p-3 border space-x-2">
                <Link href={`/admin/competitions/edit/${comp._id}`} className="bg-blue-400 px-2 py-1 rounded text-black">Edit</Link>
                <button onClick={() => handleDelete(comp._id)} className="bg-red-500 px-2 py-1 rounded">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
