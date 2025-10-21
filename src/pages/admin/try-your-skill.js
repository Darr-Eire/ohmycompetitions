'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminSidebar from '../../components/AdminSidebar';
import AdminGuard from '../../components/AdminGuard';

export default function AdminTryYourSkillPage() {
  const [games, setGames] = useState([]);
  const [stats, setStats] = useState(null);
  const [recentResults, setRecentResults] = useState([]);
  const [topWinners, setTopWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [gamesRes, statsRes, resultsRes, winnersRes] = await Promise.all([
        axios.get('/api/admin/try-your-skill'),
        axios.get('/api/admin/try-your-skill?action=stats'),
        axios.get('/api/admin/try-your-skill?action=recent-results'),
        axios.get('/api/admin/try-your-skill?action=top-winners'),
      ]);

      setGames(gamesRes.data.games || []);
      setStats(statsRes.data);
      setRecentResults(resultsRes.data || []);
      setTopWinners(winnersRes.data || []);
    } catch (err) {
      console.error('Error loading Try Your Skill data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const resetUserAttempts = async (userUid) => {
    if (!userUid || !confirm('Reset this user\'s daily game attempts?')) return;
    try {
      await axios.post('/api/admin/try-your-skill', {
        action: 'reset-user',
        userUid
      });
      alert('User attempts reset successfully!');
      loadData();
    } catch (err) {
      console.error('Error resetting user attempts:', err);
      alert('Failed to reset user attempts.');
    }
  };

  const deleteResult = async (id) => {
    if (!confirm('Delete this game result?')) return;
    try {
      await axios.delete('/api/admin/try-your-skill', {
        data: { action: 'delete-result', id }
      });
      alert('Result deleted successfully!');
      loadData();
    } catch (err) {
      console.error('Error deleting result:', err);
      alert('Failed to delete result.');
    }
  };

  const clearAllResults = async () => {
    if (!confirm('⚠️ DANGER: This will delete ALL game results. Are you sure?')) return;
    if (!confirm('This action cannot be undone. Really delete ALL results?')) return;
    try {
      await axios.delete('/api/admin/try-your-skill', {
        data: { action: 'clear-all-results' }
      });
      alert('All results cleared successfully!');
      loadData();
    } catch (err) {
      console.error('Error clearing results:', err);
      alert('Failed to clear results.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <h1 className="text-3xl font-bold mb-6">Loading Try Your Skill Admin...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <h1 className="text-3xl font-bold mb-6 text-red-400">Error: {error}</h1>
        <button onClick={loadData} className="bg-cyan-500 px-4 py-2 rounded">Retry</button>
      </div>
    );
  }

  return (
    <AdminGuard>
      <AdminSidebar>
        <div className="space-y-6 p-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-cyan-400">🎯 Try Your Skill Management</h1>
              <p className="text-gray-400 mt-1">Monitor games, stats and player activity</p>
            </div>
            <button
              onClick={loadData}
              className="bg-cyan-500 hover:bg-cyan-600 text-black px-4 py-2 rounded-lg font-bold transition"
            >
              🔄 Refresh
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-6">
            {['overview', 'statistics', 'recent-results', 'top-winners', 'management'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded capitalize ${
                  activeTab === tab
                    ? 'bg-cyan-500 text-black font-bold'
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
              >
                {tab.replace('-', ' ')}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-cyan-300">Games Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {games.map((game) => (
                  <div key={game.slug} className="border border-cyan-400 rounded-lg p-6 bg-[#0f172a]">
                    <h3 className="text-xl font-bold text-cyan-300 mb-2">{game.name}</h3>
                    <p className="text-gray-300 mb-2">{game.description}</p>
                    <p className="text-green-400 font-bold">Prize: {game.prize}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Statistics Tab */}
          {activeTab === 'statistics' && stats && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-cyan-300">Game Statistics</h2>
              <div className="border border-cyan-400 rounded-lg p-6 bg-[#0f172a]">
                <h3 className="text-xl font-bold mb-4">User Activity</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard label="Total Users" value={stats.userStats.totalUsers} color="text-cyan-400" />
                  <StatCard label="Reflex Players" value={stats.userStats.activeReflexPlayers} color="text-green-400" />
                  <StatCard label="Spin Players" value={stats.userStats.activeSpinPlayers} color="text-blue-400" />
                  <StatCard label="Slot Players" value={stats.userStats.activeSlotPlayers} color="text-purple-400" />
                </div>
              </div>
              <div className="border border-cyan-400 rounded-lg p-6 bg-[#0f172a]">
                <h3 className="text-xl font-bold mb-4">Game Performance</h3>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-cyan-600">
                      <th className="text-left p-2">Game</th>
                      <th className="text-left p-2">Total Played</th>
                      <th className="text-left p-2">Total Prizes</th>
                      <th className="text-left p-2">Avg Prize</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.gameStats.map((game) => (
                      <tr key={game._id} className="border-b border-gray-700">
                        <td className="p-2 capitalize">{game._id}</td>
                        <td className="p-2">{game.totalPlayed}</td>
                        <td className="p-2">{game.totalPrizes}π</td>
                        <td className="p-2">{game.averagePrize?.toFixed(2)}π</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Recent Results Tab */}
          {activeTab === 'recent-results' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-cyan-300">Recent Game Results</h2>
              <div className="border border-cyan-400 rounded-lg p-6 bg-[#0f172a] max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-cyan-600 sticky top-0 bg-[#0f172a]">
                      <th className="text-left p-2">User UID</th>
                      <th className="text-left p-2">Game</th>
                      <th className="text-left p-2">Result</th>
                      <th className="text-left p-2">Prize</th>
                      <th className="text-left p-2">Date</th>
                      <th className="text-left p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentResults.map((result) => (
                      <tr key={result._id} className="border-b border-gray-700 hover:bg-gray-800">
                        <td className="p-2 font-mono text-xs">{result.userUid}</td>
                        <td className="p-2 capitalize">{result.game}</td>
                        <td className="p-2">{result.result}</td>
                        <td className="p-2 text-green-400">{result.prizeAmount}π</td>
                        <td className="p-2">{new Date(result.createdAt).toLocaleDateString()}</td>
                        <td className="p-2">
                          <button
                            onClick={() => deleteResult(result._id)}
                            className="bg-red-500 px-2 py-1 rounded text-xs"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Top Winners Tab */}
          {activeTab === 'top-winners' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-cyan-300">Top Winners</h2>
              <div className="border border-cyan-400 rounded-lg p-6 bg-[#0f172a]">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-cyan-600">
                      <th className="text-left p-2">User UID</th>
                      <th className="text-left p-2">Total Winnings</th>
                      <th className="text-left p-2">Games Won</th>
                      <th className="text-left p-2">Last Win</th>
                      <th className="text-left p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topWinners.map((winner, index) => (
                      <tr key={winner._id} className="border-b border-gray-700">
                        <td className="p-2 font-mono text-xs">
                          {index < 3 && <span className="text-yellow-400 mr-2">🏆</span>}
                          {winner._id}
                        </td>
                        <td className="p-2 text-green-400 font-bold">{winner.totalWinnings}π</td>
                        <td className="p-2">{winner.gamesWon}</td>
                        <td className="p-2">{new Date(winner.lastWin).toLocaleDateString()}</td>
                        <td className="p-2">
                          <button
                            onClick={() => resetUserAttempts(winner._id)}
                            className="bg-yellow-500 px-2 py-1 rounded text-xs text-black"
                          >
                            Reset Attempts
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Management Tab */}
          {activeTab === 'management' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-cyan-300">Game Management</h2>
              <div className="border border-red-500 rounded-lg p-6 bg-red-900/20">
                <h3 className="text-xl font-bold text-red-400 mb-4">⚠️ Danger Zone</h3>
                <div className="space-y-4">
                  <button
                    onClick={clearAllResults}
                    className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded font-bold"
                  >
                    🗑️ Clear ALL Game Results
                  </button>
                  <p className="text-red-300 text-sm">
                    This will permanently delete all game results from the database. This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </AdminSidebar>
    </AdminGuard>
  );
}

// Reusable stat card component
function StatCard({ label, value, color }) {
  return (
    <div className="text-center">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-sm text-gray-300">{label}</div>
    </div>
  );
}
