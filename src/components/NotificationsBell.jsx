// FILE: src/components/NotificationsBell.jsx
'use client';

import { useEffect, useRef, useState } from 'react';

export default function NotificationsBell({ username }) {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const pollRef = useRef(null);
  const btnRef = useRef(null);
  const panelRef = useRef(null);

  // ---- poll notifications ---------------------------------------------------
  useEffect(() => {
    async function load() {
      if (!username) return;
      try {
        const res = await fetch(
          `/api/notifications/list?username=${encodeURIComponent(username)}&limit=20`
        );
        if (res.ok) {
          const j = await res.json();
          setItems(Array.isArray(j.items) ? j.items : []);
        }
      } catch {}
    }
    load();
    pollRef.current = setInterval(load, 15000);
    return () => clearInterval(pollRef.current);
  }, [username]);

  const unread = items.filter((i) => !i.read).length;

  // ---- focus first interactive element when opened -------------------------
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      // try focus close, else the panel itself
      panelRef.current?.querySelector('button, a, [tabindex]:not([tabindex="-1"])')?.focus()
        || panelRef.current?.focus();
    }, 0);
    return () => clearTimeout(t);
  }, [open]);

  // ---- close on Escape ------------------------------------------------------
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  // ---- close on outside click ----------------------------------------------
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      const target = e.target;
      if (
        panelRef.current &&
        !panelRef.current.contains(target) &&
        btnRef.current &&
        !btnRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown, { passive: true });
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
    };
  }, [open]);

  return (
    <div className="relative inline-block shrink-0">
      {/* Bell button (keeps header layout stable) */}
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        className="relative h-8 w-8 grid place-items-center rounded-md bg-white/5 border border-cyan-700/40"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="notif-popover"
        aria-label="Notifications"
      >
        <span aria-hidden>🔔</span>
        {unread > 0 && (
          <span className="absolute -top-1 -right-2 text-[10px] bg-red-600 text-white px-1 rounded">
            {unread}
          </span>
        )}
      </button>

      {/* POPOVER PANEL (mobile-first) */}
      {open && (
        <div
          ref={panelRef}
          id="notif-popover"
          role="dialog"
          aria-modal="true"
          aria-labelledby="notif-title"
          tabIndex={-1}
          // Position: on mobile, full-width-ish card anchored to bottom of header;
          // on sm+ screens, a right-aligned pop under the bell.
          className={`
            absolute right-0 mt-2
            w-[min(92vw,28rem)] sm:w-[26rem]
            max-h-[70vh]
            rounded-2xl border border-slate-700
            bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-slate-900/80
            shadow-2xl
            overflow-hidden
            outline-none
            motion-safe:transition-all motion-safe:duration-150
            data-[state=open]:opacity-100 data-[state=open]:translate-y-0 data-[state=open]:scale-100
          `}
          data-state="open"
          style={{
            // Nudge for tiny screens so it feels centered and fits:
            // if the bell hugs the right edge, the width already clamps via 92vw.
            zIndex: 60,
          }}
        >
          {/* Mobile-friendly header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
            <h2 id="notif-title" className="text-sm font-semibold text-cyan-300">
              Notifications
            </h2>
            <button
              onClick={() => setOpen(false)}
              className="h-8 px-2 rounded-lg border border-slate-600 bg-slate-800 hover:bg-slate-700 text-xs"
              aria-label="Close notifications"
            >
              Close
            </button>
          </div>

          {/* Scrollable content */}
          <div className="max-h-[60vh] overflow-auto">
            <ul className="p-3 space-y-3">
              {items.length === 0 && (
                <li className="text-sm text-gray-400 px-1 py-1">No notifications</li>
              )}
              {items.map((n) => (
                <li key={n._id} className="text-sm">
                  <div className="flex items-start justify-between gap-3 rounded-lg border border-slate-700 p-3 bg-slate-800">
                    <div className="min-w-0">
                      <div className="font-medium text-cyan-300 truncate">
                        {n.title || n.type}
                      </div>
                      <div className="text-gray-200 whitespace-pre-wrap break-words">
                        {n.message}
                      </div>
                    </div>
                    {!n.read && (
                      <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/15 text-yellow-300 border border-yellow-600/50">
                        NEW
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Footer (optional actions) */}
          <div className="border-t border-slate-700 px-3 py-2 flex justify-end gap-2">
            <button
              onClick={() => setOpen(false)}
              className="h-8 px-3 rounded-lg border border-slate-600 bg-slate-800 hover:bg-slate-700 text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
