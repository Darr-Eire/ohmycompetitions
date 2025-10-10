'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

export default function DebugAuthPage() {
  const [log, setLog] = useState(['Waiting for Pi SDK…']);
  const push = (m, obj) => {
    setLog((s) => [...s, m]);
    if (obj) console.log(m, obj);
    else console.log(m);
  };

  const run = async () => {
    try {
      if (!window.Pi) throw new Error('Pi SDK not loaded');

      // Fallback init (in case your app didn't already do this)
      if (!window.__piInitialized) {
        const sandbox =
          (typeof process !== 'undefined' &&
            process.env?.NEXT_PUBLIC_PI_SANDBOX === 'true') || false;
        window.Pi.init({ version: '2.0', sandbox });
        window.__piInitialized = true;
        push(`✅ Pi.init done (sandbox: ${sandbox})`);
      } else {
        push('✅ Pi.init already called in _app');
      }

      push('⏳ Pi.authenticate…');
      const auth = await window.Pi.authenticate(['username', 'payments', 'roles']);
      push('✅ Pi.authenticate result', auth);

      if (!auth?.accessToken) throw new Error('No accessToken from Pi.authenticate()');

      push('⏳ POST /api/pi/ping-me…');
      const r = await fetch('/api/pi/ping-me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: auth.accessToken }),
      });

      const data = await r.json().catch(() => ({}));
      push(`↩ ping-me status ${r.status}`, data);

      if (!r.ok || !data?.ok) {
        throw new Error(data?.error || `ping-me failed (status ${r.status})`);
      }

      push('🎉 me: ' + JSON.stringify(data.me));
      alert(`Pi login OK! Welcome ${data.me?.username || ''}`);
    } catch (e) {
      const msg = e?.message || String(e);
      push('❌ ' + msg);
      alert('Pi login failed: ' + msg);
    }
  };

  useEffect(() => {
    // Wait for Pi SDK to appear
    let tries = 0;
    const t = setInterval(() => {
      if (window.Pi) {
        push('✅ Pi SDK present');
        clearInterval(t);
      } else if (++tries > 60) {
        push('❌ Pi SDK not found');
        clearInterval(t);
      }
    }, 150);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ padding: 24 }}>
      {/* Load SDK (safe even if already on the page elsewhere) */}
      <Script src="https://sdk.minepi.com/pi-sdk.js" strategy="afterInteractive" />
      <h1>OMC Auth Debug</h1>
      <button onClick={run} style={{ padding: '8px 14px', borderRadius: 8 }}>
        Run Debug
      </button>
      <pre style={{ marginTop: 16, whiteSpace: 'pre-wrap' }}>{log.join('\n')}</pre>
    </div>
  );
}
