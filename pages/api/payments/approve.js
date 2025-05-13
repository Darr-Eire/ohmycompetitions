// pages/api/payments/approve.js

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { paymentId } = req.body;

  if (!paymentId) return res.status(400).json({ error: 'Missing paymentId' });

  try {
    const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
      method: 'POST',
      headers: {
        Authorization: `Key ${process.env.PI_API_KEY}`, // Set this in your Vercel env vars
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[❌] Approve failed:', data);
      return res.status(500).json({ error: 'Failed to approve payment', details: data });
    }

    console.log('[✅] Payment approved:', data);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('[🔥] Server error during approval:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

