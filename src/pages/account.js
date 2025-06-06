'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePiAuth } from '../context/PiAuthContext';  // ✅ use your existing auth context

export default function AccountPage() {
  const { user, loading, login } = usePiAuth();
  const [country, setCountry] = useState('');
  const [fullName, setFullName] = useState('');
  const [referralCount, setReferralCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const profile = JSON.parse(localStorage.getItem(`profile_${user.uid}`) || '{}');
    setCountry(profile.country || '');
    setFullName(profile.fullName || '');

    const storedCount = parseInt(localStorage.getItem(`referrals_${user.username}`) || '0', 10);
    setReferralCount(storedCount);
  }, [user]);

  const handleSave = () => {
    if (!user) return;
    const profile = { fullName, country };
    localStorage.setItem(`profile_${user.uid}`, JSON.stringify(profile));
    alert('✅ Profile saved!');
  };

  if (loading) return <div className="text-white p-10">Loading your account...</div>;
  if (!user) return (
    <div className="text-white p-10 text-center">
      <p>Please log in with Pi Browser to view your account.</p>
      <button onClick={login} className="bg-cyan-500 py-2 px-6 rounded text-black font-bold mt-4">
        Log in with Pi
      </button>
      <Link href="/" className="underline text-cyan-300 block mt-4">Go Home</Link>
    </div>
  );

  const referralUrl = `https://yourapp.com?ref=${user.username}`;

  return (
    <main className="min-h-screen bg-[#0b1120] text-white py-8 px-4 font-orbitron">
      <div className="max-w-lg mx-auto border border-cyan-400 rounded-2xl shadow-xl p-6 space-y-6 bg-[#101726]">

        <h1 className="text-2xl font-bold text-center text-cyan-300">My Account</h1>

        <div className="space-y-3">
          <div><span className="font-bold">Username:</span> {user.username}</div>
          <div><span className="font-bold">User ID:</span> {user.uid}</div>
        </div>

        <div className="space-y-4">
          <label className="block text-sm text-cyan-300">Full Name:</label>
          <input value={fullName} onChange={e => setFullName(e.target.value)} className="w-full p-2 rounded bg-black text-white border border-cyan-500" />

          <label className="block text-sm text-cyan-300">Country:</label>
          <input value={country} onChange={e => setCountry(e.target.value)} className="w-full p-2 rounded bg-black text-white border border-cyan-500" />

          <button onClick={handleSave} className="w-full py-3 rounded-lg font-bold bg-gradient-to-r from-[#00ffd5] to-[#0077ff] text-black shadow-lg">
            Save Profile
          </button>
        </div>

        <div className="pt-4 border-t border-white/20 text-sm">
          <h3 className="font-bold text-cyan-300 mb-2">Referral Program</h3>

          <div className="bg-white/10 p-3 rounded text-center">
            <p>Your link:</p>
            <div className="bg-black p-2 rounded text-sm break-all">{referralUrl}</div>
            <button className="mt-3 px-4 py-2 bg-cyan-500 rounded text-black font-bold"
              onClick={() => { navigator.clipboard.writeText(referralUrl); alert('Copied!'); }}>
              Copy Link
            </button>
          </div>

          <div className="mt-4">
            <p className="font-bold text-green-400">Total Referrals: {referralCount}</p>
            <p>Each referral earns 1 bonus entry for both you and your friend.</p>
          </div>
        </div>

        <div className="text-center pt-4">
          <Link href="/" className="text-sm text-cyan-400 underline">← Back to Home</Link>
        </div>

      </div>
    </main>
  );
}
