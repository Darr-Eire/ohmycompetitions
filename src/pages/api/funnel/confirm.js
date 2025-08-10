// file: src/pages/api/funnel/confirm.js
import { lobby } from '../../../lib/funnelLobby';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { slug, userId, stage, paymentId, txId } = req.body || {};

    // Validate
    const stageNum = Number(stage);
    if (!userId || !paymentId || Number.isNaN(stageNum)) {
      return res.status(400).json({ error: 'Missing or invalid fields: userId, paymentId, stage' });
    }

    const rec = lobby?.payments?.get(paymentId);
    if (!rec) {
      // If you want strict: return 404.
      // If you want idempotent: treat as already completed.
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Idempotency: if already completed, return OK
    if (rec.status === 'completed') {
      return res.status(200).json({ ok: true, idempotent: true, txId: rec.txId || txId || null });
    }

    // Mark completed
    lobby.payments.set(paymentId, {
      ...rec,
      status: 'completed',
      txId: txId || rec.txId || null,
      confirmedAt: Date.now(),
    });

    // TODO: persist to DB: mark user ticket/entry paid, attach to `slug` if provided

    return res.status(200).json({ ok: true, paymentId, txId: txId || null });
  } catch (err) {
    console.error('POST /api/funnel/confirm error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
