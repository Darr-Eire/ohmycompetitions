// pages/api/complete-payment.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { paymentId, txid } = req.body;

  if (!paymentId || !txid) {
    return res.status(400).json({ error: 'Missing paymentId or txid' });
  }

  console.log('🟢 Completing payment:', paymentId, txid);

  // Optional: update your database to reflect a completed payment

  return res.status(200).json({ success: true });
}
