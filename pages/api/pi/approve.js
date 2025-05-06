import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { paymentId, paymentData, signature, uid } = req.body;

    if (!paymentId || !paymentData || !signature || !uid) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const isValid = verifySignature(paymentData, signature);
    if (!isValid) {
      console.error('Invalid payment signature');
      return res.status(403).json({ error: 'Invalid payment signature' });
    }

    // Signature is valid, continue processing
    console.log('Approved payment:', paymentId);

    // Optional: Save to DB, mark entry, etc.
    // await prisma.entry.create({ data: { paymentId, uid, ... } });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Error in payment approval:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

function verifySignature(paymentData, signature) {
  const secret = process.env.PI_APP_SECRET;
  if (!secret) {
    throw new Error('PI_APP_SECRET not set in environment');
  }

  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(paymentData);
  const digest = hmac.digest('hex');
  return digest === signature;
}
