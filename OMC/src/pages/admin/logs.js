// pages/admin/logs.js
'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminGuard from '../../components/AdminGuard';

export default function AdminLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    action: '',
    user: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async (customFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams({
        limit: '50',
        offset: '0',
        ...filters,
        ...customFilters
      });

      const res = await fetch(`/api/admin/log?${queryParams}`);
      
      if (res.status === 401) {
        window.location.href = '/admin/login';
        return;
      }
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      setLogs(data.logs || []);
      setPagination(data.pagination || {});
      
    } catch (err) {
      console.error('Error fetching admin logs:', err);
      setError(err.message);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    loadLogs(filters);
  };

  const clearFilters = () => {
    setFilters({
      action: '',
      user: '',
      startDate: '',
      endDate: ''
    });
    loadLogs();
  };

  // Calculate stats from logs
  const stats = {
    total: logs.length,
    today: logs.filter(log => {
      const today = new Date().toDateString();
      return new Date(log.timestamp).toDateString() === today;
    }).length,
    thisWeek: logs.filter(log => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(log.timestamp) > weekAgo;
    }).length
  };

  return (
    <AdminGuard>
      <AdminSidebar>
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-cyan-400">📋 Admin Activity Logs</h1>
              <p className="text-gray-400 mt-1">Track all admin actions and system events</p>
            </div>
            <button
              onClick={() => loadLogs()}
              className="bg-cyan-500 hover:bg-cyan-600 text-black px-4 py-2 rounded-lg font-bold transition"
            >
              🔄 Refresh
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#0f172a] border border-cyan-400 rounded-lg p-4">
              <div className="text-2xl font-bold text-cyan-400">{stats.total}</div>
              <div className="text-sm text-gray-300">Total Logs</div>
            </div>
            <div className="bg-[#0f172a] border border-green-400 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-400">{stats.today}</div>
              <div className="text-sm text-gray-300">Today</div>
            </div>
            <div className="bg-[#0f172a] border border-yellow-400 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-400">{stats.thisWeek}</div>
              <div className="text-sm text-gray-300">This Week</div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-[#0f172a] border border-cyan-400 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-cyan-300 mb-4">Filters</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Action</label>
                <input
                  type="text"
                  value={filters.action}
                  onChange={(e) => handleFilterChange('action', e.target.value)}
                  className="w-full bg-gray-800 text-white px-3 py-2 rounded border border-gray-600"
                  placeholder="Search action..."
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">User</label>
                <input
                  type="text"
                  value={filters.user}
                  onChange={(e) => handleFilterChange('user', e.target.value)}
                  className="w-full bg-gray-800 text-white px-3 py-2 rounded border border-gray-600"
                  placeholder="Search user..."
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Start Date</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="w-full bg-gray-800 text-white px-3 py-2 rounded border border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">End Date</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="w-full bg-gray-800 text-white px-3 py-2 rounded border border-gray-600"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={applyFilters}
                className="bg-cyan-500 hover:bg-cyan-600 text-black px-4 py-2 rounded font-bold transition"
              >
                Apply Filters
              </button>
              <button
                onClick={clearFilters}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded font-bold transition"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-400 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading logs...</p>
            </div>
          ) : error ? (
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 text-center">
              <h3 className="text-red-400 font-bold mb-2">Error Loading Logs</h3>
              <p className="text-gray-300">{error}</p>
              <button 
                onClick={() => loadLogs()}
                className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="bg-[#0f172a] border border-cyan-400 rounded-lg p-6">
              <h2 className="text-xl font-bold text-cyan-300 mb-4">Activity Logs</h2>
              
              {logs.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📋</div>
                  <h3 className="text-lg font-bold text-gray-300 mb-2">No Logs Found</h3>
                  <p className="text-gray-400">No admin activity logs match your current filters.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-cyan-400/30">
                        <th className="pb-3 text-cyan-300 font-semibold">Timestamp</th>
                        <th className="pb-3 text-cyan-300 font-semibold">User</th>
                        <th className="pb-3 text-cyan-300 font-semibold">Action</th>
                        <th className="pb-3 text-cyan-300 font-semibold">Details</th>
                        <th className="pb-3 text-cyan-300 font-semibold">Resource</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log, index) => (
                        <tr key={log._id || index} className="border-b border-gray-700">
                          <td className="py-3 text-gray-300">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="py-3 text-gray-300">{log.user}</td>
                          <td className="py-3 text-gray-300">{log.action}</td>
                          <td className="py-3 text-gray-300 max-w-xs truncate">{log.details}</td>
                          <td className="py-3 text-gray-300">{log.resource || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </AdminSidebar>
    </AdminGuard>
  );
}







