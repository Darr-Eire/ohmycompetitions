/* --- StagesTicketsSection.jsx --- */
'use client';
import React, { useEffect, useState } from 'react';

export default function StagesTicketsSection({ userId }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/user/stage-tickets?userId=${encodeURIComponent(userId)}`);
        const data = await res.json();
        setRows(Array.isArray(data) ? data : []);
      } catch {
        setRows([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  return (
    <div className="rounded-2xl border border-cyan-600 bg-[#0f172a] p-4">
      {loading ? (
        <div className="text-center text-white/70 py-6">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="text-center text-white/60 py-6">You have no stage tickets yet.</div>
      ) : (
        <div className="flex overflow-x-auto gap-3 -mx-2 px-2
                        [scrollbar-width:none] [-ms-overflow-style:none]
                        [&::-webkit-scrollbar]:hidden touch-pan-x snap-x snap-mandatory">
          {rows.map((t,i) => (
            <div key={i} className="snap-start shrink-0 min-w-[180px] rounded-xl border border-cyan-300 bg-white/5 p-3">
              <div className="text-sm text-white font-bold">Stage {t.stage}</div>
              <div className="text-xs text-white/70 mt-1">{t.count} ticket(s)</div>
              {t.expiresAt && (
                <div className="text-[11px] text-white/60 mt-1">
                  Expires: {new Date(t.expiresAt).toLocaleDateString()}
                </div>
              )}
              <button
                onClick={() => location.assign(`/stages?stage=${t.stage}`)}
                className="mt-3 w-full bg-cyan-400 text-black font-bold text-sm py-2 rounded-lg"
              >
                Use in Stage {t.stage}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
