'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Example country list
const countries = [
  { name: 'United States', flag: '🇺🇸' },
  { name: 'United Kingdom', flag: '🇬🇧' },
  { name: 'Canada', flag: '🇨🇦' },
  { name: 'France', flag: '🇫🇷' },
  { name: 'Germany', flag: '🇩🇪' },
  { name: 'India', flag: '🇮🇳' },
  { name: 'Japan', flag: '🇯🇵' },
  { name: 'Australia', flag: '🇦🇺' },
  { name: 'Ireland', flag: '🇮🇪' },
  { name: 'Nigeria', flag: '🇳🇬' },
  { name: 'South Africa', flag: '🇿🇦' },
  // ➕ Add more if needed
];

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [form, setForm] = useState({
    name: '',
    country: '',
    flag: ''
  });

  useEffect(() => {
    // Redirect to login if not authenticated
    if (status === 'unauthenticated') {
      router.push('/api/auth/signin');
    }

    if (status === 'authenticated') {
      async function loadProfile() {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const data = await res.json();
          setForm({
            name: data.name || '',
            country: data.country || '',
            flag: data.flag || '',
          });
        }
      }
      loadProfile();
    }
  }, [status, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      alert('✅ Profile saved!');
    }
  };

  const handleCountryChange = (e) => {
    const selected = countries.find(c => c.name === e.target.value);
    setForm({
      ...form,
      country: selected?.name || '',
      flag: selected?.flag || ''
    });
  };

  if (status === 'loading') {
    return <div className="text-center text-white p-10">Loading...</div>;
  }

  return (
    <main className="p-8 max-w-xl mx-auto text-white font-orbitron">
      <h1 className="text-2xl mb-6 text-center">My Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-6">

        <div>
          <label className="block mb-1">Name:</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full p-3 rounded bg-gray-800"
            placeholder="Your name"
          />
        </div>

        <div>
          <label className="block mb-1">Country:</label>
          <select
            value={form.country}
            onChange={handleCountryChange}
            className="w-full p-3 rounded bg-gray-800 text-black"
          >
            <option value="">Select Country</option>
            {countries.map((c) => (
              <option key={c.name} value={c.name}>
                {c.flag} {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-cyan-300 font-semibold">Flag:</span>
          <span className="text-3xl">{form.flag}</span>
        </div>

        <button type="submit" className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-black py-3 rounded-lg font-bold">
          Save Profile
        </button>
      </form>
    </main>
  );
}
