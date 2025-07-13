'use client';

import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminGuard from '../../components/AdminGuard';

export default function PiCashCodesAdminPage() {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Form state for creating new codes
  const [newCode, setNewCode] = useState({
    code: '',
    weekStart: '',
    prizePool: 15000,
    expiresAt: '',
    drawAt: '',
    claimExpiresAt: ''
  });

  useEffect(() => {
    loadCodes();
  }, []);

  const loadCodes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/pi-cash-codes');
      if (response.ok) {
        const data = await response.json();
        setCodes(data);
      } else {
        throw new Error('Failed to load codes');
      }
    } catch (err) {
      console.error('Error loading Pi Cash Codes:', err);
      setError('Failed to load Pi Cash Codes');
    } finally {
      setLoading(false);
    }
  };

  // Calculate next Monday 3:14 PM UTC
  const getNextMonday314PM = () => {
    const now = new Date();
    const nextMonday = new Date(now);
    
    // Find next Monday (1 = Monday)
    const daysUntilMonday = (8 - nextMonday.getUTCDay()) % 7;
    nextMonday.setUTCDate(nextMonday.getUTCDate() + daysUntilMonday);
    
    // Set to 3:14 PM UTC
    nextMonday.setUTCHours(15, 14, 0, 0);
    
    return nextMonday;
  };

  // Calculate dates based on Pi Cash Code schedule
  const calculatePiCashDates = (weekStart) => {
    const startDate = new Date(weekStart);
    
    // Expires: 31 hours and 4 minutes after start
    const expiresAt = new Date(startDate.getTime() + (31 * 60 + 4) * 60 * 1000);
    
    // Draw: Friday 3:14 PM UTC (4 days after Monday)
    const drawAt = new Date(startDate);
    drawAt.setUTCDate(drawAt.getUTCDate() + 4); // Friday
    drawAt.setUTCHours(15, 14, 0, 0);
    
    // Claim expires: 31 minutes and 4 seconds after draw
    const claimExpiresAt = new Date(drawAt.getTime() + (31 * 60 + 4) * 1000);
    
    return { expiresAt, drawAt, claimExpiresAt };
  };

  const generateCode = () => {
    const code = 'PI-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    setNewCode(prev => ({ ...prev, code }));
  };

  const setNextWeekSchedule = () => {
    const nextMonday = getNextMonday314PM();
    const { expiresAt, drawAt, claimExpiresAt } = calculatePiCashDates(nextMonday);
    
    setNewCode(prev => ({
      ...prev,
      weekStart: nextMonday.toISOString().slice(0, 16), // Format for datetime-local input
      expiresAt: expiresAt.toISOString().slice(0, 16),
      drawAt: drawAt.toISOString().slice(0, 16),
      claimExpiresAt: claimExpiresAt.toISOString().slice(0, 16)
    }));
  };

  const createCode = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/admin/pi-cash-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCode),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create code');
      }

      // Reset form
      setNewCode({
        code: '',
        weekStart: '',
        expiresAt: '',
        drawAt: '',
        claimExpiresAt: '',
        prizePool: 10000
      });

      // Reload codes
      await loadCodes();
      
      alert('✅ Pi Cash Code created successfully!');
    } catch (error) {
      console.error('Error creating code:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteCode = async (codeId) => {
    // Find the code to check its status
    const codeToDelete = codes.find(code => code._id === codeId);
    
    if (!codeToDelete) {
      setError('Code not found');
      return;
    }

    // Check if code is currently active
    const now = new Date();
    const isActive = now >= new Date(codeToDelete.weekStart) && now <= new Date(codeToDelete.expiresAt);
    
    if (isActive) {
      setError('Cannot delete an active Pi Cash Code. Wait until it expires.');
      return;
    }

    // Check if code has a winner
    if (codeToDelete.winner) {
      setError('Cannot delete a Pi Cash Code that has a winner. Consider archiving instead.');
      return;
    }

    if (!confirm('Are you sure you want to delete this Pi Cash Code? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/admin/pi-cash-codes', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: codeId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete code');
      }

      // Reload codes
      await loadCodes();
      
      alert('✅ Pi Cash Code deleted successfully!');
    } catch (error) {
      console.error('Error deleting code:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      timeZone: 'UTC',
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (code) => {
    if (code.claimed) return 'text-green-400';
    if (new Date() > new Date(code.expiresAt)) return 'text-red-400';
    if (new Date() > new Date(code.drawAt)) return 'text-yellow-400';
    return 'text-blue-400';
  };

  const getStatusText = (code) => {
    if (code.claimed) return 'Claimed';
    if (new Date() > new Date(code.expiresAt)) return 'Expired';
    if (new Date() > new Date(code.drawAt)) return 'Draw Complete';
    return 'Active';
  };

  return (
    <AdminGuard>
      <AdminSidebar>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-cyan-400">💰 Pi Cash Codes Management</h1>
              <p className="text-gray-400 mt-1">Manage weekly Pi Cash Code competitions</p>
            </div>
            <button
              onClick={loadCodes}
              className="bg-cyan-500 hover:bg-cyan-600 text-black px-4 py-2 rounded-lg font-bold transition"
            >
              🔄 Refresh
            </button>
          </div>

          {/* Schedule Info */}
          <div className="bg-[#0f172a] border border-cyan-400 rounded-lg p-4">
            <h3 className="text-lg font-bold text-cyan-300 mb-2">📅 Pi Cash Code Schedule</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-cyan-400 font-bold">Code Drop:</span>
                <br />Monday 3:14 PM UTC
              </div>
              <div>
                <span className="text-green-400 font-bold">Active Period:</span>
                <br />31 hours 4 minutes
              </div>
              <div>
                <span className="text-yellow-400 font-bold">Draw:</span>
                <br />Friday 3:14 PM UTC
              </div>
              <div>
                <span className="text-red-400 font-bold">Claim Window:</span>
                <br />31 minutes 4 seconds
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-[#0f172a] border border-cyan-400 rounded-lg p-4">
              <div className="text-2xl font-bold text-cyan-400">{codes.length}</div>
              <div className="text-sm text-gray-300">Total Codes</div>
            </div>
            <div className="bg-[#0f172a] border border-green-400 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-400">
                {codes.filter(c => c.claimed).length}
              </div>
              <div className="text-sm text-gray-300">Claimed</div>
            </div>
            <div className="bg-[#0f172a] border border-blue-400 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-400">
                {codes.filter(c => !c.claimed && new Date() < new Date(c.expiresAt)).length}
              </div>
              <div className="text-sm text-gray-300">Active</div>
            </div>
            <div className="bg-[#0f172a] border border-purple-400 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-400">
                {codes.reduce((sum, c) => sum + (c.prizePool || 0), 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-300">Total Prize Pool π</div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-4">
            {['overview', 'create', 'history'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded capitalize ${
                  activeTab === tab 
                    ? 'bg-cyan-500 text-black font-bold' 
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-cyan-300">Current Codes</h2>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-400 mx-auto mb-4"></div>
                  <p className="text-gray-400">Loading codes...</p>
                </div>
              ) : error ? (
                <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 text-center">
                  <p className="text-red-400">{error}</p>
                </div>
              ) : codes.length === 0 ? (
                <div className="bg-gray-900/20 border border-gray-500 rounded-lg p-6 text-center">
                  <p className="text-gray-400">No Pi Cash Codes found</p>
                </div>
              ) : (
                <div className="bg-[#0f172a] border border-cyan-400 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-cyan-500/20">
                      <tr>
                        <th className="text-left p-4 text-cyan-300">Code</th>
                        <th className="text-left p-4 text-cyan-300">Week Start</th>
                        <th className="text-left p-4 text-cyan-300">Prize Pool</th>
                        <th className="text-left p-4 text-cyan-300">Status</th>
                        <th className="text-left p-4 text-cyan-300">Winner</th>
                        <th className="text-left p-4 text-cyan-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {codes.map((code) => (
                        <tr key={code._id} className="border-b border-gray-700">
                          <td className="p-4 font-mono text-cyan-400">{code.code}</td>
                          <td className="p-4 text-gray-300">{formatDate(code.weekStart)}</td>
                          <td className="p-4 text-green-400">{code.prizePool?.toLocaleString() || 0} π</td>
                          <td className={`p-4 font-bold ${getStatusColor(code)}`}>
                            {getStatusText(code)}
                          </td>
                          <td className="p-4 text-gray-300">
                            {code.winner ? code.winner.username : 'No winner yet'}
                          </td>
                          <td className="p-4">
                            {(() => {
                              const now = new Date();
                              const isActive = now >= new Date(code.weekStart) && now <= new Date(code.expiresAt);
                              const hasWinner = code.winner;
                              const canDelete = !isActive && !hasWinner;
                              
                              return (
                                <button 
                                  onClick={() => deleteCode(code._id)}
                                  disabled={loading || !canDelete}
                                  className={`text-sm transition ${
                                    loading 
                                      ? 'opacity-50 cursor-not-allowed text-gray-500' 
                                      : canDelete
                                        ? 'text-red-400 hover:text-red-300 hover:scale-105'
                                        : 'text-gray-500 cursor-not-allowed'
                                  }`}
                                  title={
                                    isActive 
                                      ? 'Cannot delete active code' 
                                      : hasWinner 
                                        ? 'Cannot delete code with winner' 
                                        : 'Delete this code'
                                  }
                                >
                                  {loading ? 'Deleting...' : 'Delete'}
                                </button>
                              );
                            })()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Create Tab */}
          {activeTab === 'create' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-cyan-300">Create New Pi Cash Code</h2>
              
              <div className="bg-[#0f172a] border border-cyan-400 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Code Generation */}
                  <div>
                    <label className="block text-cyan-300 text-sm font-bold mb-2">
                      Code
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCode.code}
                        onChange={(e) => setNewCode(prev => ({ ...prev, code: e.target.value }))}
                        placeholder="PI-XXXXXX"
                        className="flex-1 px-3 py-2 bg-black border border-cyan-400 rounded text-white font-mono"
                      />
                      <button
                        onClick={generateCode}
                        className="bg-cyan-500 hover:bg-cyan-600 text-black px-4 py-2 rounded font-bold"
                      >
                        Generate
                      </button>
                    </div>
                  </div>

                  {/* Prize Pool */}
                  <div>
                    <label className="block text-cyan-300 text-sm font-bold mb-2">
                      Prize Pool (π)
                    </label>
                    <input
                      type="number"
                      value={newCode.prizePool}
                      onChange={(e) => setNewCode(prev => ({ ...prev, prizePool: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 bg-black border border-cyan-400 rounded text-white"
                      min="1000"
                      step="1000"
                    />
                  </div>

                  {/* Quick Schedule Setup */}
                  <div className="md:col-span-2">
                    <label className="block text-cyan-300 text-sm font-bold mb-2">
                      Quick Schedule Setup
                    </label>
                    <button
                      onClick={setNextWeekSchedule}
                      className="bg-green-500 hover:bg-green-600 text-black px-4 py-2 rounded font-bold"
                    >
                      🗓️ Set Next Monday Schedule
                    </button>
                    <p className="text-gray-400 text-sm mt-1">
                      Automatically calculates all dates based on Pi Cash Code timing rules
                    </p>
                  </div>

                  {/* Week Start */}
                  <div>
                    <label className="block text-cyan-300 text-sm font-bold mb-2">
                      Week Start (Monday 3:14 PM UTC)
                    </label>
                    <input
                      type="datetime-local"
                      value={newCode.weekStart}
                      onChange={(e) => {
                        const weekStart = e.target.value;
                        const { expiresAt, drawAt, claimExpiresAt } = calculatePiCashDates(weekStart);
                        setNewCode(prev => ({
                          ...prev,
                          weekStart,
                          expiresAt: expiresAt.toISOString().slice(0, 16),
                          drawAt: drawAt.toISOString().slice(0, 16),
                          claimExpiresAt: claimExpiresAt.toISOString().slice(0, 16)
                        }));
                      }}
                      className="w-full px-3 py-2 bg-black border border-cyan-400 rounded text-white"
                    />
                  </div>

                  {/* Expires At */}
                  <div>
                    <label className="block text-cyan-300 text-sm font-bold mb-2">
                      Expires At (31h 4m after start)
                    </label>
                    <input
                      type="datetime-local"
                      value={newCode.expiresAt}
                      onChange={(e) => setNewCode(prev => ({ ...prev, expiresAt: e.target.value }))}
                      className="w-full px-3 py-2 bg-black border border-cyan-400 rounded text-white"
                      readOnly
                    />
                  </div>

                  {/* Draw At */}
                  <div>
                    <label className="block text-cyan-300 text-sm font-bold mb-2">
                      Draw At (Friday 3:14 PM UTC)
                    </label>
                    <input
                      type="datetime-local"
                      value={newCode.drawAt}
                      onChange={(e) => setNewCode(prev => ({ ...prev, drawAt: e.target.value }))}
                      className="w-full px-3 py-2 bg-black border border-cyan-400 rounded text-white"
                      readOnly
                    />
                  </div>

                  {/* Claim Expires At */}
                  <div>
                    <label className="block text-cyan-300 text-sm font-bold mb-2">
                      Claim Expires At (31m 4s after draw)
                    </label>
                    <input
                      type="datetime-local"
                      value={newCode.claimExpiresAt}
                      onChange={(e) => setNewCode(prev => ({ ...prev, claimExpiresAt: e.target.value }))}
                      className="w-full px-3 py-2 bg-black border border-cyan-400 rounded text-white"
                      readOnly
                    />
                  </div>
                </div>

                {/* Create Button */}
                <div className="mt-6">
                  <button
                    onClick={createCode}
                    disabled={!newCode.code || !newCode.weekStart}
                    className="bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-black px-6 py-3 rounded-lg font-bold transition"
                  >
                    🚀 Create Pi Cash Code
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-cyan-300">Code History</h2>
              <div className="bg-gray-900/20 border border-gray-500 rounded-lg p-6 text-center">
                <p className="text-gray-400">History view coming soon...</p>
              </div>
            </div>
          )}
        </div>
      </AdminSidebar>
    </AdminGuard>
  );
} 