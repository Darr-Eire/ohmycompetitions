'use client';

import { useEffect, useState } from 'react';

export default function ProfilePage() {
  const [form, setForm] = useState({
    name: '',
    country: '',
    flag: '',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/account/profile');
        if (res.ok) {
          const data = await res.json();
          setForm({
            name: data.name || '',
            country: data.country || '',
            flag: data.flag || '',
          });
        } else {
          setError('Failed to load profile');
        }
      } catch (err) {
        setError('Unexpected error loading profile');
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/account/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        alert('Profile saved successfully!');
      } else {
        alert('Failed to save profile.');
      }
    } catch {
      alert('Unexpected error while saving.');
    }
  };

  if (loading) return <div className="text-white">Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="max-w-lg mx-auto text-white font-orbitron">
      <h1 className="text-3xl font-bold mb-6 text-center">Your Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-[#0f172a] p-6 rounded-lg shadow-lg">
        <div>
          <label className="block mb-1 font-semibold">Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-800 text-white"
            placeholder="Enter your name"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Country</label>
          <input
            name="country"
            value={form.country}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-800 text-white"
            placeholder="Enter your country"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Flag</label>
          <input
            name="flag"
            value={form.flag}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-800 text-white"
            placeholder="Enter flag code (e.g. 🇺🇸)"
          />
        </div>

        <button type="submit" className="w-full py-3 rounded bg-gradient-to-r from-cyan-400 to-blue-500 font-bold text-black">
          Save Profile
        </button>
      </form>
    </div>
  );
}
