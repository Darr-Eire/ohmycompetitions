// pages/api/approve-payment.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { paymentId } = req.body;

  if (!paymentId) {
    return res.status(400).json({ error: 'Missing paymentId' });
  }

  console.log('🟡 Approving payment:', paymentId);

  // Optional: Add logic to validate payment ID, check against your DB, etc.

  return res.status(200).json({ success: true });
}
