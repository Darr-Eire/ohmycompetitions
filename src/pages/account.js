'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import '@fontsource/orbitron';

export default function AccountPage() {
  const [piUser, setPiUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [country, setCountry] = useState('');
  const [fullName, setFullName] = useState('');
  const [referralCount, setReferralCount] = useState(0);

  // Load Pi user info if available
  useEffect(() => {
    if (!window?.Pi?.getCurrentPioneer) {
      setLoading(false);
      return;
    }

    window.Pi.getCurrentPioneer().then(user => {
      setPiUser(user);
      setLoading(false);

      const storedProfile = JSON.parse(localStorage.getItem(`profile_${user.uid}`) || '{}');
      setCountry(storedProfile.country || '');
      setFullName(storedProfile.fullName || '');
      setReferralCount(storedProfile.referrals || 0);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const handleSave = () => {
    if (!piUser) return;
    const profile = { fullName, country, referrals: referralCount };
    localStorage.setItem(`profile_${piUser.uid}`, JSON.stringify(profile));
    alert('✅ Profile saved!');
  };

  if (loading) return <div className="text-white p-10">Loading your account...</div>;

  if (!piUser) return (
    <div className="text-white p-10">
      <p>Please log in with Pi Browser to view your account.</p>
      <Link href="/" className="underline text-cyan-300">Go Home</Link>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#0b1120] text-white py-8 px-4 font-orbitron">
      <div className="max-w-lg mx-auto border border-cyan-400 rounded-2xl shadow-xl p-6 space-y-6 bg-[#101726]">

        <h1 className="text-2xl font-bold text-center text-cyan-300">My Account</h1>

        <div className="space-y-3">
          <div><span className="font-bold">Username:</span> {piUser.username}</div>
          <div><span className="font-bold">User ID:</span> {piUser.uid}</div>
          <div><span className="font-bold">Joined:</span> {new Date().toLocaleDateString()}</div>
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
          <p><strong>Referrals Earned:</strong> {referralCount}</p>
          <p><strong>Competitions Entered:</strong> (future: link to history)</p>
        </div>

        <div className="text-center pt-4">
          <Link href="/" className="text-sm text-cyan-400 underline">← Back to Home</Link>
        </div>

      </div>
    </main>
  );
}
