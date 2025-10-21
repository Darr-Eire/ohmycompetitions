'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export default function NotificationsBell({ username }) {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 }); // viewport coords for the portal
  const [mounted, setMounted] = useState(false);
  const pollRef = useRef(null);
  const btnRef = useRef(null);
  const panelRef = useRef(null);

  // ---- data polling ---------------------------------------------------------
  useEffect(() => {
    async function load() {
      if (!username) return;
      try {
        const res = await fetch(`/api/notifications/list?username=${encodeURIComponent(username)}&limit=10`);
        if (res.ok) {
          const j = await res.json();
          setItems(j.items || []);
        }
      } catch {
        // silent fail
      }
    }
    load();
    pollRef.current = setInterval(load, 15000);
    return () => clearInterval(pollRef.current);
  }, [username]);

  const unread = items.filter((i) => !i.read).length;

  // ---- portal mount flag (Next.js SSR safe) ---------------------------------
  useEffect(() => {
    setMounted(true);
  }, []);

  // ---- position the panel at the right edge of the button -------------------
  const updatePosition = () => {
    const btn = btnRef.current;
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    // Place panel below button (top = bottom + 8), align panel's RIGHT to button's RIGHT
    setPos({ top: r.bottom + 8, left: r.right });
  };

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
    const onScroll = () => updatePosition();
    const onResize = () => updatePosition();
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
    };
  }, [open]);

  // ---- close on outside click / escape --------------------------------------
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      const btn = btnRef.current;
      const panel = panelRef.current;
      if (!btn || !panel) return;
      if (btn.contains(e.target) || panel.contains(e.target)) return;
      setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        className="relative h-8 w-8 grid place-items-center"
        aria-haspopup="dialog"
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

      {/* Portal panel to avoid clipping by overflow/transform parents */}
      {mounted && open &&
        createPortal(
          <div
            ref={panelRef}
            role="dialog"
            aria-label="Notifications"
            style={{
              position: 'fixed',
              top: pos.top,
              left: pos.left,
              transform: 'translateX(-100%)', // align right edge to trigger's right edge
              zIndex: 9999,
            }}
            className="w-72 rounded-lg border border-cyan-700/60 bg-[#0f172a]/95 backdrop-blur p-2 shadow-xl"
          >
            <div className="text-xs text-gray-400 mb-1 px-1">Notifications</div>
            <ul className="space-y-2 max-h-72 overflow-auto pr-1">
              {items.length === 0 && <li className="text-sm text-gray-400 px-1">No notifications</li>}
              {items.map((n) => (
                <li key={n._id} className="text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-medium text-cyan-300 truncate">{n.title || n.type}</div>
                      <div className="text-gray-300 break-words">{n.message}</div>
                    </div>
                    {!n.read && <span className="shrink-0 text-[10px] text-yellow-400">new</span>}
                  </div>
                </li>
              ))}
            </ul>
          </div>,
          document.body
        )}
    </div>
  );
}
