// pages/api/payments/complete.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { paymentId } = req.body;

  if (!paymentId) {
    return res.status(400).json({ error: 'Missing paymentId' });
  }

  try {
    const completeRes = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
      method: 'POST',
      headers: {
        Authorization: `Key ${process.env.PI_API_SECRET}`, // must be set in Vercel
        'Content-Type': 'application/json',
      },
    });

    if (!completeRes.ok) {
      const errorText = await completeRes.text();
      console.error('[❌] Completion failed:', errorText);
      return res.status(500).json({ error: 'Failed to complete payment' });
    }

    const completedPayment = await completeRes.json();
    console.log('[✅] Payment completed:', completedPayment);
    return res.status(200).json({ status: 'completed', payment: completedPayment });
  } catch (err) {
    console.error('[🔥] Server error during completion:', err);
    return res.status(500).json({ error: 'Server error during completion' });
  }
}
