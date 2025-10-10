'use client';

import { useEffect, useMemo, useState } from 'react';
import AdminSidebar from '../../../components/AdminSidebar';
import AdminGuard from '../../../components/AdminGuard';

export default function CancelAndRefundPage() {
  const [comps, setComps] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [mode, setMode] = useState('credit'); // UI only for now
  const [ack, setAck] = useState(false);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Optional preview UX (API may not support dryRun)
  const [previewing, setPreviewing] = useState(false);
  const [preview, setPreview] = useState(null);
  const [previewError, setPreviewError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/admin/competitions', { cache: 'no-store' });
        const data = await res.json().catch(() => []);
        if (!cancelled) {
          setComps(Array.isArray(data) ? data : []);
        }
      } catch {
        if (!cancelled) setComps([]);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const current = useMemo(
    () => comps.find(c => String(c._id) === String(selectedId)),
    [comps, selectedId]
  );

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError('');
    setPreview(null);
    setPreviewError('');

    const title = current?.title || 'this competition';
    const ok = window.confirm(
      `This will cancel "${title}" and issue refunds as "${mode}".\n\nAre you absolutely sure?`
    );
    if (!ok) {
      setLoading(false);
      return;
    }

    try {
      const slug = current?.comp?.slug;
      if (!slug) throw new Error('Selected competition is missing a slug.');

      // Your API expects { slug, reason? }. 'mode' is UI for now.
      const res = await fetch('/api/competitions/cancel-and-refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, reason: `Admin cancel via UI (${mode})` }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || j.ok === false) throw new Error(j.error || j.message || 'Failed');

      setResult({
        ...j,
        mode,
      });
    } catch (err) {
      setError(err.message || 'Error');
    } finally {
      setLoading(false);
    }
  }

  async function doPreview() {
    setPreviewing(true);
    setPreview(null);
    setPreviewError('');

    try {
      const slug = current?.comp?.slug;
      if (!slug) throw new Error('Select a competition first.');
      // Not all APIs support dry-run; handle gracefully.
      const res = await fetch('/api/competitions/cancel-and-refund?dryRun=1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, reason: 'dryRun', dryRun: true, mode }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || j.ok === false) {
        throw new Error(j?.error || 'Preview not supported by API (dryRun).');
      }
      setPreview(j);
    } catch (err) {
      setPreviewError(err.message || 'Preview failed');
    } finally {
      setPreviewing(false);
    }
  }

  return (
    <AdminGuard>
      <AdminSidebar>
        <div className="max-w-3xl mx-auto p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Cancel Competition & Issue Refunds</h1>
          <p className="text-white/60 text-sm mb-6">
            Cancels the competition and issues refunds to all affected users. Default is issuing
            <span className="text-cyan-300"> ticket credits</span> (recommended).
          </p>

          <form onSubmit={submit} className="space-y-5 rounded-xl border border-white/10 bg-[#0b1220] p-4">
            {/* Competition */}
            <div>
              <label className="block text-sm text-white/70 mb-1">Competition</label>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full bg-[#0b1220] border border-white/15 rounded-lg px-3 py-2"
                required
              >
                <option value="" disabled>— Select a competition —</option>
                {comps.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.title} ({c.comp?.status || 'unknown'})
                  </option>
                ))}
              </select>

              {/* quick meta */}
              {current && (
                <div className="mt-2 text-xs text-white/70 flex flex-wrap items-center gap-2">
                  <StatusChip status={current.comp?.status} />
                  <span>Slug:</span>
                  <code className="bg-white/10 px-2 py-0.5 rounded">{current.comp?.slug || '—'}</code>
                  <span className="ml-2">Tickets:</span>
                  <span className="tabular-nums">{current.ticketsSold ?? '—'}</span>
                  <span className="opacity-60">/</span>
                  <span className="tabular-nums">{current.totalTickets ?? '—'}</span>
                </div>
              )}
            </div>

            {/* Refund mode */}
            <div>
              <label className="block text-sm text-white/70 mb-1">Refund Mode</label>
              <div className="flex flex-col sm:flex-row gap-3 text-sm">
                <label className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${mode==='credit' ? 'border-cyan-400/40 bg-white/5' : 'border-white/10'}`}>
                  <input
                    type="radio"
                    name="mode"
                    value="credit"
                    checked={mode==='credit'}
                    onChange={() => setMode('credit')}
                  />
                  <div>
                    <div className="font-semibold">Ticket credits</div>
                    <div className="text-white/60 text-xs">Instant, reversible, no Pi transfer</div>
                  </div>
                </label>
                <label className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${mode==='pi' ? 'border-cyan-400/40 bg-white/5' : 'border-white/10'} opacity-70`}>
                  <input
                    type="radio"
                    name="mode"
                    value="pi"
                    checked={mode==='pi'}
                    onChange={() => setMode('pi')}
                  />
                  <div>
                    <div className="font-semibold">Pi payout (placeholder)</div>
                    <div className="text-white/60 text-xs">Requires manual follow-up</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Preview + Acknowledgement */}
            <div className="grid gap-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={doPreview}
                  disabled={!selectedId || previewing}
                  className={`px-4 py-2 rounded-lg border ${
                    !selectedId || previewing
                      ? 'border-white/15 text-white/40'
                      : 'border-cyan-400/40 text-cyan-200 hover:bg-white/5'
                  }`}
                >
                  {previewing ? 'Previewing…' : 'Preview impact'}
                </button>

                <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 flex-1">
                  <label className="flex items-start gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={ack}
                      onChange={(e) => setAck(e.target.checked)}
                      className="mt-0.5"
                    />
                    <span>
                      I understand this will <span className="font-semibold">cancel the competition</span> and
                      <span className="font-semibold"> issue refunds</span> to all affected entries.
                    </span>
                  </label>
                </div>
              </div>

              {/* Submit */}
              <div className="flex items-center gap-3">
                <button
                  disabled={loading || !selectedId || !ack}
                  className={`px-4 py-2 rounded-lg font-semibold ${
                    loading || !selectedId || !ack
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-cyan-400 text-black hover:brightness-110'
                  }`}
                >
                  {loading ? 'Processing…' : 'Cancel & Refund'}
                </button>
                {current?.comp?.status === 'active' && (
                  <span className="text-xs text-white/60">
                    Tip: consider pausing first if you need to double-check counts.
                  </span>
                )}
              </div>
            </div>
          </form>

          {/* Preview panel */}
          {previewError && (
            <div className="mt-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-200">
              <div className="font-semibold mb-1">Preview unavailable</div>
              <div className="text-white/80">{previewError}</div>
              <div className="text-white/60 mt-1">You can still proceed with Cancel & Refund.</div>
            </div>
          )}
          {preview && (
            <div className="mt-4 rounded-lg border border-white/10 bg-[#0b1220] p-4 text-sm">
              <div className="font-semibold text-cyan-300 mb-2">Preview</div>
              <ul className="space-y-1">
                {'mode' in preview && <li>Mode: <span className="font-mono">{preview.mode}</span></li>}
                {'count' in preview && <li>Entries impacted: <span className="tabular-nums">{preview.count}</span></li>}
                {Array.isArray(preview.users) && (
                  <li>Users impacted: <span className="tabular-nums">{preview.users.length}</span></li>
                )}
                {preview.message && <li className="text-white/70">{preview.message}</li>}
              </ul>
              <details className="mt-2">
                <summary className="cursor-pointer text-white/70">Raw</summary>
                <pre className="mt-2 whitespace-pre-wrap break-words text-white/70">
                  {JSON.stringify(preview, null, 2)}
                </pre>
              </details>
            </div>
          )}

          {/* Error / Result */}
          {error && (
            <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
              <div className="font-semibold mb-1">Refund failed</div>
              <pre className="whitespace-pre-wrap break-words">{error}</pre>
            </div>
          )}
          {result && (
            <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm">
              <div className="font-semibold text-emerald-300 mb-1">Refund Summary</div>
              <ul className="space-y-1">
                <li>Mode: <span className="font-mono">{result.mode || mode}</span></li>
                {'count' in result && <li>Entries refunded: <span className="tabular-nums">{result.count}</span></li>}
                {result.competitionId && (
                  <li>Competition: <code className="bg-white/10 px-2 py-0.5 rounded">{String(result.competitionId)}</code></li>
                )}
                {Array.isArray(result.users) && (
                  <li>Users impacted: <span className="tabular-nums">{result.users.length}</span></li>
                )}
                {result.message && <li className="text-white/70">{result.message}</li>}
              </ul>
            </div>
          )}
        </div>
      </AdminSidebar>
    </AdminGuard>
  );
}

/* --- Small UI helpers --- */
function StatusChip({ status }) {
  const s = String(status || '').toLowerCase();
  const style =
    s === 'active'
      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
      : s === 'scheduled'
      ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
      : s === 'paused'
      ? 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30'
      : (s === 'ended' || s === 'closed' || s === 'cancelled')
      ? 'bg-gray-500/15 text-gray-300 border-gray-500/30'
      : 'bg-white/10 text-white/80 border-white/20';
  return (
    <span className={`inline-flex items-center gap-1 border px-2 py-0.5 rounded-full ${style}`}>
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      <span className="text-xs">{status || '—'}</span>
    </span>
  );
}
