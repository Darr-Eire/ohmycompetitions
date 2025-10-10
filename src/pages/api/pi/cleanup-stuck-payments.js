import axios from 'axios';
import { dbConnect } from 'lib/dbConnect';
import Payment from 'models/Payment';

/**
 * Cleanup job for incomplete server payments.
 * Strategy:
 *  - If developer_completed -> skip
 *  - If transaction_verified -> attempt /complete
 *  - Else -> /cancel (optional branch)
 *
 * For safety, this version only completes verified payments, and logs others.
 */

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
  if (!key) throw new Error(`[cleanup-stuck-payments] Missing Pi API key for PI_ENV=${env}`);
  return { env, key };
}

function piAxios() {
  const base = process.env.PI_BASE_URL || 'https://api.minepi.com';
  const { key } = getPiApiKey();
  return axios.create({
    baseURL: base,
    timeout: 25_000,
    headers: {
      Authorization: `Key ${key}`, // IMPORTANT: server-to-Pi uses "Key", not "Bearer"
      'Content-Type': 'application/json',
    },
  });
}

export default async function handler(req, res) {
  try {
    const ax = piAxios();

    // 1) Pull canonical list from Pi
    const { data } = await ax.get('/v2/payments/incomplete_server_payments');
    const list = data?.incomplete_server_payments || [];

    if (!Array.isArray(list)) {
      return res.status(502).json({ error: 'Unexpected Pi response', raw: data });
    }

    await dbConnect();

    const completed = [];
    const skipped = [];
    const errors = [];
    const observations = [];

    // 2) Process serially (safer for rate limits)
    for (const p of list) {
      try {
        const id = p?.identifier;
        const st = p?.status || {};
        const tx = p?.transaction || {};

        if (!id) {
          observations.push({ note: 'missing_identifier', raw: p });
          continue;
        }

        // Already completed? nothing to do
        if (st.developer_completed) {
          skipped.push({ paymentId: id, reason: 'already_completed' });
          continue;
        }

        // If on-chain verified -> COMPLETE (never cancel here)
        if (st.transaction_verified || tx.verified) {
          try {
            const resp = await ax.post(`/v2/payments/${encodeURIComponent(id)}/complete`, {
              txid: tx?.txid, // optional; often not required once verified
            });

            const ok = resp?.data?.ok || resp?.data?.status?.developer_completed;
            if (ok) {
              // Update your DB
              await Payment.findOneAndUpdate(
                { paymentId: id },
                {
                  status: 'completed',
                  completedAt: new Date(),
                  txid: tx?.txid || null,
                  piStatus: resp?.data?.status || st,
                },
                { upsert: true }
              );
              completed.push(id);
            } else {
              errors.push({ paymentId: id, step: 'complete', details: resp?.data });
            }
          } catch (e) {
            errors.push({
              paymentId: id,
              step: 'complete_call',
              message: e?.message,
              http: e?.response?.status,
              body: e?.response?.data,
            });
          }
          continue;
        }

        // Not verified and not completed — leave it alone (or add a cancel branch if you want).
        skipped.push({ paymentId: id, reason: 'not_verified' });
      } catch (innerErr) {
        errors.push({ step: 'loop', message: innerErr?.message, raw: innerErr });
      }
    }

    return res.status(200).json({
      ok: true,
      counts: {
        total: list.length,
        completed: completed.length,
        skipped: skipped.length,
        errors: errors.length,
      },
      completed,
      skipped,
      errors,
      notes: observations,
    });
  } catch (err) {
    console.error('[cleanup-stuck-payments] Error', {
      message: err?.message,
      http: err?.response?.status,
      body: err?.response?.data,
    });
    return res.status(500).json({ error: 'Cleanup failed', details: err?.message || 'Unknown error' });
  }
}
