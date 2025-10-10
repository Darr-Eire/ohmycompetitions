'use client';
import React, { useState, useEffect } from 'react';
import XPProgressBar from './XPProgressBar';
import XPHistoryList from './XPHistoryList';
import XPSpendCard from './XPSpendCard';
import axios from 'axios';

/**
 * Props:
 * - userId: string (required)  // user._id or piUserId
 */
export default function StagesXPSection({ userId }) {
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [nextLevelXP, setNextLevelXP] = useState(100);
  const [history, setHistory] = useState([]);
  const [redeeming, setRedeeming] = useState(false);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const { data } = await axios.get(`/api/user/xp/get?userId=${encodeURIComponent(userId)}`);
        setXp(data.xp ?? 0);
        setLevel(data.level ?? 1);
        setNextLevelXP(data.nextLevelXP ?? 100);
        // if your GET returns xpHistory, use it; otherwise leave empty
        setHistory(data.xpHistory ?? []);
      } catch (e) {
        // fail silently
      }
    })();
  }, [userId]);

  async function redeem(kind, cost) {
    if (!userId) return;
    try {
      setRedeeming(true);
      // You’ll implement this API on the server to deduct XP and grant the item.
      const { data } = await axios.post('/api/user/xp/spend', {
        userId,
        cost,
        kind, // e.g., 'competition_ticket' | 'stages_entry_ticket' | 'exclusive_competition'
      });
      if (data?.ok) {
        setXp(data.xp);
        setLevel(data.level);
        setHistory(h => [{ amount: -cost, reason: `redeem_${kind}`, createdAt: new Date().toISOString() }, ...h]);
        alert(data.message || 'Redeemed!');
      } else {
        alert(data?.error || 'Could not redeem');
      }
    } catch (e) {
      alert('Could not redeem');
    } finally {
      setRedeeming(false);
    }
  }

  const spendables = [
    {
      title: 'Tickets for competitions',
      desc: 'Redeem XP for general competition tickets.',
      cost: 120,
      kind: 'competition_ticket',
    },
    {
      title: 'OMC Stages entry tickets',
      desc: 'Use XP to enter OMC stages without Pi payment.',
      cost: 200,
      kind: 'stages_entry_ticket',
    },
    {
      title: 'Limited/exclusive competitions',
      desc: 'Unlock access to special limited-entry prize rounds.',
      cost: 350,
      kind: 'exclusive_competition',
    },
  ];

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">OMC XP</h2>
        <span className="text-xs text-white/60">Track & redeem your XP</span>
      </div>

      <XPProgressBar xp={xp} level={level} nextLevelXP={nextLevelXP} />

      <div className="grid grid-cols-1 gap-4">
        <div className="rounded-2xl border border-cyan-600 bg-gradient-to-br from-blue-900/10 to-purple-900/10 p-4">
          <div className="text-sm font-semibold text-white mb-2">How you earned XP</div>
          <XPHistoryList history={history} />
        </div>

        <div className="rounded-2xl border border-cyan-600 bg-gradient-to-br from-blue-900/10 to-purple-900/10 p-4">
          <div className="text-sm font-semibold text-white mb-2">Spend XP</div>
          <div className="grid grid-cols-1 gap-3">
            {spendables.map(s => (
              <XPSpendCard
                key={s.kind}
                title={s.title}
                desc={s.desc}
                cost={s.cost}
                disabled={redeeming || xp < s.cost}
                onRedeem={() => redeem(s.kind, s.cost)}
              />
            ))}
          </div>
          <div className="text-[11px] text-white/50 mt-2">XP rewards & rates can change during testing.</div>
        </div>
      </div>
    </section>
  );
}
