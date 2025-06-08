// pages/admin/audit-logs.js

'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchLogs() {
      const res = await fetch('/api/admin/audit-logs');
      if (res.status === 401) {
        router.push('/');  // redirect if not admin
        return;
      }
      const data = await res.json();
      setLogs(data);
    }
    fetchLogs();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-cyan-300">Audit Logs</h1>

      <table className="w-full text-sm text-white">
        <thead>
          <tr className="border-b border-cyan-600">
            <th>User</th>
            <th>Action</th>
            <th>Details</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log._id} className="border-b border-gray-700">
              <td>{log.user}</td>
              <td>{log.action}</td>
              <td>{log.details || '-'}</td>
              <td>{new Date(log.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
