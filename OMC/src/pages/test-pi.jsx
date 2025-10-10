'use client';
import { useEffect, useState } from 'react';

export default function TestPi() {
  const [log, setLog] = useState([]);
  const push = (m) => setLog((x) => [...x, m]);

  useEffect(() => {
    (async () => {
      try {
        // 1) Ensure we're in Pi Browser
        if (!navigator.userAgent.toLowerCase().includes('pibrowser'))
          return push('Not in Pi Browser');

        // 2) Load SDK if missing
        if (!window.Pi) {
          await new Promise((res, rej) => {
            const s = document.createElement('script');
            s.src = 'https://sdk.minepi.com/pi-sdk.js';
            s.onload = res; s.onerror = () => rej(new Error('SDK load failed'));
            document.head.appendChild(s);
          });
          push('SDK loaded');
        }

        // 3) Init + authenticate
        push('Calling Pi.init…');
        window.Pi.init({ version: '2.0', network: 'Pi Testnet' });
        const scopes = ['username','payments','roles'];
        const auth = await window.Pi.authenticate(scopes);
        push(`Auth OK: ${auth?.user?.username} (${auth?.user?.uid})`);

        // 4) Backend login
        const r = await fetch('/api/pi/login', {
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ accessToken: auth?.accessToken })
        });
        push(`Backend login status: ${r.status}`);
        const data = await r.json().catch(()=> ({}));
        push(`Response: ${JSON.stringify(data).slice(0,200)}…`);
      } catch (e) {
        push('ERROR: ' + (e.message || String(e)));
      }
    })();
  }, []);

  return (
    <main style={{padding:16,color:'#0ff',fontFamily:'monospace'}}>
      <h1>/test-pi</h1>
      <ol>{log.map((l,i)=><li key={i}>{l}</li>)}</ol>
    </main>
  );
}
