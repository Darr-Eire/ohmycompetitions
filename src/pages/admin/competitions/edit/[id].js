'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';  // ✅ Pages Router, not navigation

export default function EditCompetition() {
  const router = useRouter();
  const { id } = router.query;  // ✅ Correct way to access dynamic route params

  const [form, setForm] = useState({
    slug: '',
    entryFee: '',
    totalTickets: '',
    title: '',
    prize: '',
    theme: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false); // avoid running form update before data arrives

  useEffect(() => {
    if (!id || loaded) return;

    async function loadCompetition() {
      try {
        const res = await fetch(`/api/admin/competitions/${id}`);
        if (!res.ok) throw new Error('Failed to load competition');
        const data = await res.json();

        setForm({
          slug: data.comp.slug,
          entryFee: data.comp.entryFee,
          totalTickets: data.comp.totalTickets,
          title: data.title,
          prize: data.prize,
          theme: data.theme,
        });
        setLoaded(true);
      } catch {
        setError('Failed to load competition');
      }
    }

    loadCompetition();
  }, [id, loaded]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/competitions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: form.slug,
          entryFee: parseFloat(form.entryFee),
          totalTickets: parseInt(form.totalTickets),
          title: form.title,
          prize: form.prize,
          theme: form.theme,
        }),
      });

      if (!res.ok) throw new Error('Failed to update competition');
      router.push('/admin/competitions');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 text-white">
      <h1 className="text-3xl font-bold mb-6 text-cyan-400">Edit Competition</h1>

      {error && <p className="text-red-400 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {['slug', 'title', 'prize', 'entryFee', 'totalTickets'].map((field) => (
          <input
            key={field}
            name={field}
            value={form[field]}
            onChange={handleChange}
            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
            className="w-full p-3 rounded bg-black border border-cyan-400"
            required
          />
        ))}

        <select
          name="theme"
          value={form.theme}
          onChange={handleChange}
          className="w-full p-3 rounded bg-black border border-cyan-400"
        >
          <option value="">Select Theme</option>
          <option value="tech">Tech</option>
          <option value="premium">Premium</option>
          <option value="daily">Daily</option>
          <option value="free">Free</option>
          <option value="pi">Pi</option>
          <option value="crypto">Crypto</option>
        </select>

        <button type="submit" disabled={loading} className="w-full py-3 bg-cyan-400 text-black font-bold rounded">
          {loading ? 'Updating...' : 'Update Competition'}
        </button>
      </form>
    </div>
  );
}
