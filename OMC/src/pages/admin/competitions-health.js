// src/pages/admin/competitions-health.jsx
import { useEffect, useMemo, useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminGuard from '../../components/AdminGuard';

export default function AdminCompetitionsHealth() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [query, setQuery] = useState('');
  const [statusTab, setStatusTab] = useState('all'); // all | active | scheduled | paused | ended
  const [sortKey, setSortKey] = useState('percentSold');
  const [sortDir, setSortDir] = useState('desc');

  // Fetch competitions health data
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/competitions/health');
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        if (!cancelled) setRows(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('❌ Failed to load competitions health:', e);
        if (!cancelled) setRows([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Derived stats
  const stats = useMemo(() => {
    const total = rows.length;
    const active = rows.filter(r => toStatus(r.status) === 'active').length;
    const scheduled = rows.filter(r => toStatus(r.status) === 'scheduled').length;
    const paused = rows.filter(r => toStatus(r.status) === 'paused').length;
    const ended = rows.filter(r => ['ended', 'closed'].includes(toStatus(r.status))).length;
    const avgFill =
      rows.length ? Math.round(rows.reduce((a, r) => a + Number(r.percentSold || 0), 0) / rows.length) : 0;
    return { total, active, scheduled, paused, ended, avgFill };
  }, [rows]);

  // Filtered + sorted list
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = rows;

    if (statusTab !== 'all') {
      list = list.filter(r => {
        const s = toStatus(r.status);
        if (statusTab === 'ended') return s === 'ended' || s === 'closed';
        return s === statusTab;
      });
    }

    if (q) {
      list = list.filter(r =>
        [r.title, r.slug, r.status, r.id]
          .filter(Boolean)
          .some(t => String(t).toLowerCase().includes(q))
      );
    }

    const dir = sortDir === 'asc' ? 1 : -1;
    return [...list].sort((a, b) => {
      const A = a?.[sortKey];
      const B = b?.[sortKey];
      if (sortKey === 'title') return String(A).localeCompare(String(B)) * dir;
      if (sortKey === 'endsAt') {
        const aT = A ? new Date(A).getTime() : 0;
        const bT = B ? new Date(B).getTime() : 0;
        return (aT - bT) * dir;
      }
      const aN = Number(A ?? 0);
      const bN = Number(B ?? 0);
      return (aN - bN) * dir;
    });
  }, [rows, query, statusTab, sortKey, sortDir]);

  return (
    <AdminGuard>
      <AdminSidebar>
        <div className="max-w-7xl mx-auto p-6 text-white">
          <h1 className="text-2xl font-bold mb-6">Competitions Health</h1>

          {/* Controls */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <select
                value={sortKey}
                onChange={e => setSortKey(e.target.value)}
                className="bg-[#0b1220] border border-white/15 rounded-lg px-3 py-2 text-sm"
              >
                <option value="percentSold">% Sold</option>
                <option value="ticketsSold">Tickets Sold</option>
                <option value="endsAt">Ends</option>
                <option value="title">Title</option>
              </select>
              <button
                onClick={() => setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))}
                className="bg-[#0b1220] border border-white/15 rounded-lg px-3 py-2 text-sm"
              >
                {sortDir === 'asc' ? '↑ Asc' : '↓ Desc'}
              </button>
            </div>

            <div className="relative">
              <input
                type="search"
                placeholder="Search title / slug / status…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="w-full sm:w-72 bg-[#0b1220] border border-white/15 rounded-lg pl-9 pr-3 py-2 text-sm placeholder-white/40"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">🔎</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            <StatCard label="Total" value={stats.total} />
            <StatCard label="Active" value={stats.active} accent="emerald" />
            <StatCard label="Scheduled" value={stats.scheduled} accent="cyan" />
            <StatCard label="Paused" value={stats.paused} accent="yellow" />
            <StatCard label="Ended" value={stats.ended} accent="gray" />
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-4">
            {['all', 'active', 'scheduled', 'paused', 'ended'].map(t => (
              <button
                key={t}
                onClick={() => setStatusTab(t)}
                className={`px-3 py-1.5 rounded-full text-sm border transition
                  ${statusTab === t
                    ? 'bg-cyan-400 text-black border-cyan-400'
                    : 'border-white/15 text-white/80 hover:bg-white/5'}`}
              >
                {labelForTab(t)}
              </button>
            ))}
          </div>

          {/* Cards */}
          {loading ? (
            <CardsSkeleton />
          ) : filtered.length === 0 ? (
            <EmptyState
              onReset={() => {
                setQuery('');
                setStatusTab('all');
                setSortKey('percentSold');
                setSortDir('desc');
              }}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map(r => (
                <CompetitionCard key={r.id || r.slug} r={r} />
              ))}
            </div>
          )}
        </div>
      </AdminSidebar>
    </AdminGuard>
  );
}

/* ---------------------- Components ---------------------- */
function StatCard({ label, value, accent }) {
  const colors = {
    emerald: 'border-emerald-500/30 text-emerald-300',
    cyan: 'border-cyan-500/30 text-cyan-300',
    yellow: 'border-yellow-500/30 text-yellow-300',
    gray: 'border-gray-500/30 text-gray-300',
  }[accent] || 'border-cyan-500/30 text-cyan-300';

  return (
    <div className={`bg-[#0b1220] border rounded-xl p-4 ${colors}`}>
      <div className="text-xs text-white/60">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function labelForTab(t) {
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/* Utilities */
function toStatus(s) {
  const v = String(s || '').toLowerCase();
  if (v === 'live') return 'active';
  if (v === 'closed') return 'ended';
  return v || 'unknown';
}

function CardsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-40 rounded-xl bg-white/5 border border-white/10 animate-pulse" />
      ))}
    </div>
  );
}

function EmptyState({ onReset }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0b1220] p-10 text-center">
      <div className="text-2xl">🗂️</div>
      <h2 className="mt-2 text-lg font-semibold">Nothing to show</h2>
      <p className="text-white/70 text-sm mt-1">Try clearing filters or search.</p>
      <button
        onClick={onReset}
        className="mt-4 px-4 py-2 rounded-lg border border-cyan-400/40 text-cyan-200 hover:bg-white/5"
      >
        Reset
      </button>
    </div>
  );
}
