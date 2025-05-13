// pages/api/payments/complete.js

import { verifyAndCompletePayment } from '@/lib/pi';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { paymentId, txid } = req.body;

  if (!paymentId || !txid) {
    return res.status(400).json({ error: 'Missing paymentId or txid' });
  }

  try {
    console.log('➡️ Verifying and completing payment:', paymentId, txid);

    const result = await verifyAndCompletePayment(paymentId, txid);

    console.log('✅ Completed payment:', result);
    return res.status(200).json({ success: true, result });
  } catch (error) {
    console.error('❌ Failed to complete payment:', error);
    return res.status(500).json({ error: 'Failed to complete payment', details: error });
  }
}
