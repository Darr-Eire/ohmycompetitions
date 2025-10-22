// src/pages/admin/competitions-health.jsx — Fixed auth, data shape, and live UI
'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import AdminSidebar from '../../components/AdminSidebar';
import AdminGuard from '../../components/AdminGuard';
import { RefreshCw, Activity, AlarmClock, Trophy, Users, Ticket, PercentCircle, CalendarClock } from 'lucide-react';

/* ------------------------------ helpers ------------------------------ */
const toNum = (v, d = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};

function toDateSafe(v) {
  if (!v && v !== 0) return null;
  if (v instanceof Date) return isNaN(v.getTime()) ? null : v;
  if (typeof v === 'number') return new Date(v < 1e12 ? v * 1000 : v);
  const s = String(v).trim();
  if (!s) return null;
  const d = new Date(/\d{4}-\d{2}-\d{2}$/.test(s) ? `${s}T23:59:59Z` : s);
  return isNaN(d.getTime()) ? null : d;
}

function fmtDate(v) {
  const d = toDateSafe(v);
  if (!d) return '—';
  return d.toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: '2-digit',
    hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

function relTime(from, to = Date.now()) {
  const d = toDateSafe(from);
  if (!d) return '';
  const diff = Math.round((d.getTime() - to) / 1000);
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
  const abs = Math.abs(diff);
  const units = [['year',31536000],['month',2592000],['week',604800],['day',86400],['hour',3600],['minute',60],['second',1]];
  for (const [u, s] of units) if (abs >= s) return rtf.format(Math.trunc(diff / s), u);
  return 'now';
}

const mapStatus = (s) => {
  const v = String(s || '').toLowerCase();
  if (v === 'live' || v === 'active') return 'active';
  if (v === 'scheduled' || v === 'upcoming') return 'scheduled';
  if (v === 'paused' || v === 'hold') return 'paused';
  if (v === 'closed' || v === 'ended' || v === 'finished') return 'ended';
  return v || 'unknown';
};

/* ------------------------------ page ------------------------------ */
export default function AdminCompetitionsHealth() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // UI state
  const [query, setQuery] = useState('');
  const [statusTab, setStatusTab] = useState('all'); // all | active | scheduled | paused | ended
  const [sortKey, setSortKey] = useState('percentSold');
  const [sortDir, setSortDir] = useState('desc');
  const [live, setLive] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);

  const router = useRouter();
  const redirectingRef = useRef(false);

  const goLogin = useCallback(() => {
    if (redirectingRef.current) return;
    redirectingRef.current = true;
    router.push('/admin/login');
  }, [router]);

  const fetchHealth = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const u = typeof window !== 'undefined' ? localStorage.getItem('omc_admin_user') : null;
      const p = typeof window !== 'undefined' ? localStorage.getItem('omc_admin_pass') : null;
      if (!u || !p) return goLogin();

      const res = await fetch('/api/admin/competitions/health', {
        headers: { 'x-admin-user': u, 'x-admin-pass': p },
        cache: 'no-store',
      });
      if (res.status === 401 || res.status === 403) return goLogin();
      if (!res.ok) throw new Error(`Failed to load (${res.status})`);
      const data = await res.json();
      const items = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
      setRows(items);
      setLastRefresh(Date.now());
    } catch (e) {
      console.error('❌ Failed to load competitions health:', e);
      setRows([]);
      setError('Failed to load competitions health');
    } finally {
      setLoading(false);
    }
  }, [goLogin]);

  useEffect(() => { fetchHealth(); }, [fetchHealth]);
  useEffect(() => {
    if (!live) return;
    const id = setInterval(fetchHealth, 15000);
    return () => clearInterval(id);
  }, [live, fetchHealth]);

  // Derived stats
  const stats = useMemo(() => {
    const total = rows.length;
    const active = rows.filter(r => mapStatus(r.status) === 'active').length;
    const scheduled = rows.filter(r => mapStatus(r.status) === 'scheduled').length;
    const paused = rows.filter(r => mapStatus(r.status) === 'paused').length;
    const ended = rows.filter(r => ['ended'].includes(mapStatus(r.status))).length;
    const avgFill = rows.length ? Math.round(rows.reduce((a, r) => a + toNum(r.percentSold, 0), 0) / rows.length) : 0;
    return { total, active, scheduled, paused, ended, avgFill };
  }, [rows]);

  // Filtered + sorted list
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = rows;

    if (statusTab !== 'all') {
      list = list.filter(r => {
        const s = mapStatus(r.status);
        return statusTab === 'ended' ? s === 'ended' : s === statusTab;
      });
    }

    if (q) {
      list = list.filter(r => [r.title, r.slug, r.status, r.id].filter(Boolean).some(t => String(t).toLowerCase().includes(q)));
    }

    const dir = sortDir === 'asc' ? 1 : -1;
    return [...list].sort((a, b) => {
      const A = a?.[sortKey];
      const B = b?.[sortKey];
      if (sortKey === 'title') return String(A).localeCompare(String(B)) * dir;
      if (sortKey === 'endsAt') {
        const aT = A ? toDateSafe(A)?.getTime() || 0 : 0;
        const bT = B ? toDateSafe(B)?.getTime() || 0 : 0;
        return (aT - bT) * dir;
      }
      const aN = toNum(A, 0);
      const bN = toNum(B, 0);
      return (aN - bN) * dir;
    });
  }, [rows, query, statusTab, sortKey, sortDir]);

  return (
    <AdminGuard>
      <AdminSidebar>
        <div className="max-w-7xl mx-auto p-6 text-white">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h1 className="text-2xl font-bold">Competitions Health</h1>
            <div className="flex items-center gap-2">
              <button onClick={() => setLive(v => !v)} className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm ${live ? 'border-emerald-400/60 bg-emerald-500/10 text-emerald-200' : 'border-slate-500/60 bg-slate-700/30 text-slate-200'}`}>
                <Activity className={`h-4 w-4 ${live ? 'animate-pulse' : ''}`} /> {live ? 'Live' : 'Paused'}
              </button>
              <button onClick={fetchHealth} className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-400/50 bg-black/30 px-3 py-2 text-sm hover:bg-cyan-400/10">
                <RefreshCw className="h-4 w-4" /> Refresh
              </button>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <select value={sortKey} onChange={e => setSortKey(e.target.value)} className="bg-[#0b1220] border border-white/15 rounded-lg px-3 py-2 text-sm">
                <option value="percentSold">% Sold</option>
                <option value="ticketsSold">Tickets Sold</option>
                <option value="endsAt">Ends</option>
                <option value="title">Title</option>
              </select>
              <button onClick={() => setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))} className="bg-[#0b1220] border border-white/15 rounded-lg px-3 py-2 text-sm">
                {sortDir === 'asc' ? '↑ Asc' : '↓ Desc'}
              </button>
            </div>

            <div className="relative">
              <input type="search" placeholder="Search title / slug / status…" value={query} onChange={e => setQuery(e.target.value)} className="w-full sm:w-72 bg-[#0b1220] border border-white/15 rounded-lg pl-9 pr-3 py-2 text-sm placeholder-white/40" />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">🔎</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
            <StatCard label="Total" value={stats.total} />
            <StatCard label="Active" value={stats.active} accent="emerald" />
            <StatCard label="Scheduled" value={stats.scheduled} accent="cyan" />
            <StatCard label="Paused" value={stats.paused} accent="yellow" />
            <StatCard label="Ended" value={stats.ended} accent="gray" />
            <StatCard label="Avg Fill" value={`${stats.avgFill}%`} accent="cyan" />
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-4">
            {['all', 'active', 'scheduled', 'paused', 'ended'].map(t => (
              <button key={t} onClick={() => setStatusTab(t)} className={`px-3 py-1.5 rounded-full text-sm border transition ${statusTab === t ? 'bg-cyan-400 text-black border-cyan-400' : 'border-white/15 text-white/80 hover:bg-white/5'}`}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {/* Cards */}
          {loading ? (
            <CardsSkeleton />
          ) : error ? (
            <ErrorBox text={error} onRetry={fetchHealth} />
          ) : filtered.length === 0 ? (
            <EmptyState onReset={() => { setQuery(''); setStatusTab('all'); setSortKey('percentSold'); setSortDir('desc'); }} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map(r => (
                <CompetitionCard key={r.id || r.slug} r={r} />
              ))}
            </div>
          )}

          {/* Footer meta */}
          <p className="mt-6 text-xs text-white/50">Last refresh: {lastRefresh ? fmtDate(lastRefresh) : '—'}</p>
        </div>
      </AdminSidebar>
    </AdminGuard>
  );
}

/* ---------------------- components ---------------------- */
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
      <div className="text-2xl font-bold tabular-nums">{value}</div>
    </div>
  );
}

function CardsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-44 rounded-xl bg-white/5 border border-white/10 animate-pulse" />
      ))}
    </div>
  );
}

function ErrorBox({ text, onRetry }) {
  return (
    <div className="rounded-xl border border-rose-400/50 bg-rose-500/10 p-4 text-rose-200">
      <div className="font-semibold mb-2">{text}</div>
      <button onClick={onRetry} className="rounded bg-rose-400 px-3 py-1 text-sm font-bold text-black">Retry</button>
    </div>
  );
}

function EmptyState({ onReset }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0b1220] p-10 text-center">
      <div className="text-2xl">🗂️</div>
      <h2 className="mt-2 text-lg font-semibold">Nothing to show</h2>
      <p className="text-white/70 text-sm mt-1">Try clearing filters or search.</p>
      <button onClick={onReset} className="mt-4 px-4 py-2 rounded-lg border border-cyan-400/40 text-cyan-200 hover:bg-white/5">Reset</button>
    </div>
  );
}

function Badge({ children, tone = 'cyan' }) {
  const map = {
    cyan: 'border-cyan-400/60 bg-cyan-500/10 text-cyan-200',
    emerald: 'border-emerald-400/60 bg-emerald-500/10 text-emerald-200',
    amber: 'border-amber-400/60 bg-amber-500/10 text-amber-200',
    rose: 'border-rose-400/60 bg-rose-500/10 text-rose-200',
    gray: 'border-gray-400/60 bg-gray-500/10 text-gray-200',
  };
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] ${map[tone]}`}>{children}</span>;
}

