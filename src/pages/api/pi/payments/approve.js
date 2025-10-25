// src/pages/api/pi/payments/approve.js
import axios from 'axios';
import { dbConnect } from '../../../../lib/dbConnect';
import PiPayment from '../../../../models/PiPayment';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  // Allow client to pass slug/ticketQty + optional memo/metadata redundantly
  const {
    paymentId,
    slug: bodySlug,
    ticketQty: bodyTicketQty,
    memo: bodyMemo,
    metadata: bodyMetadata,
  } = req.body || {};

  if (!paymentId) return res.status(400).json({ ok: false, error: 'Missing paymentId' });

  // Pick correct API key based on environment
  const base = process.env.PI_BASE_URL || 'https://api.minepi.com';
  const env = (process.env.NEXT_PUBLIC_PI_ENV || 'testnet').toLowerCase();
  const apiKey =
    env === 'mainnet'
      ? process.env.PI_API_KEY_MAINNET || process.env.PI_API_KEY
      : process.env.PI_API_KEY_TESTNET || process.env.PI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ ok: false, error: 'Missing Pi API key (check env vars)' });
  }

  try {
    await dbConnect();

    // 1) Fetch payment from Pi to verify basics
    const { data: pay } = await axios.get(
      `${base}/v2/payments/${encodeURIComponent(paymentId)}`,
      { headers: { Authorization: `Key ${apiKey}` }, timeout: 10000 }
    );

    // 2) Approve on Pi
    await axios.post(
      `${base}/v2/payments/${encodeURIComponent(paymentId)}/approve`,
      {},
      { headers: { Authorization: `Key ${apiKey}` }, timeout: 10000 }
    );

    // 3) Persist/merge memo + metadata for robust completion step
    // Prefer the body values if present; then fall back to Pi's values.
    const memo = typeof bodyMemo === 'string' && bodyMemo.length ? bodyMemo : (pay?.memo ?? '');

    // Merge order: Pi metadata → body metadata → explicit slug/ticketQty (body wins)
    const mergedMeta = {
      ...(pay?.metadata || {}),
      ...(bodyMetadata || {}),
      // Also persist identity hints if present in Pi payload
      username: (bodyMetadata?.username ?? pay?.metadata?.username ?? pay?.user_username) || null,
      userId: (bodyMetadata?.userId ?? pay?.metadata?.userId ?? pay?.user_uid ?? pay?.user_uid) || null,
      // Critical bits for competition fulfillment:
      slug: bodySlug || (pay?.metadata?.slug ?? null),
      ticketQty:
        Number.isFinite(+bodyTicketQty)
          ? Number(bodyTicketQty)
          : (Number(pay?.metadata?.ticketQty) || 0),
    };

    // 4) Upsert payment record
    await PiPayment.updateOne(
      { paymentId },
      {
        $set: {
          paymentId,
          status: 'approved',
          amount: pay?.amount ?? 0,
          memo,
          metadata: mergedMeta,
          username: mergedMeta.username,
          raw: pay,
        },
      },
      { upsert: true }
    );

    return res.json({
      ok: true,
      paymentId,
      memoStored: memo,
      metadataStored: {
        slug: mergedMeta.slug,
        ticketQty: mergedMeta.ticketQty,
        username: mergedMeta.username,
        userId: mergedMeta.userId,
      },
    });
  } catch (e) {
    console.error('[payments/approve] error:', e?.response?.data || e.message);
    return res.status(500).json({ ok: false, error: 'approve failed' });
  }
}
