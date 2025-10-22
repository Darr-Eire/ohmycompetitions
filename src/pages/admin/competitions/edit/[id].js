'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';

export default function EditCompetitionPage() {
  const router = useRouter();
  const { id } = router.query;

  const [form, setForm] = useState({
    title: '',
    prize: '',
    slug: '',
    entryFee: 0,
    totalTickets: 0,
    theme: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const goLogin = () => {
    const next = encodeURIComponent(router.asPath || '/admin/competitions');
    router.replace(`/admin/login?next=${next}`);
  };

  // Shape helper in case your API returns nested comp.*
  const normalize = (data) => {
    if (!data || typeof data !== 'object') return form;
    return {
      title: data.title ?? '',
      prize: data.prize ?? '',
      slug: data.slug ?? data.comp?.slug ?? '',
      entryFee: Number(data.entryFee ?? data.comp?.entryFee ?? 0) || 0,
      totalTickets: Number(data.totalTickets ?? data.comp?.totalTickets ?? 0) || 0,
      theme: data.theme ?? '',
    };
  };

  useEffect(() => {
    if (!id) return;

    const fetchCompetition = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/competitions/${id}`, {
          cache: 'no-store',
          credentials: 'include',
        });

        if (res.status === 401 || res.status === 403) {
          goLogin();
          return;
        }
        if (!res.ok) throw new Error(`Failed to fetch competition (${res.status})`);

        const data = await res.json();
        setForm(normalize(data));
      } catch (err) {
        console.error(err);
        alert('Error loading competition data.');
      } finally {
        setLoading(false);
      }
    };

    fetchCompetition();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (e) => {
    const { name, value } = e.target;
    // coerce numeric fields
    if (name === 'entryFee') {
      const n = Number(value);
      setForm((prev) => ({ ...prev, [name]: Number.isFinite(n) ? n : 0 }));
    } else if (name === 'totalTickets') {
      const n = parseInt(value, 10);
      setForm((prev) => ({ ...prev, [name]: Number.isFinite(n) ? n : 0 }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const canSave = useMemo(() => {
    return (form.title || '').trim().length > 0 && (form.slug || '').trim().length > 0;
  }, [form.title, form.slug]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSave || !id) return;

    try {
      setSaving(true);
      const res = await fetch(`/api/admin/competitions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });

      if (res.status === 401 || res.status === 403) {
        goLogin();
        return;
      }

      if (res.ok) {
        router.push('/admin/competitions');
      } else {
        const msg = await res.text().catch(() => '');
        alert(`Failed to update competition. ${msg || ''}`);
      }
    } catch (err) {
      console.error(err);
      alert('Network error while updating competition.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-white text-center py-10">Loading…</div>;
  }

  return (
    <main className="p-8 max-w-xl mx-auto text-white font-orbitron">
      <h1 className="text-3xl font-bold mb-6">Edit Competition</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {['title', 'prize', 'slug', 'theme'].map((field) => (
          <div key={field}>
            <label className="block mb-1 capitalize">{field}</label>
            <input
              type="text"
              name={field}
              value={form[field]}
              onChange={handleChange}
              className="w-full p-2 bg-black border border-cyan-400 rounded"
              required={field === 'title' || field === 'slug'}
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
            min="0"
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
            step="1"
            min="0"
            className="w-full p-2 bg-black border border-cyan-400 rounded"
          />
        </div>

        <button
          type="submit"
          disabled={!canSave || saving}
          className={`w-full py-3 rounded-lg font-bold text-black ${
            saving
              ? 'bg-cyan-300 cursor-wait'
              : 'bg-gradient-to-r from-[#00ffd5] to-[#0077ff]'
          }`}
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </main>
  );
}
