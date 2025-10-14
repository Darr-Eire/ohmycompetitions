// File: src/pages/api/pi/payments/cancel.js
// Cancel a single pending payment on the server (testnet). Safe to call repeatedly.

import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { paymentId } = req.body || {};
  if (!paymentId) return res.status(400).json({ ok: false, error: 'Missing paymentId' });

  const base = (process.env.PI_BASE_URL || 'https://api.minepi.com').replace(/\/+$/, '');
  const apiKey = process.env.PI_API_KEY_TESTNET; // why: never expose mainnet/testnet keys client-side
  if (!apiKey) return res.status(500).json({ ok: false, error: 'Missing PI_API_KEY_TESTNET' });

  try {
    const auth = { headers: { Authorization: `Key ${apiKey}` } };
    const id = encodeURIComponent(paymentId);

    // read current payment state
    const { data: pay } = await axios.get(`${base}/v2/payments/${id}`, auth);

    // if already completed/cancelled, no-op
    if (pay?.status?.developer_completed || pay?.status?.cancelled || pay?.status?.user_cancelled) {
      return res.json({ ok: true, alreadyDone: true, pay });
    }

    // cancel
    const { data } = await axios.post(`${base}/v2/payments/${id}/cancel`, {}, auth);
    return res.json({ ok: true, result: data });
  } catch (e) {
    const status = e?.response?.status;
    const details = e?.response?.data || e?.message;
    console.error('[api/pi/payments/cancel]', status, details);
    return res.status(status || 500).json({ ok: false, error: 'Cancel failed', details });
  }
}
