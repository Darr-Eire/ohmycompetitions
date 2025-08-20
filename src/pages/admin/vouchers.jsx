// src/pages/admin/vouchers.jsx
import React, { useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminGuard from '../../components/AdminGuard';

export default function AdminVouchersPage() {
  // Generate form
  const [gForm, setGForm] = useState({
    competitionSlug: '',
    ticketCount: 1,
    count: 1,
    maxRedemptions: 1,
    perUserLimit: 1,
    expiresAt: '',
    assignedToUserId: '',
    notes: ''
  });
  const [generated, setGenerated] = useState([]);

  // Grant form
  const [grantForm, setGrantForm] = useState({
    userId: '',
    competitionSlug: '',
    quantity: 1,
    reason: 'prize'
  });
  const [grantResult, setGrantResult] = useState(null);

  const adminHeaders = { 'Content-Type': 'application/json', 'x-admin': 'true' };

  const genSubmit = async (e) => {
    e.preventDefault();
    setGenerated([]);
    try {
      const res = await fetch('/api/admin/vouchers/generate', {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({
          ...gForm,
          ticketCount: Number(gForm.ticketCount),
          count: Number(gForm.count),
          maxRedemptions: Number(gForm.maxRedemptions),
          perUserLimit: Number(gForm.perUserLimit),
          expiresAt: gForm.expiresAt || null,
          assignedToUserId: gForm.assignedToUserId || null
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed to generate');
      setGenerated(json.vouchers || []);
    } catch (err) {
      alert(err.message);
    }
  };

  const grantSubmit = async (e) => {
    e.preventDefault();
    setGrantResult(null);
    try {
      const res = await fetch('/api/admin/tickets/grant', {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({
          ...grantForm,
          quantity: Number(grantForm.quantity),
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Grant failed');
      setGrantResult(json);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <AdminGuard>
      <AdminSidebar>
        <main className="max-w-3xl mx-auto p-6 text-white">
          <h1 className="text-2xl font-bold mb-6">Admin · Ticket Vouchers</h1>

          {/* Generate Codes */}
          <section className="mb-10 rounded-xl border border-cyan-400/40 p-4 bg-[#0b1220]">
            <h2 className="text-xl font-semibold mb-4">Generate Voucher Codes</h2>
            <form onSubmit={genSubmit} className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col">
                <span>Competition Slug</span>
                <input className="text-black rounded p-2" required
                  value={gForm.competitionSlug}
                  onChange={e=>setGForm({...gForm, competitionSlug:e.target.value})}/>
              </label>
              <label className="flex flex-col">
                <span>Tickets per Code</span>
                <input type="number" min={1} className="text-black rounded p-2" required
                  value={gForm.ticketCount}
                  onChange={e=>setGForm({...gForm, ticketCount:e.target.value})}/>
              </label>
              <label className="flex flex-col">
                <span>Number of Codes</span>
                <input type="number" min={1} max={1000} className="text-black rounded p-2" required
                  value={gForm.count}
                  onChange={e=>setGForm({...gForm, count:e.target.value})}/>
              </label>
              <label className="flex flex-col">
                <span>Max Redemptions (per code)</span>
                <input type="number" min={1} className="text-black rounded p-2" required
                  value={gForm.maxRedemptions}
                  onChange={e=>setGForm({...gForm, maxRedemptions:e.target.value})}/>
              </label>
              <label className="flex flex-col">
                <span>Per-User Limit</span>
                <input type="number" min={1} className="text-black rounded p-2" required
                  value={gForm.perUserLimit}
                  onChange={e=>setGForm({...gForm, perUserLimit:e.target.value})}/>
              </label>
              <label className="flex flex-col">
                <span>Expires At (optional)</span>
                <input type="datetime-local" className="text-black rounded p-2"
                  value={gForm.expiresAt}
                  onChange={e=>setGForm({...gForm, expiresAt:e.target.value})}/>
              </label>
              <label className="flex flex-col">
                <span>Assign to User (optional)</span>
                <input className="text-black rounded p-2" placeholder="userId"
                  value={gForm.assignedToUserId}
                  onChange={e=>setGForm({...gForm, assignedToUserId:e.target.value})}/>
              </label>
              <label className="flex flex-col sm:col-span-2">
                <span>Notes (optional)</span>
                <input className="text-black rounded p-2"
                  value={gForm.notes}
                  onChange={e=>setGForm({...gForm, notes:e.target.value})}/>
              </label>
              <div className="sm:col-span-2">
                <button className="px-4 py-2 rounded bg-cyan-400 text-black font-bold">Generate</button>
              </div>
            </form>

            {generated.length > 0 && (
              <div className="mt-5">
                <h3 className="font-semibold mb-2">Generated Codes</h3>
                <ul className="space-y-1">
                  {generated.map((g) => (
                    <li key={g.id || g.codeHash} className="text-sm">
                      <code className="bg-white/10 px-2 py-1 rounded">{g.code}</code>
                      <span className="ml-2 text-cyan-300">→ {g.competitionSlug} ×{g.ticketCount}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* Direct Grant */}
          <section className="rounded-xl border border-cyan-400/40 p-4 bg-[#0b1220]">
            <h2 className="text-xl font-semibold mb-4">Direct Grant Tickets</h2>
            <form onSubmit={grantSubmit} className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col">
                <span>User ID</span>
                <input className="text-black rounded p-2" required
                  value={grantForm.userId}
                  onChange={e=>setGrantForm({...grantForm, userId:e.target.value})}/>
              </label>
              <label className="flex flex-col">
                <span>Competition Slug</span>
                <input className="text-black rounded p-2" required
                  value={grantForm.competitionSlug}
                  onChange={e=>setGrantForm({...grantForm, competitionSlug:e.target.value})}/>
              </label>
              <label className="flex flex-col">
                <span>Quantity</span>
                <input type="number" min={1} className="text-black rounded p-2" required
                  value={grantForm.quantity}
                  onChange={e=>setGrantForm({...grantForm, quantity:e.target.value})}/>
              </label>
              <label className="flex flex-col">
                <span>Reason</span>
                <input className="text-black rounded p-2"
                  value={grantForm.reason}
                  onChange={e=>setGrantForm({...grantForm, reason:e.target.value})}/>
              </label>
              <div className="sm:col-span-2">
                <button className="px-4 py-2 rounded bg-cyan-400 text-black font-bold">Grant</button>
              </div>
            </form>

            {grantResult?.ok && (
              <p className="mt-3 text-emerald-300 text-sm">✅ Granted (id: {grantResult.grantId})</p>
            )}
          </section>
        </main>
      </AdminSidebar>
    </AdminGuard>
  );
}
