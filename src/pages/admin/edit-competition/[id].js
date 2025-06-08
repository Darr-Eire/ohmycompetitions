'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function EditCompetitionPage() {
  const router = useRouter();
  const { id } = useParams();
  const [form, setForm] = useState({
    title: '',
    prize: '',
    slug: '',
    entryFee: 0,
    totalTickets: 0,
    theme: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompetition = async () => {
      const res = await fetch(`/api/admin/competitions/${id}`);
      const data = await res.json();
      setForm({
        title: data.title || '',
        prize: data.prize || '',
        slug: data.slug || '',
        entryFee: data.entryFee || 0,
        totalTickets: data.totalTickets || 0,
        theme: data.theme || '',
      });
      setLoading(false);
    };
    fetchCompetition();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch(`/api/admin/competitions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      router.push('/admin/competitions');
    } else {
      alert('Failed to update competition');
    }
  };

  if (loading) return <div className="text-white text-center py-10">Loading...</div>;

  return (
    <main className="p-8 max-w-xl mx-auto text-white font-orbitron">
      <h1 className="text-3xl font-bold mb-6">Edit Competition</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {['title', 'prize', 'slug', 'theme'].map((field) => (
          <div key={field}>
            <label className="block mb-1">{field}</label>
            <input
              type="text"
              name={field}
              value={form[field]}
              onChange={handleChange}
              className="w-full p-2 bg-black border border-cyan-400 rounded"
            />
          </div>
        ))}

        <div>
          <label className="block mb-1">Entry Fee (π)</label>
          <input
            type="number"
            name="entryFee"
            value={form.entryFee}
            onChange={handleChange}
            step="0.01"
            className="w-full p-2 bg-black border border-cyan-400 rounded"
          />
        </div>

        <div>
          <label className="block mb-1">Total Tickets</label>
          <input
            type="number"
            name="totalTickets"
            value={form.totalTickets}
            onChange={handleChange}
            className="w-full p-2 bg-black border border-cyan-400 rounded"
          />
        </div>

        <button type="submit" className="w-full py-3 bg-gradient-to-r from-[#00ffd5] to-[#0077ff] text-black font-bold rounded-lg">
          Save Changes
        </button>
      </form>
    </main>
  );
}
