// pages/admin/audit-logs.js

'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminSidebar from '../../components/AdminSidebar';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const router = useRouter();

  useEffect(() => {
    async function fetchLogs() {
      try {
        setLoading(true);
        setError(null);
        
        const res = await fetch('/api/admin/audit-logs');
        
        if (res.status === 401) {
          router.push('/');  // redirect if not admin
          return;
        }
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        setLogs(data.logs || []);
        setPagination(data.pagination || {});
        
      } catch (err) {
        console.error('Error fetching audit logs:', err);
        setError(err.message);
        setLogs([]);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  // Calculate stats from logs
  const stats = {
    total: logs.length,
    warnings: logs.filter(log => log.status === 'warning').length,
    critical: logs.filter(log => log.status === 'critical').length,
    adminActions: logs.filter(log => log.action?.includes('admin')).length
  };

  return (
    <AdminSidebar>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-cyan-400">📋 Audit Logs</h1>
          <p className="text-gray-400 mt-1">Review system activity and security logs</p>
        </div>

        {/* Filter Controls */}
        <div className="bg-[#0f172a] border border-cyan-400 rounded-lg p-6">
          <h2 className="text-xl font-bold text-cyan-300 mb-4">🔍 Filter Logs</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-cyan-300 text-sm font-bold mb-2">
                Date Range
              </label>
              <select className="w-full px-3 py-2 bg-black border border-cyan-400 rounded text-white">
                <option>Last 24 hours</option>
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Custom range</option>
              </select>
            </div>
            
            <div>
              <label className="block text-cyan-300 text-sm font-bold mb-2">
                Activity Type
              </label>
              <select className="w-full px-3 py-2 bg-black border border-cyan-400 rounded text-white">
                <option>All Activities</option>
                <option>User Actions</option>
                <option>Admin Actions</option>
                <option>System Events</option>
                <option>Security Events</option>
              </select>
            </div>
            
            <div>
              <label className="block text-cyan-300 text-sm font-bold mb-2">
                Severity
              </label>
              <select className="w-full px-3 py-2 bg-black border border-cyan-400 rounded text-white">
                <option>All Levels</option>
                <option>Critical</option>
                <option>Warning</option>
                <option>Info</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button className="w-full bg-cyan-500 hover:bg-cyan-600 text-black px-4 py-2 rounded font-bold transition">
                🔍 Apply Filters
              </button>
            </div>
          </div>
        </div>

        {/* Audit Log Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#0f172a] border border-green-400 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{stats.total}</div>
            <div className="text-sm text-gray-300">Total Events</div>
          </div>
          <div className="bg-[#0f172a] border border-yellow-400 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">{stats.warnings}</div>
            <div className="text-sm text-gray-300">Warnings</div>
          </div>
          <div className="bg-[#0f172a] border border-red-400 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-400">{stats.critical}</div>
            <div className="text-sm text-gray-300">Critical Events</div>
          </div>
          <div className="bg-[#0f172a] border border-cyan-400 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-cyan-400">{stats.adminActions}</div>
            <div className="text-sm text-gray-300">Admin Actions</div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/20 border border-red-400 rounded-lg p-4">
            <div className="text-red-400 font-bold">❌ Error Loading Audit Logs</div>
            <div className="text-red-300 text-sm mt-1">{error}</div>
          </div>
        )}

        {/* Audit Log Table */}
        <div className="bg-[#0f172a] border border-cyan-400 rounded-lg p-6">
          <h2 className="text-xl font-bold text-cyan-300 mb-4">📋 Recent Activity</h2>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-400 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading audit logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-lg font-bold text-gray-300 mb-2">No Audit Logs</h3>
              <p className="text-gray-400">System activity logs will appear here once actions are performed.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-cyan-400/30">
                    <th className="pb-3 text-cyan-300 font-semibold">Timestamp</th>
                    <th className="pb-3 text-cyan-300 font-semibold">User</th>
                    <th className="pb-3 text-cyan-300 font-semibold">Action</th>
                    <th className="pb-3 text-cyan-300 font-semibold">Resource</th>
                    <th className="pb-3 text-cyan-300 font-semibold">IP Address</th>
                    <th className="pb-3 text-cyan-300 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, index) => (
                    <tr key={log.id || index} className="border-b border-gray-700">
                      <td className="py-3 text-gray-300">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 text-gray-300">{log.user}</td>
                      <td className="py-3 text-gray-300">{log.action}</td>
                      <td className="py-3 text-gray-300">{log.resource}</td>
                      <td className="py-3 text-gray-300">{log.ip}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          log.status === 'success' ? 'bg-green-500/20 text-green-400' :
                          log.status === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Export Options */}
        <div className="bg-[#0f172a] border border-blue-400 rounded-lg p-6">
          <h2 className="text-xl font-bold text-blue-300 mb-4">📤 Export Options</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => window.open('/api/admin/audit-export', '_blank')}
              className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 p-4 rounded-lg transition"
            >
              <div className="text-lg mb-2">📄</div>
              <div className="font-semibold">Export CSV</div>
              <div className="text-sm text-blue-300">Download as spreadsheet</div>
            </button>
          </div>
        </div>
      </div>
    </AdminSidebar>
  );
}
