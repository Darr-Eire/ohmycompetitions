'use client';

import { useEffect, useState } from 'react';
import { Trophy, Coins } from 'lucide-react';

export default function AdminCompetitionTotalsCard() {
  const [totals, setTotals] = useState({
    sold: 0,
    total: 0,
    lockedPi: 0,
    loading: true,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/admin/competitions');
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error('Invalid response');

        let sold = 0;
        let total = 0;
        let lockedPi = 0;

        for (const comp of data) {
          const soldCount = Number(comp.ticketsSold || 0);
          const totalCount = Number(comp.totalTickets || 0);
          const entryFee = Number(comp.entryFee || comp.piAmount || 0);

          sold += soldCount;
          total += totalCount;
          lockedPi += soldCount * entryFee;
        }

        setTotals({ sold, total, lockedPi, loading: false });
      } catch (err) {
        console.error('CompetitionTotalsCard error:', err);
        setTotals({ sold: 0, total: 0, lockedPi: 0, loading: false });
      }
    };
    load();
  }, []);

  if (totals.loading) {
    return (
      <div className="bg-black/40 border border-cyan-700/40 rounded-xl p-4 text-cyan-200">
        <p className="text-sm opacity-80">Calculating totals...</p>
      </div>
    );
  }

  const pct = totals.total ? Math.round((totals.sold / totals.total) * 100) : 0;

  return (
    <div className="bg-black/50 border border-cyan-600/30 rounded-xl p-5 text-cyan-100 space-y-2 shadow-[0_0_15px_#00fff522]">
      <h3 className="text-lg font-semibold text-cyan-300 mb-2">📊 Competition Totals Snapshot</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-cyan-200">
        <div className="flex items-center gap-2">
          <Trophy size={18} className="text-cyan-400" />
          <div>
            <div className="font-bold text-white">{totals.sold.toLocaleString()}</div>
            <div className="text-xs text-cyan-400/70">Tickets Sold</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Trophy size={18} className="text-cyan-400" />
          <div>
            <div className="font-bold text-white">{totals.total.toLocaleString()}</div>
            <div className="text-xs text-cyan-400/70">Total Tickets</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Coins size={18} className="text-yellow-400" />
          <div>
            <div className="font-bold text-white">
              {totals.lockedPi.toFixed(2)} π
            </div>
            <div className="text-xs text-cyan-400/70">Pi Locked in Competitions</div>
          </div>
        </div>
      </div>

      <div className="mt-3 text-center text-cyan-300 text-sm font-medium">
        Total Sell-Through: <span className="font-bold text-cyan-100">{pct}%</span>
      </div>
    </div>
  );
}
