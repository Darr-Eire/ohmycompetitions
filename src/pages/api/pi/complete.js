// /pages/api/pi/complete.js
import { connectToDatabase } from '@/lib/dbConnect';
import Payment from '@/models/Payment';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { paymentId, txid, uid } = req.body;

  if (!paymentId || !txid || !uid) {
    return res.status(400).json({ error: 'Missing paymentId, txid, or uid' });
  }

  try {
    await connectToDatabase();

    const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${process.env.PI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ txid }),
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Completion failed');

    await Payment.findOneAndUpdate(
      { paymentId, uid },
      { txid, status: 'COMPLETED' },
      { new: true }
    );

    return res.status(200).json({ success: true, result });
  } catch (err) {
    console.error('Completion Error:', err.message);
    return res.status(500).json({ error: 'Failed to complete payment' });
  }
}