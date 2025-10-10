// src/hooks/usePiPurchase.js
import { readyPi } from '../lib/piClient';

async function post(url, body) {
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const txt = await r.text();
  if (!r.ok) throw new Error(txt || `HTTP ${r.status}`);
  try { return JSON.parse(txt); } catch { return txt; }
}

async function get(url) {
  const r = await fetch(url);
  const txt = await r.text();
  if (!r.ok) throw new Error(txt || `HTTP ${r.status}`);
  try { return JSON.parse(txt); } catch { return txt; }
}

export function usePiPurchase() {
  return {
    purchase: async ({ amount, memo, onApproved, onCompleted }) => {
      console.debug('[purchase] starting, amount:', amount, 'memo:', memo);

      // 1) SDK
      const Pi = await readyPi();
      if (!Pi) throw new Error('Pi SDK not loaded');

      // 2) Authenticate
      let auth;
      try {
        auth = await Pi.authenticate(['payments', 'username', 'roles']);
      } catch (e) {
        console.error('[purchase] Pi.authenticate threw:', e);
        throw new Error(e?.message || 'Pi authenticate failed');
      }
      console.debug('[purchase] auth:', auth);

      if (!auth || !auth.accessToken) {
        throw new Error('Pi authenticate did not return an accessToken');
      }
      if (!auth.user) {
        throw new Error('Pi authenticate did not return a user');
      }

      // 3) Create payment
      const created = await Pi.createPayment({ amount, memo, metadata: { memo } });
      console.debug('[purchase] created:', created);
      const paymentId = created?.identifier;
      if (!paymentId) throw new Error('No paymentId from Pi.createPayment');

      // 4) Approve (server)
      await post('/api/pi/payments/approve', {
        paymentId,
        accessToken: auth.accessToken,
        amount,
        memo,
        uid: auth.user.uid,
        username: auth.user.username,
      });
      onApproved?.(paymentId);

      // 5) (optional) wait for tx id via polling
      let txid = null;
      for (let i = 0; i < 20 && !txid; i++) {
        try {
          const s = await get(`/api/pi/payments/${encodeURIComponent(paymentId)}/status`);
          if (s?.txid) txid = s.txid;
        } catch {}
        await new Promise(r => setTimeout(r, 1000));
      }

      // 6) Complete (server)
      await post('/api/pi/payments/complete', {
        paymentId,
        txid,
        accessToken: auth.accessToken,
      });
      onCompleted?.(paymentId, txid);

      return { paymentId, txid };
    },
  };
}