import axios from 'axios';

function getPiApiKey() {
  const env = (process.env.PI_ENV || process.env.NEXT_PUBLIC_PI_ENV || 'sandbox').toLowerCase();
  const key =
    (env === 'testnet'
      ? process.env.PI_API_KEY_TESTNET
      : env === 'mainnet'
      ? process.env.PI_API_KEY_MAINNET
      : process.env.PI_API_KEY_SANDBOX) ||
    process.env.PI_API_KEY ||           // legacy fallback
    process.env.PI_APP_SECRET;          // legacy fallback
  if (!key) throw new Error(`[pi/cancelled] Missing Pi API key for PI_ENV=${env}`);
  return { env, key };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { paymentId, reason } = req.body || {};
  if (!paymentId) return res.status(400).json({ error: 'Missing paymentId' });

  try {
    const { key, env } = getPiApiKey();
    const base = process.env.PI_BASE_URL || 'https://api.minepi.com';
    const url = `${base}/v2/payments/${encodeURIComponent(paymentId)}/cancel`;

    const resp = await axios.post(
      url,
      // Pi’s cancel endpoint doesn’t require a body, but we can pass a note for our logs
      reason ? { reason } : {},
      {
        headers: {
          Authorization: `Key ${key}`,  // IMPORTANT: server-to-Pi uses Key, not Bearer
          'Content-Type': 'application/json',
        },
        timeout: 30_000,
      }
    );

    // Pi typically returns the updated payment object; bubble it back for debugging/UI
    return res.status(200).json({
      success: true,
      env,
      message: `Payment ${paymentId} cancelled successfully`,
      data: resp.data,
    });
  } catch (error) {
    const http = error?.response?.status;
    const body = error?.response?.data;

    console.error('[pi/cancelled] Cancel error', {
      message: error?.message,
      http,
      body,
    });

    if (http === 404) {
      return res.status(404).json({ error: 'Payment not found on Pi Network', details: body });
    }
    if (http === 401 || http === 403) {
      return res.status(http).json({ error: 'Invalid Pi Network API credentials', details: body });
    }
    if (http === 400) {
      return res.status(400).json({ error: 'Pi Network API error', details: body });
    }
    if (http >= 500) {
      return res.status(502).json({ error: 'Pi Network API server error', details: body });
    }
    if (error?.code === 'ECONNABORTED') {
      return res.status(408).json({ error: 'Pi API timeout' });
    }
    if (error?.code === 'ENOTFOUND' || error?.code === 'ECONNREFUSED') {
      return res.status(503).json({ error: 'Pi API unavailable' });
    }

    return res.status(500).json({ error: 'Failed to cancel payment', details: error?.message || 'Unknown error' });
  }
}
