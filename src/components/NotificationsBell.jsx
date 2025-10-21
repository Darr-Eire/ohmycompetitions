'use client';

import { useEffect, useRef, useState } from 'react';

export default function NotificationsBell({ username }) {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const pollRef = useRef(null);
  const sheetRef = useRef(null);
  const closeBtnRef = useRef(null);

  // ---- poll notifications ---------------------------------------------------
  useEffect(() => {
    async function load() {
      if (!username) return;
      try {
        const res = await fetch(`/api/notifications/list?username=${encodeURIComponent(username)}&limit=20`);
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

  const unread = items.filter(i => !i.read).length;

  // ---- lock scroll when open ------------------------------------------------
  useEffect(() => {
    const root = document.documentElement;
    if (open) {
      const prev = root.style.overflow;
      root.style.overflow = 'hidden';
      // focus close for a11y
      setTimeout(() => closeBtnRef.current?.focus(), 0);
      return () => { root.style.overflow = prev; };
    }
  }, [open]);

  // ---- close on Escape ------------------------------------------------------
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  // ---- optional: simple drag-to-close on mobile -----------------------------
  useEffect(() => {
    if (!open) return;
    const el = sheetRef.current;
    if (!el) return;

    let startY = 0;
    let current = 0;
    const maxPull = 120;

    const onStart = (e) => {
      startY = (e.touches?.[0]?.clientY ?? e.clientY);
      current = 0;
      el.style.transitionProperty = 'none';
    };
    const onMove = (e) => {
      const y = (e.touches?.[0]?.clientY ?? e.clientY);
      current = Math.max(0, y - startY);
      const translate = Math.min(current, maxPull);
      el.style.transform = `translateY(${translate}px)`;
    };
    const onEnd = () => {
      el.style.transitionProperty = '';
      if (current > 80) {
        setOpen(false);
      } else {
        el.style.transform = '';
      }
    };

    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchmove', onMove, { passive: true });
    el.addEventListener('touchend', onEnd);
    return () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchmove', onMove);
      el.removeEventListener('touchend', onEnd);
    };
  }, [open]);

  return (
    <div className="relative inline-block shrink-0">
      {/* Bell button (does NOT affect layout) */}
      <button
        onClick={() => setOpen(v => !v)}
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

      {/* MOBILE-FIRST: bottom sheet (opaque) + backdrop. Also works on desktop nicely. */}
      {open && (
        <>
          {/* Backdrop */}
          <button
            className="fixed inset-0 z-[9998] bg-black/55 md:bg-black/60"
            aria-label="Close notifications"
            onClick={() => setOpen(false)}
          />

          {/* Bottom sheet */}
          <div
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="notif-title"
            className="fixed inset-x-0 bottom-0 z-[9999] 
                       max-h-[85vh] w-full rounded-t-2xl bg-slate-900 text-white 
                       border-t border-slate-700 shadow-[0_-10px_30px_rgba(0,0,0,0.35)]
                       translate-y-0 will-change-transform
                       data-[state=closed]:translate-y-full
                       motion-safe:transition-transform motion-safe:duration-200"
            style={{
              // safe area padding on iOS
              paddingBottom: 'max(env(safe-area-inset-bottom), 12px)',
            }}
          >
            {/* Grab handle */}
            <div className="pt-2 grid place-items-center">
              <span className="h-1.5 w-10 rounded-full bg-white/25" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3">
              <h2 id="notif-title" className="text-sm font-semibold text-cyan-300">
                Notifications
              </h2>
              <button
                ref={closeBtnRef}
                onClick={() => setOpen(false)}
                className="h-8 w-8 grid place-items-center rounded-lg border border-slate-600 bg-slate-800"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* List */}
            <ul className="px-4 pb-3 space-y-2 overflow-y-auto max-h-[60vh]">
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
                      <div className="text-gray-200 break-words">
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
        </>
      )}
    </div>
  );
}
