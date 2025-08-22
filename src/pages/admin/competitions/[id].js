'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AdminSidebar from 'components/AdminSidebar';
import AdminGuard from 'components/AdminGuard';
import Link from 'next/link';

export default function AdminCompetitionDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [competition, setCompetition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchCompetition = async () => {
      try {
        const adminData = JSON.parse(localStorage.getItem('adminUser'));
        const res = await fetch(`/api/admin/competitions/${id}`, {
        headers: {
  'x-admin-username': adminData.username,
  'x-admin-password': adminData.password,
}

        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch competition');
        setCompetition(data.competition);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCompetition();
  }, [id]);

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
              <h1 className="text-3xl font-bold text-cyan-400 mb-2">{competition.title}</h1>
              <p className="text-gray-400 mb-6">Slug: {competition.comp.slug}</p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-[#0f172a] p-4 border border-cyan-500 rounded-lg">
                  <p className="text-sm text-gray-400">Entry Fee</p>
                  <p className="text-xl font-bold text-cyan-400">
                    {competition.comp.entryFee} π
                  </p>
                </div>
                <div className="bg-[#0f172a] p-4 border border-cyan-500 rounded-lg">
                  <p className="text-sm text-gray-400">Tickets</p>
                  <p className="text-xl font-bold text-cyan-400">
                    {competition.comp.ticketsSold} / {competition.comp.totalTickets}
                  </p>
                </div>
              </div>

              {/* 🏆 Winners Panel */}
              <div className="bg-[#0f172a] p-6 border border-green-500 rounded-lg">
                <h2 className="text-xl font-bold text-green-300 mb-4">🏆 Winners</h2>
                {competition.winners?.length > 0 ? (
                  <ul className="space-y-3">
                    {competition.winners.map((winner, index) => (
                      <li key={index} className="bg-white/5 p-3 rounded">
                        <div>
                          <strong>#{index + 1}</strong> – {winner.username || 'Unknown'}
                        </div>
                        <div>🎟️ Ticket #: {winner.ticketNumber}</div>
                        <div>
                          {winner.claimed ? (
                            <span className="text-green-400">
                              ✅ Claimed at{' '}
                              {new Date(winner.claimedAt).toLocaleString()}
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

              <div className="mt-6">
                <Link
                  href="/admin/competitions"
                  className="inline-block bg-cyan-500 text-black px-4 py-2 rounded hover:bg-cyan-400"
                >
                  ← Back to Competitions
                </Link>
              </div>
            </>
          )}
        </div>
      </AdminSidebar>
    </AdminGuard>
  );
}
