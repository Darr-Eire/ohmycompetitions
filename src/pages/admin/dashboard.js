'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, RefreshCw, CalendarClock, Clock, Tickets, Activity, AlertTriangle, Filter, Search, Trash2, PencilLine } from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*                               Helpers / Utils                              */
/* -------------------------------------------------------------------------- */
const REFRESH_MS = 15000; // auto-refresh interval

const toNum = (v, d = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};

const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

// Accepts ms, seconds, ISO, 'YYYY-MM-DD', and Date
function toDateSafe(val) {
  if (val === undefined || val === null || val === '') return null;
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
  if (typeof val === 'number') {
    // seconds vs ms
    return new Date(val < 1e12 ? val * 1000 : val);
  }
  const s = String(val).trim();
  if (!s) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return new Date(`${s}T23:59:59Z`);
  let d = new Date(s);
  if (!isNaN(d.getTime())) return d;
  d = new Date(s.replace(' ', 'T') + (/([zZ]|[+\-]\d{2}:?\d{2})$/.test(s) ? '' : 'Z'));
  return isNaN(d.getTime()) ? null : d;
}

function fmtDate(val, tzOpt = undefined) {
  const d = toDateSafe(val);
  if (!d) return '—';
  return d.toLocaleString(undefined, {
    hour12: false,
    year: 'numeric', month: 'short', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    timeZone: tzOpt,
  });
}

function relTime(from, to = Date.now()) {
  const f = toDateSafe(from);
  if (!f) return '';
  const diff = Math.round((f.getTime() - to) / 1000);
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
  const abs = Math.abs(diff);
  const units = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
    ['second', 1],
  ];
  for (const [u, s] of units) if (abs >= s) return rtf.format(Math.trunc(diff / s), u);
  return 'now';
}

function getStatus(c, nowMs = Date.now()) {
  const comp = c.comp ?? c;
  const startsAt = toDateSafe(comp?.startsAt)?.getTime();
  const endsAt = toDateSafe(comp?.endsAt)?.getTime();
  if (startsAt && nowMs < startsAt) return 'upcoming';
  if (endsAt && nowMs > endsAt) return 'ended';
  return 'active';
}

function classStatusBadge(status) {
  switch (status) {
    case 'upcoming':
      return 'border-amber-400/60 text-amber-200 bg-amber-500/10';
    case 'ended':
      return 'border-rose-400/60 text-rose-200 bg-rose-500/10';
    default:
      return 'border-emerald-400/60 text-emerald-200 bg-emerald-500/10';
  }
}

function useServerTimeOffset() {
  const [offsetMs, setOffsetMs] = useState(0);
  const setFromFetch = async (res, serverNow) => {
    try {
      const clientNow = Date.now();
      const headerDate = res?.headers?.get?.('date');
      const serverTs = serverNow ? toDateSafe(serverNow)?.getTime() : headerDate ? toDateSafe(headerDate)?.getTime() : NaN;
      setOffsetMs(Number.isFinite(serverTs) ? serverTs - clientNow : 0);
    } catch {
      setOffsetMs(0);
    }
  };
  return { offsetMs, setFromFetch };
}

