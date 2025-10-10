// src/pages/admin/vouchers.jsx
import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import AdminSidebar from '../../components/AdminSidebar';
import AdminGuard from '../../components/AdminGuard';

export default function AdminVouchersPage() {
  // Tabs: generate | list | history
  const [activeTab, setActiveTab] = useState('generate');

  // Stats / lists
  const [stats, setStats] = useState({ total: 0, active: 0, redeemed: 0 });
  const [vouchers, setVouchers] = useState([]);
  const [voucherHistory, setVoucherHistory] = useState([]);

  // Loading / UX
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [error, setError] = useState('');
  const [okMsg, setOkMsg] = useState('');

  // Generate form + results
  const [gForm, setGForm] = useState({
    competitionSlug: '',
    ticketCount: 1,
    count: 1,
    maxRedemptions: 1,
    perUserLimit: 1,
    expiresAt: '',
    assignedToUserId: '',
    notes: '',
  });
  const [generated, setGenerated] = useState([]);

  // List filter
  const [query, setQuery] = useState('');

  /* ---------------------- Loaders ---------------------- */
  useEffect(() => {
    loadStats();
    loadVouchers();
    loadVoucherHistory();
  }, []);

  async function loadStats() {
    try {
      const res = await fetch('/api/admin/voucher-stats');
      if (res.ok) setStats(await res.json());
    } catch (e) {
      console.warn('Stats load failed', e);
    }
  }

  async function loadVouchers() {
    try {
      setListLoading(true);
      const res = await fetch('/api/admin/vouchers/list');
      if (!res.ok) throw new Error(`List failed (${res.status})`);
      const data = await res.json();
      setVouchers(data.vouchers || []);
    } catch (e) {
      setError(e.message || 'Failed to load vouchers');
    } finally {
      setListLoading(false);
    }
  }

  async function loadVoucherHistory() {
    try {
      const res = await fetch('/api/admin/vouchers/history');
      if (!res.ok) throw new Error(`History failed (${res.status})`);
      const data = await res.json();
      setVoucherHistory(data.redemptions || []);
    } catch (e) {
      console.warn('History load failed', e);
    }
  }

  /* ---------------------- Actions ---------------------- */
  const genSubmit = async (e) => {
    e.preventDefault();
    setGenerated([]);
    setError('');
    setOkMsg('');
    setLoading(true);
    try {
      const payload = {
        ...gForm,
        ticketCount: Number(gForm.ticketCount),
        count: Number(gForm.count),
        maxRedemptions: Number(gForm.maxRedemptions),
        perUserLimit: Number(gForm.perUserLimit),
        expiresAt: gForm.expiresAt || null,
        assignedToUserId: gForm.assignedToUserId || null,
      };
      const res = await fetch('/api/admin/vouchers/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed to generate');

      setGenerated(json.vouchers || []);
      setOkMsg(`Generated ${json.vouchers?.length ?? 0} code(s).`);

      // Refresh counters/lists
      await Promise.all([loadStats(), loadVouchers()]);
    } catch (e) {
      setError(e.message || 'Generate failed');
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------- Derived ---------------------- */
  const filtered = useMemo(() => {
    if (!query.trim()) return vouchers;
    const q = query.toLowerCase();
    return vouchers.filter((v) =>
      [
        v.code,
        v.codeDisplay,
        v.competitionSlug,
        v.ticketCount,
        v.maxRedemptions,
        v.notes,
        v.createdBy,
      ]
        .filter(Boolean)
        .some((s) => String(s).toLowerCase().includes(q))
    );
  }, [vouchers, query]);

  /* ---------------------- Render ---------------------- */
  return (
    <AdminGuard>
      <AdminSidebar>
        <main className="max-w-6xl mx-auto p-6 text-white">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold">Vouchers</h1>
            <Link
              href="/admin"
              className="rounded-lg border border-cyan-400/40 px-3 py-2 hover:bg-cyan-400/10"
            >
              ← Back to Admin
            </Link>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex gap-3">
            {[
              ['generate', 'Generate'],
              ['list', `Vouchers (${stats.total})`],
              ['history', `History (${stats.redeemed})`],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-4 py-2 rounded ${
                  activeTab === key ? 'bg-cyan-500 text-black' : 'bg-gray-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Alerts */}
          {(error || okMsg) && (
            <div className="mb-4 grid gap-3">
              {error && (
                <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3">
                  {error}
                </div>
              )}
              {okMsg && (
                <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3">
                  {okMsg}
                </div>
              )}
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-[#0f172a] border border-cyan-400 rounded-lg p-4">
              <div className="text-2xl font-bold text-cyan-400">{stats.total}</div>
              <div className="text-sm text-gray-300">Total Vouchers</div>
            </div>
            <div className="bg-[#0f172a] border border-green-400 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-400">{stats.active}</div>
              <div className="text-sm text-gray-300">Active</div>
            </div>
            <div className="bg-[#0f172a] border border-yellow-400 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-400">{stats.redeemed}</div>
              <div className="text-sm text-gray-300">Redeemed</div>
            </div>
          </div>

          {/* Generate Codes */}
          {activeTab === 'generate' && (
            <section className="mb-10 rounded-xl border border-cyan-400/40 p-4 bg-[#0b1220]">
              <h2 className="text-xl font-semibold mb-4">Generate Voucher Codes</h2>
              <form onSubmit={genSubmit} className="grid gap-3 sm:grid-cols-2">
                <label className="flex flex-col">
                  <span>Competition Slug</span>
                  <input
                    className="text-black rounded p-2"
                    required
                    value={gForm.competitionSlug}
                    onChange={(e) =>
                      setGForm((s) => ({ ...s, competitionSlug: e.target.value }))
                    }
                  />
                </label>
                <label className="flex flex-col">
                  <span>Tickets per Code</span>
                  <input
                    type="number"
                    min={1}
                    className="text-black rounded p-2"
                    required
                    value={gForm.ticketCount}
                    onChange={(e) =>
                      setGForm((s) => ({ ...s, ticketCount: e.target.value }))
                    }
                  />
                </label>
                <label className="flex flex-col">
                  <span>Number of Codes</span>
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    className="text-black rounded p-2"
                    required
                    value={gForm.count}
                    onChange={(e) => setGForm((s) => ({ ...s, count: e.target.value }))}
                  />
                </label>
                <label className="flex flex-col">
                  <span>Max Redemptions (per code)</span>
                  <input
                    type="number"
                    min={1}
                    className="text-black rounded p-2"
                    required
                    value={gForm.maxRedemptions}
                    onChange={(e) =>
                      setGForm((s) => ({ ...s, maxRedemptions: e.target.value }))
                    }
                  />
                </label>
                <label className="flex flex-col">
                  <span>Per-User Limit</span>
                  <input
                    type="number"
                    min={1}
                    className="text-black rounded p-2"
                    required
                    value={gForm.perUserLimit}
                    onChange={(e) =>
                      setGForm((s) => ({ ...s, perUserLimit: e.target.value }))
                    }
                  />
                </label>
                <label className="flex flex-col">
                  <span>Expires At (optional)</span>
                  <input
                    type="datetime-local"
                    className="text-black rounded p-2"
                    value={gForm.expiresAt}
                    onChange={(e) =>
                      setGForm((s) => ({ ...s, expiresAt: e.target.value }))
                    }
                  />
                </label>
                <label className="flex flex-col">
                  <span>Assign to User (optional)</span>
                  <input
                    className="text-black rounded p-2"
                    placeholder="userId"
                    value={gForm.assignedToUserId}
                    onChange={(e) =>
                      setGForm((s) => ({ ...s, assignedToUserId: e.target.value }))
                    }
                  />
                </label>
                <label className="flex flex-col sm:col-span-2">
                  <span>Notes (optional)</span>
                  <input
                    className="text-black rounded p-2"
                    value={gForm.notes}
                    onChange={(e) => setGForm((s) => ({ ...s, notes: e.target.value }))}
                  />
                </label>
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 rounded bg-cyan-400 text-black font-bold disabled:opacity-50"
                  >
                    {loading ? 'Generating…' : 'Generate'}
                  </button>
                </div>
              </form>

              {generated.length > 0 && (
                <div className="mt-5">
                  <h3 className="font-semibold mb-2">Generated Codes</h3>
                  <ul className="space-y-1">
                    {generated.map((g) => (
                      <li key={g.id || g.codeHash || g.code} className="text-sm">
                        <code className="bg-white/10 px-2 py-1 rounded">{g.code}</code>
                        <span className="ml-2 text-cyan-300">
                          → {g.competitionSlug} ×{g.ticketCount}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          {/* Voucher List */}
          {activeTab === 'list' && (
            <section className="rounded-xl border border-cyan-400/40 p-4 bg-[#0b1220]">
              <h2 className="text-xl font-semibold mb-4">Voucher List</h2>
              <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search code, slug, notes…"
                  className="bg-[#0f1830] rounded-lg px-3 py-2 border border-cyan-400/30 w-64"
                />
                <button
                  onClick={loadVouchers}
                  className="rounded border border-cyan-400/40 px-3 py-2 hover:bg-cyan-400/10"
                >
                  Refresh
                </button>
              </div>

              {listLoading ? (
                <div className="text-cyan-200/80">Loading vouchers…</div>
              ) : filtered.length === 0 ? (
                <div className="text-cyan-200/70">No vouchers found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-cyan-400/30">
                        <th className="pb-3 text-cyan-300 font-semibold">Code</th>
                        <th className="pb-3 text-cyan-300 font-semibold">Competition</th>
                        <th className="pb-3 text-cyan-300 font-semibold">Tickets</th>
                        <th className="pb-3 text-cyan-300 font-semibold">Usage</th>
                        <th className="pb-3 text-cyan-300 font-semibold">Status</th>
                        <th className="pb-3 text-cyan-300 font-semibold">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((voucher) => (
                        <tr key={voucher.id || voucher._id || voucher.code} className="border-b border-gray-700">
                          <td className="py-3">
                            <code className="bg-white/10 px-2 py-1 rounded text-sm">
                              {voucher.codeDisplay || voucher.code}
                            </code>
                          </td>
                          <td className="py-3 text-gray-300">{voucher.competitionSlug}</td>
                          <td className="py-3 text-gray-300">{voucher.ticketCount}</td>
                          <td className="py-3 text-gray-300">
                            {voucher.redeemedCount} / {voucher.maxRedemptions}
                          </td>
                          <td className="py-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                voucher.isFullyRedeemed
                                  ? 'bg-red-500/20 text-red-400'
                                  : !voucher.isActive
                                  ? 'bg-gray-500/20 text-gray-400'
                                  : 'bg-green-500/20 text-green-400'
                              }`}
                            >
                              {voucher.isFullyRedeemed
                                ? 'Fully Redeemed'
                                : !voucher.isActive
                                ? 'Expired'
                                : 'Active'}
                            </span>
                          </td>
                          <td className="py-3 text-gray-300">
                            {voucher.createdAt ? new Date(voucher.createdAt).toLocaleDateString() : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {/* Voucher History */}
          {activeTab === 'history' && (
            <section className="rounded-xl border border-cyan-400/40 p-4 bg-[#0b1220]">
              <h2 className="text-xl font-semibold mb-4">Voucher Redemption History</h2>
              {voucherHistory.length === 0 ? (
                <div className="text-cyan-200/70">No redemptions yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-cyan-400/30">
                        <th className="pb-3 text-cyan-300 font-semibold">Voucher Code</th>
                        <th className="pb-3 text-cyan-300 font-semibold">User ID</th>
                        <th className="pb-3 text-cyan-300 font-semibold">Competition</th>
                        <th className="pb-3 text-cyan-300 font-semibold">Tickets</th>
                        <th className="pb-3 text-cyan-300 font-semibold">Redeemed At</th>
                        <th className="pb-3 text-cyan-300 font-semibold">IP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {voucherHistory.map((r) => (
                        <tr key={r.id || r._id} className="border-b border-gray-700">
                          <td className="py-3">
                            <code className="bg-white/10 px-2 py-1 rounded text-sm">{r.voucherCode}</code>
                          </td>
                          <td className="py-3 text-gray-300">{r.userId}</td>
                          <td className="py-3 text-gray-300">{r.competitionSlug}</td>
                          <td className="py-3 text-gray-300">{r.ticketCount}</td>
                          <td className="py-3 text-gray-300">
                            {r.redeemedAt ? new Date(r.redeemedAt).toLocaleString() : '—'}
                          </td>
                          <td className="py-3 text-gray-300">{r.ip || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}
        </main>
      </AdminSidebar>
    </AdminGuard>
  );
}
