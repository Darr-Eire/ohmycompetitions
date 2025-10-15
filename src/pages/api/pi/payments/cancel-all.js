// ============================================================================
// PATH: src/pages/api/pi/payments/cancel-all.js (SERVER)
// Cancels ALL incomplete server payments for your app (env-aware).
// ============================================================================

import axios from 'axios';

function resolveApiKey() {
  const env = (process.env.PI_ENV || process.env.NEXT_PUBLIC_PI_ENV || 'testnet')
    .toLowerCase()
    .trim();

  // Prefer explicit per-env keys; fall back to legacy single key or app secret
  return (
    (env === 'mainnet'
      ? process.env.PI_API_KEY_MAINNET
      : env === 'sandbox'
      ? process.env.PI_API_KEY_SANDBOX
      : process.env.PI_API_KEY_TESTNET) ||
    process.env.PI_API_KEY ||
    process.env.PI_APP_SECRET
  );
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method Not Allowed' });

  const base = (process.env.PI_BASE_URL || process.env.PI_API_BASE || 'https://api.minepi.com')
    .replace(/\/+$/, '');
  const apiKey = resolveApiKey();

  if (!apiKey) {
    return res.status(500).json({
      ok: false,
      error:
        'Missing Pi API key. Set PI_API_KEY_TESTNET/MAINNET/SANDBOX or PI_API_KEY (or PI_APP_SECRET).',
    });
  }

  const http = axios.create({
    baseURL: `${base}/v2`,
    timeout: 15000,
    headers: { Authorization: `Key ${apiKey}`, Accept: 'application/json' },
  });

  try {
    // 1) Get list of incomplete server payments
    const { data } = await http.get('/payments/incomplete_server_payments');
    const list = Array.isArray(data) ? data : data?.incomplete_server_payments || [];

    const cancelled = [];
    const skipped = [];

    // 2) Iterate and cancel those still pending
    for (const p of list) {
      const id = p?.identifier || p?.id || p?.paymentId;
      if (!id) {
        skipped.push({ reason: 'no_id' });
        continue;
      }

      try {
        // Re-check current status (defensive)
        const { data: current } = await http.get(`/payments/${encodeURIComponent(id)}`);
        const st = current?.status || {};
        if (st.developer_completed || st.cancelled || st.user_cancelled) {
          skipped.push({ id, reason: 'already_done' });
          continue;
        }

        await http.post(`/payments/${encodeURIComponent(id)}/cancel`, {});
        cancelled.push(id);
      } catch (e) {
        skipped.push({
          id,
          reason: 'cancel_error',
          err: e?.response?.data || e?.message,
        });
      }
    }

    return res.json({ ok: true, total: list.length, cancelled, skipped });
  } catch (e) {
    const status = e?.response?.status || 500;
    return res
      .status(status)
      .json({ ok: false, error: 'cancel-all failed', details: e?.response?.data || e?.message });
  }
}