'use client';

import { useEffect, useState } from 'react';
import { Database, Globe, Zap } from 'lucide-react';

export default function AdminSystemStatusCard() {
  const [status, setStatus] = useState({
    mongo: null,
    pi: null,
    env: null,
    loading: true,
  });

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const [dbRes, envRes, piRes] = await Promise.all([
          fetch('/api/debug/db').then((r) => r.json()),
          fetch('/api/debug/env').then((r) => r.json()),
          fetch('/api/debug/pi').then((r) => r.json()),
        ]);

        setStatus({
          mongo: dbRes?.ok ? dbRes?.name || 'connected' : 'error',
          pi: piRes?.ok && piRes?.verified ? 'connected' : 'error',
          env: envRes?.NEXT_PUBLIC_PI_ENV || 'unknown',
          loading: false,
        });
      } catch (err) {
        console.error('AdminSystemStatusCard:', err);
        setStatus({ mongo: 'error', pi: 'error', env: 'error', loading: false });
      }
    };

    fetchStatus();
  }, []);

  const Badge = ({ ok }) => (
    <span
      className={`inline-block px-2 py-[2px] text-xs rounded-full ${
        ok ? 'bg-emerald-600/20 text-emerald-400' : 'bg-red-600/20 text-red-400'
      }`}
    >
      {ok ? 'Online' : 'Error'}
    </span>
  );

  if (status.loading) {
    return (
      <div className="bg-black/40 border border-cyan-700/40 rounded-xl p-4 text-cyan-200">
        <p className="text-sm opacity-80">Checking system status...</p>
      </div>
    );
  }

  return (
    <div className="bg-black/50 border border-cyan-600/30 rounded-xl p-4 text-cyan-100 space-y-2 shadow-[0_0_15px_#00fff522]">
      <h3 className="text-lg font-semibold text-cyan-300 mb-2">System Status</h3>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Database size={16} /> MongoDB
        </div>
        <Badge ok={status.mongo && status.mongo !== 'error'} />
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Globe size={16} /> Pi Network API
        </div>
        <Badge ok={status.pi && status.pi !== 'error'} />
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Zap size={16} /> Environment
        </div>
        <span className="text-cyan-400 font-semibold">
          {status.env?.toUpperCase()}
        </span>
      </div>
    </div>
  );
}
