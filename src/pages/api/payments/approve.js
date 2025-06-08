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
    const piResponse = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
      method: 'POST',
      headers: {
        Authorization: `Key ${process.env.PI_API_KEY}`,  // This must be set securely in Vercel/ENV
        'Content-Type': 'application/json',
      },
    });

    const result = await piResponse.json();

    if (!piResponse.ok) {
      console.error('[❌] Pi Server Approval Failed:', result);
      return res.status(500).json({ error: 'Failed to approve payment', details: result });
    }

    console.log('[✅] Payment approved successfully:', result);
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error('[🔥] Server error during Pi approval:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