/* -------------------------------------------------------------------------- */
/*                                   Page                                     */
/* -------------------------------------------------------------------------- */
export default function AdminDashboard() {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [live, setLive] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);

  const redirectingRef = useRef(false);
  const router = useRouter();

  const { offsetMs, setFromFetch } = useServerTimeOffset();

  const now = Date.now() + offsetMs;

  const goLogin = useCallback(() => {
    if (redirectingRef.current) return;
    redirectingRef.current = true;
    router.push('/admin/login');
  }, [router]);

  const fetchCompetitions = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const u = typeof window !== 'undefined' ? localStorage.getItem('omc_admin_user') : null;
      const p = typeof window !== 'undefined' ? localStorage.getItem('omc_admin_pass') : null;
      if (!u || !p) {
        goLogin();
        return;
      }

      const res = await fetch('/api/admin/competitions', {
        headers: { 'x-admin-user': u, 'x-admin-pass': p },
        cache: 'no-store',
      });

      if (res.status === 401 || res.status === 403) {
        goLogin();
        return;
      }
      if (!res.ok) throw new Error(`Failed to load (${res.status})`);

      const data = await res.json();
      setCompetitions(Array.isArray(data) ? data : []);
      await setFromFetch(res, data?.serverNow);
      setLastRefresh(Date.now());
    } catch (err) {
      console.error('❌ Error loading competitions:', err);
      setError('Failed to load competitions.');
    } finally {
      setLoading(false);
    }
  }, [goLogin, setFromFetch]);

  useEffect(() => {
    fetchCompetitions();
  }, [fetchCompetitions]);

  // Auto refresh toggle
  useEffect(() => {
    if (!live) return;
    const id = setInterval(fetchCompetitions, REFRESH_MS);
    return () => clearInterval(id);
  }, [live, fetchCompetitions]);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this competition?')) return;
    const u = localStorage.getItem('omc_admin_user');
    const p = localStorage.getItem('omc_admin_pass');
    if (!u || !p) return goLogin();

    const prev = competitions; // optimistic
    setDeletingId(id);
    setCompetitions((cur) => cur.filter((c) => c._id !== id));

    try {
      const res = await fetch(`/api/admin/competitions/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-user': u, 'x-admin-pass': p },
        cache: 'no-store',
      });
      if (res.status === 401 || res.status === 403) return goLogin();
      if (!res.ok) throw new Error(`Delete failed (${res.status})`);
    } catch (err) {
      console.error('❌ Delete failed:', err);
      alert('Failed to delete competition.');
      setCompetitions(prev); // rollback
    } finally {
      setDeletingId(null);
    }
  };

  /* ------------------------------ Derived data ----------------------------- */
  const enriched = useMemo(() => {
    return (competitions || []).map((c) => {
      const startsAt = c?.comp?.startsAt ?? c?.startsAt;
      const endsAt = c?.comp?.endsAt ?? c?.endsAt;
      const createdAt = c?.createdAt;
      const updatedAt = c?.updatedAt;
      const ticketsSold = toNum(c?.ticketsSold ?? c?.comp?.ticketsSold, 0);
      const totalTickets = toNum(c?.totalTickets ?? c?.comp?.totalTickets, 0);
      const s = getStatus(c, now);
      const progress = totalTickets > 0 ? Math.round((ticketsSold / totalTickets) * 100) : 0;
      return { ...c, startsAt, endsAt, createdAt, updatedAt, ticketsSold, totalTickets, status: s, progress };
    });
  }, [competitions, now]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return enriched.filter((c) => {
      const inStatus = statusFilter === 'all' ? true : c.status === statusFilter;
      const inQuery = !q
        || (c.title || '').toLowerCase().includes(q)
        || (c?.comp?.slug || '').toLowerCase().includes(q)
        || (c.theme || '').toLowerCase().includes(q);
      return inStatus && inQuery;
    });
  }, [enriched, statusFilter, query]);

  const totals = useMemo(() => {
    const totalComps = enriched.length;
    const active = enriched.filter((c) => c.status === 'active').length;
    const upcoming = enriched.filter((c) => c.status === 'upcoming').length;
    const ended = enriched.filter((c) => c.status === 'ended').length;
    const ticketsSold = enriched.reduce((a, c) => a + toNum(c.ticketsSold, 0), 0);
    const ticketsCap = enriched.reduce((a, c) => a + toNum(c.totalTickets, 0), 0);
    return { totalComps, active, upcoming, ended, ticketsSold, ticketsCap };
  }, [enriched]);

  /* --------------------------------- UI ----------------------------------- */
  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 text-center text-white">
        <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-cyan-300" />
        <p className="text-cyan-200">Loading competitions…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 text-white sm:px-6">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight text-cyan-300 sm:text-3xl">Admin Competitions Dashboard</h1>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => fetchCompetitions()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-400/50 bg-black/30 px-3 py-2 text-sm hover:bg-cyan-400/10"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
          <button
            onClick={() => setLive((v) => !v)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm ${
              live
                ? 'border-emerald-400/60 bg-emerald-500/10 text-emerald-200'
                : 'border-slate-500/60 bg-slate-700/30 text-slate-200'
            }`}
            title="Toggle live updates"
          >
            <Activity className={`h-4 w-4 ${live ? 'animate-pulse' : ''}`} /> {live ? 'Live' : 'Paused'}
          </button>
          <Link href="/admin/competitions/create" className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-400 px-3 py-2 font-bold text-black">
            ➕ Add New
          </Link>
        </div>
      </div>

      {/* Meta row */}
      <div className="mb-4 grid grid-cols-2 gap-2 sm:mb-6 sm:grid-cols-4">
        <MetaCard icon={Tickets} label="Tickets (total)" value={`${totals.ticketsSold.toLocaleString()} / ${totals.ticketsCap.toLocaleString()}`} />
        <MetaCard icon={Activity} label="Active" value={totals.active} />
        <MetaCard icon={CalendarClock} label="Upcoming" value={totals.upcoming} />
        <MetaCard icon={Clock} label="Ended" value={totals.ended} />
      </div>

      {/* Filters */}
      <div className="mb-3 flex flex-col gap-2 sm:mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-300/70" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title / slug / theme…"
              className="h-9 w-72 rounded-lg border border-cyan-500/40 bg-black/40 pl-8 pr-3 text-sm outline-none placeholder:text-cyan-200/40"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-cyan-200/70">Status</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-lg border border-cyan-500/40 bg-black/40 px-2 text-sm outline-none"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="upcoming">Upcoming</option>
              <option value="ended">Ended</option>
            </select>
          </div>
        </div>
        <div className="text-right text-[11px] text-cyan-200/70">
          Server time offset applied. Last refresh: {lastRefresh ? fmtDate(lastRefresh) : '—'} ({lastRefresh ? relTime(lastRefresh) : ''})
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState onCreateHref="/admin/competitions/create" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-cyan-500/40 bg-[#0b1224]">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-[#0f172a] text-cyan-200">
              <tr>
                <Th>Title</Th>
                <Th>Prize</Th>
                <Th>Slug</Th>
                <Th>Status</Th>
                <Th>Starts</Th>
                <Th>Ends</Th>
                <Th>Tickets</Th>
                <Th>Progress</Th>
                <Th>Updated</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c._id} className="border-t border-cyan-500/20 text-center">
                  <Td className="text-left font-semibold">{c.title || '—'}</Td>
                  <Td>{c.prize ?? '—'}</Td>
                  <Td className="font-mono text-xs">{c?.comp?.slug || c?.slug || '—'}</Td>
                  <Td>
                    <span className={`inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-[11px] ${classStatusBadge(c.status)}`}>
                      {c.status}
                    </span>
                  </Td>
                  <Td>
                    <DateCell value={c.startsAt} nowMs={now} />
                  </Td>
                  <Td>
                    <DateCell value={c.endsAt} nowMs={now} />
                  </Td>
                  <Td>
                    <span className="tabular-nums">{toNum(c.ticketsSold, 0).toLocaleString()}</span>
                    <span className="opacity-60"> / {toNum(c.totalTickets, 0).toLocaleString()}</span>
                  </Td>
                  <Td>
                    <div className="mx-auto h-2 w-24 overflow-hidden rounded bg-white/10">
                      <div className="h-full bg-cyan-400" style={{ width: `${clamp(c.progress, 0, 100)}%` }} />
                    </div>
                    <div className="mt-0.5 text-[11px] tabular-nums">{clamp(c.progress, 0, 100)}%</div>
                  </Td>
                  <Td>
                    <DateCell value={c.updatedAt || c.createdAt} nowMs={now} />
                  </Td>
                  <Td>
                    <div className="flex items-center justify-center gap-1.5">
                      <Link href={`/admin/competitions/edit/${c._id}`} className="inline-flex items-center gap-1 rounded bg-blue-400 px-2 py-1 font-semibold text-black">
                        <PencilLine className="h-4 w-4" /> Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(c._id)}
                        className={`inline-flex items-center gap-1 rounded px-2 py-1 font-semibold ${deletingId === c._id ? 'bg-red-300 text-black cursor-wait' : 'bg-red-500 text-white'}`}
                        disabled={deletingId === c._id}
                        title={deletingId === c._id ? 'Deleting…' : 'Delete'}
                      >
                        <Trash2 className="h-4 w-4" /> {deletingId === c._id ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Health / Alerts */}
      <HealthAlerts comps={enriched} now={now} />
    </div>
  );
}

