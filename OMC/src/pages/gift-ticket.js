// src/pages/gift-ticket.js
'use client';

import { useEffect, useState } from 'react';

export default function GiftTicketPage() {
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [ticket, setTicket] = useState(null);

  // Simple form state
  const [form, setForm] = useState({
    fromUsername: '',
    toUsername: '',
    competitionSlug: '',
    competitionId: '',
    quantity: 1,
    paymentId: '',
    transactionJson: '{\n  "identifier": "",\n  "txid": ""\n}',
  });

  // Prefill from localStorage if you like
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const lastFrom = localStorage.getItem('omc_last_from');
    if (lastFrom) {
      setForm((f) => ({ ...f, fromUsername: lastFrom }));
    }
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: name === 'quantity' ? Number(value) : value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setTicket(null);

    try {
      if (!form.fromUsername || !form.toUsername) {
        throw new Error('fromUsername and toUsername are required.');
      }
      if (!form.competitionSlug && !form.competitionId) {
        throw new Error('Provide either competitionSlug or competitionId.');
      }
      if (!form.paymentId) {
        throw new Error('paymentId is required.');
      }
      if (!form.transactionJson) {
        throw new Error('transaction JSON is required.');
      }

      let transaction;
      try {
        transaction = JSON.parse(form.transactionJson);
      } catch {
        throw new Error('transaction JSON is invalid.');
      }

      // Persist last sender for convenience
      if (typeof window !== 'undefined') {
        localStorage.setItem('omc_last_from', form.fromUsername);
      }

      const payload = {
        fromUsername: form.fromUsername.trim(),
        toUsername: form.toUsername.trim(),
        competitionSlug: form.competitionSlug.trim() || undefined,
        competitionId: form.competitionId.trim() || undefined,
        quantity: Number(form.quantity) || 1,
        paymentId: form.paymentId.trim(),
        transaction,
      };

      const res = await fetch('/api/tickets/gift', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || `Gift failed (${res.status})`);
      }

      const data = await res.json();
      setSuccess('🎉 Gift sent successfully!');
      setTicket(data?.ticket || null);
      setOk(true);
    } catch (err) {
      setOk(false);
      setError(err?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-2xl mx-auto p-6 text-white">
      <h1 className="text-2xl font-bold mb-4 text-cyan-400">Gift a Ticket</h1>
      <p className="text-white/80 mb-6">
        Send competition tickets to another Pioneer. Provide either a{' '}
        <span className="text-cyan-300">competitionSlug</span> or a{' '}
        <span className="text-cyan-300">competitionId</span>, plus the Pi{' '}
        <span className="text-cyan-300">paymentId</span> and a{' '}
        <span className="text-cyan-300">transaction</span> JSON that includes the
        payment <code className="bg-black/40 px-1 rounded">identifier</code> (and optionally <code className="bg-black/40 px-1 rounded">txid</code>).
      </p>

      {error && (
        <div className="mb-4 rounded border border-red-500 bg-red-500/20 p-3">
          ❌ {error}
        </div>
      )}
      {success && (
        <div className="mb-4 rounded border border-emerald-500 bg-emerald-500/20 p-3">
          ✅ {success}
        </div>
      )}

      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="block mb-1 text-sm text-gray-300">From Username</span>
            <input
              name="fromUsername"
              value={form.fromUsername}
              onChange={onChange}
              className="w-full rounded bg-[#0f172a] border border-cyan-700 p-2"
              placeholder="senderUsername"
              required
            />
          </label>

          <label className="block">
            <span className="block mb-1 text-sm text-gray-300">To Username</span>
            <input
              name="toUsername"
              value={form.toUsername}
              onChange={onChange}
              className="w-full rounded bg-[#0f172a] border border-cyan-700 p-2"
              placeholder="recipientUsername"
              required
            />
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="block mb-1 text-sm text-gray-300">Competition Slug</span>
            <input
              name="competitionSlug"
              value={form.competitionSlug}
              onChange={onChange}
              className="w-full rounded bg-[#0f172a] border border-cyan-700 p-2"
              placeholder="e.g., iphone-16-ultra"
            />
          </label>

          <label className="block">
            <span className="block mb-1 text-sm text-gray-300">Competition ID</span>
            <input
              name="competitionId"
              value={form.competitionId}
              onChange={onChange}
              className="w-full rounded bg-[#0f172a] border border-cyan-700 p-2"
              placeholder="Mongo ObjectId (optional if slug provided)"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="block mb-1 text-sm text-gray-300">Quantity</span>
            <input
              type="number"
              min={1}
              max={50}
              name="quantity"
              value={form.quantity}
              onChange={onChange}
              className="w-full rounded bg-[#0f172a] border border-cyan-700 p-2"
              required
            />
          </label>

          <label className="block">
            <span className="block mb-1 text-sm text-gray-300">Payment ID</span>
            <input
              name="paymentId"
              value={form.paymentId}
              onChange={onChange}
              className="w-full rounded bg-[#0f172a] border border-cyan-700 p-2"
              placeholder="Pi payment identifier"
              required
            />
          </label>
        </div>

        <label className="block">
          <span className="block mb-1 text-sm text-gray-300">
            Transaction (JSON with <code className="bg-black/40 px-1 rounded">identifier</code> and/or <code className="bg-black/40 px-1 rounded">txid</code>)
          </span>
          <textarea
            name="transactionJson"
            value={form.transactionJson}
            onChange={onChange}
            rows={6}
            className="w-full rounded bg-[#0f172a] border border-cyan-700 p-2 font-mono text-sm"
          />
        </label>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className={`rounded bg-cyan-500 px-4 py-2 font-bold text-black ${loading ? 'opacity-60 cursor-wait' : ''}`}
          >
            {loading ? 'Sending…' : 'Send Gift'}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              setError('');
              setSuccess('');
              setTicket(null);
            }}
            className="rounded bg-slate-700 px-4 py-2"
          >
            Reset status
          </button>
        </div>
      </form>

      {ticket && (
        <div className="mt-6 rounded border border-cyan-600 bg-cyan-600/10 p-4">
          <h2 className="text-lg font-semibold text-cyan-300 mb-2">Gift Summary</h2>
          <ul className="list-disc list-inside text-sm text-gray-200 space-y-1">
            <li><span className="text-gray-400">Competition:</span> {ticket.competitionTitle}</li>
            <li><span className="text-gray-400">Recipient:</span> {ticket.recipient}</li>
            <li><span className="text-gray-400">Quantity:</span> {ticket.quantity}</li>
            <li className="break-all">
              <span className="text-gray-400">Ticket Numbers:</span> {Array.isArray(ticket.ticketNumbers) ? ticket.ticketNumbers.join(', ') : '—'}
            </li>
          </ul>
        </div>
      )}
    </main>
  );
}
