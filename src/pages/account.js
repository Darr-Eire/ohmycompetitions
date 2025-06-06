'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import '@fontsource/orbitron';
import { usePiAuth } from '../context/PiAuthContext';  // <-- 🔑 use context!

export default function AccountPage() {
  const { user: piUser, loading: authLoading } = usePiAuth();

  const [country, setCountry] = useState('');
  const [fullName, setFullName] = useState('');
  const [language, setLanguage] = useState('en');
  const [referralCount, setReferralCount] = useState(0);
  const [entries, setEntries] = useState([]);
  const [payments, setPayments] = useState([]);
  const [hideId, setHideId] = useState(false);
  const [bonusTickets, setBonusTickets] = useState(0);

  useEffect(() => {
    if (!piUser) return;

    const profile = JSON.parse(localStorage.getItem(`profile_${piUser.uid}`) || '{}');
    setCountry(profile.country || '');
    setFullName(profile.fullName || '');
    setLanguage(profile.language || 'en');

    const refCount = parseInt(localStorage.getItem(`referrals_${piUser.username}`) || '0', 10);
    setReferralCount(refCount);
    setBonusTickets(Math.floor(refCount / 10));

    setEntries(JSON.parse(localStorage.getItem(`entries_${piUser.uid}`) || '[]'));
    setPayments(JSON.parse(localStorage.getItem(`payments_${piUser.uid}`) || '[]'));

    const storedHide = localStorage.getItem('hide_uid') === 'true';
    setHideId(storedHide);
  }, [piUser]);

  const handleSave = () => {
    if (!piUser) return;
    const profile = { fullName, country, language };
    localStorage.setItem(`profile_${piUser.uid}`, JSON.stringify(profile));
    alert('✅ Profile saved!');
  };

  const handleToggleId = () => {
    const newHide = !hideId;
    setHideId(newHide);
    localStorage.setItem('hide_uid', newHide ? 'true' : 'false');
  };

  const referralUrl = `https://yourapp.com?ref=${piUser?.username}`;

  if (authLoading) return <div className="text-white p-10">Loading account...</div>;
  if (!piUser) return <div className="text-white p-10">Please log in with Pi.</div>;

  return (
    <main className="min-h-screen bg-[#0b1120] text-white py-8 px-4 font-orbitron">
      <div className="max-w-lg mx-auto border border-cyan-400 rounded-2xl shadow-xl p-6 space-y-6 bg-[#101726]">

        <h1 className="text-2xl font-bold text-center text-cyan-300">My Account</h1>

        <div className="space-y-3">
          <div><span className="font-bold">Username:</span> {piUser.username}</div>
          {!hideId && <div><span className="font-bold">User ID:</span> {piUser.uid}</div>}
          <button onClick={handleToggleId} className="text-sm text-cyan-400 underline">
            {hideId ? 'Show ID' : 'Hide ID'}
          </button>
        </div>

        <div className="space-y-4">
          <label className="block text-sm text-cyan-300">Full Name:</label>
          <input value={fullName} onChange={e => setFullName(e.target.value)} className="w-full p-2 rounded bg-black border border-cyan-500" />

          <label className="block text-sm text-cyan-300">Country:</label>
          <input value={country} onChange={e => setCountry(e.target.value)} className="w-full p-2 rounded bg-black border border-cyan-500" />

          <label className="block text-sm text-cyan-300">Language:</label>
          <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full p-2 rounded bg-black border border-cyan-500">
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="de">Deutsch</option>
            <option value="fr">Français</option>
            <option value="zh">中文</option>
          </select>

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
            <p className="font-bold text-cyan-300">Total Referrals: {referralCount}</p>
            <p className="font-bold text-cyan-300">Bonus Free Tickets: {bonusTickets}</p>
            {bonusTickets > 0 && (
              <Link href="/redeem-ticket" className="mt-2 inline-block px-4 py-2 bg-gradient-to-r from-[#00ffd5] to-[#0077ff] text-black rounded shadow">
                🎟 Redeem Free Ticket
              </Link>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-white/20 text-sm">
          <h3 className="font-bold text-cyan-300 mb-2">Competitions Entered</h3>
          {entries.length === 0 ? (
            <p>No entries yet.</p>
          ) : (
            <ul className="list-disc list-inside">
              {entries.map((e, idx) => (
                <li key={idx}>{e.competitionSlug} ({e.ticketsPurchased} tickets)</li>
              ))}
            </ul>
          )}
        </div>

        <div className="pt-4 border-t border-white/20 text-sm">
          <h3 className="font-bold text-cyan-300 mb-2">Payment History</h3>
          {payments.length === 0 ? (
            <p>No payments yet.</p>
          ) : (
            <ul className="list-disc list-inside">
              {payments.map((p, idx) => (
                <li key={idx}>{p.amount} π — {p.memo}</li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </main>
  );
}
