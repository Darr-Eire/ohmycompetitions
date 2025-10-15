// PATH: src/pages/api/pi/payments/cancel.js
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { paymentId } = req.body || {};
  if (!paymentId) return res.status(400).json({ ok: false, error: 'paymentId required' });

  const base = (process.env.PI_BASE_URL || 'https://api.minepi.com').replace(/\/+$/, '');
  const apiKey = process.env.PI_API_KEY_TESTNET; // <-- MUST be set
  if (!apiKey) return res.status(500).json({ ok: false, error: 'Missing PI_API_KEY_TESTNET' });

  try {
    await axios.post(
      `${base}/v2/payments/${encodeURIComponent(paymentId)}/cancel`,
      {},
      { headers: { Authorization: `Key ${apiKey}` } }
    );
    return res.json({ ok: true });
  } catch (e) {
    const status = e?.response?.status || 500;
    return res.status(status).json({
      ok: false,
      error: 'Cancel failed',
      details: e?.response?.data || e?.message,
    });
  }
}
