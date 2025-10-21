// FILE: src/components/NotificationsBell.jsx
'use client';

import { useEffect, useRef, useState } from 'react';

export default function NotificationsBell({ username }) {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const pollRef = useRef(null);
  const closeBtnRef = useRef(null);

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

  // ---- lock scroll + focus when open ---------------------------------------
  useEffect(() => {
    if (!open) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    const t = setTimeout(() => closeBtnRef.current?.focus(), 0);
    return () => {
      clearTimeout(t);
      document.documentElement.style.overflow = prev || '';
    };
  }, [open]);

  // ---- close on Escape ------------------------------------------------------
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div className="relative inline-block shrink-0">
      {/* Bell button (keeps header layout stable) */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative h-8 w-8 grid place-items-center rounded-md bg-white/5 border border-cyan-700/40"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Notifications"
      >
        <span aria-hidden>🔔</span>
        {unread > 0 && (
          <span className="absolute -top-1 -right-2 text-[10px] bg-red-600 text-white px-1 rounded">
            {unread}
          </span>
        )}
      </button>

      {/* FULL-SCREEN POPUP (like T&Cs / slug modals) */}
      {open && (
        <>
          {/* Backdrop */}
          <button
            className="fixed inset-0 z-[9998] bg-black/60"
            aria-label="Close notifications"
            onClick={() => setOpen(false)}
          />

          {/* Modal container (full screen on mobile, centered card on desktop) */}
          <div
            className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-6"
            aria-hidden="true"
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="notif-title"
              className="w-full h-[100dvh] sm:h-auto sm:max-h-[80vh] sm:max-w-lg
                         bg-slate-900 text-white
                         rounded-none sm:rounded-2xl
                         border-t sm:border border-slate-700
                         shadow-2xl
                         flex flex-col
                         motion-safe:transition-all motion-safe:duration-200
                         data-[state=open]:opacity-100 data-[state=open]:translate-y-0
                         sm:data-[state=open]:scale-100"
              data-state="open"
              style={{
                paddingBottom: 'max(env(safe-area-inset-bottom), 0px)',
              }}
            >
              {/* Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-slate-700">
                <h2 id="notif-title" className="text-base font-semibold text-cyan-300">
                  Notifications
                </h2>
                <button
                  ref={closeBtnRef}
                  onClick={() => setOpen(false)}
                  className="h-9 w-9 grid place-items-center rounded-lg border border-slate-600 bg-slate-800 hover:bg-slate-700"
                  aria-label="Close"
                  title="Close"
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-auto">
                <ul className="p-4 pt-3 space-y-3">
                  {items.length === 0 && (
                    <li className="text-sm text-gray-400">No notifications</li>
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
              <div className="border-t border-slate-700 px-4 py-3 flex justify-end gap-2">
                <button
                  onClick={() => setOpen(false)}
                  className="h-9 px-3 rounded-lg border border-slate-600 bg-slate-800 hover:bg-slate-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
