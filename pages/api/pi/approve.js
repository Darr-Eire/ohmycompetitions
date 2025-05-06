import crypto from 'crypto';
import clientPromise from '@/lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { paymentId, paymentData, signature, uid } = req.body;

    if (!paymentId || !paymentData || !signature || !uid) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify signature using your Pi App Secret
    const secret = process.env.PI_APP_SECRET;
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(paymentData);
    const digest = hmac.digest('hex');

    if (digest !== signature) {
      console.warn('❌ Invalid payment signature');
      return res.status(403).json({ error: 'Invalid payment signature' });
    }

    const client = await clientPromise;
    const db = client.db();
    const approvals = db.collection('approvals');

    // Optional: save approval for audit/logging/debugging
    await approvals.insertOne({
      paymentId,
      userUid: uid,
      status: 'approved',
      createdAt: new Date(),
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('❌ Error in approve.js:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
