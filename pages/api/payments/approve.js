// pages/api/payments/approve.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { paymentId } = req.body;

  if (!paymentId) {
    return res.status(400).json({ error: 'Missing paymentId' });
  }

  try {
    // This URL confirms the payment with Pi's server
    const verifyRes = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
      method: 'POST',
      headers: {
        Authorization: `Key ${process.env.PI_API_SECRET}`, // Set this in Vercel
        'Content-Type': 'application/json',
      },
    });

    if (!verifyRes.ok) {
      const errorText = await verifyRes.text();
      console.error('[❌] Approve failed:', errorText);
      return res.status(500).json({ error: 'Failed to approve payment' });
    }

    const approvedPayment = await verifyRes.json();
    console.log('[✅] Payment approved:', approvedPayment);
    return res.status(200).json({ status: 'approved', payment: approvedPayment });
  } catch (err) {
    console.error('[🔥] Server error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
