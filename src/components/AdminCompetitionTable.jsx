'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminCompetitionTable() {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

useEffect(() => {
  const fetchCompetitions = async () => {
    const res = await fetch('/api/admin/competitions');
    const data = await res.json();

    if (res.status !== 200) {
      console.error('Not authorized or failed:', data);
      setCompetitions([]);  // fallback to empty array
      setLoading(false);
      return;
    }

    setCompetitions(data || []);
    setLoading(false);
  };
  fetchCompetitions();
}, []);


  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this competition?')) return;

    try {
      const res = await fetch(`/api/admin/competitions/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setCompetitions(competitions.filter(comp => comp._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="text-center text-white">Loading...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-white table-auto border border-cyan-400">
        <thead className="bg-cyan-800">
          <tr>
            <th className="px-4 py-2">Title</th>
            <th className="px-4 py-2">Prize</th>
            <th className="px-4 py-2">Entry Fee (π)</th>
            <th className="px-4 py-2">Tickets Sold</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-[#0f172a]">
          {competitions.map((comp) => (
            <tr key={comp._id} className="border-t border-cyan-700 hover:bg-cyan-900/30">
              <td className="px-4 py-2">{comp.title}</td>
              <td className="px-4 py-2">{comp.prize}</td>
              <td className="px-4 py-2">{comp.comp.entryFee ?? 'Free'}</td>
              <td className="px-4 py-2">{comp.comp.ticketsSold}</td>
              <td className="px-4 py-2">
                {new Date(comp.comp.endsAt) > new Date() ? 'Active' : 'Ended'}
              </td>
              <td className="px-4 py-2 flex gap-2">
                <button
                  onClick={() => router.push(`/admin/competitions/edit/${comp._id}`)}
                  className="bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-1 rounded-md text-sm font-bold"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(comp._id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm font-bold"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
