import AdminSidebar from '../../../components/AdminSidebar';
import AdminGuard from '../../../components/AdminGuard';
import { useState } from 'react';

export default function WeeklyReferralRewardsPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function processRewards(e) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError('');
    
    try {
      const res = await fetch('/api/admin/referrals/weekly-rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminGuard>
      <AdminSidebar>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Weekly Referral Rewards</h1>
          <p className="text-gray-400 mb-6">
            Process weekly referral rewards for top referrers. This will award Pi to top 5 referrers and reset weekly counts.
          </p>

          <form onSubmit={processRewards} className="space-y-4">
            <div className="bg-yellow-900/20 border border-yellow-600 rounded p-4">
              <h3 className="font-semibold text-yellow-400 mb-2">⚠️ Warning</h3>
              <p className="text-sm text-yellow-200">
                This will process Pi payouts to top referrers and reset all weekly counts. Make sure this is run weekly.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="neon-button px-6 py-3 text-lg disabled:opacity-50"
            >
              {loading ? 'Processing Rewards...' : 'Process Weekly Rewards'}
            </button>
          </form>

          {error && (
            <div className="mt-6 bg-red-900/20 border border-red-600 rounded p-4">
              <h3 className="font-semibold text-red-400 mb-2">Error</h3>
              <p className="text-red-200">{error}</p>
            </div>
          )}

          {result && (
            <div className="mt-6 bg-green-900/20 border border-green-600 rounded p-4">
              <h3 className="font-semibold text-green-400 mb-2">Success</h3>
              <p className="text-green-200 mb-4">{result.message}</p>
              
              {result.rewards && result.rewards.length > 0 && (
                <div>
                  <h4 className="font-semibold text-green-300 mb-2">Rewards Processed:</h4>
                  <div className="space-y-2">
                    {result.rewards.map((reward, i) => (
                      <div key={i} className="flex justify-between items-center bg-green-800/20 rounded p-2">
                        <div>
                          <span className="font-medium">{reward.username}</span>
                          <span className="text-sm text-gray-300 ml-2">
                            Rank #{reward.rank} - {reward.referrals} referrals
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-green-400">{reward.amount}π</div>
                          {reward.paymentId && (
                            <div className="text-xs text-gray-400">ID: {reward.paymentId}</div>
                          )}
                          {reward.error && (
                            <div className="text-xs text-red-400">Error: {reward.error}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </AdminSidebar>
    </AdminGuard>
  );
}
