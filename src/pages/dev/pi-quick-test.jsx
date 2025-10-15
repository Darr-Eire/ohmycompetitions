// PATH: src/pages/dev/pi-quick-test.jsx

import { useMemo, useState } from 'react';
import Head from 'next/head';
import { usePiEnv } from 'hooks/usePiEnv';
import { CreatePayment, authWithPiNetwork } from 'lib/pi/PiQuickClient';
import PiNetworkService from 'lib/pi/PiBackendIntegration';

export default function PiQuickTestPage() {
  const { isPiBrowser, hasPi, isReady } = usePiEnv();
  const [amount, setAmount] = useState('1.00');
  const [memo, setMemo] = useState('Testnet payment');
  const [busy, setBusy] = useState(false);
  const [authed, setAuthed] = useState(null);
  const [log, setLog] = useState([]);
  const [hasPiNow, setHasPiNow] = useState(false);

  // IDs surfaced to the UI
  const [lastPaymentId, setLastPaymentId] = useState('');
  const [lastTxid, setLastTxid] = useState('');

  // Clear-pending UI state
  const [cancelId, setCancelId] = useState('');
  const [cancelBusy, setCancelBusy] = useState(false);
  const [pendingList, setPendingList] = useState([]);

  const envRaw = useMemo(
    () => (process.env.NEXT_PUBLIC_PI_ENV || process.env.PI_ENV || '').toLowerCase().trim(),
    []
  );
  const envLabel = envRaw || '(not set)';
  const sandboxFlag = envRaw === 'sandbox' || envRaw === 'testnet';
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '(server)';

  function pushLog(line) {
    setLog((prev) => [`${new Date().toLocaleTimeString()} ${line}`, ...prev].slice(0, 200));
  }

  async function handleLoadSdk() {
    try {
      pushLog('Injecting Pi SDK script…');
      await new Promise((resolve, reject) => {
        const existing = document.querySelector('script[src*="sdk.minepi.com/pi-sdk.js"]');
        if (existing) return resolve();
        const s = document.createElement('script');
        s.src = 'https://sdk.minepi.com/pi-sdk.js';
        s.onload = resolve;
        s.onerror = () => reject(new Error('SDK script failed to load'));
        document.head.appendChild(s);
      });
      await new Promise((r) => setTimeout(r, 150));
      setHasPiNow(!!window.Pi);
      pushLog(`SDK loaded. window.Pi ${window.Pi ? 'available' : 'still missing'}.`);
    } catch (e) {
      pushLog(`SDK load error: ${e.message || e}`);
    }
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
    setLastTxid('');
    try {
      const amt = Number(amount);
      if (!amt || amt <= 0) throw new Error('Enter a positive amount');
      pushLog(`Creating payment for ${amt} π…`);
      await CreatePayment(
        amt,
        (paymentId, txid) => {
          setLastPaymentId(paymentId);
          setLastTxid(txid || '');
          pushLog(`✅ Payment completed. paymentId=${paymentId} txid=${txid}`);
        },
        {
          memo,
          metadata: { source: 'pi-quick-test', ts: Date.now() },
          // Why: capture ID as soon as Pi gives it, even before completion
          onPaymentId: (paymentId) => {
            setLastPaymentId(paymentId);
            setCancelId(paymentId);
            pushLog(`Got paymentId: ${paymentId}`);
          },
        }
      );
      pushLog('Payment flow finished.');
    } catch (e) {
      pushLog(`❌ Payment error: ${e.message || e}`);
    } finally {
      setBusy(false);
    }
  }

  // --- Clear pending helpers ---
  async function httpGet(path) {
    const r = await fetch(path);
    const t = await r.text();
    if (!r.ok) throw new Error(t || `HTTP ${r.status}`);
    // Guard: if API route missing, Next returns HTML
    const ct = (r.headers.get('content-type') || '').toLowerCase();
    if (ct.includes('text/html')) throw new Error('Unexpected HTML response (API route missing?)');
    try { return JSON.parse(t); } catch { return t; }
  }

  async function refreshPending() {
    try {
      const data = await httpGet('/api/pi/incomplete');
      const list = Array.isArray(data) ? data : (data?.incomplete_server_payments || []);
      setPendingList(list || []);
      pushLog(`Fetched ${list?.length || 0} pending server payment(s).`);
    } catch (e) {
      pushLog(`Fetch pending failed: ${e.message || e}`);
    }
  }

  async function handleCancelById() {
    const id = cancelId.trim();
    if (!id) { pushLog('Enter a paymentId to cancel.'); return; }
    setCancelBusy(true);
    try {
      pushLog(`Cancelling payment ${id}…`);
      await PiNetworkService.cancelPiNetworkPayment(id);
      pushLog(`✅ Cancelled ${id}.`);
      setCancelId('');
      await refreshPending();
    } catch (e) {
      pushLog(`❌ Cancel failed: ${e.message || e}`);
    } finally {
      setCancelBusy(false);
    }
  }

  async function handleAutoClear() {
    setCancelBusy(true);
    try {
      pushLog('Checking for pending payments…');
      const data = await httpGet('/api/pi/incomplete');
      const list = Array.isArray(data) ? data : (data?.incomplete_server_payments || []);
      if (!list || list.length === 0) {
        pushLog('No pending payments found.');
        setPendingList([]);
        return;
      }
      setPendingList(list);
      const oldest = list[0];
      const id = oldest?.identifier || oldest?.id || oldest?.paymentId;
      if (!id) {
        pushLog('Pending list did not include identifiers.');
        return;
      }
      pushLog(`Auto-cancelling oldest pending: ${id}…`);
      await PiNetworkService.cancelPiNetworkPayment(id);
      pushLog(`✅ Auto-cancelled ${id}.`);
      await refreshPending();
    } catch (e) {
      pushLog(`❌ Auto-clear failed: ${e.message || e}`);
    } finally {
      setCancelBusy(false);
    }
  }

  async function handleUseLastId() {
    if (!lastPaymentId) { pushLog('No last paymentId available.'); return; }
    setCancelId(lastPaymentId);
    pushLog(`Prefilled cancel id: ${lastPaymentId}`);
  }

  const sdkPresent = hasPi || hasPiNow;
  const canPay = isReady && sdkPresent && !busy;

  return (
    <>
      <Head><title>Pi Quick Test</title></Head>
      <main style={styles.main}>
        <div style={styles.card}>
          <h1 style={styles.h1}>Pi Test Payment</h1>

          <div style={styles.kv}><span>Pi Browser:</span><strong>{isPiBrowser ? 'YES' : 'NO'}</strong></div>
          <div style={styles.kv}><span>SDK Present:</span><strong>{sdkPresent ? 'YES' : 'NO'}</strong></div>
          <div style={styles.kv}><span>Client Env:</span><code>NEXT_PUBLIC_PI_ENV={envLabel}</code></div>
          <div style={styles.kv}><span>Sandbox/Testnet:</span><strong>{sandboxFlag ? 'YES (Testnet)' : 'NO (Mainnet?)'}</strong></div>
          <div style={styles.kv}><span>UA:</span><code style={{fontSize:12, opacity:.8}}>{userAgent}</code></div>

          {!sdkPresent && (
            <div style={{ display:'flex', gap:12, margin:'8px 0 16px' }}>
              <button onClick={handleLoadSdk} style={styles.btn}>Load SDK</button>
            </div>
          )}

          {(lastPaymentId || lastTxid) && (
            <div style={styles.box}>
              <div style={{fontSize:12}}>
                <div><strong>Last paymentId:</strong> <code>{lastPaymentId || '(none)'}</code></div>
                <div><strong>Last txid:</strong> <code>{lastTxid || '(none)'}</code></div>
              </div>
              <div style={{ display:'flex', gap:8, marginTop:8, flexWrap:'wrap' }}>
                <button onClick={handleUseLastId} style={styles.btn}>Use last id</button>
              </div>
            </div>
          )}

          {/* Clear pending controls */}
          <div style={styles.box}>
            <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:10, flexWrap:'wrap' }}>
              <input
                placeholder="Payment ID to cancel"
                value={cancelId}
                onChange={(e)=>setCancelId(e.target.value)}
                style={{ ...styles.input, maxWidth: '100%' }}
              />
              <button onClick={handleCancelById} disabled={cancelBusy || !cancelId.trim()} style={styles.btn}>
                {cancelBusy ? 'Working…' : 'Clear pending by ID'}
              </button>
              <button onClick={handleAutoClear} disabled={cancelBusy} style={styles.btn}>
                {cancelBusy ? 'Working…' : 'Auto-clear oldest pending'}
              </button>
              <button onClick={refreshPending} disabled={cancelBusy} style={styles.btn}>
                Refresh list
              </button>
            </div>
            {pendingList?.length > 0 && (
              <div style={{ fontSize:12, opacity:.9 }}>
                <strong>Pending on server:</strong>
                <ul>
                  {pendingList.slice(0,5).map((p,i)=>(
                    <li key={i} style={{wordBreak:'break-all'}}>
                      {p?.identifier || p?.id || p?.paymentId} — {p?.amount ?? ''}π
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div style={styles.row}>
            <label style={styles.label}>Amount (π)</label>
            <input type="number" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} style={styles.input} />
          </div>

          <div style={styles.row}>
            <label style={styles.label}>Memo</label>
            <input type="text" value={memo} onChange={(e) => setMemo(e.target.value)} style={styles.input} />
          </div>

          <div style={styles.buttons}>
            <button onClick={handleAuth} disabled={busy || !isPiBrowser || !sdkPresent} style={styles.btn}>
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
  card: { width: '100%', maxWidth: 820, background: '#121835', color: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 10px 30px rgba(0,0,0,0.35)' },
  h1: { margin: '8px 0 16px' },
  h3: { marginTop: 24 },
  row: { display: 'grid', gridTemplateColumns: '140px 1fr', gap: 12, alignItems: 'center', margin: '10px 0' },
  label: { opacity: 0.85 },
  input: { padding: '10px 12px', borderRadius: 10, border: '1px solid #2a356f', background: '#0e1530', color: '#fff', width: '100%' },
  buttons: { display: 'flex', gap: 12, marginTop: 14, flexWrap: 'wrap' },
  btn: { padding: '10px 14px', borderRadius: 10, background: '#233077', color: '#fff', border: '1px solid #2a356f', cursor: 'pointer' },
  btnPrimary: { padding: '10px 14px', borderRadius: 10, background: '#3b82f6', color: '#fff', border: 'none', cursor: 'pointer' },
  kv: { display: 'flex', gap: 8, alignItems: 'baseline', marginBottom: 6 },
  box: { background: '#0e1530', border: '1px solid #2a356f', borderRadius: 10, padding: 12, marginTop: 12 },
  warn: { background: '#3a1b1b', border: '1px solid #6b1a1a', padding: 10, borderRadius: 8, color: '#ffb4b4' },
  logBox: { background: '#0e1530', border: '1px solid #2a356f', borderRadius: 10, padding: 12, minHeight: 140, maxHeight: 260, overflow: 'auto' },
};