'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/router';

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

    // NEW
    maxPerUser: 1,
    winnersCount: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value,
    }));
  };

  const num = (v, def = 0) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : def;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        // top-level (for older handlers)
        slug: form.slug,
        entryFee: num(form.entryFee),
        totalTickets: num(form.totalTickets, 1),
        title: form.title,
        prize: form.prize,
        theme: form.theme,
        startsAt: form.startsAt,
        endsAt: form.endsAt,
        // legacy + flat support
        maxPerUser: num(form.maxPerUser, 1),
        winnersCount: num(form.winnersCount, 1),
        numberOfWinners: num(form.winnersCount, 1),

        // nested (for new handler/model)
        comp: {
          slug: form.slug,
          entryFee: num(form.entryFee),
          totalTickets: num(form.totalTickets, 1),
          ticketsSold: 0,
          prizePool: 0,
          startsAt: form.startsAt,
          endsAt: form.endsAt,
          location: 'Online Global Draw',
          paymentType: form.theme === 'free' ? 'free' : 'pi',
          piAmount: form.theme === 'free' ? 0 : num(form.entryFee),
          status: 'active',
          maxPerUser: num(form.maxPerUser, 1),
          winnersCount: num(form.winnersCount, 1),
        },
      };

      const res = await fetch('/api/admin/competitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || err.error || 'Something went wrong');
      }

      router.push('/admin/competitions');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label>Entry Fee (π)</label>
            <input
              name="entryFee"
              type="number"
              min={0}
              step="0.01"
              value={form.entryFee}
              onChange={handleChange}
              className="input"
            />
          </div>

          <div>
            <label>Total Tickets</label>
            <input
              name="totalTickets"
              type="number"
              min={1}
              value={form.totalTickets}
              onChange={handleChange}
              className="input"
            />
          </div>
        </div>

        {/* NEW fields */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label>Max Per User</label>
            <input
              name="maxPerUser"
              type="number"
              min={1}
              value={form.maxPerUser}
              onChange={handleChange}
              className="input"
              required
            />
          </div>
          <div>
            <label>Winners</label>
            <input
              name="winnersCount"
              type="number"
              min={1}
              value={form.winnersCount}
              onChange={handleChange}
              className="input"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label>Starts At (ISO)</label>
            <input name="startsAt" value={form.startsAt} onChange={handleChange} className="input" />
          </div>
          <div>
            <label>Ends At (ISO)</label>
            <input name="endsAt" value={form.endsAt} onChange={handleChange} className="input" />
          </div>
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
