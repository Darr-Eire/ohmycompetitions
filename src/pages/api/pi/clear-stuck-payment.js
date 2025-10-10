import axios from 'axios';
import initCORS from '../../../lib/cors';

/* ----------------------------- ENV & CONFIG ----------------------------- */
const PI_ENV = (process.env.PI_ENV || process.env.NEXT_PUBLIC_PI_ENV || 'sandbox').toLowerCase();

const PI_API_KEY =
  (PI_ENV === 'testnet'
    ? process.env.PI_API_KEY_TESTNET
    : PI_ENV === 'mainnet'
    ? process.env.PI_API_KEY_MAINNET
    : process.env.PI_API_KEY_SANDBOX) ||
  process.env.PI_API_KEY ||           // legacy fallback
  process.env.PI_APP_SECRET;          // legacy fallback

if (!PI_API_KEY) throw new Error(`[pi/clear-stuck-payment] Missing Pi API key for PI_ENV=${PI_ENV}`);

const PI_API_BASE = process.env.PI_BASE_URL || 'https://api.minepi.com';

function piAxios() {
  return axios.create({
    baseURL: PI_API_BASE,
    timeout: 25_000,
    headers: {
      Authorization: `Key ${PI_API_KEY}`, // server-to-Pi uses Key, not Bearer
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Strategy:
 * 1) If developer_completed → return OK
 * 2) If transaction_verified → attempt /complete
 * 3) Else → /cancel
 * You can override with body.strategy = 'complete' | 'cancel'
 */
export default async function handler(req, res) {
  try {
    const end = await initCORS(req, res);
    if (end) return;

    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { paymentId, strategy } = req.body || {};
    if (!paymentId) return res.status(400).json({ error: 'Payment ID is required' });

    const ax = piAxios();

    // 1) Get canonical status
    const statusResp = await ax.get(`/v2/payments/${encodeURIComponent(paymentId)}`);
    const p = statusResp.data || {};
    const flags = p?.status || {};

    // Already completed?
    if (flags.developer_completed) {
      return res.status(200).json({
        message: 'Payment is already completed',
        paymentId,
        status: p.status,
      });
    }

    // Resolve desired action
    let action = strategy;
    if (!action) {
      action = (flags.transaction_verified || p?.transaction?.verified) ? 'complete' : 'cancel';
    }

    if (action === 'complete') {
      // 2) Try to complete (works if transaction already verified)
      try {
        const resp = await ax.post(`/v2/payments/${encodeURIComponent(paymentId)}/complete`, {
          txid: p?.transaction?.txid || undefined, // optional; Pi may not require it when verified
        });

        const ok = resp.data?.ok || resp.data?.status?.developer_completed;
        if (!ok) {
          return res.status(502).json({
            error: 'Pi did not mark the payment as completed',
            details: resp.data,
          });
        }

        return res.status(200).json({
          message: 'Payment completed successfully',
          paymentId,
          data: resp.data,
        });
      } catch (e) {
        // If completion fails and caller didn’t force 'complete', fall back to cancel
        if (strategy === 'complete') {
          const http = e?.response?.status;
          return res.status(http || 502).json({
            error: 'Failed to complete payment',
            details: e?.response?.data || e?.message,
          });
        }
        // fall through to cancel
        action = 'cancel';
      }
    }

    if (action === 'cancel') {
      // 3) Cancel the payment
      const resp = await ax.post(`/v2/payments/${encodeURIComponent(paymentId)}/cancel`, {});
      return res.status(200).json({
        message: 'Payment cancelled successfully',
        paymentId,
        data: resp.data,
      });
    }

    return res.status(400).json({ error: 'Invalid strategy. Use "complete" or "cancel".' });
  } catch (error) {
    const http = error?.response?.status;
    const body = error?.response?.data;
    console.error('[pi/clear-stuck-payment] Error', { message: error?.message, http, body });

    if (http === 404) return res.status(404).json({ error: 'Payment not found on Pi Network', details: body });
    if (http === 401 || http === 403) return res.status(http).json({ error: 'Invalid Pi API credentials', details: body });
    if (http === 400) return res.status(400).json({ error: 'Pi API error', details: body });
    if (http >= 500) return res.status(502).json({ error: 'Pi API server error', details: body });
    if (error?.code === 'ECONNABORTED') return res.status(408).json({ error: 'Pi API timeout' });
    if (error?.code === 'ENOTFOUND' || error?.code === 'ECONNREFUSED') return res.status(503).json({ error: 'Pi API unavailable' });

    return res.status(500).json({ error: 'Failed to clear payment', details: error?.message || 'Unknown error' });
  }
}
