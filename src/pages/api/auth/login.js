'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        router.push('/admin/competitions');
      } else {
        const data = await res.json();
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('Login failed. Try again.');
    }
  };

  return (
    <main className="min-h-screen flex justify-center items-center bg-black text-white font-orbitron">
      <div className="p-8 border border-cyan-500 rounded-xl shadow-lg bg-[#0f172a] w-full max-w-md">
        <h1 className="text-3xl mb-6 text-center font-bold text-cyan-300">Admin Login</h1>

        {error && <div className="text-red-400 mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 rounded bg-black border border-cyan-400"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-3 rounded bg-black border border-cyan-400"
          />
          <button type="submit" className="w-full py-3 bg-cyan-400 text-black font-bold rounded">
            Login
          </button>
        </form>
      </div>
    </main>
  );
}
