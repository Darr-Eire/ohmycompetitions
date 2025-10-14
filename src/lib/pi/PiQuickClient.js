import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const base = (process.env.PI_BASE_URL || 'https://api.minepi.com').replace(/\/+$/, '');
  const apiKey = process.env.PI_API_KEY_TESTNET;
  if (!apiKey) return res.status(500).json({ ok: false, error: 'Missing PI_API_KEY_TESTNET' });

  try {
    const auth = { headers: { Authorization: `Key ${apiKey}` } };
    const { data } = await axios.get(`${base}/v2/payments/incomplete_server_payments`, auth);
    const list = Array.isArray(data) ? data : (data?.incomplete_server_payments || []);
    return res.json({ incomplete_server_payments: list });
  } catch (e) {
    const status = e?.response?.status || 500;
    const details = e?.response?.data || e?.message;
    console.error('[api/pi/incomplete]', status, details);
    return res.status(status).json({ ok: false, error: 'Fetch incomplete failed', details });
  }
}
