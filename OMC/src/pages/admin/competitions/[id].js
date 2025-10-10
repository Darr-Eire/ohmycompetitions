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
  const [drawingWinners, setDrawingWinners] = useState(false);
  const [drawMessage, setDrawMessage] = useState('');
  const [showTicketPrizesModal, setShowTicketPrizesModal] = useState(false);
  const [ticketPrizes, setTicketPrizes] = useState([]);
  const [savingPrizes, setSavingPrizes] = useState(false);

  /* ---------------------- Fetch competition ---------------------- */
  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        const adminDataRaw = localStorage.getItem('adminUser');
        if (!adminDataRaw) throw new Error('Missing admin credentials. Please re-login.');
        const adminData = JSON.parse(adminDataRaw);

        const res = await fetch(`/api/admin/competitions/${id}`, {
          headers: {
            'x-admin-username': adminData.username,
            'x-admin-password': adminData.password,
          },
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
    })();
  }, [id]);

  useEffect(() => {
    if (competition?.ticketPrizes) setTicketPrizes(competition.ticketPrizes);
  }, [competition]);

  /* ---------------------- Draw Winners ---------------------- */
  const handleDrawWinners = async () => {
    if (!competition || drawingWinners) return;
    setDrawingWinners(true);
    setDrawMessage('');

    try {
      const adminDataRaw = localStorage.getItem('adminUser');
      if (!adminDataRaw) throw new Error('Missing admin credentials. Please re-login.');
      const adminData = JSON.parse(adminDataRaw);

      const res = await fetch(`/api/admin/competitions/${id}/draw-winners`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-username': adminData.username,
          'x-admin-password': adminData.password,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to draw winners');
      setDrawMessage(`✅ ${data.message}`);

      // Refresh competition
      const refresh = await fetch(`/api/admin/competitions/${id}`, {
        headers: {
          'x-admin-username': adminData.username,
          'x-admin-password': adminData.password,
        },
      });
      const refreshData = await refresh.json();
      if (refresh.ok) setCompetition(refreshData.competition);
    } catch (err) {
      console.error(err);
      setDrawMessage(`❌ ${err.message}`);
    } finally {
      setDrawingWinners(false);
    }
  };

  /* ---------------------- Ticket Prize Handlers ---------------------- */
  const handleSaveTicketPrizes = async () => {
    if (!id || savingPrizes) return;
    setSavingPrizes(true);

    try {
      const adminDataRaw = localStorage.getItem('adminUser');
      if (!adminDataRaw) throw new Error('Missing admin credentials. Please re-login.');
      const adminData = JSON.parse(adminDataRaw);

      const res = await fetch(`/api/admin/competitions/${id}/ticket-prizes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-username': adminData.username,
          'x-admin-password': adminData.password,
        },
        body: JSON.stringify({ ticketPrizes }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save ticket prizes');

      setCompetition(prev => ({ ...prev, ticketPrizes: data.ticketPrizes }));
      setShowTicketPrizesModal(false);
      alert('✅ Ticket prizes saved successfully!');
    } catch (err) {
      console.error(err);
      alert(`Error: ${err.message}`);
    } finally {
      setSavingPrizes(false);
    }
  };

  const addTicketPrize = () =>
    setTicketPrizes(prev => [...prev, { competitionSlug: '', ticketCount: 1, position: null }]);

  const removeTicketPrize = index =>
    setTicketPrizes(prev => prev.filter((_, i) => i !== index));

  const updateTicketPrize = (index, field, value) =>
    setTicketPrizes(prev => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));

  /* ---------------------- Render ---------------------- */
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
              <p className="text-gray-400 mb-6">Slug: {competition.comp?.slug || '—'}</p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-[#0f172a] p-4 border border-cyan-500 rounded-lg">
                  <p className="text-sm text-gray-400">Entry Fee</p>
                  <p className="text-xl font-bold text-cyan-400">
                    {competition.comp?.entryFee ?? '—'} π
                  </p>
                </div>
                <div className="bg-[#0f172a] p-4 border border-cyan-500 rounded-lg">
                  <p className="text-sm text-gray-400">Tickets</p>
                  <p className="text-xl font-bold text-cyan-400">
                    {competition.comp?.ticketsSold ?? 0} / {competition.comp?.totalTickets ?? 0}
                  </p>
                </div>
              </div>

              {/* Winners */}
              <div className="bg-[#0f172a] p-6 border border-green-500 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-green-300">🏆 Winners</h2>
                  {competition.winners?.length === 0 && competition.comp?.status === 'active' && (
                    <button
                      onClick={handleDrawWinners}
                      disabled={drawingWinners}
                      className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                        drawingWinners
                          ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                          : 'bg-green-500 hover:bg-green-600 text-white'
                      }`}
                    >
                      {drawingWinners ? 'Drawing…' : '🎲 Draw Winners'}
                    </button>
                  )}
                </div>

                {drawMessage && (
                  <div
                    className={`mb-4 p-3 rounded-lg ${
                      drawMessage.startsWith('✅')
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}
                  >
                    {drawMessage}
                  </div>
                )}

                {Array.isArray(competition.winners) && competition.winners.length > 0 ? (
                  <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-green-400/40">
                          <th>Position</th>
                          <th>Winner</th>
                          <th>Ticket #</th>
                          <th>Prize</th>
                          <th>Status</th>
                          <th>Claimed At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {competition.winners.map((w, i) => (
                          <tr key={i} className="border-b border-gray-700/30">
                            <td className="py-2 font-semibold">{i + 1}</td>
                            <td>{w.username || 'Unknown'}</td>
                            <td>#{w.ticketNumber}</td>
                            <td>{competition.prizeBreakdown?.[i] || competition.prize || '—'}</td>
                            <td>{w.claimed ? '✅ Claimed' : '⏳ Pending'}</td>
                            <td>{w.claimedAt ? new Date(w.claimedAt).toLocaleString() : '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-400 mt-4">No winners yet.</p>
                )}
              </div>

              {/* Ticket Prizes */}
              <div className="bg-[#0f172a] p-6 border border-purple-500 rounded-lg mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-purple-300">🎫 Ticket Prizes</h2>
                  <button
                    onClick={() => setShowTicketPrizesModal(true)}
                    className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg"
                  >
                    Manage Ticket Prizes
                  </button>
                </div>

                {competition.ticketPrizes?.length > 0 ? (
                  <ul className="space-y-2">
                    {competition.ticketPrizes.map((p, i) => (
                      <li key={i} className="border border-purple-400/20 p-3 rounded-lg">
                        {p.ticketCount}× for <strong>{p.competitionSlug}</strong>{' '}
                        {p.position && <span className="text-sm text-gray-400">– Position {p.position}</span>}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400">No ticket prizes yet.</p>
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

      {/* Ticket Prize Modal */}
      {showTicketPrizesModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#0f172a] border border-purple-500 rounded-lg p-6 max-w-2xl w-full mx-4">
            <h3 className="text-xl font-bold text-purple-300 mb-4">Manage Ticket Prizes</h3>

            {ticketPrizes.map((prize, i) => (
              <div key={i} className="bg-gray-800/30 rounded-lg p-4 mb-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={prize.competitionSlug}
                    onChange={e => updateTicketPrize(i, 'competitionSlug', e.target.value)}
                    placeholder="Competition slug"
                    className="bg-gray-700 text-white px-3 py-2 rounded border border-gray-600"
                  />
                  <input
                    type="number"
                    min="1"
                    value={prize.ticketCount}
                    onChange={e =>
                      updateTicketPrize(i, 'ticketCount', parseInt(e.target.value) || 1)
                    }
                    className="bg-gray-700 text-white px-3 py-2 rounded border border-gray-600"
                  />
                  <input
                    type="number"
                    min="1"
                    value={prize.position || ''}
                    onChange={e =>
                      updateTicketPrize(i, 'position', e.target.value ? parseInt(e.target.value) : null)
                    }
                    className="bg-gray-700 text-white px-3 py-2 rounded border border-gray-600"
                    placeholder="Position (optional)"
                  />
                </div>
                <button
                  onClick={() => removeTicketPrize(i)}
                  className="mt-2 text-red-400 hover:text-red-300 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}

            <div className="flex justify-between mt-4">
              <button
                onClick={addTicketPrize}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded"
              >
                + Add Prize
              </button>
              <button
                onClick={handleSaveTicketPrizes}
                disabled={savingPrizes}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {savingPrizes ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminGuard>
  );
}
