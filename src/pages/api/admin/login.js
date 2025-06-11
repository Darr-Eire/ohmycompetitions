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
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/admin/competitions');
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      console.error('Login request failed:', err);
      setError('Login failed. Please try again.');
    }
  };

  return (
    <main className="min-h-screen flex justify-center items-center bg-[#0b1120] text-white font-orbitron">
      <div className="p-8 border border-cyan-500 rounded-2xl shadow-[0_0_30px_#00f0ff88] bg-[#0f172a] w-full max-w-md">
        <h1 className="text-3xl mb-6 text-center font-bold text-cyan-300">Admin Login</h1>

        {error && <div className="text-red-400 mb-4 text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 rounded-xl bg-black border border-cyan-400 text-white placeholder-cyan-400"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-3 rounded-xl bg-black border border-cyan-400 text-white placeholder-cyan-400"
          />
          <button
            type="submit"
            className="w-full py-3 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-xl transition"
          >
            Login
          </button>
        </form>
      </div>
    </main>
  );
}
