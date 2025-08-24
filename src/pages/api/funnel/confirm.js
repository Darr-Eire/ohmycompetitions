// file: src/pages/api/funnel/confirm.js
import { dbConnect } from '../../../lib/dbConnect';
import { completePayment } from '../../../lib/piClient';
import { lobby } from '../../../lib/funnelLobby';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    await dbConnect();

    const { paymentId, txid: txidRaw, txId: txIdAlt } = req.body || {};
    const txid = txidRaw || txIdAlt;

    if (!paymentId) return res.status(400).json({ error: 'Missing paymentId' });
    if (!txid) return res.status(400).json({ error: 'Missing txid' });

    // Call Pi to mark complete
    await completePayment(paymentId, txid).catch((e) => {
      const msg = e?.response?.data || e?.message || e;
      console.warn('completePayment warning', msg);
      // allow idempotent "already completed" errors to pass if needed
    });

    // Mark staged payment as completed (idempotent)
    try {
      const staged = lobby?.payments?.get?.(paymentId);
      if (staged) {
        staged.status = 'completed';
        staged.completedAt = Date.now();
        staged.txid = txid;
        lobby.payments.set(paymentId, staged);
      }
    } catch (e) {
      console.error('lobby complete staging error', e);
    }

    return res.status(200).json({ ok: true, paymentId, txid, status: 'completed' });
  } catch (err) {
    console.error('POST /api/funnel/confirm error', err?.response?.data || err);
    return res.status(500).json({ error: 'Server error' });
  }
}
