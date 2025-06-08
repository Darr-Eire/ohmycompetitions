'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function EditCompetition() {
  const router = useRouter();
  const { id } = useParams();
  const [competition, setCompetition] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompetition = async () => {
      try {
        const res = await fetch(`/api/admin/competitions/${id}`);
        const data = await res.json();
        setCompetition(data);
      } catch (err) {
        console.error(err);
        router.push('/admin/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchCompetition();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCompetition((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/admin/competitions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(competition),
      });
      if (res.ok) router.push('/admin/dashboard');
    } catch (err) {
      console.error(err);
      alert('Failed to update competition.');
    }
  };

  if (loading) return <p className="text-white text-center">Loading...</p>;
  if (!competition) return <p className="text-white text-center">Competition not found.</p>;

  return (
    <div className="max-w-xl mx-auto p-8 text-white">
      <h1 className="text-3xl font-bold mb-6">Edit Competition</h1>
      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label className="block mb-1">Title</label>
          <input name="title" value={competition.title} onChange={handleChange}
            className="w-full p-2 text-black rounded" required />
        </div>

        <div>
          <label className="block mb-1">Prize</label>
          <input name="prize" value={competition.prize} onChange={handleChange}
            className="w-full p-2 text-black rounded" required />
        </div>

        <div>
          <label className="block mb-1">Slug</label>
          <input name="comp.slug" value={competition.comp.slug} onChange={(e) => {
            setCompetition(prev => ({
              ...prev,
              comp: { ...prev.comp, slug: e.target.value }
            }));
          }} className="w-full p-2 text-black rounded" required />
        </div>

        <div>
          <label className="block mb-1">Theme</label>
          <input name="theme" value={competition.theme} onChange={handleChange}
            className="w-full p-2 text-black rounded" required />
        </div>

        <button type="submit" className="w-full py-2 bg-cyan-500 rounded font-bold text-black">Update</button>
      </form>
    </div>
  );
}
