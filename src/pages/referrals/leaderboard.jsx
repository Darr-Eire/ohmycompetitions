import { useEffect, useState } from 'react';

export default function ReferralLeaderboardPage() {
  const [data, setData] = useState({ allTime: [], weekly: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/referrals/leaderboard');
        if (!res.ok) throw new Error('Failed to load leaderboard');
        const json = await res.json();
        if (mounted) setData({ allTime: json.allTime || [], weekly: json.weekly || [] });
      } catch (err) {
        setError(err.message || 'Error loading');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="p-6">Loading leaderboard…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  const Card = ({ title, items }) => (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 w-full">
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      <ol className="space-y-2 list-decimal list-inside">
        {items.map((r, idx) => (
          <li key={`${title}-${idx}`} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {r.profileImage ? (
                <img src={r.profileImage} alt={r.username} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-200" />
              )}
              <div>
                <div className="font-medium">{r.username || 'Unknown'}</div>
                <div className="text-xs text-gray-500">{r.country || '—'}</div>
              </div>
            </div>
            <div className="text-sm">
              <span className="font-semibold">{r.count}</span> referrals
            </div>
          </li>
        ))}
        {items.length === 0 && <div className="text-sm text-gray-500">No data yet.</div>}
      </ol>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Referral Leaderboard</h1>
      <p className="text-sm text-gray-600">Top referrers earn rewards. Keep inviting!</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="All-time" items={data.allTime} />
        <Card title="This week" items={data.weekly} />
      </div>
    </div>
  );
}


