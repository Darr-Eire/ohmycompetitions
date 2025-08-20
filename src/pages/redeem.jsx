// pages/redeem.jsx
'use client';
import { useState } from 'react';

export default function RedeemPage() {
  const [code, setCode] = useState('');
  const [resMsg, setResMsg] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setResMsg('');
    const res = await fetch('/api/vouchers/redeem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': 'CURRENT_USER_ID' }, // replace with real auth
      body: JSON.stringify({ code })
    });
    const json = await res.json();
    if (json.ok) {
      setResMsg(`🎉 Redeemed! +${json.ticketCount} ticket(s) for ${json.competitionSlug}.`);
      setCode('');
    } else {
      setResMsg(json.error || 'Failed to redeem.');
    }
  };

  return (
    <main className="max-w-md mx-auto p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">Redeem Voucher</h1>
      <form onSubmit={submit} className="flex gap-2">
        <input value={code} onChange={e=>setCode(e.target.value)} placeholder="OMC-XXXX-XXXX-XXXX"
               className="flex-1 text-black rounded p-2" required />
        <button className="px-4 py-2 rounded bg-cyan-400 text-black font-bold">Redeem</button>
      </form>
      {resMsg && <p className="mt-3 text-sm">{resMsg}</p>}
    </main>
  );
}
