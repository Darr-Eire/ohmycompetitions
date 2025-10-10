import AdminSidebar from '../../../components/AdminSidebar';
import AdminGuard from '../../../components/AdminGuard';
import { useEffect, useState } from 'react';

export default function VoucherHistoryPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/vouchers/history');
        const data = await res.json();
        setRows(data.redemptions || data || []);
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
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Voucher Redemption History</h1>
          {loading ? (
            <div>Loading…</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-cyan-700">
                  <th className="py-2">User</th>
                  <th className="py-2">Competition</th>
                  <th className="py-2">Qty</th>
                  <th className="py-2">Redeemed At</th>
                  <th className="py-2">Batch</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-b border-cyan-900">
                    <td className="py-2">{r.username || r.userId}</td>
                    <td className="py-2">{r.competitionSlug || '-'}</td>
                    <td className="py-2">{r.quantity || r.qty || 1}</td>
                    <td className="py-2">{r.redeemedAt ? new Date(r.redeemedAt).toLocaleString() : '-'}</td>
                    <td className="py-2">{r.batchId || '-'}</td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr><td colSpan="5" className="py-4 text-center text-gray-400">No redemptions</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </AdminSidebar>
    </AdminGuard>
  );
}


