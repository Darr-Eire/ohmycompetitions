import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { paymentId, paymentData, signature, uid } = req.body;

    if (!paymentId || !paymentData || !signature || !uid) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify HMAC
    const secret = process.env.PI_APP_SECRET;
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(paymentData);
    const digest = hmac.digest('hex');

    if (digest !== signature) {
      console.warn('❌ Invalid signature');
      return res.status(403).json({ error: 'Invalid signature' });
    }

    // ✅ Approve payment with Pi
    const piRes = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${process.env.PI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!piRes.ok) {
      const text = await piRes.text();
      console.error('❌ Pi approval failed:', text);
      return res.status(500).json({ error: 'Pi approval failed', detail: text });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('❌ Approve.js error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