/* --------------------------------- Bits ---------------------------------- */
function Th({ children }) {
  return <th className="p-2.5 text-xs font-bold tracking-wider uppercase text-cyan-300">{children}</th>;
}
function Td({ children, className = '' }) {
  return <td className={`p-2.5 align-middle ${className}`}>{children}</td>;
}

function DateCell({ value, nowMs }) {
  const d = toDateSafe(value);
  if (!d) return <span className="opacity-60">—</span>;
  return (
    <div className="leading-tight">
      <div className="tabular-nums">{fmtDate(d)}</div>
      <div className="text-[11px] text-cyan-200/70">{relTime(d, nowMs)}</div>
    </div>
  );
}

function MetaCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-cyan-500/40 bg-white/5 p-3">
      <div className="flex items-center gap-2 text-cyan-200">
        <Icon className="h-4 w-4" />
        <span className="text-xs uppercase tracking-wider">{label}</span>
      </div>
      <div className="mt-1 text-xl font-extrabold tabular-nums">{value}</div>
    </div>
  );
}

function EmptyState({ onCreateHref }) {
  return (
    <div className="mt-6 rounded-xl border border-cyan-500/40 bg-[#0f172a] p-10 text-center">
      <p className="mb-4 text-cyan-200">No competitions found.</p>
      <Link href={onCreateHref} className="inline-block rounded-lg bg-cyan-400 px-4 py-2 font-bold text-black">
        Create your first competition
      </Link>
    </div>
  );
}

