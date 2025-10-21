'use client';

import { useEffect, useRef, useState } from 'react';

export default function NotificationsBell({ username }) {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const pollRef = useRef(null);

  useEffect(() => {
    async function load() {
      if (!username) return;
      try {
        const res = await fetch(`/api/notifications/list?username=${encodeURIComponent(username)}&limit=10`);
        if (res.ok) {
          const j = await res.json();
          setItems(j.items || []);
        }
      } catch {}
    }
    load();
    pollRef.current = setInterval(load, 15000);
    return () => clearInterval(pollRef.current);
  }, [username]);

  const unread = items.filter((i) => !i.read).length;

  // close on outside click / escape (desktop dropdown)
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (!e.target.closest?.('[data-bell-root]') && !e.target.closest?.('[data-bell-overlay]')) {
        setOpen(false);
      }
    };
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div data-bell-root className="relative inline-block shrink-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative h-8 w-8 grid place-items-center rounded-md bg-white/5 border border-cyan-700/40"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Notifications"
      >
        <span>🔔</span>
        {unread > 0 && (
          <span className="absolute -top-1 -right-2 text-[10px] bg-red-600 text-white px-1 rounded">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Mobile: right-side drawer (opaque) */}
          <div
            data-bell-overlay
            className="sm:hidden fixed inset-0 z-[9998] bg-black/50"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            className="sm:hidden fixed right-0 top-0 z-[9999] h-[100dvh] w-[88vw] max-w-80
                       bg-slate-900 text-white shadow-2xl border-l border-cyan-700
                       flex flex-col"
            role="dialog"
            aria-label="Notifications"
          >
            <div className="flex items-center justify-between px-3 py-3 border-b border-white/10">
              <span className="text-sm font-semibold text-cyan-300">Notifications</span>
              <button
                onClick={() => setOpen(false)}
                className="h-7 w-7 grid place-items-center rounded-md bg-slate-800 border border-slate-600"
                aria-label="Close"
                title="Close"
              >
                ✕
              </button>
            </div>
            <ul className="flex-1 overflow-y-auto p-3 space-y-2">
              {items.length === 0 && <li className="text-sm text-gray-400">No notifications</li>}
              {items.map((n) => (
                <li key={n._id} className="text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-medium text-cyan-300 truncate">{n.title || n.type}</div>
                      <div className="text-gray-200 break-words">{n.message}</div>
                    </div>
                    {!n.read && <span className="shrink-0 text-[10px] text-yellow-400">new</span>}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Desktop: right-aligned dropdown (opaque) */}
          <div
            className="hidden sm:block absolute right-0 top-full mt-2 z-[9999] w-80
                       rounded-lg border border-cyan-700 bg-slate-900 text-white p-2 shadow-xl"
            role="menu"
            aria-label="Notifications"
          >
            <div className="text-xs text-gray-400 mb-1 px-1">Notifications</div>
            <ul className="space-y-2 max-h-72 overflow-auto pr-1">
              {items.length === 0 && <li className="text-sm text-gray-400 px-1">No notifications</li>}
              {items.map((n) => (
                <li key={n._id} className="text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-medium text-cyan-300 truncate">{n.title || n.type}</div>
                      <div className="text-gray-200 break-words">{n.message}</div>
                    </div>
                    {!n.read && <span className="shrink-0 text-[10px] text-yellow-400">new</span>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
