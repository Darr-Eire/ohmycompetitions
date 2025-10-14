// File: src/pages/dev/pi-quick-test.jsx
// NOTE: No import of isSandboxEnv. We compute locally to avoid build-time mismatch.

import { useMemo, useState } from 'react';
import Head from 'next/head';
import { usePiEnv } from 'hooks/usePiEnv';
import { CreatePayment, authWithPiNetwork } from 'lib/pi/PiQuickClient';

export default function PiQuickTestPage() {
  const { isPiBrowser, hasPi, isReady } = usePiEnv();
  const [amount, setAmount] = useState('1.00');
  const [memo, setMemo] = useState('Testnet payment');
  const [busy, setBusy] = useState(false);
  const [authed, setAuthed] = useState(null);
  const [log, setLog] = useState([]);

  const envRaw = useMemo(
    () => (process.env.NEXT_PUBLIC_PI_ENV || process.env.PI_ENV || '').toLowerCase().trim(),
    []
  );
  const envLabel = envRaw || '(not set)';

  // testnet/sandbox both map to "Pi Testnet" in SDK init in your repo
  const sandboxFlag = envRaw === 'sandbox' || envRaw === 'testnet';

  function pushLog(line) {
    setLog((prev) => [`${new Date().toLocaleTimeString()}  ${line}`, ...prev].slice(0, 200));
  }

  async function handleAuth() {
    setBusy(true);
    try {
      pushLog('Authenticating…');
      const ans = await authWithPiNetwork();
      setAuthed(ans);
      const short = ans.wallet_address ? `${ans.wallet_address.slice(0, 6)}…` : 'n/a';
      pushLog(`Authenticated as @${ans.username}, wallet ${short}`);
    } catch (e) {
      pushLog(`Auth failed: ${e.message || e}`);
    } finally {
      setBusy(false);
    }
  }

  async function handlePay() {
    setBusy(true);
    try {
      const amt = Number(amount);
      if (!amt || amt <= 0) throw new Error('Enter a positive amount');
      pushLog(`Creating payment for ${amt} π…`);
      await CreatePayment(
        amt,
        (paymentId, txid) => pushLog(`✅ Payment completed. paymentId=${paymentId} txid=${txid}`),
        { memo, metadata: { source: 'pi-quick-test', ts: Date.now() } }
      );
      pushLog('Payment flow finished.');
    } catch (e) {
      pushLog(`❌ Payment error: ${e.message || e}`);
    } finally {
      setBusy(false);
    }
  }

  const canPay = isReady && hasPi && isPiBrowser && !busy;

  return (
    <>
      <Head><title>Pi Quick Test</title></Head>
      <main style={styles.main}>
        <div style={styles.card}>
          <h1 style={styles.h1}>Pi Test Payment</h1>

          <div style={styles.kv}><span>Pi Browser:</span><strong>{isPiBrowser ? 'YES' : 'NO'}</strong></div>
          <div style={styles.kv}><span>SDK Present:</span><strong>{hasPi ? 'YES' : 'NO'}</strong></div>
          <div style={styles.kv}><span>Client Env:</span><code>NEXT_PUBLIC_PI_ENV={envLabel}</code></div>
          <div style={styles.kv}><span>Sandbox/Testnet:</span><strong>{sandboxFlag ? 'YES (Testnet)' : 'NO (Mainnet?)'}</strong></div>

          {!isPiBrowser && (
            <p style={styles.warn}>Open this page inside <strong>Pi Browser</strong> to run the SDK flow.</p>
          )}

          <div style={styles.row}>
            <label style={styles.label}>Amount (π)</label>
            <input type="number" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} style={styles.input} />
          </div>

          <div style={styles.row}>
            <label style={styles.label}>Memo</label>
            <input type="text" value={memo} onChange={(e) => setMemo(e.target.value)} style={styles.input} />
          </div>

          <div style={styles.buttons}>
            <button onClick={handleAuth} disabled={busy || !isPiBrowser || !hasPi} style={styles.btn}>
              {busy ? 'Working…' : 'Authenticate'}
            </button>
            <button onClick={handlePay} disabled={!canPay} style={styles.btnPrimary}>
              {busy ? 'Processing…' : 'Pay with Pi (Testnet)'}
            </button>
          </div>

          {authed && (
            <div style={styles.box}>
              <div><strong>Authenticated:</strong> @{authed.username}</div>
              <div><strong>Wallet:</strong> {authed.wallet_address}</div>
            </div>
          )}

          <h3 style={styles.h3}>Logs</h3>
          <div style={styles.logBox} aria-live="polite">
            {log.length === 0 ? <em>No logs yet.</em> : log.map((l, i) => <div key={i}>{l}</div>)}
          </div>
        </div>
      </main>
    </>
  );
}

const styles = {
  main: { minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#0b1020', padding: 24 },
  card: { width: '100%', maxWidth: 720, background: '#121835', color: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 10px 30px rgba(0,0,0,0.35)' },
  h1: { margin: '8px 0 16px' },
  h3: { marginTop: 24 },
  row: { display: 'grid', gridTemplateColumns: '140px 1fr', gap: 12, alignItems: 'center', margin: '10px 0' },
  label: { opacity: 0.85 },
  input: { padding: '10px 12px', borderRadius: 10, border: '1px solid #2a356f', background: '#0e1530', color: '#fff' },
  buttons: { display: 'flex', gap: 12, marginTop: 14 },
  btn: { padding: '10px 14px', borderRadius: 10, background: '#233077', color: '#fff', border: '1px solid #2a356f', cursor: 'pointer' },
  btnPrimary: { padding: '10px 14px', borderRadius: 10, background: '#3b82f6', color: '#fff', border: 'none', cursor: 'pointer' },
  kv: { display: 'flex', gap: 8, alignItems: 'baseline', marginBottom: 6 },
  box: { background: '#0e1530', border: '1px solid #2a356f', borderRadius: 10, padding: 12, marginTop: 12 },
  warn: { background: '#3a1b1b', border: '1px solid #6b1a1a', padding: 10, borderRadius: 8, color: '#ffb4b4' },
  logBox: { background: '#0e1530', border: '1px solid '#2a356f', borderRadius: 10, padding: 12, minHeight: 140, maxHeight: 260, overflow: 'auto' },
};
