// file: src/pages/api/funnel/join.js
import dbConnect from '@/lib/dbConnect';
import { assignStage1Room, ENTRY_FEE_PI } from '@/lib/funnelService';
import { getPayment, approvePayment } from '@/lib/piClient';

export default async function handler(req, res) {
  // CORS preflight
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    await dbConnect();

    const { slug, userId, stage = 1, paymentId, amount, cycleId = 'default' } = req.body || {};
    if (!userId) return res.status(400).json({ error: 'Missing userId' });

    if (stage === 1) {
      if (paymentId) {
        const payment = await getPayment(paymentId);
        if (payment?.currency !== 'PI') return res.status(400).json({ error: 'Invalid currency' });
        if (Number(payment?.amount) !== Number(ENTRY_FEE_PI)) {
          return res.status(400).json({ error: 'Incorrect amount' });
        }
        await approvePayment(paymentId);
      } else {
        if (Number(amount) !== Number(ENTRY_FEE_PI)) {
          return res.status(400).json({ error: 'Incorrect amount' });
        }
      }

      const { room, etaSec } = await assignStage1Room(userId, { cycleId });
      return res.status(200).json({ ok: true, stage: 1, slug: room.slug, entrantsCount: room.entrantsCount, status: room.status, etaSec });
    }

    return res.status(400).json({ error: 'Unsupported stage' });
  } catch (err) {
    console.error('POST /api/funnel/join error', err?.response?.data || err);
    return res.status(500).json({ error: 'Server error' });
  }
}
