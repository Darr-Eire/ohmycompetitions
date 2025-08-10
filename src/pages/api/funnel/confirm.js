// file: src/pages/api/funnel/confirm.js
import dbConnect from '@/lib/dbConnect';
import { completePayment } from '@/lib/piClient';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    await dbConnect();
    const { paymentId, txId } = req.body || {};
    if (!paymentId || !txId) return res.status(400).json({ error: 'Missing paymentId or txId' });

    await completePayment(paymentId, txId);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('POST /api/funnel/confirm error', err?.response?.data || err);
    return res.status(500).json({ error: 'Server error' });
  }
}
