import { useEffect, useState, useRef } from 'react';

export default function NotificationsBell({ username }) {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const timer = useRef(null);

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
    timer.current = setInterval(load, 15000);
    return () => clearInterval(timer.current);
  }, [username]);

  const unread = items.filter(i => !i.read).length;

  return (
    <div className="relative">
      <button onClick={() => setOpen(v => !v)} className="relative">
        <span>🔔</span>
        {unread > 0 && (
          <span className="absolute -top-1 -right-2 text-[10px] bg-red-600 text-white px-1 rounded">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-[#0f172a] border border-cyan-700 rounded p-2 z-50">
          <div className="text-xs text-gray-400 mb-1">Notifications</div>
          <ul className="space-y-2 max-h-72 overflow-auto">
            {items.length === 0 && <li className="text-sm text-gray-400">No notifications</li>}
            {items.map(n => (
              <li key={n._id} className="text-sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-medium text-cyan-300">{n.title || n.type}</div>
                    <div className="text-gray-300">{n.message}</div>
                  </div>
                  {!n.read && <span className="text-[10px] text-yellow-400">new</span>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}


