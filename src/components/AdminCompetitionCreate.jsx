'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminCompetitionCreate() {
  const router = useRouter();
  const [form, setForm] = useState({
    slug: '',
    title: '',
    prize: '',
    entryFee: 0,
    totalTickets: 0,
    startsAt: '',
    endsAt: '',
    location: 'Online Global Draw',
    theme: 'free',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/competitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error('Failed to create competition');

      router.push('/admin/dashboard'); // redirect after success
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-8 bg-[#0f172a] text-white rounded-lg border border-cyan-400 shadow-lg">
      <h1 className="text-2xl mb-6 font-bold text-cyan-300">Create New Competition</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="slug" placeholder="Slug" value={form.slug} onChange={handleChange} required className="input" />
        <input name="title" placeholder="Title" value={form.title} onChange={handleChange} required className="input" />
        <input name="prize" placeholder="Prize" value={form.prize} onChange={handleChange} required className="input" />
        <input name="entryFee" placeholder="Entry Fee (π)" type="number" step="0.01" value={form.entryFee} onChange={handleChange} required className="input" />
        <input name="totalTickets" placeholder="Total Tickets" type="number" value={form.totalTickets} onChange={handleChange} required className="input" />
        <input name="startsAt" placeholder="Starts At (ISO date)" value={form.startsAt} onChange={handleChange} className="input" />
        <input name="endsAt" placeholder="Ends At (ISO date)" value={form.endsAt} onChange={handleChange} className="input" />
        <input name="location" placeholder="Location" value={form.location} onChange={handleChange} className="input" />
        <select name="theme" value={form.theme} onChange={handleChange} className="input">
          <option value="free">Free</option>
          <option value="tech">Tech</option>
          <option value="premium">Premium</option>
          <option value="daily">Daily</option>
          <option value="crypto">Crypto</option>
          <option value="pi">Pi</option>
        </select>

        <button type="submit" className="w-full bg-gradient-to-r from-[#00ffd5] to-[#0077ff] py-3 rounded-lg font-bold">
          Create Competition
        </button>
      </form>
    </div>
  );
}
