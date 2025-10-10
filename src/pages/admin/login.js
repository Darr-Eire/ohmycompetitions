// file: src/pages/admin/login.js
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/router';

export default function AdminLoginPage() {
  const router = useRouter();
  const [emailOrUser, setEmailOrUser] = useState(''); // email OR username
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!emailOrUser || !password) return setError('Enter email/username and password.');

    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // accept cookie from API
        // send both keys so API accepts either
        body: JSON.stringify({ email: emailOrUser, username: emailOrUser, password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || 'Invalid credentials');
      } else {
        const next = new URLSearchParams(window.location.search).get('next') || '/admin/competitions';
        router.push(next);
      }
    } catch (err) {
      console.error('Login request failed:', err);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex justify-center items-center bg-[#0b1120] text-white font-orbitron px-4">
      <div className="p-8 border border-cyan-500 rounded-2xl shadow-[0_0_30px_#00f0ff88] bg-[#0f172a] w-full max-w-md">
        <h1 className="text-3xl mb-6 text-center font-bold text-cyan-300">Admin Login</h1>

        {error && (
          <div className="text-red-400 mb-4 text-center border border-red-400/40 rounded-md py-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            placeholder="Email or Username"
            value={emailOrUser}
            onChange={(e) => setEmailOrUser(e.target.value)}
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
            disabled={loading}
            className="w-full py-3 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in…' : 'Login'}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-white/60">
          Trouble logging in? Clear site cookies and try again.
        </p>
      </div>
    </main>
  );
}
