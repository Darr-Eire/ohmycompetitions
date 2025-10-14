// ============================================================================
// PATH: src/lib/pi/PiQuickClient.js
// Clean client – DO NOT paste this into a page file.
// ============================================================================
import { readyPi } from '../piClient';
import PiNetworkService from './PiBackendIntegration';

function isSandboxEnv() {
  const raw = (process.env.NEXT_PUBLIC_PI_ENV || process.env.PI_ENV || '').toLowerCase().trim();
  return raw === 'sandbox' || raw === 'testnet';
}

async function ensurePi() {
  // Why: your readyPi() resolves "Pi Testnet" for sandbox/testnet automatically
  return readyPi({ network: undefined });
}

export async function onIncompletePaymentFound(paymentDTO) {
  // Why: clear stale pendings so user can try again
  try { await PiNetworkService.cancelPiNetworkPayment(paymentDTO?.identifier); } catch {}
}

export async function getUserAccessToken() {
  const Pi = await ensurePi();
  const ans = await Pi.authenticate(['username', 'payments', 'wallet_address'], onIncompletePaymentFound);
  return ans.accessToken;
}

export async function getUserWalletAddress() {
  const Pi = await ensurePi();
  const ans = await Pi.authenticate(['username', 'payments', 'wallet_address'], onIncompletePaymentFound);
  return ans.wallet_address;
}

export async function authWithPiNetwork() {
  const Pi = await ensurePi();
  const ans = await Pi.authenticate(['username', 'payments', 'wallet_address'], onIncompletePaymentFound);
  return { username: ans.username, accessToken: ans.accessToken, wallet_address: ans.wallet_address };
}

/**
 * Create a payment.
 * @param {number} amount
 * @param {(paymentId:string, txid?:string)=>void} onPaymentSucceed
 * @param {{ memo?:string, metadata?:object, onPaymentId?:(paymentId:string)=>void }} [opts]
 */
export async function CreatePayment(amount, onPaymentSucceed, opts = {}) {
  if (!amount || Number(amount) <= 0) throw new Error('CreatePayment: positive amount required');
  const memo = opts.memo ?? 'Donation';
  const metadata = opts.metadata ?? { source: 'app' };
  const onPaymentId = typeof opts.onPaymentId === 'function' ? opts.onPaymentId : null;

  const Pi = await ensurePi();
  const { accessToken } = await authWithPiNetwork();

  return Pi.createPayment(
    { amount, memo, metadata },
    {
      onReadyForServerApproval: async (paymentId) => {
        try { onPaymentId && onPaymentId(paymentId); } catch {}
        await PiNetworkService.approvePiNetworkPayment(paymentId);
      },
      onReadyForServerCompletion: async (paymentId, txid) => {
        await PiNetworkService.completePiNetworkPayment(paymentId, txid, accessToken);
        try { typeof onPaymentSucceed === 'function' && onPaymentSucceed(paymentId, txid); } catch {}
      },
      onCancel: async () => {},
      onError: async (error, paymentDTO) => {
        try { await PiNetworkService.cancelPiNetworkPayment(paymentDTO?.identifier); } catch {}
        throw error;
      },
    }
  );
}

export default {
  CreatePayment,
  authWithPiNetwork,
  getUserAccessToken,
  getUserWalletAddress,
  onIncompletePaymentFound,
  isSandboxEnv,
};


// ============================================================================
// PATH: src/pages/dev/pi-quick-test.jsx
// Clean page – imports ONLY. No duplicate exports.
// ============================================================================
import { useMemo, useState } from 'react';
import Head from 'next/head';
import { usePiEnv } from '@/hooks/usePiEnv';
import { CreatePayment, authWithPiNetwork } from '@/lib/pi/PiQuickClient';
import PiNetworkService from '@/lib/pi/PiBackendIntegration';

