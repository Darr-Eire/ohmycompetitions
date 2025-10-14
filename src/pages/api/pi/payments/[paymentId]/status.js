import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const { id } = req.query || {};
  if (!id) return res.status(400).json({ ok: false, error: 'Missing id' });

  const base = (process.env.PI_BASE_URL || 'https://api.minepi.com').replace(/\/+$/, '');
  const apiKey = process.env.PI_API_KEY_TESTNET;
  if (!apiKey) return res.status(500).json({ ok: false, error: 'Missing PI_API_KEY_TESTNET' });

  try {
    const auth = { headers: { Authorization: `Key ${apiKey}` } };
    const enc = encodeURIComponent(id);
    const { data } = await axios.get(`${base}/v2/payments/${enc}`, auth);
    return res.json({ ok: true, payment: data });
  } catch (e) {
    const status = e?.response?.status || 500;
    const details = e?.response?.data || e?.message;
    console.error('[api/pi/payments/[id]/status]', status, details);
    return res.status(status).json({ ok: false, error: 'Status fetch failed', details });
  }
}
