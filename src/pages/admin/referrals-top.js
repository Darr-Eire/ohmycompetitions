import AdminSidebar from '../../components/AdminSidebar';
import AdminGuard from '../../components/AdminGuard';
import { useEffect, useState } from 'react';

export default function AdminReferralsTop() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/referrals/top');
        const data = await res.json();
        setRows(Array.isArray(data) ? data : []);
      } catch (e) {
        setRows([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <AdminGuard>
      <AdminSidebar>
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Top Referrers</h1>
          {loading ? (
            <div>Loading…</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-cyan-700">
                  <th className="py-2">#</th>
                  <th className="py-2">Referrer</th>
                  <th className="py-2">Count</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-b border-cyan-900">
                    <td className="py-2">{i + 1}</td>
                    <td className="py-2">{r._id}</td>
                    <td className="py-2">{r.count}</td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr><td colSpan="3" className="py-4 text-center text-gray-400">No data</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </AdminSidebar>
    </AdminGuard>
  );
}


