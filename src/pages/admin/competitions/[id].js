// file: src/pages/admin/competitions/[id].js
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import AdminSidebar from 'components/AdminSidebar';
import AdminGuard from 'components/AdminGuard';
import Link from 'next/link';

/* --------------------------- auth header helpers --------------------------- */
function getStoredAdmin() {
  try {
    const raw = localStorage.getItem('adminUser');
    if (!raw) return null;
    return JSON.parse(raw); // { username, password, role, email }
  } catch {
    return null;
  }
}

function basicAuthHeader(u, p) {
  if (!u || !p) return {};
  const token = btoa(`${u}:${p}`);
  return { Authorization: `Basic ${token}` };
}

function headerCredsCompat() {
  // support both our header guard and Basic Auth
  const admin = getStoredAdmin();
  const u = admin?.username || localStorage.getItem('omc_admin_user') || '';
  const p = admin?.password || localStorage.getItem('omc_admin_pass') || '';
  return {
    ...basicAuthHeader(u, p),        // for endpoints using Basic Auth
    'x-admin-user': u,               // for requireAdmin(req) header guard
    'x-admin-pass': p,
  };
}

/* ----------------------------- field helpers ------------------------------ */
function pickCompField(comp, root, key, fallback = 'N/A') {
  if (comp && comp[key] != null) return comp[key];
  if (root && root[key] != null) return root[key];
  return fallback;
}

export default function AdminCompetitionDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [competition, setCompetition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [drawing, setDrawing] = useState(false);

  const authHeaders = useMemo(() => headerCredsCompat(), []);

  async function fetchCompetition() {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/competitions/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        credentials: 'include',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Failed to fetch competition');
      setCompetition(data.competition || data); // accept either shape
    } catch (err) {
      console.error(err);
      setError(err.message);
      setCompetition(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!router.isReady) return;
    fetchCompetition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, id]);

  async function handleDrawWinners() {
    if (!competition) return;
    if (!confirm('Are you sure you want to draw winners?')) return;
    try {
      setDrawing(true);
      const count =
        pickCompField(competition?.comp, competition, 'winnersCount', 1) || 1;

      const res = await fetch(`/api/admin/competitions/${id}/draw-winners`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        credentials: 'include',
        body: JSON.stringify({ count }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Failed to draw winners');
      alert('✅ Winners drawn successfully!');
      fetchCompetition();
    } catch (err) {
      alert(`❌ ${err.message}`);
    } finally {
      setDrawing(false);
    }
  }

  const comp = competition?.comp || competition || {};
  const entryFee = pickCompField(competition?.comp, competition, 'entryFee', 0);
  const ticketsSold = pickCompField(competition?.comp, competition, 'ticketsSold', 0);
  const totalTickets = pickCompField(competition?.comp, competition, 'totalTickets', 0);
  const maxPerUser = pickCompField(competition?.comp, competition, 'maxPerUser', 'N/A');
  const winnersCount = pickCompField(competition?.comp, competition, 'winnersCount', 'N/A');

  return (
    <AdminGuard>
      <AdminSidebar>
        <div className="max-w-4xl mx-auto p-6 text-white">
          {loading ? (
            <p className="text-cyan-300">Loading competition...</p>
          ) : error ? (
            <p className="text-red-400">{error}</p>
          ) : !competition ? (
            <p className="text-gray-400">Competition not found.</p>
          ) : (
            <>
              {/* Header */}
              <h1 className="text-3xl font-bold text-cyan-400 mb-2">
                {competition.title || comp.title || 'Untitled'}
              </h1>
              <p className="text-gray-400 mb-6">
                Slug: {pickCompField(competition?.comp, competition, 'slug', '—')}
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-[#0f172a] p-4 border border-cyan-500 rounded-lg">
                  <p className="text-sm text-gray-400">Entry Fee</p>
                  <p className="text-xl font-bold text-cyan-400">
                    {entryFee} π
                  </p>
                </div>
                <div className="bg-[#0f172a] p-4 border border-cyan-500 rounded-lg">
                  <p className="text-sm text-gray-400">Tickets</p>
                  <p className="text-xl font-bold text-cyan-400">
                    {ticketsSold} / {totalTickets}
                  </p>
                </div>
                <div className="bg-[#0f172a] p-4 border border-cyan-500 rounded-lg">
                  <p className="text-sm text-gray-400">Max Per User</p>
                  <p className="text-xl font-bold text-cyan-400">
                    {maxPerUser}
                  </p>
                </div>
                <div className="bg-[#0f172a] p-4 border border-cyan-500 rounded-lg">
                  <p className="text-sm text-gray-400">Winners Count</p>
                  <p className="text-xl font-bold text-cyan-400">
                    {winnersCount}
                  </p>
                </div>
              </div>

              {/* 🏆 Winners Panel */}
              <div className="bg-[#0f172a] p-6 border border-green-500 rounded-lg">
                <h2 className="text-xl font-bold text-green-300 mb-4">🏆 Winners</h2>
                {Array.isArray(competition.winners) && competition.winners.length > 0 ? (
                  <ul className="space-y-3">
                    {competition.winners.map((winner, index) => (
                      <li key={index} className="bg-white/5 p-3 rounded">
                        <div>
                          <strong>#{index + 1}</strong> – {winner.username || winner.handle || 'Unknown'}
                        </div>
                        <div>🎟️ Ticket #: {winner.ticketNumber ?? winner.ticketId ?? '—'}</div>
                        <div>
                          {winner.claimed ? (
                            <span className="text-green-400">
                              ✅ Claimed at{' '}
                              {winner.claimedAt
                                ? new Date(winner.claimedAt).toLocaleString()
                                : 'N/A'}
                            </span>
                          ) : (
                            <span className="text-yellow-400">⏳ Not Claimed</span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400">No winners selected yet.</p>
                )}
              </div>

              {/* Actions */}
              <div className="mt-6 flex gap-3 flex-wrap">
                <Link
                  href="/admin/competitions"
                  className="inline-block bg-cyan-500 text-black px-4 py-2 rounded hover:bg-cyan-400"
                >
                  ← Back to Competitions
                </Link>

                <Link
                  href={`/admin/competitions/edit/${id}`}
                  className="inline-block bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300"
                >
                  ✏️ Edit Competition
                </Link>

                <button
                  onClick={handleDrawWinners}
                  disabled={drawing}
                  className={`inline-block px-4 py-2 rounded ${
                    drawing
                      ? 'bg-green-800 text-gray-400 cursor-not-allowed'
                      : 'bg-green-500 text-black hover:bg-green-400'
                  }`}
                >
                  {drawing ? 'Drawing...' : '🎯 Draw Winners'}
                </button>
              </div>
            </>
          )}
        </div>
      </AdminSidebar>
    </AdminGuard>
  );
}