export default function PiQuickTestPage() {
  const { isPiBrowser, hasPi, isReady } = usePiEnv();
  const [amount, setAmount] = useState('1.00');
  const [memo, setMemo] = useState('Testnet payment');
  const [busy, setBusy] = useState(false);
  const [authed, setAuthed] = useState(null);
  const [log, setLog] = useState([]);
  const [hasPiNow, setHasPiNow] = useState(false);
  const [lastPaymentId, setLastPaymentId] = useState('');
  const [lastTxid, setLastTxid] = useState('');
  const [cancelId, setCancelId] = useState('');
  const [cancelBusy, setCancelBusy] = useState(false);

  const envRaw = useMemo(() => (process.env.NEXT_PUBLIC_PI_ENV || process.env.PI_ENV || '').toLowerCase().trim(), []);
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

  // Utilities
  async function httpGet(path) {
    const r = await fetch(path);
    const t = await r.text();
    if (!r.ok) throw new Error(t || `HTTP ${r.status}`);
    if ((r.headers.get('content-type') || '').includes('text/html')) throw new Error('Unexpected HTML response');
    try { return JSON.parse(t); } catch { return t; }
  }

  async function handleCancelById() {
    const id = cancelId.trim();
    if (!id) { pushLog('Enter a paymentId to cancel.'); return; }
    setCancelBusy(true);
    try {
      pushLog(`Cancelling payment ${id}…`);
      await PiNetworkService.cancelPiNetworkPayment(id);
      pushLog(`✅ Cancelled ${id}.`);
    } catch (e) {
      pushLog(`❌ Cancel failed: ${e.message || e}`);
    } finally {
      setCancelBusy(false);
    }
  }

  async function handleUseLastId() {
    if (!lastPaymentId) { pushLog('No last paymentId available.'); return; }
    setCancelId(lastPaymentId);
    pushLog(`Prefilled cancel id: ${lastPaymentId}`);
  }

  async function handleCheckStatus() {
    const id = (cancelId || lastPaymentId).trim();
    if (!id) { pushLog('Provide a paymentId to check.'); return; }
    try {
      pushLog(`Checking status for ${id}…`);
      const enc = encodeURIComponent(id);
      const data = await httpGet(`/api/pi/payments/${enc}/status`);
      pushLog(`Status: ${JSON.stringify(data)}`);
    } catch (e) {
      pushLog(`❌ Status check failed: ${e.message || e}`);
    }
  }

  const sdkPresent = hasPi || hasPiNow;
  const canPay = isReady && sdkPresent && isPiBrowser && !busy;

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
              <div style={{ display:'flex', gap:8, marginTop:8 }}>
                <button onClick={handleUseLastId} style={styles.btn}>Use last id</button>
                <button onClick={handleCheckStatus} style={styles.btn}>Check status</button>
              </div>
            </div>
          )}

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
            </div>
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
  card: { width: '100%', maxWidth: 860, background: '#121835', color: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 10px 30px rgba(0,0,0,0.35)' },
  h1: { margin: '8px 0 16px' },
  h3: { marginTop: 24 },
  row: { display: 'grid', gridTemplateColumns: '140px 1fr', gap: 12, alignItems: 'center', margin: '10px 0' },
  label: { opacity: 0.85 },
  input: { padding: '10px 12px', borderRadius: 10, border: '1px solid #2a356f', background: '#0e1530', color: '#fff' },
  buttons: { display: 'flex', gap: 12, marginTop: 14, flexWrap: 'wrap' },
  btn: { padding: '10px 14px', borderRadius: 10, background: '#233077', color: '#fff', border: '1px solid #2a356f', cursor: 'pointer' },
  btnPrimary: { padding: '10px 14px', borderRadius: 10, background: '#3b82f6', color: '#fff', border: 'none', cursor: 'pointer' },
  kv: { display: 'flex', gap: 8, alignItems: 'baseline', marginBottom: 6 },
  box: { background: '#0e1530', border: '1px solid #2a356f', borderRadius: 10, padding: 12, marginTop: 12 },
  warn: { background: '#3a1b1b', border: '1px solid #6b1a1a', padding: 10, borderRadius: 8, color: '#ffb4b4' },
  logBox: { background: '#0e1530', border: '1px solid #2a356f', borderRadius: 10, padding: 12, minHeight: 140, maxHeight: 260, overflow: 'auto' },
};


// ============================================================================
// PATH: src/pages/api/pi/payments/cancel.js
// Cancel a pending payment (server-side). Needed for clearing stale.
// ============================================================================
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { paymentId } = req.body || {};
  if (!paymentId) return res.status(400).json({ ok: false, error: 'Missing paymentId' });

  const base = (process.env.PI_BASE_URL || 'https://api.minepi.com').replace(/\/+$/, '');
  const apiKey = process.env.PI_API_KEY_TESTNET;
  if (!apiKey) return res.status(500).json({ ok: false, error: 'Missing PI_API_KEY_TESTNET' });

  try {
    const auth = { headers: { Authorization: `Key ${apiKey}` } };
    const id = encodeURIComponent(paymentId);
    const { data: pay } = await axios.get(`${base}/v2/payments/${id}`, auth);

    if (pay?.status?.developer_completed || pay?.status?.cancelled || pay?.status?.user_cancelled) {
      return res.json({ ok: true, alreadyDone: true, pay });
    }
    const { data } = await axios.post(`${base}/v2/payments/${id}/cancel`, {}, auth);
    return res.json({ ok: true, result: data });
  } catch (e) {
    const status = e?.response?.status || 500;
    const details = e?.response?.data || e?.message;
    console.error('[api/pi/payments/cancel]', status, details);
    return res.status(status).json({ ok: false, error: 'Cancel failed', details });
  }
}


// ============================================================================
// PATH: src/pages/api/pi/incomplete.js
// List server-side incomplete payments. Fixes your "auto-clear failed: HTML" issue.
// ============================================================================
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const base = (process.env.PI_BASE_URL || 'https://api.minepi.com').replace(/\/+$/, '');
  const apiKey = process.env.PI_API_KEY_TESTNET;
  if (!apiKey) return res.status(500).json({ ok: false, error: 'Missing PI_API_KEY_TESTNET' });

  try {
    const auth = { headers: { Authorization: `Key ${apiKey}` } };
    const { data } = await axios.get(`${base}/v2/payments/incomplete_server_payments`, auth);
    // Normalize shape to always return array under .incomplete_server_payments
    const list = Array.isArray(data) ? data : (data?.incomplete_server_payments || []);
    return res.json({ incomplete_server_payments: list });
  } catch (e) {
    const status = e?.response?.status || 500;
    const details = e?.response?.data || e?.message;
    console.error('[api/pi/incomplete]', status, details);
    return res.status(status).json({ ok: false, error: 'Fetch incomplete failed', details });
  }
}