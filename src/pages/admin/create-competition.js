'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateCompetitionPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    slug: '',
    title: '',
    prize: '',
    entryFee: 0,
    totalTickets: 0,
    startsAt: '',
    endsAt: '',
    theme: 'pi',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/competitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Something went wrong');
      }

      router.push('/admin/competitions');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <main className="p-8 max-w-2xl mx-auto text-white font-orbitron">
      <h1 className="text-3xl font-bold mb-6">Create New Competition</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label>Slug</label>
          <input name="slug" value={form.slug} onChange={handleChange} required className="input" />
        </div>

        <div>
          <label>Title</label>
          <input name="title" value={form.title} onChange={handleChange} required className="input" />
        </div>

        <div>
          <label>Prize</label>
          <input name="prize" value={form.prize} onChange={handleChange} required className="input" />
        </div>

        <div>
          <label>Entry Fee (π)</label>
          <input name="entryFee" type="number" value={form.entryFee} onChange={handleChange} className="input" />
        </div>

        <div>
          <label>Total Tickets</label>
          <input name="totalTickets" type="number" value={form.totalTickets} onChange={handleChange} className="input" />
        </div>

        <div>
          <label>Starts At (ISO)</label>
          <input name="startsAt" value={form.startsAt} onChange={handleChange} className="input" />
        </div>

        <div>
          <label>Ends At (ISO)</label>
          <input name="endsAt" value={form.endsAt} onChange={handleChange} className="input" />
        </div>

        <div>
          <label>Theme</label>
          <select name="theme" value={form.theme} onChange={handleChange} className="input">
            <option value="pi">Pi</option>
            <option value="free">Free</option>
            <option value="daily">Daily</option>
            <option value="premium">Premium</option>
            <option value="crypto">Crypto</option>
          </select>
        </div>

        {error && <p className="text-red-400">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Creating...' : 'Create Competition'}
        </button>
      </form>
    </main>
  );
}
