'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import '@fontsource/orbitron';
import { PiAuthProvider } from '../context/PiAuthContext';

export default function AccountPage() {
  const [piUser, setPiUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [country, setCountry] = useState('');
  const [fullName, setFullName] = useState('');
  const [referralCount, setReferralCount] = useState(0);

  useEffect(() => {
    if (!window?.Pi?.getCurrentPioneer) {
      setLoading(false);
      return;
    }

    window.Pi.getCurrentPioneer().then(user => {
      setPiUser(user);
      setLoading(false);

      const profile = JSON.parse(localStorage.getItem(`profile_${user.uid}`) || '{}');
      setCountry(profile.country || '');
      setFullName(profile.fullName || '');

      const storedCount = parseInt(localStorage.getItem(`referrals_${user.username}`) || '0', 10);
      setReferralCount(storedCount);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const handleSave = () => {
    if (!piUser) return;
    const profile = { fullName, country };
    localStorage.setItem(`profile_${piUser.uid}`, JSON.stringify(profile));
    alert('✅ Profile saved!');
  };

  const referralUrl = `https://yourapp.com?ref=${piUser?.username}`;

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
        </div>

        <div className="space-y-4">
          <label className="block text-sm text-cyan-300">Full Name:</label>
          <input
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            className="w-full p-2 rounded bg-black text-white border border-cyan-500"
          />

          <label className="block text-sm text-cyan-300">Country:</label>
          <input
            value={country}
            onChange={e => setCountry(e.target.value)}
            className="w-full p-2 rounded bg-black text-white border border-cyan-500"
          />

          <button
            onClick={handleSave}
            className="w-full py-3 rounded-lg font-bold bg-gradient-to-r from-[#00ffd5] to-[#0077ff] text-black shadow-lg"
          >
            Save Profile
          </button>
        </div>

        <div className="pt-4 border-t border-white/20 text-sm">
          <h3 className="font-bold text-cyan-300 mb-2">Referral Program</h3>

          <div className="bg-white/10 p-3 rounded text-center">
            <p>Your Referral Link:</p>
            <div className="bg-black p-2 rounded text-sm break-all">{referralUrl}</div>

            <div className="flex justify-center gap-4 mt-3">
              <button
                className="px-4 py-2 bg-cyan-500 rounded text-black font-bold"
                onClick={() => { navigator.clipboard.writeText(referralUrl); alert('Copied!'); }}
              >
                Copy Link
              </button>

              <a
                href={`https://twitter.com/intent/tweet?text=Join%20me%20on%20this%20amazing%20Pi%20competition!%20${encodeURIComponent(referralUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-[#1DA1F2] text-white font-bold rounded"
              >
                Share on X
              </a>
            </div>
          </div>

          <div className="mt-4">
            <p className="font-bold text-green-400">Total Referrals: {referralCount}</p>
            <p>Every referral earns bonus entries for both you and your friend 🎯</p>
          </div>
        </div>

        <div className="text-center pt-4">
          <Link href="/" className="text-sm text-cyan-400 underline">← Back to Home</Link>
        </div>

      </div>
    </main>
  );
}