function Progress({ pct }) {
  const v = Math.max(0, Math.min(100, toNum(pct, 0)));
  return (
    <div className="h-2 w-full overflow-hidden rounded bg-white/10">
      <div className="h-full bg-cyan-400" style={{ width: `${v}%` }} />
    </div>
  );
}

function CompetitionCard({ r }) {
  const status = mapStatus(r.status);
  const ends = toDateSafe(r.endsAt);
  const endsSoon = ends && ends.getTime() - Date.now() < 72 * 3600 * 1000;

  return (
    <div className="rounded-2xl border border-cyan-500/40 bg-[#0b1220] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-lg font-bold">{r.title || 'Untitled'}</div>
          <div className="mt-0.5 text-xs text-white/50">{r.slug || '—'}</div>
        </div>
        <Badge tone={status === 'active' ? 'emerald' : status === 'scheduled' ? 'cyan' : status === 'paused' ? 'amber' : status === 'ended' ? 'gray' : 'cyan'}>
          {status}
        </Badge>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-white/80"><Ticket className="h-4 w-4" />
            <span className="tabular-nums">{toNum(r.ticketsSold).toLocaleString()}</span>
            <span className="opacity-60"> / {toNum(r.totalTickets).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2 text-white/80"><PercentCircle className="h-4 w-4" /> {toNum(r.percentSold)}%</div>
          <div className="flex items-center gap-2 text-white/80"><Trophy className="h-4 w-4" /> {toNum(r.prizePool).toLocaleString()} π</div>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-white/80"><CalendarClock className="h-4 w-4" /> Ends: {fmtDate(r.endsAt)}</div>
          <div className="text-xs text-white/60">{relTime(r.endsAt)}</div>
          {endsSoon && status === 'active' ? (
            <div className="text-[11px] text-amber-200">Ending soon — boost visibility</div>
          ) : null}
        </div>
      </div>

      <div className="mt-3">
        <Progress pct={r.percentSold} />
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-white/50">
        <span>ID: {String(r.id || '').slice(-6) || '—'}</span>
        <Link href={`/admin/competitions/edit/${r.id || ''}`} className="rounded border border-cyan-400/50 px-2 py-1 text-cyan-200 hover:bg-cyan-400/10">Edit</Link>
      </div>
    </div>
  );
}
