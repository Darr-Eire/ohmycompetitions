import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { paymentId, paymentData, signature, uid } = req.body;

  console.log('✅ /api/pi/approve called');
  console.log('paymentId:', paymentId);
  console.log('signature:', signature?.slice(0, 12));
  console.log('uid:', uid);
  console.log('paymentData snippet:', paymentData?.slice(0, 60));

  if (!paymentId || !paymentData || !signature || !uid) {
    console.warn('❌ Missing fields in approval payload');
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const secret = process.env.PI_APP_SECRET;
    const apiKey = process.env.PI_API_KEY;

    if (!secret || !apiKey) {
      console.error('❌ PI_APP_SECRET or PI_API_KEY not defined');
      return res.status(500).json({ error: 'Server config error' });
    }

    // Verify signature using HMAC SHA256
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(paymentData);
    const digest = hmac.digest('hex');

    console.log('🧠 Calculated digest:', digest.slice(0, 16));
    console.log('🧠 Signature match:', digest === signature);

    if (digest !== signature) {
      return res.status(403).json({ error: 'Invalid payment signature' });
    }

    // ✅ Approve payment via Pi Server
    const approveRes = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
      method: 'POST',
      headers: {
        Authorization: `Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!approveRes.ok) {
      const errorText = await approveRes.text();
      console.error('❌ Pi approval API failed:', errorText);
      return res.status(500).json({ error: 'Pi approval failed', detail: errorText });
    }

    const result = await approveRes.json();
    console.log('✅ Payment approved by Pi Server:', result);

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('❌ Error in /api/pi/approve:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
