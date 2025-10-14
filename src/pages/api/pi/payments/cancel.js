// ============================================================================
// PATH: src/pages/api/pi/payments/cancel.js  (SERVER)
// Cancels a pending payment. Used by your "Clear pending" buttons.
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
    return res.status(status).json({ ok: false, error: 'Cancel failed', details: e?.response?.data || e?.message });
  }
}
