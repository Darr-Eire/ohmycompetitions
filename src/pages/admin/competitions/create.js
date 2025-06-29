'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateCompetition() {
  const router = useRouter();

  const [form, setForm] = useState({
    slug: '',
    entryFee: '',
    totalTickets: '',
    title: '',
    prize: '',
    theme: 'tech',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Add timeout to prevent Pi SDK timeout issues
    const timeoutId = setTimeout(() => {
      setError('Request timeout. Please try again.');
      setLoading(false);
    }, 30000); // 30 second timeout
    
    try {
      const res = await fetch('/api/admin/competitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: form.slug.trim(),
          entryFee: parseFloat(form.entryFee),
          totalTickets: parseInt(form.totalTickets),
          title: form.title.trim(),
          prize: form.prize.trim(),
          theme: form.theme,
        }),
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const data = await res.json();
        if (res.status === 409) {
          throw new Error(`Duplicate competition: ${data.message}`);
        }
        throw new Error(data.message || 'Failed to create competition');
      }

      const newCompetition = await res.json();
      console.log('✅ Competition created successfully:', newCompetition);
      router.push('/admin/competitions');
    } catch (err) {
      clearTimeout(timeoutId);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 text-white">
      <h1 className="text-3xl font-bold mb-6 text-cyan-400">Create Competition</h1>

      {error && (
        <div className="bg-red-900/30 border border-red-500 text-red-400 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

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

        <button 
          type="submit" 
          disabled={loading} 
          className="w-full py-3 bg-cyan-400 text-black font-bold rounded hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating Competition...' : 'Create Competition'}
        </button>
      </form>
      
      <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500 rounded">
        <h3 className="text-blue-400 font-bold mb-2">Quick Note:</h3>
        <p className="text-blue-300 text-sm">
          If you get a "duplicate competition" error, that competition already exists in the database. 
          Check the existing competitions list before adding new ones.
        </p>
      </div>
    </div>
  );
}
