// src/pages/api/pi/payments/approve.js
import axios from 'axios';
import { dbConnect } from '../../../../lib/dbConnect';
import PiPayment from '../../../../models/PiPayment';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { paymentId } = req.body || {};
  if (!paymentId) return res.status(400).json({ ok: false, error: 'Missing paymentId' });

  const base = process.env.PI_BASE_URL || 'https://api.minepi.com';
  const apiKey = process.env.PI_API_KEY_TESTNET;
  if (!apiKey) return res.status(500).json({ ok: false, error: 'Missing PI_API_KEY_TESTNET' });

  try {
    await dbConnect();

    const { data: pay } = await axios.get(`${base}/v2/payments/${encodeURIComponent(paymentId)}`, {
      headers: { Authorization: `Key ${apiKey}` },
      timeout: 10000,
    });

    // (optional) validate amount/memo/metadata here
    await axios.post(
      `${base}/v2/payments/${encodeURIComponent(paymentId)}/approve`,
      {},
      { headers: { Authorization: `Key ${apiKey}` }, timeout: 10000 }
    );

    // upsert a record so complete can update it later
    await PiPayment.updateOne(
      { paymentId },
      {
        $set: {
          paymentId,
          status: 'approved',
          amount: pay?.amount ?? 0,
          memo: pay?.memo ?? '',
          username: pay?.metadata?.username ?? pay?.user_username ?? null,
          raw: pay,
        },
      },
      { upsert: true }
    );

    return res.json({ ok: true });
  } catch (e) {
    console.error('[payments/approve] error:', e?.response?.data || e.message);
    return res.status(500).json({ ok: false, error: 'approve failed' });
  }
}