function HealthAlerts({ comps, now }) {
  const alerts = useMemo(() => {
    const arr = [];
    for (const c of comps) {
      const starts = toDateSafe(c.startsAt)?.getTime();
      const ends = toDateSafe(c.endsAt)?.getTime();
      if (!starts || !ends) arr.push({ type: 'warning', text: `Missing dates for \"${c.title}\"` });
      if (starts && ends && starts > ends) arr.push({ type: 'error', text: `Start is after end for \"${c.title}\"` });
      const cap = toNum(c.totalTickets, 0);
      const sold = toNum(c.ticketsSold, 0);
      if (cap > 0 && sold > cap) arr.push({ type: 'error', text: `Oversold tickets for \"${c.title}\" (${sold}/${cap})` });
      if (getStatus(c, now) === 'active' && ends && ends - now < 3 * 24 * 3600 * 1000) {
        arr.push({ type: 'info', text: `\"${c.title}\" ends ${relTime(ends, now)} (${fmtDate(ends)})` });
      }
    }
    return arr;
  }, [comps, now]);

  if (!alerts.length) return null;
  return (
    <div className="mx-auto mt-4 max-w-7xl space-y-2">
      {alerts.map((a, i) => (
        <div
          key={i}
          className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
            a.type === 'error'
              ? 'border-rose-400/60 bg-rose-500/10 text-rose-200'
              : a.type === 'warning'
              ? 'border-amber-400/60 bg-amber-500/10 text-amber-200'
              : 'border-cyan-400/60 bg-cyan-500/10 text-cyan-100'
          }`}
        >
          <AlertTriangle className="h-4 w-4" />
          <span>{a.text}</span>
        </div>
      ))}
    </div>
  );
}
