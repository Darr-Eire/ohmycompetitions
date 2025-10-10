/* --- StageHistorySection.jsx --- */
'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';

export default function StageHistorySection({ userId }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [next, setNext] = useState(null); // { stage, roomSlug? }
  const router = useRouter();

  useEffect(() => {
    if (!userId) return;
    (async () => {
      setLoading(true);
      try {
        const [histRes, nextRes] = await Promise.all([
          fetch(`/api/stages/history?userId=${encodeURIComponent(userId)}`),
          fetch(`/api/stages/next?userId=${encodeURIComponent(userId)}`)
        ]);
        const hist = await histRes.json();
        const nextData = await nextRes.json();
        setRows(Array.isArray(hist) ? hist : []);
        setNext(nextData?.next || null);
      } catch {
        setRows([]);
        setNext(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  const stats = useMemo(() => {
    if (!rows.length) return { played: 0, advances: 0, winRate: 0, bestRank: null, avgRank: null };
    const played = rows.length;
    const advances = rows.filter(r=>r.advanced).length;
    const winRate = Math.round((advances / played) * 100);
    const ranks = rows.map(r => r.rank).filter(Boolean);
    const bestRank = ranks.length ? Math.min(...ranks) : null;
    const avgRank = ranks.length ? Math.round(ranks.reduce((a,b)=>a+b,0) / ranks.length) : null;
    return { played, advances, winRate, bestRank, avgRank };
  }, [rows]);

  function goContinue() {
    if (!next) return;
    const targetStage = next.stage;
    // Adjust this route to your stage/battles page
    router.push(`/battles?stage=${targetStage}`);
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <Stat label="Played" value={stats.played} />
        <Stat label="Advances" value={stats.advances} />
        <Stat label="Win Rate" value={`${stats.winRate}%`} />
        <Stat label="Best Rank" value={stats.bestRank ?? '—'} />
        <Stat label="Avg Rank" value={stats.avgRank ?? '—'} />
      </div>

      {/* Continue CTA */}
      {next && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-400/50 bg-emerald-400/10 p-3">
          <div className="text-white text-sm">
            Continue your run: <span className="font-bold">Stage {next.stage}</span>
          </div>
          <button
            onClick={goContinue}
            className="bg-emerald-400 text-black font-bold px-4 py-2 rounded-lg"
          >
            Continue
          </button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl border border-cyan-600 bg-[#0f172a] overflow-hidden">
        <div className="grid grid-cols-5 text-xs text-white/60 border-b border-white/10 px-3 py-2">
          <div>When</div><div>Stage</div><div>Room</div><div>Rank</div><div>Advanced</div>
        </div>
        {loading ? (
          <div className="text-center text-white/70 py-6">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="text-center text-white/60 py-6">No history yet</div>
        ) : (
          rows.map((r, i) => (
            <div key={i} className="grid grid-cols-5 text-xs px-3 py-2 border-b border-white/5">
              <div className="text-white/80">{new Date(r.playedAt).toLocaleString()}</div>
              <div className="text-white">Stage {r.stage}</div>
              <div className="text-white/80">{r.roomSlug || '—'}</div>
              <div className="text-cyan-300">{r.rank ?? '—'}</div>
              <div className={r.advanced ? 'text-emerald-400' : 'text-white/60'}>
                {r.advanced ? 'Yes' : 'No'}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl border border-cyan-600 bg-white/5 p-3 text-center">
      <div className="text-xs text-white/70">{label}</div>
      <div className="text-lg font-extrabold text-cyan-300 mt-1">{value}</div>
    </div>
  );
}
