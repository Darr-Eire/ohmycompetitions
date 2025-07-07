'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Store admin session in localStorage for client-side checks
        localStorage.setItem('adminUser', JSON.stringify(data.user));
        router.push('/admin');
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      console.error('Login request failed:', err);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Admin Login | OhMyCompetitions</title>
      </Head>
      
      <main className="min-h-screen flex justify-center items-center bg-[#0b1120] text-white font-orbitron">
        <div className="p-8 border border-cyan-500 rounded-2xl shadow-[0_0_30px_#00f0ff88] bg-[#0f172a] w-full max-w-md">
          <h1 className="text-3xl mb-6 text-center font-bold text-cyan-300">
            🔐 Admin Login
          </h1>

          {error && (
            <div className="text-red-400 mb-4 text-center bg-red-900/20 p-3 rounded-lg border border-red-500">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-cyan-300 text-sm font-bold mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder="admin@ohmycompetitions.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="w-full p-3 rounded-xl bg-black border border-cyan-400 text-white placeholder-cyan-400 focus:border-cyan-300 focus:outline-none disabled:opacity-50"
              />
            </div>
            
            <div>
              <label className="block text-cyan-300 text-sm font-bold mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="w-full p-3 rounded-xl bg-black border border-cyan-400 text-white placeholder-cyan-400 focus:border-cyan-300 focus:outline-none disabled:opacity-50"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '🔄 Logging in...' : '🚀 Login to Admin'}
            </button>
          </form>

          <div className="mt-6 text-center text-cyan-300 text-sm">
            <p>🛡️ Authorized Personnel Only</p>
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={() => router.push('/')}
              className="text-cyan-400 hover:text-cyan-300 text-sm underline"
            >
              ← Back to Main Site
            </button>
          </div>
        </div>
      </main>
    </>
  );
} 